// ─── CONFIG ──────────────────────────────────────────────────────

const VEHICLES = [
  { emoji: '✈️', name: 'Plane' },
  { emoji: '🚀', name: 'Rocket' },
  { emoji: '🦸', name: 'Hero' },
  { emoji: '🐦', name: 'Bird' },
  { emoji: '🦋', name: 'Butterfly' },
  { emoji: '🎈', name: 'Balloon' },
];

const COLLECTIBLES = [
  { emoji: '⭐', points: 1, freq: 0.6 },
  { emoji: '🌟', points: 2, freq: 0.2 },
  { emoji: '💎', points: 3, freq: 0.08 },
  { emoji: '🍭', points: 1, freq: 0.06 },
  { emoji: '🎁', points: 2, freq: 0.06 },
];

const CLOUD_TYPES = [
  { emoji: '☁️', size: 60, slow: false },
  { emoji: '⛅', size: 50, slow: false },
  { emoji: '🌧️', size: 55, slow: true },
  { emoji: '🌩️', size: 55, slow: true },
];

const SKY_COLORS = [
  { stop: 0, colors: ['#87CEEB', '#B8E4F0'] },     // day sky
  { stop: 500, colors: ['#6BB3D9', '#A0D8EF'] },
  { stop: 1000, colors: ['#FF9F7F', '#FFD4A8'] },   // sunset
  { stop: 1500, colors: ['#2C3E8F', '#5B6ABF'] },   // twilight
  { stop: 2000, colors: ['#0F1B3D', '#1A2755'] },   // night
  { stop: 3000, colors: ['#FF7EB3', '#FFC3A0'] },   // dawn
  { stop: 3500, colors: ['#87CEEB', '#B8E4F0'] },   // back to day
];

const DIFFICULTIES = {
  easy:   { maxHP: 5, cloudDmg: 0.5, floorDmg: 1, cloudRate: 1.0, healChance: 0.15 },
  medium: { maxHP: 3, cloudDmg: 1,   floorDmg: 2, cloudRate: 1.3, healChance: 0.08 },
  hard:   { maxHP: 2, cloudDmg: 1,   floorDmg: 2, cloudRate: 1.6, healChance: 0.03 },
};

const CELEBRATIONS = ['⭐', '🎉', '🌟', '👏', '🏆', '💪', '🥳'];

// ─── GAME ────────────────────────────────────────────────────────

class SkyPilot {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.selectedVehicle = VEHICLES[0];
    this.selectedDifficulty = 'easy';
    this.running = false;
    this.paused = false;
    this.animFrame = null;
    this.audioCtx = null;

    this.setupUI();
    this.buildVehiclePicker();
    this.buildDifficultyPicker();
  }

  setupUI() {
    this.startScreen = document.getElementById('startScreen');
    this.gameScreen = document.getElementById('gameScreen');
    this.pauseOverlay = document.getElementById('pauseOverlay');
    this.hudStars = document.getElementById('hudStars');
    this.hudDistance = document.getElementById('hudDistance');
    this.hudHP = document.getElementById('hudHP');
    this.gameOverOverlay = document.getElementById('gameOverOverlay');

    document.getElementById('startBtn').addEventListener('click', () => this.startGame());
    document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
    document.getElementById('resumeBtn').addEventListener('click', () => this.togglePause());
    document.getElementById('homeBtn').addEventListener('click', () => this.goHome());
    document.getElementById('retryBtn').addEventListener('click', () => { this.gameOverOverlay.classList.remove('active'); this.startGame(); });
    document.getElementById('goHomeBtn').addEventListener('click', () => { this.gameOverOverlay.classList.remove('active'); this.goHome(); });

    // Tap/click to fly
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.flap();
    });
    this.canvas.addEventListener('mousedown', () => this.flap());

    // Touch hold for continuous boost
    this.canvas.addEventListener('touchend', () => { this.holding = false; });
    this.canvas.addEventListener('mouseup', () => { this.holding = false; });

    window.addEventListener('resize', () => this.resizeCanvas());
  }

  buildVehiclePicker() {
    const picker = document.getElementById('vehiclePicker');
    VEHICLES.forEach((v, i) => {
      const btn = document.createElement('button');
      btn.className = 'vehicle-option' + (i === 0 ? ' selected' : '');
      btn.textContent = v.emoji;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.vehicle-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedVehicle = v;
        document.querySelector('.start-plane').textContent = v.emoji;
      });
      picker.appendChild(btn);
    });
  }

  buildDifficultyPicker() {
    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedDifficulty = btn.dataset.diff;
      });
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
    gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);
    osc.start();
    osc.stop(this.audioCtx.currentTime + duration);
  }

  playCollect() {
    this.playTone(880, 0.1);
    setTimeout(() => this.playTone(1100, 0.15), 80);
  }

  playFlap() {
    this.playTone(400, 0.08, 'triangle');
  }

  playBounce() {
    this.playTone(250, 0.15, 'square');
  }

  playHurt() {
    this.playTone(150, 0.2, 'sawtooth');
    setTimeout(() => this.playTone(120, 0.15, 'sawtooth'), 100);
  }

  playGameOver() {
    this.playTone(400, 0.15);
    setTimeout(() => this.playTone(300, 0.15), 150);
    setTimeout(() => this.playTone(200, 0.3), 300);
  }

  // ─── GAME STATE ────────────────────────────────────────────────

  resizeCanvas() {
    this.canvas.width = window.innerWidth * window.devicePixelRatio;
    this.canvas.height = window.innerHeight * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.W = window.innerWidth;
    this.H = window.innerHeight;
  }

  startGame() {
    this.setupAudio();
    this.resizeCanvas();

    this.startScreen.classList.remove('active');
    this.gameScreen.classList.add('active');

    // Player state
    this.player = {
      x: this.W * 0.2,
      y: this.H * 0.5,
      vy: 0,
      size: Math.min(60, this.W * 0.12),
      rotation: 0,
      trail: [],
    };

    this.diff = DIFFICULTIES[this.selectedDifficulty];
    this.hp = this.diff.maxHP;
    this.maxHP = this.diff.maxHP;
    this.invincibleTimer = 0; // brief invincibility after hit

    this.stars = 0;
    this.distance = 0;
    this.scrollSpeed = 1.5;
    this.maxSpeed = 4;
    this.gravity = 0.25;
    this.flapForce = -5.5;
    this.holding = false;
    this.running = true;
    this.paused = false;
    this.gameOver = false;
    this.lastTime = performance.now();

    // World objects
    this.clouds = [];
    this.collectibles = [];
    this.particles = [];
    this.bgClouds = [];

    // Spawn initial background clouds
    for (let i = 0; i < 8; i++) {
      this.bgClouds.push({
        x: Math.random() * this.W,
        y: Math.random() * this.H,
        size: 30 + Math.random() * 50,
        speed: 0.3 + Math.random() * 0.5,
        opacity: 0.15 + Math.random() * 0.2,
      });
    }

    // Timers for spawning
    this.cloudTimer = 0;
    this.collectibleTimer = 0;
    this.milestoneNext = 100;

    this.updateHUD();
    this.loop();
  }

  flap() {
    if (!this.running || this.paused || this.gameOver) return;
    this.player.vy = this.flapForce;
    this.holding = true;
    this.playFlap();

    // Trail sparkle
    this.spawnTrail();
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
    this.gameOver = false;
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
    const dt = Math.min((now - this.lastTime) / 16.67, 3); // normalize to ~60fps, cap
    this.lastTime = now;

    this.update(dt);
    this.draw();

    this.animFrame = requestAnimationFrame(() => this.loop());
  }

  update(dt) {
    const p = this.player;

    // Gravity + velocity
    p.vy += this.gravity * dt;
    // If holding, reduce gravity effect slightly for a floaty feel
    if (this.holding) {
      p.vy += -0.12 * dt;
    }
    p.vy = Math.max(-8, Math.min(8, p.vy));
    p.y += p.vy * dt;

    // Rotation follows velocity
    p.rotation = Math.max(-0.4, Math.min(0.5, p.vy * 0.05));

    // Invincibility cooldown
    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= dt;
    }

    // Bounds - bounce + floor damage
    if (p.y < p.size / 2) {
      p.y = p.size / 2;
      p.vy = Math.abs(p.vy) * 0.3;
      this.playBounce();
    }
    if (p.y > this.H - p.size / 2) {
      p.y = this.H - p.size / 2;
      p.vy = -Math.abs(p.vy) * 0.5;
      this.takeDamage(this.diff.floorDmg);
    }

    // Trail
    p.trail.push({ x: p.x, y: p.y, life: 1 });
    if (p.trail.length > 20) p.trail.shift();
    p.trail.forEach(t => t.life -= 0.04 * dt);

    // Distance + speed ramp
    this.distance += this.scrollSpeed * dt;
    this.scrollSpeed = Math.min(this.maxSpeed, 1.5 + this.distance * 0.001);

    // Spawn clouds
    this.cloudTimer += dt;
    if (this.cloudTimer > 60 / (this.scrollSpeed * this.diff.cloudRate)) {
      this.cloudTimer = 0;
      this.spawnCloud();
    }

    // Spawn collectibles
    this.collectibleTimer += dt;
    if (this.collectibleTimer > 40 / this.scrollSpeed) {
      this.collectibleTimer = 0;
      this.spawnCollectible();
    }

    // Move clouds
    this.clouds.forEach(c => {
      c.x -= this.scrollSpeed * dt * (c.slow ? 0.6 : 1);
    });
    this.clouds = this.clouds.filter(c => c.x > -80);

    // Move collectibles
    this.collectibles.forEach(c => {
      c.x -= this.scrollSpeed * dt;
      c.bobPhase += 0.05 * dt;
    });
    this.collectibles = this.collectibles.filter(c => c.x > -40);

    // Move bg clouds
    this.bgClouds.forEach(c => {
      c.x -= c.speed * dt;
      if (c.x < -c.size) {
        c.x = this.W + c.size;
        c.y = Math.random() * this.H;
      }
    });

    // Collision with collectibles
    this.collectibles = this.collectibles.filter(c => {
      const dx = p.x - c.x;
      const dy = p.y - c.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < p.size * 0.6 + 18) {
        if (c.isHeart) {
          this.heal(1);
        } else {
          this.stars += c.points;
        }
        this.playCollect();
        this.spawnCollectParticles(c.x, c.y, c.emoji);
        this.updateHUD();
        return false;
      }
      return true;
    });

    // Collision with clouds - bounce + damage
    this.clouds.forEach(c => {
      if (c.hit) return; // already hit this cloud
      const dx = p.x - c.x;
      const dy = p.y - c.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = p.size * 0.4 + c.size * 0.4;
      if (dist < minDist) {
        c.hit = true; // only damage once per cloud
        const angle = Math.atan2(dy, dx);
        p.y += Math.sin(angle) * 3 * dt;
        p.vy *= 0.5;
        if (c.slow) {
          this.scrollSpeed = Math.max(1, this.scrollSpeed * 0.98);
        }
        this.takeDamage(this.diff.cloudDmg);
      }
    });

    // Particles
    this.particles.forEach(part => {
      part.x += part.vx * dt;
      part.y += part.vy * dt;
      part.life -= 0.03 * dt;
    });
    this.particles = this.particles.filter(part => part.life > 0);

    // Milestones
    if (Math.floor(this.distance) >= this.milestoneNext) {
      this.milestoneNext += 100;
      this.spawnMilestoneCelebration();
    }

    this.updateHUD();
  }

  // ─── SPAWNING ──────────────────────────────────────────────────

  spawnCloud() {
    const type = CLOUD_TYPES[Math.floor(Math.random() * CLOUD_TYPES.length)];
    this.clouds.push({
      x: this.W + 60,
      y: Math.random() * (this.H - 100) + 50,
      size: type.size + Math.random() * 20,
      emoji: type.emoji,
      slow: type.slow,
    });
  }

  spawnCollectible() {
    // Maybe spawn a heart if HP is low
    if (this.hp < this.maxHP && Math.random() < this.diff.healChance) {
      this.collectibles.push({
        x: this.W + 30,
        y: Math.random() * (this.H - 120) + 60,
        emoji: '❤️‍🩹',
        points: 0,
        isHeart: true,
        bobPhase: Math.random() * Math.PI * 2,
      });
      return;
    }

    // Weighted random pick
    const r = Math.random();
    let cumulative = 0;
    let type = COLLECTIBLES[0];
    for (const c of COLLECTIBLES) {
      cumulative += c.freq;
      if (r < cumulative) { type = c; break; }
    }

    this.collectibles.push({
      x: this.W + 30,
      y: Math.random() * (this.H - 120) + 60,
      emoji: type.emoji,
      points: type.points,
      bobPhase: Math.random() * Math.PI * 2,
    });
  }

  takeDamage(amount) {
    if (this.invincibleTimer > 0 || this.gameOver) return;
    this.hp = Math.max(0, this.hp - amount);
    this.invincibleTimer = 30; // ~0.5s at 60fps
    this.playHurt();
    this.updateHUD();

    // Screen flash
    const flash = document.createElement('div');
    flash.className = 'damage-flash';
    document.getElementById('gameScreen').appendChild(flash);
    setTimeout(() => flash.remove(), 400);

    // Animate HP hud
    this.hudHP.classList.remove('hurt');
    void this.hudHP.offsetWidth;
    this.hudHP.classList.add('hurt');

    if (this.hp <= 0) {
      this.showGameOver();
    }
  }

  heal(amount) {
    this.hp = Math.min(this.maxHP, this.hp + amount);
    this.updateHUD();
  }

  showGameOver() {
    this.gameOver = true;
    this.running = false;
    cancelAnimationFrame(this.animFrame);
    this.playGameOver();

    const titles = ['Great Flight!', 'Nice Try!', 'Good Job!', 'Wow!', 'So High!'];
    document.getElementById('gameOverTitle').textContent = titles[Math.floor(Math.random() * titles.length)];
    document.getElementById('goStars').textContent = this.stars;
    document.getElementById('goDistance').textContent = Math.floor(this.distance);

    setTimeout(() => {
      this.gameOverOverlay.classList.add('active');
    }, 500);
  }

  spawnTrail() {
    const p = this.player;
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: p.x - p.size * 0.3,
        y: p.y + (Math.random() - 0.5) * p.size * 0.5,
        vx: -2 - Math.random() * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 1,
        color: `hsl(${40 + Math.random() * 30}, 100%, 70%)`,
        size: 4 + Math.random() * 4,
        type: 'circle',
      });
    }
  }

  spawnCollectParticles(x, y, emoji) {
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * 3,
        vy: Math.sin(angle) * 3,
        life: 1,
        emoji,
        size: 20,
        type: 'emoji',
      });
    }
  }

  spawnMilestoneCelebration() {
    const emoji = CELEBRATIONS[Math.floor(Math.random() * CELEBRATIONS.length)];
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: this.W * 0.5 + (Math.random() - 0.5) * 200,
        y: this.H * 0.3,
        vx: (Math.random() - 0.5) * 4,
        vy: -2 - Math.random() * 3,
        life: 1.5,
        emoji,
        size: 30 + Math.random() * 20,
        type: 'emoji',
      });
    }
    this.playTone(600, 0.1);
    setTimeout(() => this.playTone(800, 0.1), 100);
    setTimeout(() => this.playTone(1000, 0.15), 200);
  }

  // ─── DRAWING ───────────────────────────────────────────────────

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);

    // Sky gradient based on distance
    this.drawSky(ctx);

    // Background clouds
    ctx.save();
    this.bgClouds.forEach(c => {
      ctx.globalAlpha = c.opacity;
      ctx.font = `${c.size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('☁️', c.x, c.y);
    });
    ctx.restore();

    // Ground line (simple horizon)
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(0, this.H - 3, this.W, 3);

    // Clouds
    this.clouds.forEach(c => {
      ctx.font = `${c.size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.emoji, c.x, c.y);
    });

    // Collectibles (bobbing)
    this.collectibles.forEach(c => {
      const bobY = Math.sin(c.bobPhase) * 8;
      ctx.font = '36px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.emoji, c.x, c.y + bobY);
    });

    // Particles
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      if (p.type === 'emoji') {
        ctx.font = `${p.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.emoji, p.x, p.y);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // Trail
    const trail = this.player.trail;
    trail.forEach((t, i) => {
      if (t.life <= 0) return;
      ctx.save();
      ctx.globalAlpha = t.life * 0.3;
      ctx.fillStyle = '#FFD93D';
      const r = (i / trail.length) * 6;
      ctx.beginPath();
      ctx.arc(t.x - 10, t.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Player (blink when invincible)
    const p = this.player;
    const visible = this.invincibleTimer <= 0 || Math.floor(this.invincibleTimer * 3) % 2 === 0;
    if (visible) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.font = `${p.size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.selectedVehicle.emoji, 0, 0);
      ctx.restore();
    }
  }

  drawSky(ctx) {
    const d = this.distance % 3500;
    let c1, c2;

    // Find which two color stops we're between
    for (let i = 0; i < SKY_COLORS.length - 1; i++) {
      const cur = SKY_COLORS[i];
      const next = SKY_COLORS[i + 1];
      if (d >= cur.stop && d < next.stop) {
        const t = (d - cur.stop) / (next.stop - cur.stop);
        c1 = this.lerpColor(cur.colors[0], next.colors[0], t);
        c2 = this.lerpColor(cur.colors[1], next.colors[1], t);
        break;
      }
    }
    if (!c1) {
      c1 = SKY_COLORS[0].colors[0];
      c2 = SKY_COLORS[0].colors[1];
    }

    const grad = ctx.createLinearGradient(0, 0, 0, this.H);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.W, this.H);
  }

  lerpColor(a, b, t) {
    const ar = parseInt(a.slice(1, 3), 16), ag = parseInt(a.slice(3, 5), 16), ab = parseInt(a.slice(5, 7), 16);
    const br = parseInt(b.slice(1, 3), 16), bg = parseInt(b.slice(3, 5), 16), bb = parseInt(b.slice(5, 7), 16);
    const rr = Math.round(ar + (br - ar) * t);
    const rg = Math.round(ag + (bg - ag) * t);
    const rb = Math.round(ab + (bb - ab) * t);
    return `#${rr.toString(16).padStart(2, '0')}${rg.toString(16).padStart(2, '0')}${rb.toString(16).padStart(2, '0')}`;
  }

  updateHUD() {
    // Build hearts display
    const fullHearts = Math.floor(this.hp);
    const halfHeart = (this.hp % 1) >= 0.5 ? 1 : 0;
    const emptyHearts = Math.ceil(this.maxHP) - fullHearts - halfHeart;
    this.hudHP.textContent = '❤️'.repeat(fullHearts) + (halfHeart ? '💔' : '') + '🖤'.repeat(emptyHearts);

    this.hudStars.textContent = `⭐ ${this.stars}`;
    this.hudDistance.textContent = `📏 ${Math.floor(this.distance)}m`;
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
  window.game = new SkyPilot();
  window.game.registerServiceWorker();
});
