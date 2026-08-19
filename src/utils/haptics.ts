// Haptic feedback melalui Vibration API (jika disokong)
let enabled = true;

export function setHapticsEnabled(v: boolean) {
  enabled = v;
}

function vibrate(pattern: number | number[]) {
  if (!enabled) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* tidak disokong */
  }
}

export const haptics = {
  perfect: () => vibrate(30),
  great: () => vibrate(12),
  miss: () => vibrate([40, 60, 40]),
  collapse: () => vibrate([80, 60, 120]),
  stageComplete: () => vibrate([30, 40, 30, 40, 80]),
};
