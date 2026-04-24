import Phaser from 'phaser';

/**
 * Procedural audio generation using Web Audio API
 * No external audio files needed!
 */
class SoundManagerClass {
  private context?: AudioContext;
  private masterGain?: GainNode;
  private initialized: boolean = false;
  
  private musicOsc?: OscillatorNode;
  private musicGain?: GainNode;
  private musicPlaying: boolean = false;
  
  // Volume settings
  private sfxVolume: number = 0.8;
  private musicVolume: number = 0.5;

  /**
   * Initialize audio context (must be called after user interaction)
   */
  init(): void {
    if (this.initialized) return;
    
    try {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
      this.masterGain.gain.value = 0.5;
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  private ensureContext(): boolean {
    if (!this.initialized) this.init();
    if (!this.context || !this.masterGain) return false;
    
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
    return true;
  }

  /**
   * Play a beep/tone
   */
  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3): void {
    if (!this.ensureContext()) return;
    
    const osc = this.context!.createOscillator();
    const gain = this.context!.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.context!.currentTime);
    
    gain.gain.setValueAtTime(volume * this.sfxVolume, this.context!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context!.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.masterGain!);
    
    osc.start();
    osc.stop(this.context!.currentTime + duration);
  }

  /**
   * Play noise burst
   */
  private playNoise(duration: number, volume: number = 0.2): void {
    if (!this.ensureContext()) return;
    
    const bufferSize = this.context!.sampleRate * duration;
    const buffer = this.context!.createBuffer(1, bufferSize, this.context!.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.context!.createBufferSource();
    const gain = this.context!.createGain();
    const filter = this.context!.createBiquadFilter();
    
    noise.buffer = buffer;
    filter.type = 'lowpass';
    filter.frequency.value = 1000;
    
    gain.gain.setValueAtTime(volume * this.sfxVolume, this.context!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context!.currentTime + duration);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);
    
    noise.start();
  }

  // === GAME SOUNDS ===

  /**
   * Gravity flip sound - whoosh + blip
   */
  playFlip(): void {
    // Whoosh
    this.playNoise(0.15, 0.15);
    
    // Rising tone
    if (!this.ensureContext()) return;
    
    const osc = this.context!.createOscillator();
    const gain = this.context!.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, this.context!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.context!.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.2 * this.sfxVolume, this.context!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context!.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(this.masterGain!);
    
    osc.start();
    osc.stop(this.context!.currentTime + 0.15);
  }

  /**
   * Coin/gear collect sound - bright chime
   */
  playCoinCollect(): void {
    // Main chime
    this.playTone(880, 0.1, 'sine', 0.25);
    
    // Harmonic
    setTimeout(() => {
      this.playTone(1320, 0.08, 'sine', 0.15);
    }, 30);
    
    // Sparkle
    setTimeout(() => {
      this.playTone(1760, 0.06, 'sine', 0.1);
    }, 60);
  }

  /**
   * Death sound - descending boom
   */
  playDeath(): void {
    // Impact
    this.playNoise(0.3, 0.4);
    
    // Descending tone
    if (!this.ensureContext()) return;
    
    const osc = this.context!.createOscillator();
    const gain = this.context!.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, this.context!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.context!.currentTime + 0.5);
    
    gain.gain.setValueAtTime(0.3 * this.sfxVolume, this.context!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context!.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(this.masterGain!);
    
    osc.start();
    osc.stop(this.context!.currentTime + 0.5);
  }

  /**
   * Victory fanfare
   */
  playVictory(): void {
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.3, 'sine', 0.25);
      }, i * 100);
    });
  }

  /**
   * Pause sound - soft blip
   */
  playPause(): void {
    this.playTone(440, 0.1, 'sine', 0.15);
    setTimeout(() => {
      this.playTone(330, 0.15, 'sine', 0.1);
    }, 80);
  }

  /**
   * Button click
   */
  playClick(): void {
    this.playTone(600, 0.05, 'square', 0.1);
  }

  /**
   * Button hover
   */
  playHover(): void {
    this.playTone(800, 0.03, 'sine', 0.05);
  }

  /**
   * Combo sound - ascending based on combo level
   */
  playCombo(combo: number): void {
    const baseFreq = 400 + combo * 50;
    this.playTone(baseFreq, 0.1, 'triangle', 0.2);
    
    if (combo >= 5) {
      setTimeout(() => {
        this.playTone(baseFreq * 1.5, 0.08, 'sine', 0.15);
      }, 40);
    }
  }

  /**
   * Shield break sound
   */
  playShieldBreak(): void {
    // Glass shatter
    this.playNoise(0.2, 0.3);
    
    // High ping
    this.playTone(2000, 0.15, 'sine', 0.2);
    
    setTimeout(() => {
      this.playTone(1500, 0.1, 'sine', 0.1);
    }, 50);
  }

  /**
   * Phase change warning
   */
  playPhaseChange(): void {
    // Warning siren
    if (!this.ensureContext()) return;
    
    const osc = this.context!.createOscillator();
    const gain = this.context!.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, this.context!.currentTime);
    osc.frequency.linearRampToValueAtTime(600, this.context!.currentTime + 0.2);
    osc.frequency.linearRampToValueAtTime(400, this.context!.currentTime + 0.4);
    
    gain.gain.setValueAtTime(0.15 * this.sfxVolume, this.context!.currentTime);
    gain.gain.setValueAtTime(0.15 * this.sfxVolume, this.context!.currentTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context!.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(this.masterGain!);
    
    osc.start();
    osc.stop(this.context!.currentTime + 0.5);
  }

  // === AMBIENT MUSIC (Simple procedural) ===

  startMusic(): void {
    if (!this.ensureContext() || this.musicPlaying) return;
    
    // Simple ambient drone
    this.musicOsc = this.context!.createOscillator();
    this.musicGain = this.context!.createGain();
    const filter = this.context!.createBiquadFilter();
    
    this.musicOsc.type = 'sawtooth';
    this.musicOsc.frequency.value = 55; // A1 bass drone
    
    filter.type = 'lowpass';
    filter.frequency.value = 200;
    filter.Q.value = 5;
    
    this.musicGain.gain.value = this.musicVolume * 0.1;
    
    this.musicOsc.connect(filter);
    filter.connect(this.musicGain);
    this.musicGain.connect(this.masterGain!);
    
    this.musicOsc.start();
    this.musicPlaying = true;
    
    // Add subtle modulation
    const lfo = this.context!.createOscillator();
    const lfoGain = this.context!.createGain();
    
    lfo.frequency.value = 0.1;
    lfoGain.gain.value = 20;
    
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
  }

  stopMusic(): void {
    if (this.musicOsc) {
      this.musicOsc.stop();
      this.musicOsc = undefined;
      this.musicPlaying = false;
    }
  }

  // === VOLUME CONTROL ===

  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicGain) {
      this.musicGain.gain.value = this.musicVolume * 0.1;
    }
  }

  setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }
}

// Singleton
export const soundManager = new SoundManagerClass();
