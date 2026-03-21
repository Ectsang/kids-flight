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
  easy:   { colors: 5, dropSpeed: 3.5, matchCount: 3, powerupMult: 0.8, quakeInterval: 0, quakeForce: 0 },
  medium: { colors: 6, dropSpeed: 5.0, matchCount: 3, powerupMult: 0.5, quakeInterval: 900, quakeForce: 3 },
  hard:   { colors: 6, dropSpeed: 7.0, matchCount: 4, powerupMult: 0.3, quakeInterval: 500, quakeForce: 5 },
};

const TERRAIN_PROFILES = [
  { name: 'Flat',      gen: (x, W, H) => H },
  { name: 'Hill',      gen: (x, W, H) => H - Math.sin((x / W) * Math.PI) * H * 0.2 },
  { name: 'Valley',    gen: (x, W, H) => H - H * 0.22 + Math.sin((x / W) * Math.PI) * H * 0.22 },
  { name: 'Steps',     gen: (x, W, H) => { const s = Math.floor(x / (W / 4)); return H - [0, 0.12, 0.06, 0.18][s % 4] * H; } },
  { name: 'Slopes',    gen: (x, W, H) => H - (x / W) * H * 0.25 },
  { name: 'Waves',     gen: (x, W, H) => H - Math.sin((x / W) * Math.PI * 3) * H * 0.1 - H * 0.05 },
  { name: 'Funnel',    gen: (x, W, H) => H - Math.abs(x - W / 2) / (W / 2) * H * 0.2 },
  { name: 'Peaks',     gen: (x, W, H) => H - (Math.sin((x / W) * Math.PI * 2) * 0.5 + 0.5) * H * 0.18 - H * 0.04 },
];

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

    // Terrain
    this.generateTerrain();

    // Earthquake
    this.quakeTimer = 0;
    this.quakeActive = 0;
    this.quakeOffsetX = 0;
    this.quakeOffsetY = 0;
    this.bubblesDropped = 0;

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

  // ─── TERRAIN ────────────────────────────────────────────────────

  generateTerrain() {
    // Pick a random non-flat profile (flat 30% of the time)
    const roll = Math.random();
    if (roll < 0.15) {
      this.terrainProfile = TERRAIN_PROFILES[0]; // flat
    } else {
      const nonFlat = TERRAIN_PROFILES.slice(1);
      this.terrainProfile = nonFlat[Math.floor(Math.random() * nonFlat.length)];
    }

    // Pre-compute terrain heights at each pixel
    this.terrainHeights = new Float32Array(Math.ceil(this.W) + 1);
    for (let x = 0; x <= this.W; x++) {
      this.terrainHeights[x] = this.terrainProfile.gen(x, this.W, this.H);
    }
  }

  getTerrainY(x) {
    const clamped = Math.max(0, Math.min(this.W, Math.round(x)));
    return this.terrainHeights[clamped] || this.H;
  }

  getTerrainNormal(x) {
    const x0 = Math.max(0, x - 2);
    const x1 = Math.min(this.W, x + 2);
    const y0 = this.getTerrainY(x0);
    const y1 = this.getTerrainY(x1);
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.sqrt(dx * dx + dy * dy);
    return { nx: -dy / len, ny: dx / len };
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

    // ── Physics for ALL bubbles (settled + falling) ──
    // Build a single list of all physics bodies
    const allBodies = [...this.bubbles];
    if (this.falling && this.falling.dropped && !this.falling.settled) {
      allBodies.push(this.falling);
    }

    // Apply gravity to all bodies
    for (const b of allBodies) {
      b.vy = (b.vy || 0) + GRAVITY * dt;
      b.vx = (b.vx || 0) * FRICTION;
      b.x += (b.vx || 0) * dt;
      b.y += (b.vy || 0) * dt;
    }

    // Wall collisions for all
    for (const b of allBodies) {
      if (b.x - r < 0) { b.x = r; b.vx = Math.abs(b.vx || 0) * BOUNCE_DAMPING; }
      if (b.x + r > this.W) { b.x = this.W - r; b.vx = -Math.abs(b.vx || 0) * BOUNCE_DAMPING; }
    }

    // Terrain collisions for all
    for (const b of allBodies) {
      const terrainY = this.getTerrainY(b.x);
      if (b.y + r >= terrainY) {
        b.y = terrainY - r;
        const { nx, ny } = this.getTerrainNormal(b.x);
        const dot = (b.vx || 0) * nx + (b.vy || 0) * ny;
        if (dot < 0) {
          b.vx -= 2 * dot * nx * BOUNCE_DAMPING;
          b.vy -= 2 * dot * ny * BOUNCE_DAMPING;
        }
        // Slope slide
        const slopeX = -ny; // tangent direction
        b.vx += slopeX * GRAVITY * 0.5 * dt;
      }
    }

    // Bubble-vs-bubble collisions (all pairs, with momentum transfer)
    for (let i = 0; i < allBodies.length; i++) {
      for (let j = i + 1; j < allBodies.length; j++) {
        const a = allBodies[i];
        const b = allBodies[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = r * 2;

        if (dist < minDist && dist > 0.1) {
          const overlap = minDist - dist;
          const nx = dx / dist;
          const ny = dy / dist;

          // Push apart (50/50 split)
          a.x -= nx * overlap * 0.5;
          a.y -= ny * overlap * 0.5;
          b.x += nx * overlap * 0.5;
          b.y += ny * overlap * 0.5;

          // Relative velocity
          const dvx = (b.vx || 0) - (a.vx || 0);
          const dvy = (b.vy || 0) - (a.vy || 0);
          const dvDot = dvx * nx + dvy * ny;

          // Only resolve if approaching
          if (dvDot < 0) {
            const impulse = dvDot * (1 + BOUNCE_DAMPING) * 0.5;
            a.vx = (a.vx || 0) + impulse * nx;
            a.vy = (a.vy || 0) + impulse * ny;
            b.vx = (b.vx || 0) - impulse * nx;
            b.vy = (b.vy || 0) - impulse * ny;
          }
        }
      }
    }

    // Check if falling bubble has come to rest → settle it
    if (this.falling && this.falling.dropped && !this.falling.settled) {
      const f = this.falling;
      const speed = Math.sqrt((f.vx || 0) ** 2 + (f.vy || 0) ** 2);
      const terrainY = this.getTerrainY(f.x);
      const onGround = f.y + r >= terrainY - 1;
      const onBubble = this.bubbles.some(b => {
        const d = Math.sqrt((f.x - b.x) ** 2 + (f.y - b.y) ** 2);
        return d < r * 2.2 && f.y < b.y;
      });

      if (speed < 0.8 && (onGround || onBubble)) {
        this.settleBubble(f);
      }
    }

    // Check all settled bubbles are still at rest, mark moving ones
    let anyMoving = false;
    for (const b of this.bubbles) {
      const speed = Math.sqrt((b.vx || 0) ** 2 + (b.vy || 0) ** 2);
      if (speed < 0.3) {
        b.vx = 0;
        b.vy = 0;
      } else {
        anyMoving = true;
      }
      // Visual scale bounce on impact
      if (b.settleTimer > 0) {
        b.settleTimer -= dt;
        b.scale = 1 + Math.sin(b.settleTimer * 0.5) * 0.08;
      } else {
        b.scale = 1;
      }
    }

    // Earthquake logic
    const diff = DIFFICULTIES[this.difficulty];
    if (diff.quakeInterval > 0) {
      this.quakeTimer += dt;
      if (this.quakeTimer >= diff.quakeInterval && this.quakeActive <= 0) {
        this.quakeActive = 40;
        this.quakeTimer = 0;
        this.playTone(80, 0.4, 'sawtooth');
        this.floatingTexts.push({
          x: this.W / 2, y: this.H * 0.3,
          text: '🌋 EARTHQUAKE!', combo: '', life: 1.2,
        });
      }
    }

    if (this.quakeActive > 0) {
      this.quakeActive -= dt;
      const intensity = Math.min(1, this.quakeActive / 20);
      this.quakeOffsetX = (Math.random() - 0.5) * diff.quakeForce * 2 * intensity;
      this.quakeOffsetY = (Math.random() - 0.5) * diff.quakeForce * intensity;

      // Kick all settled bubbles with real velocity
      for (const b of this.bubbles) {
        b.vx = (b.vx || 0) + (Math.random() - 0.5) * diff.quakeForce * 0.8 * dt;
        b.vy = (b.vy || 0) - Math.random() * diff.quakeForce * 0.3 * dt;
      }

      if (this.quakeActive <= 0) {
        this.quakeOffsetX = 0;
        this.quakeOffsetY = 0;
        // After quake settles, check for matches
        setTimeout(() => {
          if (this.running && !this.falling) this.processMatches(null);
        }, 600);
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

    const bubble = {
      x: f.x,
      y: f.y,
      vx: (f.vx || 0) * 0.3, // keep some residual momentum
      vy: (f.vy || 0) * 0.3,
      radius: this.bubbleRadius,
      color: f.color,
      scale: 1,
      settleTimer: 10,
      id: Date.now() + Math.random(),
    };

    this.bubbles.push(bubble);
    this.falling = null;

    // Check for matches after physics settle a bit
    setTimeout(() => {
      if (!this.running) return;
      this.combo = 0;
      this.processMatches(bubble);
    }, 250);
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
      const blastR = this.bubbleRadius * 5;
      const toRemove = [];
      // Blast: remove nearby, push away the rest
      for (const b of this.bubbles) {
        const dx = b.x - bubble.x;
        const dy = b.y - bubble.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < blastR) {
          toRemove.push(b);
        } else if (dist < blastR * 2) {
          // Shockwave pushes nearby bubbles
          const force = (1 - dist / (blastR * 2)) * 8;
          b.vx = (b.vx || 0) + (dx / dist) * force;
          b.vy = (b.vy || 0) + (dy / dist) * force - 2;
        }
      }
      const points = toRemove.length * 15;
      this.score += points;
      this.totalPopped += toRemove.length;
      const removeSet = new Set(toRemove.map(b => b.id));
      toRemove.forEach(b => this.spawnPopParticles(b.x, b.y, b.color.hex || '#ff8800'));
      this.bubbles = this.bubbles.filter(b => !removeSet.has(b.id));
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
    // Give all bubbles a small downward kick so physics resolves naturally
    for (const b of this.bubbles) {
      b.vy = (b.vy || 0) + 1;
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

    // Apply earthquake screen shake
    ctx.save();
    if (this.quakeActive > 0) {
      ctx.translate(this.quakeOffsetX, this.quakeOffsetY);
    }

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.H);
    bgGrad.addColorStop(0, '#1a1a2e');
    bgGrad.addColorStop(1, '#16213e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(-10, -10, this.W + 20, this.H + 20);

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

    // Draw terrain
    this.drawTerrain(ctx);

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
      ctx.lineTo(aimX, this.getTerrainY(aimX));
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

    // Close earthquake transform
    ctx.restore();
  }

  drawTerrain(ctx) {
    if (!this.terrainHeights) return;

    // Terrain fill
    const tGrad = ctx.createLinearGradient(0, this.H * 0.7, 0, this.H);
    tGrad.addColorStop(0, 'rgba(30,40,70,0.9)');
    tGrad.addColorStop(1, 'rgba(20,28,50,1)');

    ctx.fillStyle = tGrad;
    ctx.beginPath();
    ctx.moveTo(0, this.H + 5);
    const step = 3;
    for (let x = 0; x <= this.W; x += step) {
      ctx.lineTo(x, this.getTerrainY(x));
    }
    ctx.lineTo(this.W, this.H + 5);
    ctx.closePath();
    ctx.fill();

    // Terrain edge highlight
    ctx.strokeStyle = 'rgba(100,140,200,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x <= this.W; x += step) {
      if (x === 0) ctx.moveTo(x, this.getTerrainY(x));
      else ctx.lineTo(x, this.getTerrainY(x));
    }
    ctx.stroke();

    // Terrain surface dots for texture
    ctx.fillStyle = 'rgba(100,140,200,0.08)';
    for (let x = 10; x < this.W; x += 20) {
      const ty = this.getTerrainY(x);
      ctx.beginPath();
      ctx.arc(x, ty + 8, 2, 0, Math.PI * 2);
      ctx.fill();
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
    } else if (this.terrainProfile && this.terrainProfile.name !== 'Flat') {
      this.hudCombo.textContent = `⛰️ ${this.terrainProfile.name}`;
      this.hudCombo.style.color = '#74b9ff';
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
