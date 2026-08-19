// ============================================================
// SISTEM CABARAN (DIFFICULTY) — 4 level bertemakan jenis rumah
// Semua parameter difficulty diselaraskan di sini sahaja.
// ============================================================

export type DifficultyId = "terrace" | "semiD" | "bungalow" | "premiumBungalow";

export interface DifficultyDef {
  id: DifficultyId;
  name: string;
  subLabel: string; // label kecil pada kad
  desc: string;
  targetFloors: number;
  speedMultiplier: number;
  brickWidthMultiplier: number;
  swayMultiplier: number;
  perfectToleranceMultiplier: number;
  windStrength: number; // 0 hingga 0.6
  scoreMultiplier: number;
  accent: string; // warna accent kad
  dots: number; // difficulty indicator 1-4
  recommend: string;
  next: DifficultyId | null; // untuk butang "Naik Taraf Cabaran"
}

export const difficultyConfig: Record<DifficultyId, DifficultyDef> = {
  terrace: {
    id: "terrace",
    name: "Rumah Teres",
    subLabel: "Cabaran Santai",
    desc: "Bata lebih besar, pergerakan lebih perlahan dan menara lebih stabil.",
    targetFloors: 10,
    speedMultiplier: 0.75,
    brickWidthMultiplier: 1.15,
    swayMultiplier: 0.4,
    perfectToleranceMultiplier: 1.5,
    windStrength: 0,
    scoreMultiplier: 1,
    accent: "#2e9e4f",
    dots: 1,
    recommend: "Disyorkan untuk pemain baru",
    next: "semiD",
  },
  semiD: {
    id: "semiD",
    name: "Semi-D",
    subLabel: "Cabaran Seimbang",
    desc: "Kelajuan sederhana dan memerlukan timing yang lebih tepat.",
    targetFloors: 20,
    speedMultiplier: 1,
    brickWidthMultiplier: 1,
    swayMultiplier: 0.75,
    perfectToleranceMultiplier: 1,
    windStrength: 0.15,
    scoreMultiplier: 1.25,
    accent: "#2f7fd6",
    dots: 2,
    recommend: "Cabaran standard",
    next: "bungalow",
  },
  bungalow: {
    id: "bungalow",
    name: "Banglo",
    subLabel: "Cabaran Sukar",
    desc: "Bata bergerak lebih pantas dan menara lebih mudah bergoyang.",
    targetFloors: 35,
    speedMultiplier: 1.3,
    brickWidthMultiplier: 0.9,
    swayMultiplier: 1.15,
    perfectToleranceMultiplier: 0.7,
    windStrength: 0.35,
    scoreMultiplier: 1.5,
    accent: "#e07b1f",
    dots: 3,
    recommend: "Untuk pemain berpengalaman",
    next: "premiumBungalow",
  },
  premiumBungalow: {
    id: "premiumBungalow",
    name: "Banglo Premium",
    subLabel: "Cabaran Profesional",
    desc: "Kelajuan tinggi, bata lebih kecil dan margin kesilapan sangat rendah.",
    targetFloors: 50,
    speedMultiplier: 1.6,
    brickWidthMultiplier: 0.8,
    swayMultiplier: 1.5,
    perfectToleranceMultiplier: 0.45,
    windStrength: 0.6,
    scoreMultiplier: 2,
    accent: "#b0121a",
    dots: 4,
    recommend: "Cabaran tertinggi",
    next: null,
  },
};

export const difficultyOrder: DifficultyId[] = ["terrace", "semiD", "bungalow", "premiumBungalow"];

export function getDifficulty(id: string | undefined | null): DifficultyDef {
  return difficultyConfig[(id as DifficultyId) ?? "semiD"] ?? difficultyConfig.semiD;
}
