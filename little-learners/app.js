// ─── DATA ────────────────────────────────────────────────────────

const SHAPES = [
  { name: 'Circle', emoji: '🔴', color: '#FF6B6B' },
  { name: 'Square', emoji: '🟧', color: '#FF9F43' },
  { name: 'Triangle', emoji: '🔺', color: '#FFD93D' },
  { name: 'Star', emoji: '⭐', color: '#F9CA24' },
  { name: 'Heart', emoji: '❤️', color: '#E74C3C' },
  { name: 'Diamond', emoji: '💎', color: '#6C5CE7' },
  { name: 'Moon', emoji: '🌙', color: '#FDCB6E' },
  { name: 'Cloud', emoji: '☁️', color: '#74B9FF' },
];

const LETTERS = [
  { letter: 'A', animal: '🐊', name: 'Alligator' },
  { letter: 'B', animal: '🐻', name: 'Bear' },
  { letter: 'C', animal: '🐱', name: 'Cat' },
  { letter: 'D', animal: '🐶', name: 'Dog' },
  { letter: 'E', animal: '🐘', name: 'Elephant' },
  { letter: 'F', animal: '🐸', name: 'Frog' },
  { letter: 'G', animal: '🦒', name: 'Giraffe' },
  { letter: 'H', animal: '🦔', name: 'Hedgehog' },
  { letter: 'I', animal: '🦎', name: 'Iguana' },
  { letter: 'J', animal: '🪼', name: 'Jellyfish' },
  { letter: 'K', animal: '🐨', name: 'Koala' },
  { letter: 'L', animal: '🦁', name: 'Lion' },
  { letter: 'M', animal: '🐵', name: 'Monkey' },
  { letter: 'N', animal: '🦑', name: 'Narwhal' },
  { letter: 'O', animal: '🦉', name: 'Owl' },
  { letter: 'P', animal: '🐧', name: 'Penguin' },
  { letter: 'Q', animal: '🦔', name: 'Quail' },
  { letter: 'R', animal: '🐰', name: 'Rabbit' },
  { letter: 'S', animal: '🐍', name: 'Snake' },
  { letter: 'T', animal: '🐢', name: 'Turtle' },
  { letter: 'U', animal: '🦄', name: 'Unicorn' },
  { letter: 'V', animal: '🦅', name: 'Vulture' },
  { letter: 'W', animal: '🐋', name: 'Whale' },
  { letter: 'X', animal: '🐠', name: 'X-ray Fish' },
  { letter: 'Y', animal: '🐃', name: 'Yak' },
  { letter: 'Z', animal: '🦓', name: 'Zebra' },
];

const COLORS = [
  { name: 'Red', hex: '#FF4444' },
  { name: 'Blue', hex: '#4488FF' },
  { name: 'Yellow', hex: '#FFD700' },
  { name: 'Green', hex: '#44BB44' },
  { name: 'Purple', hex: '#9944FF' },
  { name: 'Orange', hex: '#FF8800' },
];

const COLOR_MIXES = [
  { a: 'Red', b: 'Blue', result: 'Purple', resultHex: '#9944FF' },
  { a: 'Red', b: 'Yellow', result: 'Orange', resultHex: '#FF8800' },
  { a: 'Blue', b: 'Yellow', result: 'Green', resultHex: '#44BB44' },
  { a: 'Red', b: 'Green', result: 'Brown', resultHex: '#8B4513' },
  { a: 'Blue', b: 'Orange', result: 'Brown', resultHex: '#8B4513' },
  { a: 'Yellow', b: 'Purple', result: 'Brown', resultHex: '#8B4513' },
];

const CRITTERS = ['🐛', '🐞', '🦋', '🐝', '🐠', '🐙', '🦀', '🐸', '🐥', '🌟'];

const PATTERN_SETS = [
  // AB patterns
  { items: ['🔴', '🔵'] },
  { items: ['⭐', '🌙'] },
  { items: ['🐱', '🐶'] },
  { items: ['🌸', '🌺'] },
  { items: ['🍎', '🍊'] },
  { items: ['☀️', '🌧️'] },
  { items: ['🐟', '🐙'] },
  { items: ['🎈', '🎁'] },
  // AAB patterns
  { items: ['🔴', '🔴', '🔵'] },
  { items: ['🐸', '🐸', '🦋'] },
  { items: ['⭐', '⭐', '🌙'] },
  { items: ['🍓', '🍓', '🍌'] },
  // ABB patterns
  { items: ['🔵', '🟡', '🟡'] },
  { items: ['🐝', '🌸', '🌸'] },
  { items: ['🌈', '☁️', '☁️'] },
  // ABC patterns
  { items: ['❤️', '💙', '💚'] },
  { items: ['🟡', '🟢', '🔴'] },
  { items: ['🐱', '🐶', '🐰'] },
  { items: ['🍎', '🍌', '🍇'] },
  { items: ['🚗', '🚌', '🚀'] },
  // ABA patterns
  { items: ['🍎', '🍌', '🍎'] },
  { items: ['🌺', '🌻', '🌺'] },
  { items: ['🐻', '🐼', '🐻'] },
  // AABB patterns
  { items: ['🔴', '🔴', '🔵', '🔵'] },
  { items: ['🌸', '🌸', '🌺', '🌺'] },
  { items: ['🐛', '🐛', '🦋', '🦋'] },
  // ABAC patterns
  { items: ['⭐', '🌙', '⭐', '❤️'] },
  { items: ['🐱', '🐶', '🐱', '🐰'] },
];

const BG_GRADIENTS = {
  shapes: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
  letters: 'linear-gradient(135deg, #4ECDC4 0%, #6EE7DE 100%)',
  colors: 'linear-gradient(135deg, #FFD93D 0%, #FFE873 100%)',
  numbers: 'linear-gradient(135deg, #A8E6CF 0%, #C8F7E1 100%)',
  patterns: 'linear-gradient(135deg, #DDA0DD 0%, #E8BFE8 100%)',
};

const CELEBRATIONS = [
  { emoji: '⭐', text: 'Great Job!' },
  { emoji: '🎉', text: 'Awesome!' },
  { emoji: '🌟', text: 'Super Star!' },
  { emoji: '👏', text: 'Well Done!' },
  { emoji: '🏆', text: 'Amazing!' },
  { emoji: '💪', text: 'You Did It!' },
];

// ─── APP ─────────────────────────────────────────────────────────

class LittleLearners {
  constructor() {
    this.stars = 0;
    this.currentWorld = null;
    this.synth = window.speechSynthesis;
    this.audioCtx = null;
    this.selectedColors = [];
    this.numberCount = 0;
    this.numberTarget = 0;
    this.currentCritter = '';
    this.currentLetterIndex = 0;
    this.busy = false;
    this.history = { shapes: [], letters: [], colors: [], numbers: [], patterns: [] };

    this.init();
  }

  init() {
    this.homeScreen = document.getElementById('homeScreen');
    this.gameScreen = document.getElementById('gameScreen');
    this.gameTitle = document.getElementById('gameTitle');
    this.promptText = document.getElementById('promptText');
    this.gameArea = document.getElementById('gameArea');
    this.starsDisplay = document.getElementById('starsDisplay');
    this.confettiContainer = document.getElementById('confettiContainer');
    this.celebrationOverlay = document.getElementById('celebrationOverlay');
    this.celebrationEmoji = document.getElementById('celebrationEmoji');
    this.celebrationText = document.getElementById('celebrationText');

    document.querySelectorAll('.world-card').forEach(card => {
      card.addEventListener('click', () => this.enterWorld(card.dataset.world));
    });

    document.getElementById('backBtn').addEventListener('click', () => this.goHome());

    this.setupAudio();
    this.registerServiceWorker();
  }

  setupAudio() {
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {}
  }

  ensureAudio() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // ─── NAVIGATION ──────────────────────────────────────────────

  enterWorld(world) {
    this.ensureAudio();
    this.currentWorld = world;
    this.homeScreen.classList.remove('active');
    this.gameScreen.classList.add('active');
    document.body.style.background = BG_GRADIENTS[world];

    const titles = { shapes: 'Shapes', letters: 'Letters', colors: 'Colors', numbers: 'Numbers', patterns: 'Patterns' };
    this.gameTitle.textContent = titles[world];

    this.loadRound();
  }

  goHome() {
    this.gameScreen.classList.remove('active');
    this.homeScreen.classList.add('active');
    document.body.style.background = 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)';
    this.currentWorld = null;
  }

  loadRound() {
    this.busy = false;
    this.gameArea.innerHTML = '';

    switch (this.currentWorld) {
      case 'shapes': this.loadShapes(); break;
      case 'letters': this.loadLetters(); break;
      case 'colors': this.loadColors(); break;
      case 'numbers': this.loadNumbers(); break;
      case 'patterns': this.loadPatterns(); break;
    }
  }

  // ─── SHAPES ──────────────────────────────────────────────────

  loadShapes() {
    const available = SHAPES.filter(s => !this.history.shapes.includes(s.name));
    if (available.length === 0) this.history.shapes = [];
    const pool = available.length > 0 ? available : SHAPES;
    const shuffled = shuffle([...pool]);
    const target = shuffled[0];
    this.history.shapes.push(target.name);
    const options = shuffle(shuffled.slice(0, 4));

    this.promptText.textContent = `Find the ${target.name}!`;
    this.speak(`Find the ${target.name}`);

    const targetEl = document.createElement('div');
    targetEl.className = 'shape-target';
    targetEl.textContent = target.emoji;
    this.gameArea.appendChild(targetEl);

    const optionsRow = document.createElement('div');
    optionsRow.style.cssText = 'display:flex;flex-wrap:wrap;justify-content:center;gap:16px;';
    this.gameArea.appendChild(optionsRow);

    options.forEach(shape => {
      const btn = document.createElement('button');
      btn.className = 'shape-option';
      btn.textContent = shape.emoji;
      btn.addEventListener('click', () => {
        if (this.busy) return;
        if (shape.name === target.name) {
          this.busy = true;
          btn.classList.add('correct');
          this.playTone(800, 0.3);
          this.awardStar();
          this.speak(`Yes! That's the ${target.name}!`);
          setTimeout(() => this.loadRound(), 1500);
        } else {
          btn.classList.add('wrong');
          this.playTone(200, 0.2);
          this.speak('Try again!');
          setTimeout(() => btn.classList.remove('wrong'), 400);
        }
      });
      optionsRow.appendChild(btn);
    });
  }

  // ─── LETTERS ─────────────────────────────────────────────────

  loadLetters() {
    const entry = LETTERS[this.currentLetterIndex % LETTERS.length];
    const wrongLetters = shuffle(LETTERS.filter(l => l.letter !== entry.letter)).slice(0, 3);
    const options = shuffle([entry, ...wrongLetters]);

    this.promptText.textContent = `${entry.letter} is for ${entry.name}!`;
    this.speak(`${entry.letter} is for ${entry.name}`);

    const display = document.createElement('div');
    display.className = 'letter-display';
    display.innerHTML = `
      <div class="big-letter">${entry.letter}</div>
      <div class="letter-animal">${entry.animal}</div>
    `;
    this.gameArea.appendChild(display);

    const optionsRow = document.createElement('div');
    optionsRow.style.cssText = 'display:flex;flex-wrap:wrap;justify-content:center;gap:16px;';
    this.gameArea.appendChild(optionsRow);

    const subPrompt = document.createElement('p');
    subPrompt.style.cssText = 'width:100%;text-align:center;color:#fff;font-size:1.2rem;font-weight:bold;text-shadow:1px 1px 2px rgba(0,0,0,0.2);margin-bottom:12px;';
    subPrompt.textContent = `Tap the letter ${entry.letter}!`;
    optionsRow.before(subPrompt);

    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'letter-option';
      btn.textContent = opt.letter;
      btn.addEventListener('click', () => {
        if (this.busy) return;
        if (opt.letter === entry.letter) {
          this.busy = true;
          btn.classList.add('correct');
          this.playTone(800, 0.3);
          this.awardStar();
          this.speak(`Yes! ${entry.letter} is for ${entry.name}!`);
          this.currentLetterIndex++;
          setTimeout(() => this.loadRound(), 1800);
        } else {
          btn.classList.add('wrong');
          this.playTone(200, 0.2);
          this.speak(`That's ${opt.letter}. Try again!`);
          setTimeout(() => btn.classList.remove('wrong'), 400);
        }
      });
      optionsRow.appendChild(btn);
    });
  }

  // ─── COLORS ──────────────────────────────────────────────────

  loadColors() {
    const available = COLOR_MIXES.filter(m => !this.history.colors.includes(m.result + m.a + m.b));
    if (available.length === 0) this.history.colors = [];
    const pool = available.length > 0 ? available : COLOR_MIXES;
    const mix = shuffle([...pool])[0];
    this.history.colors.push(mix.result + mix.a + mix.b);
    const colorA = COLORS.find(c => c.name === mix.a);
    const colorB = COLORS.find(c => c.name === mix.b);
    this.selectedColors = [];

    this.promptText.textContent = `Mix two colors to make ${mix.result}!`;
    this.speak(`Mix two colors to make ${mix.result}`);

    const targetRow = document.createElement('div');
    targetRow.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:20px;width:100%;margin-bottom:24px;';

    const targetLabel = document.createElement('div');
    targetLabel.style.cssText = 'text-align:center;color:#fff;font-weight:bold;font-size:1.2rem;text-shadow:1px 1px 2px rgba(0,0,0,0.2);';
    targetLabel.textContent = 'Make this color:';

    const targetBlob = document.createElement('div');
    targetBlob.className = 'color-target';
    targetBlob.style.background = mix.resultHex;
    targetBlob.textContent = mix.result;

    targetRow.appendChild(targetLabel);
    targetRow.appendChild(targetBlob);
    this.gameArea.appendChild(targetRow);

    const resultEl = document.createElement('div');
    resultEl.className = 'color-result';
    resultEl.textContent = '?';
    resultEl.id = 'colorResult';
    this.gameArea.appendChild(resultEl);

    const blobsRow = document.createElement('div');
    blobsRow.style.cssText = 'display:flex;flex-wrap:wrap;justify-content:center;gap:16px;margin-top:20px;';

    const availableColors = shuffle([colorA, colorB, ...shuffle(COLORS.filter(c => c.name !== mix.a && c.name !== mix.b)).slice(0, 2)]);

    availableColors.forEach(color => {
      const blob = document.createElement('button');
      blob.className = 'color-blob';
      blob.style.background = color.hex;
      blob.textContent = color.name;
      blob.addEventListener('click', () => {
        if (this.busy) return;
        this.handleColorTap(color, blob, mix, resultEl);
      });
      blobsRow.appendChild(blob);
    });

    this.gameArea.appendChild(blobsRow);
  }

  handleColorTap(color, blob, mix, resultEl) {
    if (this.selectedColors.length >= 2) return;

    blob.classList.add('selected');
    this.selectedColors.push(color.name);
    this.playTone(500 + this.selectedColors.length * 200, 0.2);
    this.speak(color.name);

    if (this.selectedColors.length === 2) {
      this.busy = true;
      const sorted = [...this.selectedColors].sort();
      const mixSorted = [mix.a, mix.b].sort();

      setTimeout(() => {
        if (sorted[0] === mixSorted[0] && sorted[1] === mixSorted[1]) {
          resultEl.style.background = mix.resultHex;
          resultEl.classList.add('filled');
          resultEl.textContent = mix.result + '!';
          this.awardStar();
          this.speak(`${this.selectedColors[0]} and ${this.selectedColors[1]} make ${mix.result}!`);
          setTimeout(() => this.loadRound(), 2000);
        } else {
          resultEl.style.background = '#999';
          resultEl.classList.add('filled');
          resultEl.textContent = 'Hmm...';
          this.speak("That doesn't make " + mix.result + ". Try again!");
          setTimeout(() => {
            resultEl.style.background = 'rgba(255,255,255,0.3)';
            resultEl.classList.remove('filled');
            resultEl.textContent = '?';
            document.querySelectorAll('.color-blob').forEach(b => b.classList.remove('selected'));
            this.selectedColors = [];
            this.busy = false;
          }, 1500);
        }
      }, 600);
    }
  }

  // ─── NUMBERS ─────────────────────────────────────────────────

  loadNumbers() {
    let key;
    do {
      this.numberTarget = Math.floor(Math.random() * 5) + 1;
      this.currentCritter = CRITTERS[Math.floor(Math.random() * CRITTERS.length)];
      key = this.numberTarget + this.currentCritter;
    } while (this.history.numbers.includes(key) && this.history.numbers.length < 50);
    this.history.numbers.push(key);
    if (this.history.numbers.length >= 50) this.history.numbers = [];
    this.numberCount = 0;

    this.promptText.textContent = `Tap to add ${this.numberTarget} critters!`;
    this.speak(`Tap to add ${this.numberTarget} critters`);

    const numDisplay = document.createElement('div');
    numDisplay.className = 'number-display';
    numDisplay.innerHTML = `<div class="big-number">${this.numberTarget}</div>`;
    this.gameArea.appendChild(numDisplay);

    const critterArea = document.createElement('div');
    critterArea.className = 'critter-area';
    critterArea.id = 'critterArea';
    this.gameArea.appendChild(critterArea);

    const btn = document.createElement('button');
    btn.className = 'critter-btn';
    btn.textContent = this.currentCritter;
    btn.addEventListener('click', () => {
      if (this.busy) return;
      this.handleNumberTap(critterArea);
    });
    this.gameArea.appendChild(btn);
  }

  handleNumberTap(critterArea) {
    this.numberCount++;

    const critter = document.createElement('span');
    critter.className = 'critter';
    critter.textContent = this.currentCritter;
    critterArea.appendChild(critter);

    this.playTone(400 + this.numberCount * 100, 0.2);
    this.speak(String(this.numberCount));

    if (this.numberCount >= this.numberTarget) {
      this.busy = true;
      this.awardStar();
      this.speak(`You counted to ${this.numberTarget}!`);
      setTimeout(() => this.loadRound(), 2000);
    }
  }

  // ─── PATTERNS ────────────────────────────────────────────────

  loadPatterns() {
    const available = PATTERN_SETS.filter((_, i) => !this.history.patterns.includes(i));
    if (available.length === 0) this.history.patterns = [];
    const pool = available.length > 0 ? available : PATTERN_SETS;
    const patternSet = shuffle([...pool])[0];
    const patternIdx = PATTERN_SETS.indexOf(patternSet);
    this.history.patterns.push(patternIdx);

    const patternLen = patternSet.items.length;
    // Show exactly 2 full cycles (max 8 items) so it fits on screen
    const maxVisible = 8;
    const repeatCount = Math.min(2, Math.floor(maxVisible / patternLen));
    const sequence = [];
    for (let i = 0; i < repeatCount; i++) {
      sequence.push(...patternSet.items);
    }
    // Add partial cycle only if total stays under max
    if (sequence.length + 1 <= maxVisible) {
      const extraItems = Math.min(
        Math.floor(Math.random() * (patternLen - 1)),
        maxVisible - sequence.length - 1
      );
      for (let i = 0; i <= extraItems; i++) {
        if (sequence.length < maxVisible) sequence.push(patternSet.items[i]);
      }
    }

    const answerIndex = sequence.length;
    const correctAnswer = patternSet.items[(answerIndex) % patternLen];

    this.promptText.textContent = 'What comes next?';
    this.speak('What comes next in the pattern?');

    const track = document.createElement('div');
    track.className = 'train-track';

    sequence.forEach(item => {
      const car = document.createElement('div');
      car.className = 'train-car';
      car.textContent = item;
      track.appendChild(car);
    });

    const mystery = document.createElement('div');
    mystery.className = 'train-car mystery';
    mystery.textContent = '?';
    mystery.id = 'mysteryCar';
    track.appendChild(mystery);

    this.gameArea.appendChild(track);

    // Build options
    const uniqueItems = [...new Set(patternSet.items)];
    const wrongItems = ['🟠', '🟤', '🩵', '🩷', '🐲', '🎵'].filter(i => !uniqueItems.includes(i));
    let optionItems = [...uniqueItems];
    if (optionItems.length < 3) {
      optionItems.push(...shuffle(wrongItems).slice(0, 3 - optionItems.length));
    }
    optionItems = shuffle(optionItems);

    const optionsRow = document.createElement('div');
    optionsRow.style.cssText = 'display:flex;flex-wrap:wrap;justify-content:center;gap:16px;';

    optionItems.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'pattern-option';
      btn.textContent = item;
      btn.addEventListener('click', () => {
        if (this.busy) return;
        if (item === correctAnswer) {
          this.busy = true;
          btn.classList.add('correct');
          mystery.textContent = item;
          mystery.classList.remove('mystery');
          this.playTone(800, 0.3);
          this.awardStar();
          this.speak('Great pattern!');
          setTimeout(() => this.loadRound(), 1500);
        } else {
          btn.classList.add('wrong');
          this.playTone(200, 0.2);
          this.speak('Look at the pattern again!');
          setTimeout(() => btn.classList.remove('wrong'), 400);
        }
      });
      optionsRow.appendChild(btn);
    });

    this.gameArea.appendChild(optionsRow);
  }

  // ─── AUDIO ───────────────────────────────────────────────────

  playTone(freq, duration) {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
    gain.gain.setValueAtTime(0.25, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);
    osc.start();
    osc.stop(this.audioCtx.currentTime + duration);
  }

  speak(text) {
    if (!this.synth) return;
    if (this.synth.speaking) this.synth.cancel();

    const u = new SpeechSynthesisUtterance(text);
    u.pitch = 1.3;
    u.rate = 0.85;
    u.volume = 1;

    const voices = this.synth.getVoices();
    const preferred = voices.find(v => v.name.includes('Samantha')) ||
                      voices.find(v => v.lang.startsWith('en') && v.name.includes('Female')) ||
                      voices.find(v => v.lang.startsWith('en')) ||
                      voices[0];
    if (preferred) u.voice = preferred;

    this.synth.speak(u);
  }

  // ─── REWARDS ─────────────────────────────────────────────────

  awardStar() {
    this.stars++;
    this.starsDisplay.textContent = `⭐ ${this.stars}`;
    this.celebrate();
    this.burstConfetti();
  }

  celebrate() {
    const c = CELEBRATIONS[Math.floor(Math.random() * CELEBRATIONS.length)];
    this.celebrationEmoji.textContent = c.emoji;
    this.celebrationText.textContent = c.text;
    this.celebrationOverlay.classList.add('active');
    setTimeout(() => this.celebrationOverlay.classList.remove('active'), 1200);
  }

  burstConfetti() {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#A8E6CF', '#DDA0DD', '#FF9F43'];
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    for (let i = 0; i < 30; i++) {
      const el = document.createElement('div');
      el.style.cssText = `position:absolute;width:10px;height:10px;border-radius:3px;background:${colors[Math.floor(Math.random() * colors.length)]};left:${cx}px;top:${cy}px;`;

      const angle = (Math.random() * 360 * Math.PI) / 180;
      const v = 80 + Math.random() * 150;
      const tx = Math.cos(angle) * v;
      const ty = Math.sin(angle) * v;

      el.animate([
        { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${tx}px,${ty + 300}px) rotate(${600 + Math.random() * 400}deg)`, opacity: 0 }
      ], { duration: 1500 + Math.random() * 800, easing: 'cubic-bezier(0.25,0.46,0.45,0.94)' });

      this.confettiContainer.appendChild(el);
      setTimeout(() => el.remove(), 2500);
    }
  }

  // ─── SERVICE WORKER ──────────────────────────────────────────

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./service-worker.js')
        .then(r => console.log('SW registered', r))
        .catch(e => console.log('SW failed', e));
    }
  }
}

// ─── HELPERS ───────────────────────────────────────────────────

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─── BOOT ──────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  window.app = new LittleLearners();
});

if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {};
}
