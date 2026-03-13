import type { SoundEffect } from "../types";

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

export function playSound(effect: SoundEffect): void {
  if (effect === "none") return;
  try {
    const ctx = getAudioContext();
    switch (effect) {
      case "whoosh":
        playWhoosh(ctx);
        break;
      case "pop":
        playPop(ctx);
        break;
      case "swipe":
        playSwipe(ctx);
        break;
      case "glitch":
        playGlitch(ctx);
        break;
      case "cinematic":
        playCinematic(ctx);
        break;
      case "typewriter-click":
        playTypewriterClick(ctx);
        break;
    }
  } catch {
    // Audio not available
  }
}

function playWhoosh(ctx: AudioContext): void {
  const bufSize = ctx.sampleRate * 0.35;
  const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(800, ctx.currentTime);
  filter.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.35);
  filter.Q.value = 2;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.4, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.35);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
  source.stop(ctx.currentTime + 0.35);
}

function playPop(ctx: AudioContext): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(900, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.5, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.1);
}

function playSwipe(ctx: AudioContext): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(2200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.22);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.22);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.22);
}

function playGlitch(ctx: AudioContext): void {
  for (let i = 0; i < 3; i++) {
    const delay = i * 0.05;
    const bufSize = Math.floor(ctx.sampleRate * 0.04);
    const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let j = 0; j < bufSize; j++) {
      data[j] = (Math.random() * 2 - 1) * (j % 2 === 0 ? 1 : -1);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = 0.25;
    const distortion = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let k = 0; k < 256; k++) {
      const x = (k * 2) / 256 - 1;
      curve[k] = ((Math.PI + 100) * x) / (Math.PI + 100 * Math.abs(x));
    }
    distortion.curve = curve;
    source.connect(distortion);
    distortion.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime + delay);
  }
}

function playCinematic(ctx: AudioContext): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = 55;
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.15);
  gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.6);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 1.2);
}

function playTypewriterClick(ctx: AudioContext): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = 1200;
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.03);
}
