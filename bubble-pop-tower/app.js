// ─── CONFIG ──────────────────────────────────────────────────────

const BUBBLE_COLORS = [
  { name: 'red',    hex: '#e94560', glow: 'rgba(233,69,96,0.5)' },
  { name: 'blue',   hex: '#4ea8de', glow: 'rgba(78,168,222,0.5)' },
  { name: 'green',  hex: '#52b788', glow: 'rgba(82,183,136,0.5)' },
  { name: 'yellow', hex: '#ffd166', glow: 'rgba(255,209,102,0.5)' },
  { name: 'purple', hex: '#9b5de5', glow: 'rgba(155,93,229,0.5)' },
  { name: 'orange', hex: '#f77f00', glow: 'rgba(247,127,0,0.5)' },
];

const POWERUPS = [
  { type: 'bomb',    emoji: '💣', freq: 0.06, desc: 'Clears nearby bubbles' },
  { type: 'rainbow', emoji: '🌈', freq: 0.04, desc: 'Matches any color' },
  { type: 'star',    emoji: '⭐', freq: 0.03, desc: 'Clears entire row' },
];

const DIFFICULTIES = {
  easy:   { colors: 5, dropSpeed: 3.5, matchCount: 3, powerupMult: 0.8 },
  medium: { colors: 6, dropSpeed: 5.0, matchCount: 3, powerupMult: 0.5 },
  hard:   { colors: 6, dropSpeed: 7.0, matchCount: 4, powerupMult: 0.3 },
};

const GRAVITY = 0.28;
const BOUNCE_DAMPING = 0.55;
const FRICTION = 0.96;
const MATCH_MIN = 3;

// ─── GAME ────────────────────────────────────────────────────────

class BubblePopTower {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.difficulty = 'easy';
    this.running = false;
    this.paused = false;
    this.audioCtx = null;
    this.animFrame = null;

    this.setupUI();
  }

  setupUI() {
    this.startScreen = document.getElementById('startScreen');
    this.gameScreen = document.getElementById('gameScreen');
    this.pauseOverlay = document.getElementById('pauseOverlay');
    this.gameOverOverlay = document.getElementById('gameOverOverlay');
    this.hudScore = document.getElementById('hudScore');
    this.hudCombo = document.getElementById('hudCombo');
    this.nextBubbleEl = document.getElementById('nextBubble');

    document.getElementById('startBtn').addEventListener('click', () => this.startGame());
    document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
    document.getElementById('resumeBtn').addEventListener('click', () => this.togglePause());
    document.getElementById('homeBtn').addEventListener('click', () => this.goHome());
    document.getElementById('retryBtn').addEventListener('click', () => {
      this.gameOverOverlay.classList.remove('active');
      this.startGame();
    });
    document.getElementById('goHomeBtn').addEventListener('click', () => {
      this.gameOverOverlay.classList.remove('active');
      this.goHome();
    });

    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.difficulty = btn.dataset.diff;
      });
    });

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.handleTap(touch.clientX);
    });
    this.canvas.addEventListener('mousedown', (e) => {
      this.handleTap(e.clientX);
    });

    // Track pointer for aim preview
    this.aimX = 0;
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      this.aimX = e.touches[0].clientX;
    });
    this.canvas.addEventListener('mousemove', (e) => {
      this.aimX = e.clientX;
    });

    window.addEventListener('resize', () => {
      if (this.running) this.resizeCanvas();
    });
  }

  setupAudio() {
    if (!this.audioCtx) {
      try {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {}
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playTone(freq, duration, type = 'sine') {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
    gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);
    osc.start();
    osc.stop(this.audioCtx.currentTime + duration);
  }

  playPop(count) {
    const base = 600 + Math.min(count, 10) * 80;
    for (let i = 0; i < Math.min(count, 5); i++) {
      setTimeout(() => this.playTone(base + i * 60, 0.12), i * 50);
    }
  }

  playDrop() {
    this.playTone(300, 0.08, 'triangle');
  }

  playBomb() {
    this.playTone(100, 0.3, 'sawtooth');
    setTimeout(() => this.playTone(80, 0.2, 'sawtooth'), 100);
  }

  playGameOver() {
    this.playTone(400, 0.15);
    setTimeout(() => this.playTone(300, 0.15), 150);
    setTimeout(() => this.playTone(200, 0.3), 300);
  }

  // ─── GAME STATE ────────────────────────────────────────────────

  resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.ctx.scale(dpr, dpr);
    this.W = window.innerWidth;
    this.H = window.innerHeight;
    this.bubbleRadius = Math.max(16, Math.min(28, this.W / 18));
    this.dangerLine = this.bubbleRadius * 4;
  }

  startGame() {
    this.setupAudio();
    this.resizeCanvas();

    this.startScreen.classList.remove('active');
    this.gameScreen.classList.add('active');

    const diff = DIFFICULTIES[this.difficulty];
    this.activeColors = BUBBLE_COLORS.slice(0, diff.colors);
    this.dropSpeed = diff.dropSpeed;
    this.powerupMult = diff.powerupMult;

    this.bubbles = [];
    this.falling = null;
    this.particles = [];
    this.floatingTexts = [];

    this.score = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.totalPopped = 0;
    this.gameOver = false;
    this.running = true;
    this.paused = false;
    this.checkingMatches = false;
    this.lastTime = performance.now();

    this.nextColor = this.randomBubbleColor();
    this.spawnFalling();
    this.updateHUD();
    this.updateNextPreview();
    this.loop();
  }

  randomBubbleColor() {
    // Small chance of powerup
    const pRoll = Math.random();
    let cumFreq = 0;
    for (const pu of POWERUPS) {
      cumFreq += pu.freq * this.powerupMult;
      if (pRoll < cumFreq) {
        return { ...pu, isPowerup: true };
      }
    }
    const c = this.activeColors[Math.floor(Math.random() * this.activeColors.length)];
    return { ...c, isPowerup: false };
  }

  spawnFalling() {
    const color = this.nextColor;
    this.nextColor = this.randomBubbleColor();
    this.updateNextPreview();

    this.falling = {
      x: this.W / 2,
      y: this.bubbleRadius + 8,
      vx: 0,
      vy: 0,
      radius: this.bubbleRadius,
      color,
      settled: false,
    };
    this.aimX = this.W / 2;
  }

  handleTap(clientX) {
    if (!this.running || this.paused || this.gameOver) return;
    if (!this.falling || this.falling.dropped) return;

    // Set horizontal position and drop
    this.falling.x = Math.max(this.bubbleRadius, Math.min(this.W - this.bubbleRadius, clientX));
    this.falling.dropped = true;
    this.falling.vy = this.dropSpeed;
    this.playDrop();
  }

  togglePause() {
    this.paused = !this.paused;
    if (this.paused) {
      this.pauseOverlay.classList.add('active');
      cancelAnimationFrame(this.animFrame);
    } else {
      this.pauseOverlay.classList.remove('active');
      this.lastTime = performance.now();
      this.loop();
    }
  }

  goHome() {
    this.running = false;
    this.paused = false;
    cancelAnimationFrame(this.animFrame);
    this.pauseOverlay.classList.remove('active');
    this.gameOverOverlay.classList.remove('active');
    this.gameScreen.classList.remove('active');
    this.startScreen.classList.add('active');
  }

  // ─── GAME LOOP ─────────────────────────────────────────────────

  loop() {
    if (!this.running || this.paused) return;

    const now = performance.now();
    const rawDt = (now - this.lastTime) / 16.67;
    const dt = Math.min(rawDt, 3);
    this.lastTime = now;

    this.update(dt);
    this.draw();

    this.animFrame = requestAnimationFrame(() => this.loop());
  }

  update(dt) {
    const r = this.bubbleRadius;

    // Update falling bubble
    if (this.falling && this.falling.dropped && !this.falling.settled) {
      const f = this.falling;
      f.vy += GRAVITY * dt;
      f.y += f.vy * dt;
      f.x += f.vx * dt;
      f.vx *= FRICTION;

      // Wall collisions
      if (f.x - r < 0) { f.x = r; f.vx = Math.abs(f.vx) * BOUNCE_DAMPING; }
      if (f.x + r > this.W) { f.x = this.W - r; f.vx = -Math.abs(f.vx) * BOUNCE_DAMPING; }

      // Floor collision
      if (f.y + r >= this.H) {
        f.y = this.H - r;
        f.vy = -Math.abs(f.vy) * BOUNCE_DAMPING;
        if (Math.abs(f.vy) < 0.5) {
          this.settleBubble(f);
        }
      }

      // Collision with settled bubbles
      for (const b of this.bubbles) {
        const dx = f.x - b.x;
        const dy = f.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = r * 2;

        if (dist < minDist && dist > 0) {
          // Push apart
          const overlap = minDist - dist;
          const nx = dx / dist;
          const ny = dy / dist;
          f.x += nx * overlap * 0.7;
          f.y += ny * overlap * 0.7;

          // Bounce
          const dot = f.vx * nx + f.vy * ny;
          f.vx -= dot * nx * (1 + BOUNCE_DAMPING);
          f.vy -= dot * ny * (1 + BOUNCE_DAMPING);

          // If sitting on top, settle
          if (f.vy < 0.8 && f.y < b.y) {
            this.settleBubble(f);
            break;
          }
        }
      }
    }

    // Animate settled bubbles (minor settling)
    for (const b of this.bubbles) {
      if (b.settleTimer > 0) {
        b.settleTimer -= dt;
        b.scale = 1 + Math.sin(b.settleTimer * 0.5) * 0.1;
      } else {
        b.scale = 1;
      }
    }

    // Particles
    this.particles = this.particles.filter(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 0.1 * dt;
      p.life -= 0.025 * dt;
      return p.life > 0;
    });

    // Floating texts
    this.floatingTexts = this.floatingTexts.filter(t => {
      t.y -= 1.2 * dt;
      t.life -= 0.02 * dt;
      return t.life > 0;
    });
  }

  settleBubble(f) {
    if (f.settled) return;
    f.settled = true;
    f.vy = 0;
    f.vx = 0;

    const bubble = {
      x: f.x,
      y: f.y,
      radius: this.bubbleRadius,
      color: f.color,
      scale: 1,
      settleTimer: 10,
      id: Date.now() + Math.random(),
    };

    this.bubbles.push(bubble);
    this.falling = null;

    // Check for matches after a tiny delay for visual feedback
    setTimeout(() => {
      if (!this.running) return;
      this.combo = 0;
      this.processMatches(bubble);
    }, 100);
  }

  processMatches(trigger) {
    if (this.gameOver) return;

    // Handle powerup
    if (trigger && trigger.color.isPowerup) {
      this.activatePowerup(trigger);
      return;
    }

    const matched = this.findMatches();
    if (matched.length >= MATCH_MIN) {
      this.combo++;
      if (this.combo > this.bestCombo) this.bestCombo = this.combo;

      const points = matched.length * 10 * this.combo;
      this.score += points;
      this.totalPopped += matched.length;

      // Spawn particles and floating text
      let cx = 0, cy = 0;
      const matchedSet = new Set(matched.map(b => b.id));
      for (const b of matched) {
        cx += b.x;
        cy += b.y;
        this.spawnPopParticles(b.x, b.y, b.color.hex);
      }
      cx /= matched.length;
      cy /= matched.length;

      this.floatingTexts.push({
        x: cx,
        y: cy,
        text: `+${points}`,
        combo: this.combo > 1 ? `${this.combo}x COMBO!` : '',
        life: 1,
      });

      this.playPop(matched.length);

      // Remove matched
      this.bubbles = this.bubbles.filter(b => !matchedSet.has(b.id));

      // Apply gravity to remaining bubbles
      this.applyGravity();

      // Check for chain reactions
      setTimeout(() => {
        if (!this.running) return;
        this.processMatches(null);
      }, 300);

      this.updateHUD();
    } else {
      // No more matches - check game over, then spawn next
      if (this.checkGameOver()) return;
      this.combo = 0;
      this.spawnFalling();
      this.updateHUD();
    }
  }

  findMatches() {
    const r = this.bubbleRadius;
    const visited = new Set();
    let bestGroup = [];

    for (const bubble of this.bubbles) {
      if (visited.has(bubble.id)) continue;
      if (bubble.color.isPowerup) continue;

      const group = [];
      const stack = [bubble];
      const groupVisited = new Set();

      while (stack.length > 0) {
        const current = stack.pop();
        if (groupVisited.has(current.id)) continue;
        groupVisited.add(current.id);
        visited.add(current.id);
        group.push(current);

        // Find neighbors of same color
        for (const other of this.bubbles) {
          if (groupVisited.has(other.id)) continue;
          if (other.color.isPowerup) continue;
          if (other.color.name !== current.color.name) continue;

          const dx = current.x - other.x;
          const dy = current.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < r * 2.5) {
            stack.push(other);
          }
        }
      }

      if (group.length >= MATCH_MIN && group.length > bestGroup.length) {
        bestGroup = group;
      }
    }

    return bestGroup;
  }

  activatePowerup(bubble) {
    const type = bubble.color.type;
    const idx = this.bubbles.indexOf(bubble);
    if (idx !== -1) this.bubbles.splice(idx, 1);

    if (type === 'bomb') {
      this.playBomb();
      // Clear all bubbles within blast radius
      const blastR = this.bubbleRadius * 5;
      const toRemove = this.bubbles.filter(b => {
        const dx = b.x - bubble.x;
        const dy = b.y - bubble.y;
        return Math.sqrt(dx * dx + dy * dy) < blastR;
      });
      const points = toRemove.length * 15;
      this.score += points;
      this.totalPopped += toRemove.length;
      toRemove.forEach(b => this.spawnPopParticles(b.x, b.y, b.color.hex || '#ff8800'));
      this.bubbles = this.bubbles.filter(b => !toRemove.includes(b));
      this.floatingTexts.push({ x: bubble.x, y: bubble.y, text: `💣 +${points}`, combo: '', life: 1 });

      // Big explosion particles
      for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 * i) / 20;
        this.particles.push({
          x: bubble.x, y: bubble.y,
          vx: Math.cos(angle) * (3 + Math.random() * 3),
          vy: Math.sin(angle) * (3 + Math.random() * 3),
          life: 1,
          color: '#ff8800',
          size: 6 + Math.random() * 4,
        });
      }
    } else if (type === 'rainbow') {
      // Find the most common color touching and match all of that color
      const neighbors = this.bubbles.filter(b => {
        const dx = b.x - bubble.x;
        const dy = b.y - bubble.y;
        return Math.sqrt(dx * dx + dy * dy) < this.bubbleRadius * 3 && !b.color.isPowerup;
      });

      if (neighbors.length > 0) {
        // Count colors
        const counts = {};
        neighbors.forEach(b => {
          counts[b.color.name] = (counts[b.color.name] || 0) + 1;
        });
        const targetColor = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
        const toRemove = this.bubbles.filter(b => b.color.name === targetColor);
        const points = toRemove.length * 20;
        this.score += points;
        this.totalPopped += toRemove.length;
        toRemove.forEach(b => this.spawnPopParticles(b.x, b.y, b.color.hex));
        this.bubbles = this.bubbles.filter(b => b.color.name !== targetColor);
        this.floatingTexts.push({ x: bubble.x, y: bubble.y, text: `🌈 +${points}`, combo: '', life: 1 });
        this.playPop(toRemove.length);
      }
    } else if (type === 'star') {
      // Clear the row at this Y level
      const rowH = this.bubbleRadius * 2.5;
      const toRemove = this.bubbles.filter(b => Math.abs(b.y - bubble.y) < rowH);
      const points = toRemove.length * 15;
      this.score += points;
      this.totalPopped += toRemove.length;
      toRemove.forEach(b => this.spawnPopParticles(b.x, b.y, b.color.hex || '#ffd166'));
      this.bubbles = this.bubbles.filter(b => !toRemove.includes(b));
      this.floatingTexts.push({ x: bubble.x, y: bubble.y, text: `⭐ +${points}`, combo: '', life: 1 });
      this.playPop(toRemove.length);
    }

    this.applyGravity();
    this.updateHUD();

    setTimeout(() => {
      if (!this.running) return;
      this.processMatches(null);
    }, 400);
  }

  applyGravity() {
    // Simple gravity: let bubbles fall if nothing below them
    let moved = true;
    let iterations = 0;
    while (moved && iterations < 20) {
      moved = false;
      iterations++;
      for (const b of this.bubbles) {
        const oldY = b.y;
        // Check floor
        let targetY = this.H - b.radius;

        // Check bubbles below
        for (const other of this.bubbles) {
          if (other === b) continue;
          const dx = b.x - other.x;
          const dy = b.y - other.y;
          if (dy < 0 && Math.abs(dx) < b.radius * 2) {
            const aboveY = other.y - b.radius * 2;
            if (aboveY < targetY) targetY = aboveY;
          }
        }

        if (targetY > b.y + 1) {
          b.y = Math.min(b.y + 4, targetY);
          moved = true;
        }
      }
    }
  }

  spawnPopParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.3;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * (2 + Math.random() * 2),
        vy: Math.sin(angle) * (2 + Math.random() * 2) - 1,
        life: 1,
        color,
        size: 3 + Math.random() * 4,
      });
    }
  }

  checkGameOver() {
    const anyAboveLine = this.bubbles.some(b => b.y - b.radius < this.dangerLine);
    if (anyAboveLine) {
      this.gameOver = true;
      this.running = false;
      cancelAnimationFrame(this.animFrame);
      this.playGameOver();

      document.getElementById('goScore').textContent = this.score;
      document.getElementById('goCombo').textContent = this.bestCombo;
      document.getElementById('goPopped').textContent = this.totalPopped;

      const titles = ['Game Over!', 'Nice Tower!', 'Great Run!', 'So Close!', 'Wow!'];
      document.getElementById('goTitle').textContent = titles[Math.floor(Math.random() * titles.length)];

      setTimeout(() => {
        this.gameOverOverlay.classList.add('active');
      }, 600);
      return true;
    }
    return false;
  }

  // ─── DRAWING ───────────────────────────────────────────────────

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);

    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, this.H);
    grad.addColorStop(0, '#1a1a2e');
    grad.addColorStop(1, '#16213e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.W, this.H);

    // Grid lines (subtle)
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    const gridSize = this.bubbleRadius * 2;
    for (let x = gridSize; x < this.W; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.H);
      ctx.stroke();
    }

    // Danger line
    const dangerAlpha = this.bubbles.some(b => b.y - b.radius < this.dangerLine + this.bubbleRadius * 3)
      ? 0.6 + Math.sin(performance.now() * 0.008) * 0.3
      : 0.15;
    ctx.strokeStyle = `rgba(233,69,96,${dangerAlpha})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(0, this.dangerLine);
    ctx.lineTo(this.W, this.dangerLine);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw aim guide for falling bubble
    if (this.falling && !this.falling.dropped) {
      const aimX = Math.max(this.bubbleRadius, Math.min(this.W - this.bubbleRadius, this.aimX));
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(aimX, this.falling.y);
      ctx.lineTo(aimX, this.H);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Settled bubbles
    for (const b of this.bubbles) {
      this.drawBubble(ctx, b.x, b.y, b.radius * (b.scale || 1), b.color);
    }

    // Falling bubble
    if (this.falling) {
      const f = this.falling;
      const drawX = f.dropped ? f.x : Math.max(f.radius, Math.min(this.W - f.radius, this.aimX));
      const drawY = f.y;
      this.drawBubble(ctx, drawX, drawY, f.radius, f.color);
    }

    // Particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Floating texts
    for (const t of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, t.life);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t.text, t.x, t.y);
      if (t.combo) {
        ctx.fillStyle = '#ffd166';
        ctx.font = 'bold 18px system-ui, sans-serif';
        ctx.fillText(t.combo, t.x, t.y - 28);
      }
      ctx.restore();
    }
  }

  drawBubble(ctx, x, y, radius, color) {
    ctx.save();

    if (color.isPowerup) {
      // Powerup bubble
      ctx.shadowColor = 'rgba(255,255,255,0.5)';
      ctx.shadowBlur = 12;
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.font = `${radius * 1.2}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(color.emoji, x, y);
    } else {
      // Regular bubble with glow
      ctx.shadowColor = color.glow;
      ctx.shadowBlur = 10;

      // Main circle
      const bGrad = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, radius * 0.1, x, y, radius);
      bGrad.addColorStop(0, this.lighten(color.hex, 40));
      bGrad.addColorStop(0.7, color.hex);
      bGrad.addColorStop(1, this.darken(color.hex, 30));
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;

      // Highlight
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath();
      ctx.ellipse(x - radius * 0.25, y - radius * 0.3, radius * 0.35, radius * 0.2, -0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  lighten(hex, amount) {
    const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount);
    const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount);
    const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount);
    return `rgb(${r},${g},${b})`;
  }

  darken(hex, amount) {
    const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
    const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
    const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
    return `rgb(${r},${g},${b})`;
  }

  updateHUD() {
    this.hudScore.textContent = `Score: ${this.score}`;
    if (this.combo > 1) {
      this.hudCombo.textContent = `${this.combo}x Combo!`;
      this.hudCombo.style.color = '#ffd166';
    } else {
      this.hudCombo.textContent = '';
    }
  }

  updateNextPreview() {
    const c = this.nextColor;
    if (c.isPowerup) {
      this.nextBubbleEl.innerHTML = `Next: ${c.emoji}`;
    } else {
      this.nextBubbleEl.innerHTML = `Next: <span class="next-preview" style="background:${c.hex};"></span>`;
    }
  }

  // ─── SERVICE WORKER ────────────────────────────────────────────

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./service-worker.js')
        .catch(e => console.log('SW failed', e));
    }
  }
}

// ─── BOOT ────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  window.game = new BubblePopTower();
  window.game.registerServiceWorker();
});
