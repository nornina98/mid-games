// Sound design menggunakan Web Audio API — tiada fail audio luaran diperlukan.
// Semua bunyi dijana secara procedural (oscillator + noise) supaya saiz kecil.

let ctx: AudioContext | null = null;
let sfxOn = true;
let musicOn = true;
let musicTimer: number | null = null;
let musicGain: GainNode | null = null;

export function setAudioPrefs(prefs: { sfx: boolean; music: boolean }) {
  sfxOn = prefs.sfx;
  musicOn = prefs.music;
  if (!musicOn) stopMusic();
}

function ensureCtx(): AudioContext | null {
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

// Panggil selepas first user interaction sahaja (dasar autoplay browser)
export function unlockAudio() {
  ensureCtx();
}

function tone(freq: number, dur: number, type: OscillatorType = "sine", vol = 0.15, delay = 0, slide = 0) {
  if (!sfxOn) return;
  const c = ensureCtx();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slide) osc.frequency.linearRampToValueAtTime(freq + slide, t0 + dur);
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noise(dur: number, vol = 0.12, delay = 0) {
  if (!sfxOn) return;
  const c = ensureCtx();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = c.createBufferSource();
  src.buffer = buf;
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  src.connect(g).connect(c.destination);
  src.start(t0);
}

export const sfx = {
  tap: () => tone(600, 0.06, "square", 0.05),
  drop: () => {
    tone(180, 0.1, "square", 0.1);
    noise(0.08, 0.1);
  },
  perfect: () => {
    tone(660, 0.1, "sine", 0.14);
    tone(880, 0.12, "sine", 0.14, 0.08);
    tone(1320, 0.16, "sine", 0.12, 0.16);
  },
  great: () => {
    tone(520, 0.1, "sine", 0.12);
    tone(780, 0.12, "sine", 0.1, 0.08);
  },
  good: () => tone(440, 0.1, "sine", 0.1),
  cut: () => {
    noise(0.12, 0.14);
    tone(300, 0.08, "sawtooth", 0.06);
  },
  fall: () => tone(400, 0.35, "sawtooth", 0.1, 0, -300),
  shake: () => noise(0.2, 0.08),
  collapse: () => {
    noise(0.5, 0.2);
    tone(200, 0.5, "sawtooth", 0.12, 0, -150);
    noise(0.4, 0.15, 0.2);
  },
  coin: () => {
    tone(988, 0.08, "square", 0.08);
    tone(1319, 0.14, "square", 0.08, 0.07);
  },
  badge: () => {
    tone(523, 0.12, "sine", 0.12);
    tone(659, 0.12, "sine", 0.12, 0.1);
    tone(784, 0.12, "sine", 0.12, 0.2);
    tone(1047, 0.24, "sine", 0.14, 0.3);
  },
  approved: () => {
    tone(523, 0.15, "triangle", 0.14);
    tone(784, 0.25, "triangle", 0.14, 0.12);
  },
  stageComplete: () => {
    [523, 587, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, "triangle", 0.13, i * 0.11));
  },
  button: () => tone(500, 0.05, "sine", 0.06),
  golden: () => {
    tone(880, 0.1, "sine", 0.12);
    tone(1109, 0.1, "sine", 0.12, 0.08);
    tone(1319, 0.2, "sine", 0.14, 0.16);
  },
  warning: () => {
    tone(330, 0.15, "square", 0.1);
    tone(330, 0.15, "square", 0.1, 0.2);
  },
};

// Muzik latar ringkas: arpeggio construction-inspired yang loop
const MELODY = [262, 330, 392, 523, 392, 330, 294, 392, 440, 587, 440, 392];

export function startMusic() {
  if (!musicOn || musicTimer !== null) return;
  const c = ensureCtx();
  if (!c) return;
  musicGain = c.createGain();
  musicGain.gain.value = 0.045;
  musicGain.connect(c.destination);
  let step = 0;
  const playStep = () => {
    if (!musicOn || !c || !musicGain) return;
    const f = MELODY[step % MELODY.length];
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = "triangle";
    osc.frequency.value = f;
    g.gain.setValueAtTime(0.9, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.34);
    osc.connect(g).connect(musicGain);
    osc.start();
    osc.stop(c.currentTime + 0.36);
    // bass setiap 4 langkah
    if (step % 4 === 0) {
      const b = c.createOscillator();
      const bg = c.createGain();
      b.type = "sine";
      b.frequency.value = f / 2;
      bg.gain.setValueAtTime(0.7, c.currentTime);
      bg.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.5);
      b.connect(bg).connect(musicGain);
      b.start();
      b.stop(c.currentTime + 0.52);
    }
    step++;
  };
  musicTimer = window.setInterval(playStep, 380);
}

export function stopMusic() {
  if (musicTimer !== null) {
    clearInterval(musicTimer);
    musicTimer = null;
  }
  musicGain?.disconnect();
  musicGain = null;
}
