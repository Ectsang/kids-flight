const DEFAULT_PLAYERS = [
  { id: 'dad', name: 'Dad', color: '#6E9B87', active: true },
  { id: 'mom', name: 'Mom', color: '#B477A8', active: false },
  { id: 'a', name: 'A', color: '#D96C57', active: true },
  { id: 'teddy', name: 'Teddy', color: '#9A7458', active: true },
  { id: 'bunny', name: 'Bunny', color: '#658EB5', active: true }
];

const AVATAR_COLORS = ['#6E9B87', '#B477A8', '#D96C57', '#9A7458', '#658EB5', '#8B76B5', '#C58A45', '#4E9AA1'];
const STORAGE_KEY = 'tea-party-talk-setup-v1';

class TeaPartyTalk {
  constructor() {
    this.players = this.loadPlayers();
    this.deck = 'all';
    this.activePlayers = [];
    this.remainingCards = [];
    this.currentCard = null;
    this.turnIndex = 0;
    this.seenCount = 0;
    this.waitTimer = null;
    this.waitStartedAt = 0;
    this.cacheDOM();
    this.bindEvents();
    this.renderPlayerSetup();
    this.registerServiceWorker();
  }

  cacheDOM() {
    const ids = [
      'setupScreen', 'gameScreen', 'playerSetupList', 'addGuestBtn', 'deckSelect', 'startBtn',
      'setupBtn', 'cardPosition', 'turnList', 'cardImage', 'categoryBadge', 'currentTurn',
      'questionText', 'parentTip', 'waitBtn', 'waitTrack', 'waitProgress', 'waitStatus',
      'nextTurnBtn', 'anotherCardBtn', 'completionOverlay', 'playAgainBtn', 'completionSetupBtn'
    ];
    ids.forEach(id => { this[id] = document.getElementById(id); });
  }

  bindEvents() {
    this.addGuestBtn.addEventListener('click', () => this.addGuest());
    this.startBtn.addEventListener('click', () => this.startGame());
    this.setupBtn.addEventListener('click', () => this.showSetup());
    this.nextTurnBtn.addEventListener('click', () => this.advanceTurn());
    this.anotherCardBtn.addEventListener('click', () => this.drawDifferentCard());
    this.waitBtn.addEventListener('click', () => this.startWait());
    this.playAgainBtn.addEventListener('click', () => this.restartDeck());
    this.completionSetupBtn.addEventListener('click', () => this.showSetup());
  }

  loadPlayers() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(saved) && saved.length >= 2) return saved;
    } catch {}
    return DEFAULT_PLAYERS.map(player => ({ ...player }));
  }

  savePlayers() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.players)); } catch {}
  }

  renderPlayerSetup() {
    this.playerSetupList.replaceChildren();
    this.players.forEach((player, index) => {
      const row = document.createElement('div');
      row.className = 'player-setup-row';

      const checkbox = document.createElement('input');
      checkbox.className = 'player-toggle';
      checkbox.type = 'checkbox';
      checkbox.checked = player.active;
      checkbox.setAttribute('aria-label', `Include ${player.name}`);
      checkbox.addEventListener('change', () => {
        player.active = checkbox.checked;
        this.savePlayers();
      });

      const avatar = this.makeAvatar(player);
      const nameInput = document.createElement('input');
      nameInput.className = 'player-name';
      nameInput.value = player.name;
      nameInput.maxLength = 18;
      nameInput.setAttribute('aria-label', 'Player name');
      nameInput.addEventListener('input', () => {
        player.name = nameInput.value.trimStart();
        checkbox.setAttribute('aria-label', `Include ${player.name || 'guest'}`);
        this.savePlayers();
      });

      row.append(checkbox, avatar, nameInput);
      this.playerSetupList.append(row);
      if (index >= DEFAULT_PLAYERS.length) this.addGuestBtn.disabled = this.players.length >= 8;
    });
    this.addGuestBtn.disabled = this.players.length >= 8;
  }

  makeAvatar(player) {
    const avatar = document.createElement('span');
    avatar.className = 'avatar';
    avatar.style.setProperty('--avatar', player.color);
    avatar.textContent = (player.name.trim()[0] || '?').toUpperCase();
    avatar.setAttribute('aria-hidden', 'true');
    return avatar;
  }

  addGuest() {
    if (this.players.length >= 8) return;
    const guestNumber = this.players.filter(player => player.id.startsWith('guest-')).length + 1;
    this.players.push({
      id: `guest-${Date.now()}`,
      name: `Guest ${guestNumber}`,
      color: AVATAR_COLORS[(this.players.length) % AVATAR_COLORS.length],
      active: true
    });
    this.savePlayers();
    this.renderPlayerSetup();
  }

  startGame() {
    this.activePlayers = this.players.filter(player => player.active && player.name.trim());
    if (this.activePlayers.length < 2) {
      this.startBtn.textContent = 'Choose at least two guests';
      setTimeout(() => { this.startBtn.textContent = 'Start the tea party'; }, 1800);
      return;
    }
    this.deck = this.deckSelect.value;
    this.savePlayers();
    this.setupScreen.classList.add('hidden');
    this.gameScreen.classList.remove('hidden');
    this.completionOverlay.classList.add('hidden');
    this.resetDeck();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  showSetup() {
    this.stopWait();
    this.completionOverlay.classList.add('hidden');
    this.gameScreen.classList.add('hidden');
    this.setupScreen.classList.remove('hidden');
    this.renderPlayerSetup();
  }

  resetDeck() {
    this.remainingCards = this.shuffle(CARDS.filter(card => this.deck === 'all' || card.category === this.deck));
    this.seenCount = 0;
    this.drawCard();
  }

  restartDeck() {
    this.completionOverlay.classList.add('hidden');
    this.resetDeck();
  }

  shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  drawCard() {
    if (!this.remainingCards.length) {
      this.currentCard = null;
      this.completionOverlay.classList.remove('hidden');
      this.playAgainBtn.focus();
      return;
    }
    this.stopWait();
    this.currentCard = this.remainingCards.pop();
    this.turnIndex = 0;
    this.seenCount += 1;
    this.renderCard();
  }

  drawDifferentCard() {
    if (!this.currentCard) return;
    this.remainingCards.unshift(this.currentCard);
    this.seenCount = Math.max(0, this.seenCount - 1);
    this.drawCard();
  }

  renderCard() {
    const card = this.currentCard;
    this.cardImage.src = `assets/${card.id}.svg`;
    this.cardImage.alt = card.alt;
    this.categoryBadge.textContent = card.categoryLabel;
    this.questionText.textContent = card.question;
    this.parentTip.textContent = card.tip;
    const total = this.seenCount + this.remainingCards.length;
    this.cardPosition.textContent = `Card ${this.seenCount} of ${total}`;
    this.renderTurns();
  }

  renderTurns() {
    this.turnList.replaceChildren();
    this.activePlayers.forEach((player, index) => {
      const chip = document.createElement('div');
      chip.className = 'turn-chip';
      if (index === this.turnIndex) chip.classList.add('active');
      if (index < this.turnIndex) chip.classList.add('done');
      chip.append(this.makeAvatar(player));
      const name = document.createElement('span');
      name.textContent = player.name;
      chip.append(name);
      this.turnList.append(chip);
    });
    const player = this.activePlayers[this.turnIndex];
    this.currentTurn.textContent = `${player.name}’s turn`;
    this.nextTurnBtn.textContent = this.turnIndex === this.activePlayers.length - 1 ? 'Next card' : 'Next turn';
  }

  advanceTurn() {
    this.stopWait();
    if (this.turnIndex < this.activePlayers.length - 1) {
      this.turnIndex += 1;
      this.renderTurns();
      return;
    }
    this.drawCard();
  }

  startWait() {
    this.stopWait();
    this.waitStartedAt = Date.now();
    this.waitTrack.classList.remove('hidden');
    this.waitStatus.textContent = 'Give them thinking time.';
    this.waitBtn.disabled = true;
    this.waitTimer = setInterval(() => this.updateWait(), 100);
    this.updateWait();
  }

  updateWait() {
    const elapsed = Date.now() - this.waitStartedAt;
    const percent = Math.min(100, elapsed / 100);
    this.waitProgress.style.width = `${percent}%`;
    if (elapsed < 10000) return;
    this.stopWait();
    this.waitStatus.textContent = 'Ready when they are. Any answer counts.';
  }

  stopWait() {
    if (this.waitTimer) clearInterval(this.waitTimer);
    this.waitTimer = null;
    this.waitBtn.disabled = false;
    this.waitTrack.classList.add('hidden');
    this.waitProgress.style.width = '0';
    if (this.waitStatus) this.waitStatus.textContent = '';
  }

  registerServiceWorker() {
    if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
    navigator.serviceWorker.register('./service-worker.js').catch(error => console.log('SW failed', error));
  }
}

new TeaPartyTalk();
