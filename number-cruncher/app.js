// ─── CONFIG ──────────────────────────────────────────────────────

const DIFFICULTIES = {
  easy:   { numbers: 4, ops: ['+', '-'],           maxNum: 10,  targetMax: 30,  timePerRound: 45, roundsPerGame: 10 },
  medium: { numbers: 5, ops: ['+', '-', '*'],      maxNum: 25,  targetMax: 100, timePerRound: 40, roundsPerGame: 12 },
  hard:   { numbers: 6, ops: ['+', '-', '*', '/'], maxNum: 50,  targetMax: 500, timePerRound: 60, roundsPerGame: 15 },
};

// ─── GAME ────────────────────────────────────────────────────────

class NumberCruncher {
  constructor() {
    this.difficulty = 'easy';
    this.setupUI();
  }

  setupUI() {
    this.startScreen = document.getElementById('startScreen');
    this.gameScreen = document.getElementById('gameScreen');
    this.pauseOverlay = document.getElementById('pauseOverlay');
    this.resultOverlay = document.getElementById('resultOverlay');
    this.gameOverOverlay = document.getElementById('gameOverOverlay');

    document.getElementById('startBtn').addEventListener('click', () => this.startGame());
    document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
    document.getElementById('resumeBtn').addEventListener('click', () => this.togglePause());
    document.getElementById('homeBtn').addEventListener('click', () => this.goHome());
    document.getElementById('retryBtn').addEventListener('click', () => { this.gameOverOverlay.classList.remove('active'); this.startGame(); });
    document.getElementById('goHomeBtn').addEventListener('click', () => { this.gameOverOverlay.classList.remove('active'); this.goHome(); });
    document.getElementById('undoBtn').addEventListener('click', () => this.undo());
    document.getElementById('clearBtn').addEventListener('click', () => this.clearExpr());
    document.getElementById('submitBtn').addEventListener('click', () => this.submit());
    document.getElementById('nextRoundBtn').addEventListener('click', () => this.nextRound());

    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.difficulty = btn.dataset.diff;
      });
    });

    document.querySelectorAll('.op-btn').forEach(btn => {
      btn.addEventListener('click', () => this.selectOp(btn.dataset.op));
    });
  }

  startGame() {
    this.diff = DIFFICULTIES[this.difficulty];
    this.score = 0;
    this.round = 0;
    this.perfectCount = 0;
    this.running = true;
    this.paused = false;

    this.startScreen.classList.remove('active');
    this.gameScreen.classList.add('active');

    this.nextRound();
  }

  nextRound() {
    this.resultOverlay.classList.remove('active');
    this.round++;

    if (this.round > this.diff.roundsPerGame) {
      this.showGameOver();
      return;
    }

    // Generate puzzle
    this.generatePuzzle();

    // Reset expression state
    this.steps = [];           // [{ a, op, b, result }]
    this.usedIndices = [];     // indices of used number buttons
    this.pendingNumber = null; // number waiting for an operator
    this.pendingOp = null;     // selected operator
    this.expectingNumber = false;

    this.updateExpression();
    this.renderNumbers();
    this.updateHUD();
    this.clearOpSelection();

    // Start timer
    this.timeLeft = this.diff.timePerRound;
    this.timerMax = this.diff.timePerRound;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => this.tickTimer(), 100);
    this.updateTimer();
  }

  generatePuzzle() {
    // Generate numbers and find a reachable target
    const d = this.diff;
    let attempts = 0;

    while (attempts < 100) {
      attempts++;
      this.numbers = [];
      for (let i = 0; i < d.numbers; i++) {
        this.numbers.push(Math.floor(Math.random() * d.maxNum) + 1);
      }

      // Try to find a target reachable by combining 2-3 numbers
      const reachable = this.findReachableTargets(this.numbers, d.ops);
      const valid = reachable.filter(t => t >= 1 && t <= d.targetMax && Number.isInteger(t));

      if (valid.length > 0) {
        this.target = valid[Math.floor(Math.random() * valid.length)];
        break;
      }
    }

    document.getElementById('targetNumber').textContent = this.target;
  }

  findReachableTargets(nums, ops) {
    const results = new Set();

    // All pairs
    for (let i = 0; i < nums.length; i++) {
      for (let j = 0; j < nums.length; j++) {
        if (i === j) continue;
        for (const op of ops) {
          const r = this.calc(nums[i], op, nums[j]);
          if (r !== null && r > 0) results.add(r);

          // Triple: (a op b) op c
          for (let k = 0; k < nums.length; k++) {
            if (k === i || k === j) continue;
            for (const op2 of ops) {
              const r2 = this.calc(r, op2, nums[k]);
              if (r2 !== null && r2 > 0) results.add(r2);
            }
          }
        }
      }
    }
    return [...results];
  }

  calc(a, op, b) {
    if (a === null || b === null) return null;
    switch (op) {
      case '+': return a + b;
      case '-': return a - b >= 0 ? a - b : null;
      case '*': return a * b;
      case '/': return b !== 0 && a % b === 0 ? a / b : null;
      default: return null;
    }
  }

  renderNumbers() {
    const area = document.getElementById('numbersArea');
    area.innerHTML = '';

    // Show available numbers (original + intermediate results)
    const available = this.getAvailableNumbers();
    available.forEach((item, i) => {
      const btn = document.createElement('button');
      btn.className = 'num-btn';
      if (item.used) btn.classList.add('used');
      btn.textContent = item.value;
      btn.addEventListener('click', () => this.selectNumber(item.index, item.value));
      area.appendChild(btn);
    });
  }

  getAvailableNumbers() {
    const items = this.numbers.map((n, i) => ({ value: n, index: i, used: this.usedIndices.includes(i) }));

    // Add intermediate results as available numbers
    this.steps.forEach((step, si) => {
      items.push({ value: step.result, index: 'step_' + si, used: step.consumed });
    });

    return items;
  }

  selectNumber(index, value) {
    if (this.pendingOp !== null && this.pendingNumber !== null) {
      // We have: number, op, now picking second number
      const result = this.calc(this.pendingNumber, this.pendingOp, value);
      if (result === null) {
        this.flashExpression('Invalid!');
        return;
      }

      // Mark both numbers as used
      if (typeof this.pendingIndex === 'string' && this.pendingIndex.startsWith('step_')) {
        const si = parseInt(this.pendingIndex.split('_')[1]);
        this.steps[si].consumed = true;
      } else {
        this.usedIndices.push(this.pendingIndex);
      }
      if (typeof index === 'string' && index.startsWith('step_')) {
        const si = parseInt(index.split('_')[1]);
        this.steps[si].consumed = true;
      } else {
        this.usedIndices.push(index);
      }

      this.steps.push({
        a: this.pendingNumber,
        op: this.pendingOp,
        b: value,
        result,
        consumed: false,
      });

      this.pendingNumber = null;
      this.pendingOp = null;
      this.pendingIndex = null;
      this.clearOpSelection();
      this.updateExpression();
      this.renderNumbers();
    } else {
      // First number selection
      this.pendingNumber = value;
      this.pendingIndex = index;
      this.updateExpression();
    }
  }

  selectOp(op) {
    if (this.pendingNumber === null) return;
    this.pendingOp = op;
    this.clearOpSelection();
    document.querySelector(`.op-btn[data-op="${op}"]`).classList.add('selected');
    this.updateExpression();
  }

  clearOpSelection() {
    document.querySelectorAll('.op-btn').forEach(b => b.classList.remove('selected'));
  }

  undo() {
    if (this.steps.length === 0 && this.pendingNumber === null) return;

    if (this.pendingOp !== null) {
      this.pendingOp = null;
      this.clearOpSelection();
      this.updateExpression();
      return;
    }

    if (this.pendingNumber !== null && this.steps.length === 0) {
      this.pendingNumber = null;
      this.pendingIndex = null;
      this.updateExpression();
      return;
    }

    // Undo last step
    const last = this.steps.pop();
    // Un-use the indices
    this.usedIndices = this.usedIndices.filter(i => i !== last.aIndex && i !== last.bIndex);
    // Re-enable any step results that were consumed
    // Simple approach: rebuild used state
    this.rebuildUsedState();

    this.pendingNumber = null;
    this.pendingOp = null;
    this.pendingIndex = null;
    this.clearOpSelection();
    this.updateExpression();
    this.renderNumbers();
  }

  rebuildUsedState() {
    this.usedIndices = [];
    for (const step of this.steps) {
      step.consumed = false;
    }
    // Mark original numbers used by active steps
    // This is a simplification - full undo tracking would be more complex
  }

  clearExpr() {
    this.steps = [];
    this.usedIndices = [];
    this.pendingNumber = null;
    this.pendingOp = null;
    this.pendingIndex = null;
    this.clearOpSelection();
    this.updateExpression();
    this.renderNumbers();
  }

  updateExpression() {
    const exprEl = document.getElementById('expression');
    const previewEl = document.getElementById('resultPreview');

    const opSymbol = { '+': '+', '-': '−', '*': '×', '/': '÷' };

    let parts = [];
    for (const step of this.steps) {
      parts.push(`${step.a} ${opSymbol[step.op]} ${step.b} = ${step.result}`);
    }

    if (this.pendingNumber !== null) {
      let current = `${this.pendingNumber}`;
      if (this.pendingOp !== null) {
        current += ` ${opSymbol[this.pendingOp]} ?`;
      }
      parts.push(current);
    }

    exprEl.textContent = parts.length > 0 ? parts.join('  →  ') : '\u00A0';

    previewEl.textContent = '';
  }

  getCurrentResult() {
    if (this.steps.length > 0) {
      // Find the last unconsumed result
      for (let i = this.steps.length - 1; i >= 0; i--) {
        if (!this.steps[i].consumed) return this.steps[i].result;
      }
    }
    return null;
  }

  submit() {
    const result = this.getCurrentResult();
    if (result === null) return;

    clearInterval(this.timerInterval);

    const diff = Math.abs(result - this.target);
    let points = 0;
    let title = '';

    if (diff === 0) {
      points = 100 + Math.floor(this.timeLeft * 2);
      title = '🎯 Perfect!';
      this.perfectCount++;
    } else if (diff <= 2) {
      points = 60 + Math.floor(this.timeLeft);
      title = '👏 So Close!';
    } else if (diff <= 5) {
      points = 30;
      title = '👍 Not Bad';
    } else {
      points = Math.max(0, 10 - diff);
      title = '😅 Keep Trying';
    }

    this.score += points;
    document.getElementById('resultTitle').textContent = title;
    document.getElementById('resultDetail').textContent = `${result} (target: ${this.target}) → +${points} points`;
    this.resultOverlay.classList.add('active');
  }

  tickTimer() {
    if (this.paused) return;
    this.timeLeft -= 0.1;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      clearInterval(this.timerInterval);
      // Auto-submit if they have a result, otherwise skip
      const result = this.getCurrentResult();
      if (result !== null) {
        this.submit();
      } else {
        document.getElementById('resultTitle').textContent = '⏰ Time\'s Up!';
        document.getElementById('resultDetail').textContent = `Target was ${this.target}`;
        this.resultOverlay.classList.add('active');
      }
    }
    this.updateTimer();
  }

  updateTimer() {
    const pct = (this.timeLeft / this.timerMax) * 100;
    const fill = document.getElementById('timerFill');
    fill.style.width = pct + '%';
    fill.style.backgroundColor = pct > 30 ? '#00c896' : pct > 15 ? '#f0a030' : '#e94560';
  }

  updateHUD() {
    document.getElementById('hudScore').textContent = `Score: ${this.score}`;
    document.getElementById('hudRound').textContent = `Round ${this.round}/${this.diff.roundsPerGame}`;
  }

  flashExpression(msg) {
    const el = document.getElementById('resultPreview');
    el.textContent = msg;
    el.style.color = '#e94560';
    setTimeout(() => this.updateExpression(), 800);
  }

  togglePause() {
    this.paused = !this.paused;
    if (this.paused) {
      this.pauseOverlay.classList.add('active');
    } else {
      this.pauseOverlay.classList.remove('active');
    }
  }

  goHome() {
    this.running = false;
    clearInterval(this.timerInterval);
    this.pauseOverlay.classList.remove('active');
    this.resultOverlay.classList.remove('active');
    this.gameOverOverlay.classList.remove('active');
    this.gameScreen.classList.remove('active');
    this.startScreen.classList.add('active');
  }

  showGameOver() {
    this.running = false;
    clearInterval(this.timerInterval);

    document.getElementById('goScore').textContent = this.score;
    document.getElementById('goRounds').textContent = this.round - 1;
    document.getElementById('goPerfect').textContent = this.perfectCount;

    const titles = ['Game Over!', 'Great Run!', 'Well Done!', 'Nice Brain!'];
    document.getElementById('goTitle').textContent = this.score > 500
      ? '🧠 Genius!' : titles[Math.floor(Math.random() * titles.length)];

    this.gameOverOverlay.classList.add('active');
  }
}

// ─── BOOT ────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  window.game = new NumberCruncher();
});
