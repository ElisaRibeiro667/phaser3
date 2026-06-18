/**
 * AudioManager — generates and plays procedural sounds via Web Audio API.
 * No external audio files needed.
 */
export default class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this._init();
  }

  _init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      this.enabled = false;
    }
  }

  _resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  _playTone(frequency, type, duration, volume = 0.3, detune = 0) {
    if (!this.enabled || !this.ctx) return;
    this._resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
    osc.detune.setValueAtTime(detune, this.ctx.currentTime);
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + duration);
  }

  _playNoise(duration, volume = 0.15) {
    if (!this.enabled || !this.ctx) return;
    this._resume();
    const bufSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    source.connect(gain);
    gain.connect(this.ctx.destination);
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    source.start();
  }

  playPlantTree() {
    // cheerful ascending notes
    this._playTone(440, 'sine', 0.1, 0.2);
    setTimeout(() => this._playTone(550, 'sine', 0.1, 0.2), 100);
    setTimeout(() => this._playTone(660, 'sine', 0.15, 0.25), 200);
  }

  playBuildPurifier() {
    // mechanical clunk + hum
    this._playNoise(0.1, 0.2);
    setTimeout(() => this._playTone(180, 'sawtooth', 0.3, 0.15), 80);
    setTimeout(() => this._playTone(220, 'square', 0.2, 0.1), 200);
  }

  playPollutionHit() {
    // ominous low thud
    this._playTone(80, 'sine', 0.4, 0.3);
    this._playNoise(0.15, 0.1);
  }

  playCleanBurst() {
    // sparkly high tones
    [800, 1000, 1200, 1000].forEach((f, i) => {
      setTimeout(() => this._playTone(f, 'sine', 0.08, 0.15), i * 60);
    });
  }

  playGameOver() {
    // descending sad notes
    [440, 370, 311, 261].forEach((f, i) => {
      setTimeout(() => this._playTone(f, 'sine', 0.4, 0.25), i * 300);
    });
  }

  playVictory() {
    // triumphant fanfare
    [523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => this._playTone(f, 'triangle', 0.3, 0.3), i * 180);
    });
    setTimeout(() => this._playTone(1047, 'sine', 0.6, 0.4), 800);
  }

  playDebrisLand() {
    this._playNoise(0.12, 0.18);
    this._playTone(120, 'sawtooth', 0.2, 0.2);
  }

  playButtonClick() {
    this._playTone(660, 'square', 0.05, 0.1);
  }

  playResourcePickup() {
    this._playTone(880, 'sine', 0.08, 0.15);
    setTimeout(() => this._playTone(1100, 'sine', 0.08, 0.12), 80);
  }

  // Background ambient hum (very subtle)
  startAmbient() {
    if (!this.enabled || !this.ctx) return;
    this._ambientRunning = true;
    this._ambientLoop();
  }

  _ambientLoop() {
    if (!this._ambientRunning) return;
    this._playTone(55, 'sine', 2, 0.04, -5);
    this._playTone(110, 'sine', 2, 0.02, 3);
    setTimeout(() => this._ambientLoop(), 1800);
  }

  stopAmbient() {
    this._ambientRunning = false;
  }
}
