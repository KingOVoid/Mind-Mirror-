/**
 * Tokyo Night Ambient Audio Engine
 * Uses pure Web Audio API to procedurally synthesize high-fidelity focus soundscapes
 * (100% offline, zero network requests, zero broken audio assets).
 */

export type AmbientSoundType = 'rain' | 'lofi' | 'binaural' | 'cyberhum' | 'none';

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentType: AmbientSoundType = 'none';
  private activeNodes: { stop?: () => void; disconnect: () => void }[] = [];
  private volume: number = 0.4;
  public analyser: AnalyserNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;

      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentSound(): AmbientSoundType {
    return this.currentType;
  }

  public stop() {
    for (const node of this.activeNodes) {
      try {
        if (node.stop) node.stop();
        node.disconnect();
      } catch {}
    }
    this.activeNodes = [];
    this.currentType = 'none';
  }

  public play(type: AmbientSoundType) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.currentType === type) {
      this.stop();
      return;
    }

    this.stop();
    this.currentType = type;

    switch (type) {
      case 'rain':
        this.startMidnightRain();
        break;
      case 'lofi':
        this.startTokyoLoFiDrone();
        break;
      case 'binaural':
        this.startBinauralTheta();
        break;
      case 'cyberhum':
        this.startCyberpunkHum();
        break;
      default:
        this.stop();
    }
  }

  /** Synthesize steady midnight rainfall via filtered white noise */
  private startMidnightRain() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Pink-noise approximation
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.35;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(950, this.ctx.currentTime);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(this.masterGain);

    whiteNoise.start(0);
    this.activeNodes.push(whiteNoise, filter, rainGain);
  }

  /** Warm Tokyo Night Lo-Fi ambient drone (432Hz root + sub-harmonics) */
  private startTokyoLoFiDrone() {
    if (!this.ctx || !this.masterGain) return;

    // Root 108Hz (432Hz two octaves down) & fifth 162Hz
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const osc3 = this.ctx.createOscillator();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(108, this.ctx.currentTime);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(162.5, this.ctx.currentTime); // gentle detune chorus

    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(54, this.ctx.currentTime); // sub-bass

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);

    const droneGain = this.ctx.createGain();
    droneGain.gain.setValueAtTime(0.5, this.ctx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    osc3.connect(filter);
    filter.connect(droneGain);
    droneGain.connect(this.masterGain);

    osc1.start();
    osc2.start();
    osc3.start();

    this.activeNodes.push(osc1, osc2, osc3, filter, droneGain);
  }

  /** Theta Binaural Beats for Deep Flow (6Hz frequency differential) */
  private startBinauralTheta() {
    if (!this.ctx || !this.masterGain) return;

    // Left channel: 216Hz, Right channel: 210Hz => 6Hz Theta frequency
    const oscL = this.ctx.createOscillator();
    const oscR = this.ctx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(216, this.ctx.currentTime);

    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(210, this.ctx.currentTime);

    const merger = this.ctx.createChannelMerger(2);
    oscL.connect(merger, 0, 0); // left
    oscR.connect(merger, 0, 1); // right

    const binGain = this.ctx.createGain();
    binGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

    merger.connect(binGain);
    binGain.connect(this.masterGain);

    oscL.start();
    oscR.start();

    this.activeNodes.push(oscL, oscR, merger, binGain);
  }

  /** Low frequency cyberpunk laboratory hum */
  private startCyberpunkHum() {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, this.ctx.currentTime);

    const humGain = this.ctx.createGain();
    humGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    osc.connect(filter);
    filter.connect(humGain);
    humGain.connect(this.masterGain);

    osc.start();
    this.activeNodes.push(osc, filter, humGain);
  }
}

export const ambientAudio = new AmbientAudioEngine();
