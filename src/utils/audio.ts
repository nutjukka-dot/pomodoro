import { ChimeType } from '../types';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a notification chime
 */
export function playChime(type: ChimeType, volumePercent: number = 80) {
  try {
    const ctx = getAudioContext();
    const gainNode = ctx.createGain();
    const masterGain = Math.max(0, Math.min(1, volumePercent / 100));
    gainNode.gain.setValueAtTime(masterGain, ctx.currentTime);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'bell': {
        // High quality Tibetan singing bowl / meditation bell
        const freqs = [587.33, 1174.66, 1762.0, 2349.3]; // D5 and harmonics
        const amps = [0.6, 0.25, 0.1, 0.05];
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          oscGain.gain.setValueAtTime(0, now);
          oscGain.gain.linearRampToValueAtTime(amps[i], now + 0.015);
          oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8 - (i * 0.4));

          osc.connect(oscGain);
          oscGain.connect(gainNode);

          osc.start(now);
          osc.stop(now + 3.0);
        });
        break;
      }

      case 'chime': {
        // Joyful 3-tone arpeggio (C6, E6, G6)
        const notes = [1046.5, 1318.5, 1567.98]; // C6, E6, G6
        notes.forEach((freq, idx) => {
          const startTime = now + idx * 0.12;
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);

          noteGain.gain.setValueAtTime(0, startTime);
          noteGain.gain.linearRampToValueAtTime(0.4, startTime + 0.02);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

          osc.connect(noteGain);
          noteGain.connect(gainNode);

          osc.start(startTime);
          osc.stop(startTime + 1.3);
        });
        break;
      }

      case 'gong': {
        // Deep resonant gong with low fundamental and sub-harmonics
        const baseFreq = 160;
        const freqs = [baseFreq, baseFreq * 1.48, baseFreq * 2.1, baseFreq * 2.9];
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = i % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          oscGain.gain.setValueAtTime(0, now);
          oscGain.gain.linearRampToValueAtTime(0.5 / (i + 1), now + 0.04);
          oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

          osc.connect(oscGain);
          oscGain.connect(gainNode);

          osc.start(now);
          osc.stop(now + 3.6);
        });
        break;
      }

      case 'marimba': {
        // Warm wooden percussive marimba sequence
        const chords = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        chords.forEach((freq, idx) => {
          const startTime = now + idx * 0.08;
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);

          // Wood resonance overtone
          const osc2 = ctx.createOscillator();
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(freq * 3.8, startTime);
          const osc2Gain = ctx.createGain();

          oscGain.gain.setValueAtTime(0.7, startTime);
          oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

          osc2Gain.gain.setValueAtTime(0.2, startTime);
          osc2Gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);

          osc.connect(oscGain);
          osc2.connect(osc2Gain);
          oscGain.connect(gainNode);
          osc2Gain.connect(gainNode);

          osc.start(startTime);
          osc.stop(startTime + 0.7);
          osc2.start(startTime);
          osc2.stop(startTime + 0.2);
        });
        break;
      }
    }
  } catch (err) {
    console.warn('Audio playback not permitted or supported yet:', err);
  }
}
