const ANIMALS = [
  { id: 'cat', name: 'Cat', emoji: '🐱', sound: 'meow', narration: 'The cat says meow' },
  { id: 'dog', name: 'Dog', emoji: '🐶', sound: 'woof', narration: 'The dog says woof' },
  { id: 'cow', name: 'Cow', emoji: '🐮', sound: 'moo', narration: 'The cow says moo' },
  { id: 'lion', name: 'Lion', emoji: '🦁', sound: 'roar', narration: 'The lion says roar' },
  { id: 'duck', name: 'Duck', emoji: '🦆', sound: 'quack', narration: 'The duck says quack' },
  { id: 'elephant', name: 'Elephant', emoji: '🐘', sound: 'trumpet', narration: 'The elephant goes trumpet' },
  { id: 'sheep', name: 'Sheep', emoji: '🐑', sound: 'baa', narration: 'The sheep says baa' },
  { id: 'monkey', name: 'Monkey', emoji: '🐵', sound: 'ooh ooh', narration: 'The monkey says ooh ooh ah ah' }
];

const MODES = [
  { id: 'free', name: 'Free Play', icon: '🎮', prompt: 'Tap any animal!' },
  { id: 'find', name: 'Find It!', icon: '🔍', prompt: 'Find the' },
  { id: 'sound', name: 'Sound Match', icon: '🔊', prompt: 'Which animal says' },
  { id: 'count', name: 'Counting', icon: '🔢', prompt: 'Tap' }
];

const ANIMATIONS = ['bounce', 'wiggle', 'pop', 'glow'];
const BG_COLORS = [
  'linear-gradient(135deg, #FFD93D 0%, #FF9F43 100%)',
  'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
  'linear-gradient(135deg, #FF6B6B 0%, #EE5A5A 100%)',
  'linear-gradient(135deg, #A8E6CF 0%, #88D8B0 100%)',
  'linear-gradient(135deg, #DDA0DD 0%, #BA55D3 100%)'
];

class AnimalTapParade {
  constructor() {
    this.currentMode = MODES[0];
    this.targetAnimal = null;
    this.tapCount = 0;
    this.countTarget = 0;
    this.countCurrent = 0;
    this.synth = window.speechSynthesis;
    this.audioContext = null;
    
    this.init();
  }

  init() {
    this.cacheDOM();
    this.bindEvents();
    this.renderGrid();
    this.setupAudio();
    this.randomizeBackground();
    this.registerServiceWorker();
  }

  cacheDOM() {
    this.grid = document.getElementById('animalGrid');
    this.modeBtn = document.getElementById('modeBtn');
    this.modeIcon = document.querySelector('.mode-icon');
    this.modeLabel = document.querySelector('.mode-label');
    this.promptArea = document.getElementById('promptArea');
    this.promptText = document.getElementById('promptText');
    this.tapCountEl = document.getElementById('tapCount');
    this.overlay = document.getElementById('overlay');
    this.overlayTitle = document.getElementById('overlayTitle');
    this.overlayMessage = document.getElementById('overlayMessage');
    this.overlayBtn = document.getElementById('overlayBtn');
    this.confettiContainer = document.getElementById('confettiContainer');
  }

  bindEvents() {
    this.modeBtn.addEventListener('click', () => this.cycleMode());
    this.overlayBtn.addEventListener('click', () => this.hideOverlay());
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.hideOverlay();
    });
  }

  setupAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.log('Audio context not supported');
    }
  }

  playSound(soundType) {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    const sounds = {
      meow: { freq: 800, duration: 0.3, type: 'sine' },
      woof: { freq: 400, duration: 0.2, type: 'square' },
      moo: { freq: 300, duration: 0.5, type: 'sawtooth' },
      roar: { freq: 200, duration: 0.6, type: 'sawtooth' },
      quack: { freq: 600, duration: 0.25, type: 'square' },
      trumpet: { freq: 500, duration: 0.4, type: 'sawtooth' },
      baa: { freq: 450, duration: 0.35, type: 'sine' },
      ribbit: { freq: 350, duration: 0.3, type: 'sine' },
      growl: { freq: 150, duration: 0.4, type: 'sawtooth' },
      oink: { freq: 350, duration: 0.2, type: 'square' },
      neigh: { freq: 600, duration: 0.4, type: 'sine' },
      'ooh ooh': { freq: 700, duration: 0.3, type: 'sine' },
      success: { freq: 1000, duration: 0.5, type: 'sine' }
    };
    
    const sound = sounds[soundType] || sounds.meow;
    oscillator.type = sound.type;
    oscillator.frequency.setValueAtTime(sound.freq, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(sound.freq * 0.5, this.audioContext.currentTime + sound.duration);
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + sound.duration);
  }

  speak(text, pitch = 1.2, rate = 0.9) {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.volume = 1;
    
    const voices = this.synth.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Samantha')) ||
                          voices.find(v => v.lang.startsWith('en') && v.name.includes('Female')) ||
                          voices.find(v => v.lang.startsWith('en')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;
    
    this.synth.speak(utterance);
  }

  renderGrid() {
    this.grid.innerHTML = '';
    
    const shuffled = [...ANIMALS].sort(() => Math.random() - 0.5);
    
    ANIMALS.forEach(animal => {
      const card = document.createElement('div');
      card.className = 'animal-card';
      card.dataset.id = animal.id;
      card.dataset.name = animal.name;
      card.innerHTML = `
        <div class="animal-emoji">${animal.emoji}</div>
        <div class="animal-name">${animal.name}</div>
      `;
      
      card.addEventListener('click', () => this.handleTap(animal, card));
      card.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.handleTap(animal, card);
      });
      
      this.grid.appendChild(card);
    });
  }

  handleTap(animal, card) {
    this.tapCount++;
    this.tapCountEl.textContent = this.tapCount;
    
    this.playSound(animal.sound);
    this.speak(animal.name);
    
    setTimeout(() => {
      this.speak(animal.narration);
    }, 800);
    
    this.animateCard(card);
    this.createConfetti(card);
    
    if (this.currentMode.id === 'find' && this.targetAnimal) {
      if (animal.id === this.targetAnimal.id) {
        this.showSuccess(animal);
      } else {
        this.speak('Try again!');
      }
    }
    
    if (this.currentMode.id === 'sound' && this.targetAnimal) {
      if (animal.id === this.targetAnimal.id) {
        this.showSuccess(animal);
      }
    }
    
    if (this.currentMode.id === 'count' && this.targetAnimal) {
      if (animal.id === this.targetAnimal.id) {
        this.countCurrent++;
        if (this.countCurrent >= this.countTarget) {
          this.showSuccess(animal, true);
        } else {
          this.speak(`${this.countTarget - this.countCurrent} more!`);
        }
      }
    }
  }

  animateCard(card) {
    const animation = ANIMATIONS[Math.floor(Math.random() * ANIMATIONS.length)];
    
    card.classList.remove('animate-bounce', 'animate-wiggle', 'animate-pop', 'animate-glow');
    void card.offsetWidth;
    card.classList.add(`animate-${animation}`);
    
    setTimeout(() => {
      card.classList.remove(`animate-${animation}`);
    }, 1200);
  }

  createConfetti(card) {
    const rect = card.getBoundingClientRect();
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#FF9F43', '#A8E6CF'];
    
    for (let i = 0; i < 12; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = (rect.left + rect.width / 2) + 'px';
      confetti.style.top = (rect.top + rect.height / 2) + 'px';
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      
      const angle = (Math.random() * 360 * Math.PI) / 180;
      const velocity = 50 + Math.random() * 100;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity - 100;
      
      confetti.animate([
        { transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
        { transform: `translate(${tx}px, ${ty + 200}px) rotate(${720}deg)`, opacity: 0 }
      ], {
        duration: 1500 + Math.random() * 1000,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      });
      
      this.confettiContainer.appendChild(confetti);
      
      setTimeout(() => confetti.remove(), 3000);
    }
  }

  cycleMode() {
    const currentIndex = MODES.findIndex(m => m.id === this.currentMode.id);
    const nextIndex = (currentIndex + 1) % MODES.length;
    this.currentMode = MODES[nextIndex];
    
    this.modeIcon.textContent = this.currentMode.icon;
    this.modeLabel.textContent = this.currentMode.name;
    
    this.clearHighlights();
    this.updatePrompt();
    
    if (this.currentMode.id === 'find' || this.currentMode.id === 'sound') {
      this.selectTargetAnimal();
    } else if (this.currentMode.id === 'count') {
      this.setupCounting();
    }
    
    this.speak(`Mode: ${this.currentMode.name}`);
  }

  updatePrompt() {
    if (this.currentMode.id === 'free') {
      this.promptText.textContent = this.currentMode.prompt;
    } else if (this.currentMode.id === 'find' && this.targetAnimal) {
      this.promptText.textContent = `${this.currentMode.prompt} ${this.targetAnimal.name}!`;
    } else if (this.currentMode.id === 'sound' && this.targetAnimal) {
      this.promptText.textContent = `${this.currentMode.prompt} "${this.targetAnimal.sound}"?`;
      setTimeout(() => this.playSound(this.targetAnimal.sound), 500);
    } else if (this.currentMode.id === 'count' && this.targetAnimal) {
      this.promptText.textContent = `${this.currentMode.prompt} ${this.countTarget} ${this.targetAnimal.name}s!`;
    }
  }

  selectTargetAnimal() {
    const shuffled = [...ANIMALS].sort(() => Math.random() - 0.5);
    this.targetAnimal = shuffled[0];
    
    this.clearHighlights();
    
    if (this.currentMode.id === 'find') {
      const targetCard = document.querySelector(`[data-id="${this.targetAnimal.id}"]`);
      if (targetCard) targetCard.classList.add('highlight');
    }
    
    setTimeout(() => this.updatePrompt(), 500);
  }

  setupCounting() {
    const shuffled = [...ANIMALS].sort(() => Math.random() - 0.5);
    this.targetAnimal = shuffled[0];
    this.countTarget = Math.floor(Math.random() * 3) + 2;
    this.countCurrent = 0;
    
    this.clearHighlights();
    setTimeout(() => this.updatePrompt(), 500);
  }

  clearHighlights() {
    document.querySelectorAll('.animal-card').forEach(card => {
      card.classList.remove('highlight');
    });
  }

  showSuccess(animal, isCounting = false) {
    const messages = [
      'Great Job!',
      'Awesome!',
      'You Did It!',
      'Super Star!',
      'Fantastic!',
      'Well Done!'
    ];
    
    this.overlayTitle.textContent = messages[Math.floor(Math.random() * messages.length)];
    
    if (isCounting) {
      this.overlayMessage.textContent = `You found ${this.countTarget} ${animal.name}s!`;
    } else {
      this.overlayMessage.textContent = `You found the ${animal.name}!`;
    }
    
    this.showOverlay();
    this.playSound('success');
    this.createMassiveConfetti();
    
    setTimeout(() => {
      this.speak(this.overlayTitle.textContent);
    }, 300);
    
    if (this.currentMode.id === 'find' || this.currentMode.id === 'sound') {
      setTimeout(() => {
        this.selectTargetAnimal();
      }, 2000);
    } else if (this.currentMode.id === 'count') {
      setTimeout(() => {
        this.setupCounting();
      }, 2000);
    }
  }

  showOverlay() {
    this.overlay.classList.add('active');
  }

  hideOverlay() {
    this.overlay.classList.remove('active');
    this.updatePrompt();
  }

  createMassiveConfetti() {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#FF9F43', '#A8E6CF', '#DDA0DD'];
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = centerX + 'px';
      confetti.style.top = centerY + 'px';
      
      const angle = (Math.random() * 360 * Math.PI) / 180;
      const velocity = 100 + Math.random() * 200;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;
      
      confetti.animate([
        { transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
        { transform: `translate(${tx}px, ${ty + 500}px) rotate(${720}deg)`, opacity: 0 }
      ], {
        duration: 2000 + Math.random() * 1000,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      });
      
      this.confettiContainer.appendChild(confetti);
      
      setTimeout(() => confetti.remove(), 4000);
    }
  }

  randomizeBackground() {
    document.body.style.background = BG_COLORS[Math.floor(Math.random() * BG_COLORS.length)];
    
    setInterval(() => {
      document.body.style.background = BG_COLORS[Math.floor(Math.random() * BG_COLORS.length)];
    }, 60000);
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./service-worker.js')
        .then(reg => console.log('Service Worker registered', reg))
        .catch(err => console.log('Service Worker registration failed', err));
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new AnimalTapParade();
});

if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {};
}
