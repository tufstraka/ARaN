// Sound Manager - Generates all sounds programmatically using Web Audio API
// No external audio files needed!

export class SoundManager {
  private audioContext: AudioContext | null = null;
  private masterVolume: number = 0.5;
  private isMuted: boolean = false;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  private ensureContext(): void {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  // Flip/Gravity reverse sound - Whoosh with electronic zap
  playFlip(): void {
    if (!this.audioContext || this.isMuted) return;
    this.ensureContext();

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // Whoosh sound
    const whooshOsc = ctx.createOscillator();
    const whooshGain = ctx.createGain();
    whooshOsc.type = 'sawtooth';
    whooshOsc.frequency.setValueAtTime(400, now);
    whooshOsc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
    whooshGain.gain.setValueAtTime(0.3 * this.masterVolume, now);
    whooshGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    whooshOsc.connect(whooshGain);
    whooshGain.connect(ctx.destination);
    whooshOsc.start(now);
    whooshOsc.stop(now + 0.2);

    // Electronic zap
    const zapOsc = ctx.createOscillator();
    const zapGain = ctx.createGain();
    zapOsc.type = 'square';
    zapOsc.frequency.setValueAtTime(800, now);
    zapOsc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
    zapGain.gain.setValueAtTime(0.15 * this.masterVolume, now);
    zapGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    zapOsc.connect(zapGain);
    zapGain.connect(ctx.destination);
    zapOsc.start(now);
    zapOsc.stop(now + 0.15);
  }

  // Coin/Gear collection sound - Bright chime
  playCoinCollect(): void {
    if (!this.audioContext || this.isMuted) return;
    this.ensureContext();

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // Main chime
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.setValueAtTime(1320, now + 0.05);
    gain1.gain.setValueAtTime(0.3 * this.masterVolume, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Harmonic
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1760, now + 0.05);
    gain2.gain.setValueAtTime(0.15 * this.masterVolume, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.25);
  }

  // Victory/Level complete sound - Triumphant fanfare
  playVictory(): void {
    if (!this.audioContext || this.isMuted) return;
    this.ensureContext();

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const durations = [0.15, 0.15, 0.15, 0.4];
    let time = now;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0.2 * this.masterVolume, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + durations[i]);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + durations[i]);
      time += durations[i] * 0.8;
    });
  }

  // UI Click sound - Soft click
  playClick(): void {
    if (!this.audioContext || this.isMuted) return;
    this.ensureContext();

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
    gain.gain.setValueAtTime(0.2 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Hover sound - Subtle blip
  playHover(): void {
    if (!this.audioContext || this.isMuted) return;
    this.ensureContext();

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0.08 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.03);
  }

  // Death/Hazard hit sound - Electric shock
  playDeath(): void {
    if (!this.audioContext || this.isMuted) return;
    this.ensureContext();

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // Buzz
    const buzzOsc = ctx.createOscillator();
    const buzzGain = ctx.createGain();
    buzzOsc.type = 'sawtooth';
    buzzOsc.frequency.setValueAtTime(100, now);
    buzzGain.gain.setValueAtTime(0.3 * this.masterVolume, now);
    buzzGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    buzzOsc.connect(buzzGain);
    buzzGain.connect(ctx.destination);
    buzzOsc.start(now);
    buzzOsc.stop(now + 0.3);

    // Crackle
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
    }
    const noiseSource = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    noiseSource.buffer = noiseBuffer;
    noiseGain.gain.setValueAtTime(0.2 * this.masterVolume, now);
    noiseSource.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSource.start(now);
  }

  // Start game sound - Power up
  playStart(): void {
    if (!this.audioContext || this.isMuted) return;
    this.ensureContext();

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);
    gain.gain.setValueAtTime(0.25 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Pause sound - Soft descending tone
  playPause(): void {
    if (!this.audioContext || this.isMuted) return;
    this.ensureContext();

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);
    gain.gain.setValueAtTime(0.2 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Resume sound - Soft ascending tone
  playResume(): void {
    if (!this.audioContext || this.isMuted) return;
    this.ensureContext();

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
    gain.gain.setValueAtTime(0.2 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }
}

// Global sound manager instance
export const soundManager = new SoundManager();
