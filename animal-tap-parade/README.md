# Animal Tap Parade

A simple, offline-first toddler web app where kids tap animal cards to trigger sounds, animations, and positive feedback.

## Quick Start

1. Open `index.html` in a browser
2. For best experience, serve via local server:
   ```bash
   python3 -m http.server 8000
   ```
3. Navigate to `http://localhost:8000`
4. Install as PWA (optional) for offline use

## Features

- **8 Animals**: Cat, Dog, Cow, Lion, Duck, Elephant, Sheep, Monkey
- **4 Game Modes**:
  - Free Play - tap any animal
  - Find It! - find the named animal
  - Sound Match - match animal to sound
  - Counting - count out animals
- **Instant Feedback**: Sound effects, animations, confetti
- **Offline Ready**: Works in airplane mode after first load
- **PWA Installable**: Add to home screen on tablets/phones

## Folder Structure

```
animal-tap-parade/
├── index.html
├── styles.css
├── app.js
├── service-worker.js
├── manifest.webmanifest
├── icons.html (open in browser to generate PNG icons)
└── assets/
    ├── images/
    ├── sounds/
    └── icons/
        ├── icon-192.svg
        └── icon-512.svg
```

## Usage

### Tablet/Phone
1. Open in Chrome/Safari
2. Tap "Add to Home Screen" or "Install"
3. App works offline after install

### Desktop
1. Open `index.html` in browser
2. Use mouse or touch to tap animals

## Customization

### Add Animals
Edit `ANIMALS` array in `app.js`:
```javascript
{ id: 'frog', name: 'Frog', emoji: '🐸', sound: 'ribbit', narration: 'The frog says ribbit' }
```

### Change Colors
Edit `BG_COLORS` array in `app.js` for background rotations.

### Adjust Difficulty
Modify counting targets in `setupCounting()` method.

## Accessibility

- Large touch targets (140px+)
- No reading required
- Reduced motion respects system preferences
- High contrast mode available
- Works landscape on tablets

## Tech Stack

- Vanilla HTML/CSS/JS (no frameworks)
- Web Audio API for sounds
- Speech Synthesis API for voice
- Service Worker for offline caching
- CSS Animations for effects
- PWA manifest for installability

## Browser Support

- Chrome/Edge (best support)
- Safari (iOS 14+)
- Firefox
- Android Chrome

## License

MIT - Free for personal and educational use
