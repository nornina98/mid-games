// Jenis-jenis data utama untuk game engine

export type PlacementGrade = "perfect" | "great" | "good" | "risky" | "miss";

export type BrickTypeId =
  | "standard"
  | "cement"
  | "lightweight"
  | "interlocking"
  | "cracked"
  | "golden";

export type DisturbanceId =
  | "wind-light"
  | "wind-medium"
  | "wind-strong"
  | "rain"
  | "cracked-bricks"
  | "crane-swing"
  | "speed"
  | "tilted-base"
  | "base-movement"
  | "random-size"
  | "timer";

export type PowerUpId = "laser" | "slowmo" | "cement" | "brace";

export type GameMode = "classic" | "stage" | "daily";

export interface ObjectiveDef {
  type:
    | "bricks"
    | "height"
    | "score"
    | "perfect"
    | "greatOrPerfect"
    | "stabilityEnd"
    | "combo"
    | "bricksInTime"
    | "quality"
    | "surviveWeather"
    | "noPowerUp";
  value: number;
  timeLimit?: number; // saat, untuk bricksInTime
  bricks?: number; // sasaran bata tambahan (cth. stabilityEnd)
  combo?: number; // syarat combo tambahan
  perfect?: number; // syarat perfect tambahan
  stabilityMin?: number; // syarat stability tambahan
  label: string;
}

export interface BonusObjectiveDef {
  type:
    | "perfectCount"
    | "qualityMin"
    | "riskyMax"
    | "combo"
    | "stabilityMin"
    | "noMiss"
    | "missMax"
    | "crackedUsed"
    | "timeLeft"
    | "noBrace"
    | "noPowerUp";
  value: number;
  label: string;
}

export interface StageDef {
  id: number;
  title: string;
  phase: string; // fasa pembinaan
  objective: ObjectiveDef;
  bonus: BonusObjectiveDef;
  disturbances: DisturbanceId[];
  baseSpeed: number; // px/s asas
  targetScore: number; // untuk 2 bintang
  minQuality: number; // % minima untuk lulus (0 = tiada)
  rewardCoins: number;
  rewardXp: number;
  timeLimit?: number; // saat
  ctaAfter?: string; // mesej CTA ringan selepas stage
  envTint?: string;
}

export interface RunStats {
  mode: GameMode;
  stageId?: number;
  difficultyId?: string; // mod Cabaran: terrace | semiD | bungalow | premiumBungalow
  score: number;
  bricks: number;
  height: number; // meter
  perfect: number;
  great: number;
  good: number;
  risky: number;
  miss: number;
  longestCombo: number;
  quality: number;
  stability: number;
  coinsEarned: number;
  crackedUsed: number;
  powerUpsUsed: number;
  braceUsed: boolean;
  timeUsed: number; // saat
  collapsed: boolean;
  won: boolean;
  bonusDone: boolean;
  goldenBricks: number;
}

export interface EngineEvent {
  type:
    | "placement"
    | "combo"
    | "collapse-warning"
    | "collapsed"
    | "gameover"
    | "stage-complete"
    | "golden-brick"
    | "supervisor"
    | "hud";
  grade?: PlacementGrade;
  message?: string;
  stats?: RunStats;
}

export interface HudState {
  score: number;
  height: number;
  combo: number;
  quality: number;
  stability: number;
  bricks: number;
  lives: number;
  timeLeft: number | null;
  windLevel: number; // 0-3, arah dalam windDir
  windDir: 1 | -1;
  objectiveText: string;
  objectiveProgress: number; // 0-1
  activePowerUps: PowerUpId[];
  running: boolean;
}
