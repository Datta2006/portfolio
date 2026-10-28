/* ------------------------------------------------------------
   Optional synthesized strike audio.

   No audio asset is shipped. The hiss is generated with WebAudio
   only after the visitor explicitly enables sound, and only after
   a user gesture has unlocked the audio context. Volume stays low.
   ------------------------------------------------------------ */

let context: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;

type AudioContextCtor = typeof AudioContext;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor: AudioContextCtor | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
  if (!Ctor) return null;

  if (!context) {
    context = new Ctor();
  }
  if (context.state === "suspended") {
    void context.resume().catch(() => undefined);
  }
  return context;
}

function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer;
  const duration = 1.35;
  const length = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  noiseBuffer = buffer;
  return buffer;
}

/** Unlock the audio context from a user gesture. */
export function primeAudio(): void {
  getAudioContext();
}

/** A short, restrained hiss + throat growl. Safe to call repeatedly. */
export function playHiss(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  const source = ctx.createBufferSource();
  source.buffer = getNoiseBuffer(ctx);

  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.setValueAtTime(2600, now);
  band.frequency.exponentialRampToValueAtTime(5200, now + 0.42);
  band.Q.value = 0.9;

  const high = ctx.createBiquadFilter();
  high.type = "highpass";
  high.frequency.value = 900;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.11, now + 0.06);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

  source.connect(band);
  band.connect(high);
  high.connect(gain);
  gain.connect(ctx.destination);
  source.start(now);
  source.stop(now + 1.1);

  const growl = ctx.createOscillator();
  growl.type = "sawtooth";
  growl.frequency.setValueAtTime(62, now);
  growl.frequency.exponentialRampToValueAtTime(44, now + 0.6);

  const growlFilter = ctx.createBiquadFilter();
  growlFilter.type = "lowpass";
  growlFilter.frequency.value = 190;

  const growlGain = ctx.createGain();
  growlGain.gain.setValueAtTime(0.0001, now);
  growlGain.gain.exponentialRampToValueAtTime(0.045, now + 0.05);
  growlGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

  growl.connect(growlFilter);
  growlFilter.connect(growlGain);
  growlGain.connect(ctx.destination);
  growl.start(now);
  growl.stop(now + 0.8);
}
