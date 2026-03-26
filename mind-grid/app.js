// ─── CONFIG ──────────────────────────────────────────────────────

const DIFFICULTIES = {
  easy:   { startGrid: 3, startCells: 3, showTime: 2000, maxLives: 5 },
  medium: { startGrid: 4, startCells: 4, showTime: 1500, maxLives: 3 },
  hard:   { startGrid: 4, startCells: 5, showTime: 1200, maxLives: 2 },
};

// Adaptive: every 2 perfect rounds, increase difficulty
// Grid grows: 3→4→5→6, cells grow with it, show time decreases

// ─── GAME ────────────────────────────────────────────────────────

class MindGrid {
  constructor() {
    this.difficulty = 'easy';
    this.audioCtx = null;
    this.setupUI();
  }

  setupUI() {
    this.startScreen = document.getElementById('startScreen');
    this.gameScreen = document.getElementById('gameScreen');
    this.pauseOverlay = document.getElementById('pauseOverlay');
    this.gameOverOverlay = document.getElementById('gameOverOverlay');

    document.getElementById('startBtn').addEventListener('click', () => this.startGame());
    document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
    document.getElementById('resumeBtn').addEventListener('click', () => this.togglePause());
    document.getElementById('homeBtn').addEventListener('click', () => this.goHome());
    document.getElementById('retryBtn').addEventListener('click', () => { this.gameOverOverlay.classList.remove('active'); this.startGame(); });
    document.getElementById('goHomeBtn').addEventListener('click', () => { this.gameOverOverlay.classList.remove('active'); this.goHome(); });
    document.getElementById('submitGuess').addEventListener('click', () => this.checkAnswer());

    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.difficulty = btn.dataset.diff;
      });
    });
  }

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
    gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);
    osc.start();
    osc.stop(this.audioCtx.currentTime + duration);
  }

  startGame() {
    this.setupAudio();
    this.diff = DIFFICULTIES[this.difficulty];
    this.score = 0;
    this.level = 1;
    this.lives = this.diff.maxLives;
    this.perfectCount = 0;
    this.consecutivePerfect = 0;
    this.running = true;
    this.paused = false;

    // Adaptive difficulty state
    this.gridSize = this.diff.startGrid;
    this.cellCount = this.diff.startCells;
    this.showTime = this.diff.showTime;

    this.startScreen.classList.remove('active');
    this.gameScreen.classList.add('active');

    this.startRound();
  }

  startRound() {
    this.phase = 'memorize';
    this.selectedCells = new Set();
    this.updateHUD();

    // Generate random lit cells
    const total = this.gridSize * this.gridSize;
    this.litCells = new Set();
    while (this.litCells.size < this.cellCount) {
      this.litCells.add(Math.floor(Math.random() * total));
    }

    // Build grid
    this.buildGrid();
    this.showPattern();
  }

  buildGrid() {
    const container = document.getElementById('gridContainer');
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;

    const total = this.gridSize * this.gridSize;
    for (let i = 0; i < total; i++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.dataset.index = i;
      cell.addEventListener('click', () => this.tapCell(i));
      container.appendChild(cell);
    }
  }

  showPattern() {
    document.getElementById('phaseLabel').textContent = `Memorize! (${this.cellCount} cells)`;
    document.getElementById('submitGuess').style.display = 'none';

    // Light up the cells
    const cells = document.querySelectorAll('.grid-cell');
    this.litCells.forEach(i => cells[i].classList.add('lit'));

    // Play ascending tones
    let delay = 0;
    this.litCells.forEach(() => {
      setTimeout(() => this.playTone(400 + delay * 80, 0.1), delay * 100);
      delay++;
    });

    // Hide after showTime
    this.showTimeout = setTimeout(() => {
      cells.forEach(c => c.classList.remove('lit'));
      this.phase = 'recall';
      document.getElementById('phaseLabel').textContent = 'Tap the cells!';
      document.getElementById('submitGuess').style.display = 'block';
    }, this.showTime);
  }

  tapCell(index) {
    if (this.phase !== 'recall') return;

    const cell = document.querySelectorAll('.grid-cell')[index];

    if (this.selectedCells.has(index)) {
      this.selectedCells.delete(index);
      cell.classList.remove('selected');
      this.playTone(300, 0.05);
    } else {
      this.selectedCells.add(index);
      cell.classList.add('selected');
      this.playTone(500, 0.05);
    }

    // Auto-submit when they've selected the right number of cells
    if (this.selectedCells.size === this.cellCount) {
      setTimeout(() => this.checkAnswer(), 300);
    }
  }

  checkAnswer() {
    if (this.phase !== 'recall') return;
    this.phase = 'result';
    document.getElementById('submitGuess').style.display = 'none';

    const cells = document.querySelectorAll('.grid-cell');

    let correct = 0;
    let wrong = 0;

    // Show results
    this.selectedCells.forEach(i => {
      if (this.litCells.has(i)) {
        cells[i].classList.add('correct');
        correct++;
      } else {
        cells[i].classList.add('wrong');
        wrong++;
      }
    });

    // Show missed cells
    this.litCells.forEach(i => {
      if (!this.selectedCells.has(i)) {
        cells[i].classList.add('missed');
      }
    });

    const perfect = correct === this.cellCount && wrong === 0;

    if (perfect) {
      this.perfectCount++;
      this.consecutivePerfect++;
      const timeBonus = Math.floor(this.showTime < 1500 ? 20 : 10);
      const points = this.cellCount * 20 + this.level * 5 + timeBonus;
      this.score += points;

      document.getElementById('phaseLabel').textContent = `✨ Perfect! +${points}`;
      this.playTone(600, 0.1);
      setTimeout(() => this.playTone(800, 0.1), 100);
      setTimeout(() => this.playTone(1000, 0.15), 200);

      // Adaptive difficulty increase
      if (this.consecutivePerfect >= 2) {
        this.increaseDifficulty();
        this.consecutivePerfect = 0;
      }
    } else {
      this.consecutivePerfect = 0;
      const points = correct * 10;
      this.score += points;
      this.lives--;

      document.getElementById('phaseLabel').textContent = `${correct}/${this.cellCount} correct  +${points}`;
      this.playTone(200, 0.2, 'sawtooth');

      if (this.lives <= 0) {
        setTimeout(() => this.showGameOver(), 1200);
        this.updateHUD();
        return;
      }
    }

    this.level++;
    this.updateHUD();

    // Next round after delay
    setTimeout(() => {
      if (this.running) this.startRound();
    }, 1500);
  }

  increaseDifficulty() {
    // Increase cells first, then grid size, then decrease show time
    if (this.cellCount < this.gridSize * this.gridSize * 0.5) {
      this.cellCount++;
    } else if (this.gridSize < 7) {
      this.gridSize++;
      this.cellCount = Math.max(this.cellCount, Math.floor(this.gridSize * this.gridSize * 0.3));
    }

    if (this.showTime > 600) {
      this.showTime = Math.max(600, this.showTime - 100);
    }
  }

  updateHUD() {
    document.getElementById('hudScore').textContent = `Score: ${this.score}`;
    document.getElementById('hudLevel').textContent = `Level ${this.level}`;
    const hearts = '❤️'.repeat(this.lives) + '🖤'.repeat(Math.max(0, this.diff.maxLives - this.lives));
    document.getElementById('hudLives').textContent = hearts;
  }

  togglePause() {
    this.paused = !this.paused;
    if (this.paused) {
      this.pauseOverlay.classList.add('active');
      clearTimeout(this.showTimeout);
    } else {
      this.pauseOverlay.classList.remove('active');
      // Restart the current round on resume (can't restore timer easily)
      if (this.phase === 'memorize') this.startRound();
    }
  }

  goHome() {
    this.running = false;
    clearTimeout(this.showTimeout);
    this.pauseOverlay.classList.remove('active');
    this.gameOverOverlay.classList.remove('active');
    this.gameScreen.classList.remove('active');
    this.startScreen.classList.add('active');
  }

  showGameOver() {
    this.running = false;
    clearTimeout(this.showTimeout);

    document.getElementById('goScore').textContent = this.score;
    document.getElementById('goLevel').textContent = this.level - 1;
    document.getElementById('goPerfect').textContent = this.perfectCount;

    document.getElementById('goTitle').textContent = this.level > 15
      ? '🧠 Incredible Memory!' : this.level > 8 ? '🌟 Great Job!' : 'Game Over!';

    this.gameOverOverlay.classList.add('active');
  }
}

// ─── BOOT ────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  window.game = new MindGrid();
});
