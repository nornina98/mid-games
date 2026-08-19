import type { BrickTypeId } from "../game/types";

export interface BrickTypeDef {
  id: BrickTypeId;
  name: string;
  color: string;
  edge: string;
  widthMul: number; // pendarab lebar
  heightMul: number; // pendarab tinggi
  fallSpeedMul: number;
  windMul: number; // sensitiviti angin
  stabilityBonus: number; // + / - stability per placement
  scoreMul: number;
  desc: string;
}

export const brickTypes: Record<BrickTypeId, BrickTypeDef> = {
  standard: {
    id: "standard",
    name: "Standard Red Brick",
    color: "#b34a2e",
    edge: "#7d301c",
    widthMul: 1,
    heightMul: 1,
    fallSpeedMul: 1,
    windMul: 1,
    stabilityBonus: 0,
    scoreMul: 1,
    desc: "Seimbang dan mudah digunakan.",
  },
  cement: {
    id: "cement",
    name: "Cement Block",
    color: "#8d8d88",
    edge: "#5c5c58",
    widthMul: 1.25,
    heightMul: 1.15,
    fallSpeedMul: 1.35,
    windMul: 0.5,
    stabilityBonus: 3,
    scoreMul: 1,
    desc: "Lebih besar dan berat, stability tinggi.",
  },
  lightweight: {
    id: "lightweight",
    name: "Lightweight Block",
    color: "#d8cfc0",
    edge: "#a89e8d",
    widthMul: 0.95,
    heightMul: 1,
    fallSpeedMul: 0.85,
    windMul: 1.8,
    stabilityBonus: -1,
    scoreMul: 1.1,
    desc: "Ringan tetapi mudah dipengaruhi angin.",
  },
  interlocking: {
    id: "interlocking",
    name: "Interlocking Block",
    color: "#a8724a",
    edge: "#6f4a2e",
    widthMul: 1,
    heightMul: 1,
    fallSpeedMul: 1,
    windMul: 0.8,
    stabilityBonus: 4,
    scoreMul: 1.1,
    desc: "Mudah align, stability bonus. Rare.",
  },
  cracked: {
    id: "cracked",
    name: "Cracked Brick",
    color: "#9c5540",
    edge: "#5f3123",
    widthMul: 1,
    heightMul: 1,
    fallSpeedMul: 1,
    windMul: 1.1,
    stabilityBonus: -4,
    scoreMul: 1.3,
    desc: "Kurang stabil, bonus score jika berjaya.",
  },
  golden: {
    id: "golden",
    name: "Golden Brick",
    color: "#d2a84a",
    edge: "#9a7524",
    widthMul: 1,
    heightMul: 1,
    fallSpeedMul: 1,
    windMul: 0.8,
    stabilityBonus: 5,
    scoreMul: 2,
    desc: "Ganjaran combo tinggi. Bonus besar!",
  },
};
