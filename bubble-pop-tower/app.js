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
  easy:   { colors: 5, dropSpeed: 6, matchCount: 3, powerupMult: 0.8, quakeInterval: 0, quakeForce: 0 },
  medium: { colors: 6, dropSpeed: 9, matchCount: 3, powerupMult: 0.5, quakeInterval: 900, quakeForce: 5 },
  hard:   { colors: 6, dropSpeed: 12, matchCount: 4, powerupMult: 0.3, quakeInterval: 500, quakeForce: 8 },
};

const TERRAIN_PROFILES = [
  { name: 'Flat',      gen: (x, W, H) => H * 0.88 },
  { name: 'Hill',      gen: (x, W, H) => H * 0.88 - Math.sin((x / W) * Math.PI) * H * 0.18 },
  { name: 'Valley',    gen: (x, W, H) => H * 0.7 + Math.sin((x / W) * Math.PI) * H * 0.18 },
  { name: 'Steps',     gen: (x, W, H) => { const s = Math.floor(x / (W / 4)); return H * 0.88 - [0, 0.12, 0.06, 0.18][s % 4] * H; } },
  { name: 'Slopes',    gen: (x, W, H) => H * 0.88 - (x / W) * H * 0.2 },
  { name: 'Waves',     gen: (x, W, H) => H * 0.83 - Math.sin((x / W) * Math.PI * 3) * H * 0.08 },
  { name: 'Funnel',    gen: (x, W, H) => H * 0.88 - Math.abs(x - W / 2) / (W / 2) * H * 0.18 },
  { name: 'Peaks',     gen: (x, W, H) => H * 0.84 - (Math.sin((x / W) * Math.PI * 2) * 0.5 + 0.5) * H * 0.16 },
];

const MATCH_MIN = 3;

const { Engine, World, Bodies, Body, Composite, Events, Vector } = Matter;

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
      this.handleTap(e.touches[0].clientX);
    });
    this.canvas.addEventListener('mousedown', (e) => {
      this.handleTap(e.clientX);
    });

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

  // ─── AUDIO ──────────────────────────────────────────────────────

  setupAudio() {
    if (!this.audioCtx) {
      try { this.audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') this.audioCtx.resume();
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
  playDrop() { this.playTone(300, 0.08, 'triangle'); }
  playBomb() { this.playTone(100, 0.3, 'sawtooth'); setTimeout(() => this.playTone(80, 0.2, 'sawtooth'), 100); }
  playGameOver() { this.playTone(400, 0.15); setTimeout(() => this.playTone(300, 0.15), 150); setTimeout(() => this.playTone(200, 0.3), 300); }

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

    // Matter.js engine
    this.engine = Engine.create({ gravity: { x: 0, y: 1.2 } });
    this.world = this.engine.world;

    // Game state
    this.bubbles = [];       // { body, color, id, scale, settleTimer }
    this.falling = null;     // { body, color, dropped }
    this.particles = [];
    this.floatingTexts = [];

    this.score = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.totalPopped = 0;
    this.gameOver = false;
    this.running = true;
    this.paused = false;
    this.lastTime = performance.now();

    // Terrain
    this.generateTerrain();
    this.buildTerrainBodies();
    this.buildWalls();
    this.turnsSinceTerrain = 0;
    this.nextTerrainShift = 4 + Math.floor(Math.random() * 5);
    this.terrainShifting = false;
    this.terrainShiftTimer = 0;
    this.oldTerrainHeights = null;
    this.newTerrainHeights = null;

    // Earthquake
    this.quakeTimer = 0;
    this.quakeActive = 0;
    this.quakeOffsetX = 0;
    this.quakeOffsetY = 0;

    this.nextColor = this.randomBubbleColor();
    this.spawnFalling();
    this.updateHUD();
    this.updateNextPreview();
    this.loop();
  }

  // ─── MATTER.JS TERRAIN & WALLS ─────────────────────────────────

  buildTerrainBodies() {
    // Remove old terrain bodies
    if (this.terrainBodies) {
      Composite.remove(this.world, this.terrainBodies);
    }
    // Build terrain as chain of small static rectangles
    this.terrainBodies = [];
    const step = 10;
    for (let x = 0; x <= this.W - step; x += step) {
      const y0 = this.getTerrainY(x);
      const y1 = this.getTerrainY(x + step);
      const cx = x + step / 2;
      const cy = (y0 + y1) / 2;
      const dx = step;
      const dy = y1 - y0;
      const len = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      const seg = Bodies.rectangle(cx, cy + len / 2, len, len, {
        isStatic: true,
        angle: angle,
        friction: 0.3,
        restitution: 0.4,
        label: 'terrain',
      });
      this.terrainBodies.push(seg);
    }
    Composite.add(this.world, this.terrainBodies);
  }

  buildWalls() {
    if (this.wallBodies) Composite.remove(this.world, this.wallBodies);
    const thick = 60;
    this.wallBodies = [
      // Left wall
      Bodies.rectangle(-thick / 2, this.H / 2, thick, this.H * 2, { isStatic: true, restitution: 0.5, label: 'wall' }),
      // Right wall
      Bodies.rectangle(this.W + thick / 2, this.H / 2, thick, this.H * 2, { isStatic: true, restitution: 0.5, label: 'wall' }),
      // Floor (safety net below terrain)
      Bodies.rectangle(this.W / 2, this.H + thick, this.W * 2, thick, { isStatic: true, restitution: 0.3, label: 'floor' }),
    ];
    Composite.add(this.world, this.wallBodies);
  }

  createBubbleBody(x, y, opts = {}) {
    return Bodies.circle(x, y, this.bubbleRadius, {
      restitution: 0.5,
      friction: 0.05,
      frictionAir: 0.01,
      density: 0.002,
      label: 'bubble',
      ...opts,
    });
  }

  // ─── TERRAIN ────────────────────────────────────────────────────

  generateTerrain() {
    const roll = Math.random();
    if (roll < 0.15) {
      this.terrainProfile = TERRAIN_PROFILES[0];
    } else {
      const nonFlat = TERRAIN_PROFILES.slice(1);
      this.terrainProfile = nonFlat[Math.floor(Math.random() * nonFlat.length)];
    }
    this.terrainHeights = new Float32Array(Math.ceil(this.W) + 1);
    for (let x = 0; x <= this.W; x++) {
      this.terrainHeights[x] = this.terrainProfile.gen(x, this.W, this.H);
    }
  }

  getTerrainY(x) {
    const clamped = Math.max(0, Math.min(this.W, Math.round(x)));
    return this.terrainHeights[clamped] || this.H;
  }

  // ─── GAME LOGIC ────────────────────────────────────────────────

  randomBubbleColor() {
    const pRoll = Math.random();
    let cumFreq = 0;
    for (const pu of POWERUPS) {
      cumFreq += pu.freq * this.powerupMult;
      if (pRoll < cumFreq) return { ...pu, isPowerup: true };
    }
    const c = this.activeColors[Math.floor(Math.random() * this.activeColors.length)];
    return { ...c, isPowerup: false };
  }

  spawnFalling() {
    const color = this.nextColor;
    this.nextColor = this.randomBubbleColor();
    this.updateNextPreview();

    // Create a sensor body (no physics until dropped)
    this.falling = {
      x: this.W / 2,
      y: this.bubbleRadius + 8,
      color,
      dropped: false,
      body: null,
    };
    this.aimX = this.W / 2;
  }

  handleTap(clientX) {
    if (!this.running || this.paused || this.gameOver) return;
    if (!this.falling || this.falling.dropped) return;

    const x = Math.max(this.bubbleRadius, Math.min(this.W - this.bubbleRadius, clientX));
    const body = this.createBubbleBody(x, this.falling.y);
    Body.setVelocity(body, { x: 0, y: this.dropSpeed });
    Composite.add(this.world, body);

    this.falling.body = body;
    this.falling.dropped = true;
    this.falling.x = x;
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
    if (this.engine) Engine.clear(this.engine);
  }

  // ─── GAME LOOP ─────────────────────────────────────────────────

  loop() {
    if (!this.running || this.paused) return;

    const now = performance.now();
    const elapsed = now - this.lastTime;
    this.lastTime = now;

    // Step Matter.js engine (fixed timestep for stability)
    Engine.update(this.engine, Math.min(elapsed, 32));

    this.update(elapsed);
    this.draw();

    this.animFrame = requestAnimationFrame(() => this.loop());
  }

  update(elapsed) {
    const dt = Math.min(elapsed / 16.67, 3);
    const r = this.bubbleRadius;

    // Sync bubble positions from Matter.js bodies
    for (const b of this.bubbles) {
      b.x = b.body.position.x;
      b.y = b.body.position.y;
      if (b.settleTimer > 0) {
        b.settleTimer -= dt;
        b.scale = 1 + Math.sin(b.settleTimer * 0.5) * 0.08;
      } else {
        b.scale = 1;
      }
    }

    // Check if falling bubble has settled
    if (this.falling && this.falling.dropped && this.falling.body) {
      const body = this.falling.body;
      this.falling.x = body.position.x;
      this.falling.y = body.position.y;
      const speed = body.speed;

      if (speed < 0.5) {
        this.falling.settleCounter = (this.falling.settleCounter || 0) + dt;
        if (this.falling.settleCounter > 8) {
          this.settleBubble(this.falling);
        }
      } else {
        this.falling.settleCounter = 0;
      }
    }

    // Terrain shifting
    if (this.terrainShifting) {
      this.terrainShiftTimer += dt * 0.03;
      if (this.terrainShiftTimer >= 1) {
        this.terrainShifting = false;
        this.terrainShiftTimer = 0;
        this.terrainHeights = this.newTerrainHeights;
        this.oldTerrainHeights = null;
        this.newTerrainHeights = null;
        this.buildTerrainBodies();
        // Wake all bubbles
        for (const b of this.bubbles) Body.setVelocity(b.body, { x: 0, y: 2 });
      } else {
        const t = this.terrainShiftTimer;
        const smooth = t * t * (3 - 2 * t);
        for (let x = 0; x <= this.W; x++) {
          this.terrainHeights[x] = this.oldTerrainHeights[x] + (this.newTerrainHeights[x] - this.oldTerrainHeights[x]) * smooth;
        }
        this.buildTerrainBodies();
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
        this.floatingTexts.push({ x: this.W / 2, y: this.H * 0.3, text: '🌋 EARTHQUAKE!', combo: '', life: 1.2 });
      }
    }

    if (this.quakeActive > 0) {
      this.quakeActive -= dt;
      const intensity = Math.min(1, this.quakeActive / 20);
      this.quakeOffsetX = (Math.random() - 0.5) * diff.quakeForce * 2 * intensity;
      this.quakeOffsetY = (Math.random() - 0.5) * diff.quakeForce * intensity;

      for (const b of this.bubbles) {
        Body.applyForce(b.body, b.body.position, {
          x: (Math.random() - 0.5) * diff.quakeForce * 0.002,
          y: -Math.random() * diff.quakeForce * 0.001,
        });
      }

      if (this.quakeActive <= 0) {
        this.quakeOffsetX = 0;
        this.quakeOffsetY = 0;
        setTimeout(() => {
          if (this.running && !this.falling) this.processMatches(null);
        }, 600);
      }
    }

    // Periodic match check when idle
    if (!this.falling && !this.gameOver && this.bubbles.length >= MATCH_MIN) {
      this.idleMatchTimer = (this.idleMatchTimer || 0) + dt;
      if (this.idleMatchTimer > 30) {
        this.idleMatchTimer = 0;
        const matched = this.findMatches();
        if (matched.length >= MATCH_MIN) {
          this.combo = 0;
          this.processMatches(null);
        }
      }
    } else {
      this.idleMatchTimer = 0;
    }

    // Particles & floating texts
    this.particles = this.particles.filter(p => {
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 0.1 * dt; p.life -= 0.025 * dt;
      return p.life > 0;
    });
    this.floatingTexts = this.floatingTexts.filter(t => {
      t.y -= 1.2 * dt; t.life -= 0.02 * dt;
      return t.life > 0;
    });
  }

  settleBubble(f) {
    const bubble = {
      body: f.body,
      x: f.body.position.x,
      y: f.body.position.y,
      radius: this.bubbleRadius,
      color: f.color,
      scale: 1,
      settleTimer: 10,
      id: Date.now() + Math.random(),
    };

    this.bubbles.push(bubble);
    this.falling = null;

    this.turnsSinceTerrain++;
    if (this.turnsSinceTerrain >= this.nextTerrainShift && !this.terrainShifting) {
      this.shiftTerrain();
    }

    setTimeout(() => {
      if (!this.running) return;
      this.combo = 0;
      this.processMatches(bubble);
    }, 350);
  }

  shiftTerrain() {
    this.turnsSinceTerrain = 0;
    this.nextTerrainShift = 4 + Math.floor(Math.random() * 5);

    const currentName = this.terrainProfile.name;
    const others = TERRAIN_PROFILES.filter(t => t.name !== currentName);
    this.terrainProfile = others[Math.floor(Math.random() * others.length)];

    this.oldTerrainHeights = new Float32Array(this.terrainHeights);
    this.newTerrainHeights = new Float32Array(Math.ceil(this.W) + 1);
    for (let x = 0; x <= this.W; x++) {
      this.newTerrainHeights[x] = this.terrainProfile.gen(x, this.W, this.H);
    }

    this.terrainShifting = true;
    this.terrainShiftTimer = 0;

    this.playTone(150, 0.3, 'sawtooth');
    this.floatingTexts.push({ x: this.W / 2, y: this.H * 0.4, text: `⛰️ ${this.terrainProfile.name}!`, combo: '', life: 1.5 });
  }

  // ─── MATCHING & SCORING ─────────────────────────────────────────

  processMatches(trigger) {
    if (this.gameOver) return;

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

      let cx = 0, cy = 0;
      const matchedSet = new Set(matched.map(b => b.id));
      for (const b of matched) {
        cx += b.x; cy += b.y;
        this.spawnPopParticles(b.x, b.y, b.color.hex);
        Composite.remove(this.world, b.body);
      }
      cx /= matched.length; cy /= matched.length;

      this.floatingTexts.push({
        x: cx, y: cy,
        text: `+${points}`,
        combo: this.combo > 1 ? `${this.combo}x COMBO!` : '',
        life: 1,
      });
      this.playPop(matched.length);

      this.bubbles = this.bubbles.filter(b => !matchedSet.has(b.id));

      setTimeout(() => {
        if (!this.running) return;
        this.processMatches(null);
      }, 300);

      this.updateHUD();
    } else {
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

        for (const other of this.bubbles) {
          if (groupVisited.has(other.id)) continue;
          if (other.color.isPowerup) continue;
          if (other.color.name !== current.color.name) continue;

          const dx = current.x - other.x;
          const dy = current.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < r * 4) {
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
    if (idx !== -1) {
      Composite.remove(this.world, bubble.body);
      this.bubbles.splice(idx, 1);
    }

    if (type === 'bomb') {
      this.playBomb();
      const blastR = this.bubbleRadius * 5;
      const toRemove = [];
      for (const b of this.bubbles) {
        const dx = b.x - bubble.x;
        const dy = b.y - bubble.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < blastR) {
          toRemove.push(b);
        } else if (dist < blastR * 2 && dist > 0) {
          const force = (1 - dist / (blastR * 2)) * 0.05;
          Body.applyForce(b.body, b.body.position, { x: (dx / dist) * force, y: (dy / dist) * force - 0.02 });
        }
      }
      const points = toRemove.length * 15;
      this.score += points;
      this.totalPopped += toRemove.length;
      const removeSet = new Set(toRemove.map(b => b.id));
      toRemove.forEach(b => { this.spawnPopParticles(b.x, b.y, b.color.hex || '#ff8800'); Composite.remove(this.world, b.body); });
      this.bubbles = this.bubbles.filter(b => !removeSet.has(b.id));
      this.floatingTexts.push({ x: bubble.x, y: bubble.y, text: `💣 +${points}`, combo: '', life: 1 });

      for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 * i) / 20;
        this.particles.push({
          x: bubble.x, y: bubble.y,
          vx: Math.cos(angle) * (3 + Math.random() * 3),
          vy: Math.sin(angle) * (3 + Math.random() * 3),
          life: 1, color: '#ff8800', size: 6 + Math.random() * 4,
        });
      }
    } else if (type === 'rainbow') {
      const neighbors = this.bubbles.filter(b => {
        const dx = b.x - bubble.x, dy = b.y - bubble.y;
        return Math.sqrt(dx * dx + dy * dy) < this.bubbleRadius * 4 && !b.color.isPowerup;
      });
      if (neighbors.length > 0) {
        const counts = {};
        neighbors.forEach(b => { counts[b.color.name] = (counts[b.color.name] || 0) + 1; });
        const targetColor = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
        const toRemove = this.bubbles.filter(b => b.color.name === targetColor);
        const points = toRemove.length * 20;
        this.score += points;
        this.totalPopped += toRemove.length;
        toRemove.forEach(b => { this.spawnPopParticles(b.x, b.y, b.color.hex); Composite.remove(this.world, b.body); });
        this.bubbles = this.bubbles.filter(b => b.color.name !== targetColor);
        this.floatingTexts.push({ x: bubble.x, y: bubble.y, text: `🌈 +${points}`, combo: '', life: 1 });
        this.playPop(toRemove.length);
      }
    } else if (type === 'star') {
      const rowH = this.bubbleRadius * 2.5;
      const toRemove = this.bubbles.filter(b => Math.abs(b.y - bubble.y) < rowH);
      const points = toRemove.length * 15;
      this.score += points;
      this.totalPopped += toRemove.length;
      toRemove.forEach(b => { this.spawnPopParticles(b.x, b.y, b.color.hex || '#ffd166'); Composite.remove(this.world, b.body); });
      this.bubbles = this.bubbles.filter(b => !toRemove.includes(b));
      this.floatingTexts.push({ x: bubble.x, y: bubble.y, text: `⭐ +${points}`, combo: '', life: 1 });
      this.playPop(toRemove.length);
    }

    this.updateHUD();
    setTimeout(() => {
      if (!this.running) return;
      this.processMatches(null);
    }, 400);
  }

  spawnPopParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.3;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * (2 + Math.random() * 2),
        vy: Math.sin(angle) * (2 + Math.random() * 2) - 1,
        life: 1, color, size: 3 + Math.random() * 4,
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

      setTimeout(() => { this.gameOverOverlay.classList.add('active'); }, 600);
      return true;
    }
    return false;
  }

  // ─── DRAWING ───────────────────────────────────────────────────

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);

    ctx.save();
    if (this.quakeActive > 0) ctx.translate(this.quakeOffsetX, this.quakeOffsetY);

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.H);
    bgGrad.addColorStop(0, '#1a1a2e');
    bgGrad.addColorStop(1, '#16213e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(-10, -10, this.W + 20, this.H + 20);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    const gridSize = this.bubbleRadius * 2;
    for (let x = gridSize; x < this.W; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.H); ctx.stroke();
    }

    this.drawTerrain(ctx);

    // Danger line
    const dangerAlpha = this.bubbles.some(b => b.y - b.radius < this.dangerLine + this.bubbleRadius * 3)
      ? 0.6 + Math.sin(performance.now() * 0.008) * 0.3 : 0.15;
    ctx.strokeStyle = `rgba(233,69,96,${dangerAlpha})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath(); ctx.moveTo(0, this.dangerLine); ctx.lineTo(this.W, this.dangerLine); ctx.stroke();
    ctx.setLineDash([]);

    // Aim guide
    if (this.falling && !this.falling.dropped) {
      const aimX = Math.max(this.bubbleRadius, Math.min(this.W - this.bubbleRadius, this.aimX));
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(aimX, this.falling.y); ctx.lineTo(aimX, this.getTerrainY(aimX)); ctx.stroke();
      ctx.setLineDash([]);
    }

    // Settled bubbles
    for (const b of this.bubbles) {
      this.drawBubble(ctx, b.x, b.y, b.radius * (b.scale || 1), b.color);
    }

    // Falling bubble
    if (this.falling) {
      let drawX, drawY;
      if (this.falling.dropped && this.falling.body) {
        drawX = this.falling.body.position.x;
        drawY = this.falling.body.position.y;
      } else {
        drawX = Math.max(this.bubbleRadius, Math.min(this.W - this.bubbleRadius, this.aimX));
        drawY = this.falling.y;
      }
      this.drawBubble(ctx, drawX, drawY, this.bubbleRadius, this.falling.color);
    }

    // Particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2); ctx.fill();
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

    ctx.restore();
  }

  drawTerrain(ctx) {
    if (!this.terrainHeights) return;

    const tGrad = ctx.createLinearGradient(0, this.H * 0.7, 0, this.H);
    tGrad.addColorStop(0, 'rgba(30,40,70,0.9)');
    tGrad.addColorStop(1, 'rgba(20,28,50,1)');
    ctx.fillStyle = tGrad;
    ctx.beginPath();
    ctx.moveTo(0, this.H + 5);
    const step = 3;
    for (let x = 0; x <= this.W; x += step) ctx.lineTo(x, this.getTerrainY(x));
    ctx.lineTo(this.W, this.H + 5);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(100,140,200,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x <= this.W; x += step) {
      if (x === 0) ctx.moveTo(x, this.getTerrainY(x));
      else ctx.lineTo(x, this.getTerrainY(x));
    }
    ctx.stroke();

    ctx.fillStyle = 'rgba(100,140,200,0.08)';
    for (let x = 10; x < this.W; x += 20) {
      const ty = this.getTerrainY(x);
      ctx.beginPath(); ctx.arc(x, ty + 8, 2, 0, Math.PI * 2); ctx.fill();
    }
  }

  drawBubble(ctx, x, y, radius, color) {
    ctx.save();
    if (color.isPowerup) {
      ctx.shadowColor = 'rgba(255,255,255,0.5)';
      ctx.shadowBlur = 12;
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.font = `${radius * 1.2}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(color.emoji, x, y);
    } else {
      ctx.shadowColor = color.glow;
      ctx.shadowBlur = 10;
      const bGrad = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, radius * 0.1, x, y, radius);
      bGrad.addColorStop(0, this.lighten(color.hex, 40));
      bGrad.addColorStop(0.7, color.hex);
      bGrad.addColorStop(1, this.darken(color.hex, 30));
      ctx.fillStyle = bGrad;
      ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
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
      navigator.serviceWorker.register('./service-worker.js').catch(e => console.log('SW failed', e));
    }
  }
}

// ─── BOOT ────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  window.game = new BubblePopTower();
  window.game.registerServiceWorker();
});
