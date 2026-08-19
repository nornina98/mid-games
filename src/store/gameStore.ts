import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PowerUpId, RunStats } from "../game/types";
import { badges } from "../data/badges";
import { stages } from "../data/stages";
import { challengeForDate, todayKey } from "../data/challenges";
import { levelForXp } from "../data/cosmetics";
import { difficultyConfig, difficultyOrder, type DifficultyId } from "../data/difficulty";

// ---------- rekod pemain & leaderboard per level ----------
export interface LevelRecord {
  bestScore: number;
  highestFloor: number;
  completed: boolean;
  perfectLandings: number;
  bestAccuracy: number;
  fastestTime: number | null;
  lastDate: string;
}

export interface PlayerData {
  displayName: string;
  avatar: string;
  levels: Partial<Record<DifficultyId, LevelRecord>>;
}

export interface ChallengeEntry {
  name: string;
  score: number;
  floor: number;
  perfect: number;
  accuracy: number;
  date: string;
  completed: boolean;
  time: number | null;
}

// Ranking: completed dahulu (score > accuracy > masa), kemudian incomplete (tingkat > score)
export function rankChallenge(a: ChallengeEntry, b: ChallengeEntry): number {
  if (a.completed !== b.completed) return a.completed ? -1 : 1;
  if (a.completed) {
    if (b.score !== a.score) return b.score - a.score;
    if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
    return (a.time ?? Infinity) - (b.time ?? Infinity);
  }
  if (b.floor !== a.floor) return b.floor - a.floor;
  return b.score - a.score;
}

function seedChallengeBoards(): Record<DifficultyId, ChallengeEntry[]> {
  const mk = (
    name: string,
    score: number,
    floor: number,
    perfect: number,
    accuracy: number,
    completed: boolean,
    time: number | null,
  ): ChallengeEntry => ({ name, score, floor, perfect, accuracy, date: "2026-07-01", completed, time });
  return {
    terrace: [
      mk("Aina", 1850, 10, 5, 88, true, 55),
      mk("Amir", 1620, 10, 3, 81, true, 61),
      mk("Danish", 1100, 8, 2, 72, false, null),
    ],
    semiD: [
      mk("Hakim", 4350, 20, 8, 85, true, 118),
      mk("Sarah", 3980, 20, 6, 79, true, 126),
      mk("Amir", 2650, 15, 4, 74, false, null),
    ],
    bungalow: [
      mk("Sarah", 8850, 35, 12, 84, true, 214),
      mk("Hakim", 6420, 28, 8, 76, false, null),
      mk("Aina", 5100, 24, 6, 71, false, null),
    ],
    premiumBungalow: [
      mk("Danish", 14200, 50, 15, 82, true, 322),
      mk("Sarah", 9800, 38, 9, 74, false, null),
      mk("Hakim", 7300, 31, 7, 70, false, null),
    ],
  };
}

export function playerKey(name: string): string {
  return name.trim().toLowerCase(); // pengenalan pemain tidak case-sensitive
}

export type Screen =
  | "splash"
  | "setup"
  | "menu"
  | "stageSelect"
  | "game"
  | "result"
  | "project"
  | "badges"
  | "leaderboard"
  | "daily"
  | "settings"
  | "about"
  | "certificate"
  | "shop"
  | "howto";

export interface LeaderboardEntry {
  name: string;
  value: number;
  isPlayer?: boolean;
}

export interface SettingsState {
  music: boolean;
  sfx: boolean;
  vibration: boolean;
  reducedMotion: boolean;
}

interface StageResult {
  stars: number;
  bestScore: number;
}

export interface GameState {
  version: number;
  // player
  playerName: string;
  avatar: string;
  coins: number;
  xp: number;
  // sistem multi-pemain & cabaran
  players: Record<string, PlayerData>;
  activePlayer: string; // key lowercase
  selectedDifficulty: DifficultyId;
  challengeBoards: Record<DifficultyId, ChallengeEntry[]>;
  // progress
  stageResults: Record<number, StageResult>;
  unlockedStage: number;
  classicHighScore: number;
  highestTower: number;
  longestCombo: number;
  highestQuality: number;
  mostPerfect: number;
  totalBricks: number;
  totalPerfect: number;
  earnedBadges: string[];
  unlockedCosmetics: string[];
  equipped: { helmet: string; brickSkin: string; background: string; facade: string };
  powerUpInventory: Record<PowerUpId, number>;
  tutorialDone: boolean;
  certificateUnlocked: boolean;
  dailyDate: string;
  dailyDone: boolean;
  settings: SettingsState;
  leaderboards: Record<string, LeaderboardEntry[]>;
  // runtime (tidak disimpan berat)
  screen: Screen;
  pendingMode: "classic" | "stage" | "daily";
  pendingStageId: number;
  selectedPowerUps: PowerUpId[];
  lastRun: RunStats | null;
  lastNewBadges: string[];
  lastLeveledUp: boolean;
  // actions
  setScreen: (s: Screen) => void;
  setupPlayer: (name: string, avatar: string) => void;
  switchPlayer: (name: string) => boolean; // tukar/daftar pemain tanpa padam rekod lama
  setDifficulty: (id: DifficultyId) => void;
  resetPlayerData: () => void; // padam data pemain semasa sahaja
  startGame: (mode: "classic" | "stage" | "daily", stageId?: number, powerUps?: PowerUpId[]) => void;
  finishRun: (stats: RunStats) => void;
  buyPowerUp: (id: PowerUpId, cost: number) => boolean;
  consumePowerUp: (id: PowerUpId) => void;
  buyCosmetic: (id: string, cost: number) => boolean;
  equipCosmetic: (category: keyof GameState["equipped"], id: string) => void;
  updateSettings: (s: Partial<SettingsState>) => void;
  resetProgress: () => void;
  refreshDaily: () => void;
}

const FAKE_PLAYERS = ["Amir", "Aina", "Hakim", "Sarah", "Danish"];

function seedBoard(base: number, spread: number): LeaderboardEntry[] {
  return FAKE_PLAYERS.map((name, i) => ({
    name,
    value: Math.round(base + spread * (FAKE_PLAYERS.length - i) * (0.8 + 0.07 * i)),
  })).sort((a, b) => b.value - a.value);
}

const initialLeaderboards = (): Record<string, LeaderboardEntry[]> => ({
  score: seedBoard(800, 450),
  tower: seedBoard(3, 1.4).map((e) => ({ ...e, value: Math.round(e.value * 10) / 10 })),
  perfect: seedBoard(2, 1.5).map((e) => ({ ...e, value: Math.round(e.value) })),
  combo: seedBoard(2, 1).map((e) => ({ ...e, value: Math.round(e.value) })),
  quality: seedBoard(55, 8).map((e) => ({ ...e, value: Math.min(97, Math.round(e.value)) })),
});

const initialPersisted = {
  version: 2,
  playerName: "",
  avatar: "tukang",
  players: {} as Record<string, PlayerData>,
  activePlayer: "",
  selectedDifficulty: "semiD" as DifficultyId,
  challengeBoards: seedChallengeBoards(),
  coins: 150,
  xp: 0,
  stageResults: {} as Record<number, StageResult>,
  unlockedStage: 1,
  classicHighScore: 0,
  highestTower: 0,
  longestCombo: 0,
  highestQuality: 0,
  mostPerfect: 0,
  totalBricks: 0,
  totalPerfect: 0,
  earnedBadges: [] as string[],
  unlockedCosmetics: ["helmet-white", "brick-standard", "bg-pagi", "facade-modern"],
  equipped: { helmet: "helmet-white", brickSkin: "brick-standard", background: "bg-pagi", facade: "facade-modern" },
  powerUpInventory: { laser: 1, slowmo: 1, cement: 0, brace: 0 } as Record<PowerUpId, number>,
  tutorialDone: false,
  certificateUnlocked: false,
  dailyDate: "",
  dailyDone: false,
  settings: { music: true, sfx: true, vibration: true, reducedMotion: false },
  leaderboards: initialLeaderboards(),
};

function updateBoard(
  boards: Record<string, LeaderboardEntry[]>,
  key: string,
  playerName: string,
  value: number,
): { boards: Record<string, LeaderboardEntry[]>; newRank: boolean } {
  const board = (boards[key] ?? []).filter((e) => !e.isPlayer);
  const existing = boards[key]?.find((e) => e.isPlayer);
  const best = Math.max(value, existing?.value ?? 0);
  const merged = [...board, { name: playerName || "Anda", value: best, isPlayer: true }]
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
  const newRank = value > 0 && merged.some((e) => e.isPlayer) && best === value && (!existing || value > existing.value);
  return { boards: { ...boards, [key]: merged }, newRank };
}

export function checkBadges(state: GameState, run: RunStats): string[] {
  const earned = new Set(state.earnedBadges);
  const out: string[] = [];
  const grant = (id: string) => {
    if (!earned.has(id)) {
      earned.add(id);
      out.push(id);
    }
  };
  if (run.perfect > 0) grant("perfect-start");
  if (run.longestCombo >= 5) grant("mahligai-precision");
  if (state.totalPerfect + run.perfect >= 10) grant("master-bricklayer");
  if (run.height >= 10) grant("tower-master");
  if (run.mode === "stage" && run.won && run.miss === 0) grant("zero-waste");
  if (run.mode === "stage" && run.won && run.stageId === 13) grant("weather-survivor");
  if (run.mode === "stage" && run.won && run.quality > 90) grant("mahligai-quality");
  if (run.mode === "stage" && run.won && run.stability > 90) grant("stability-king");
  if (run.mode === "stage" && run.won && run.stageId === 9) grant("speed-builder");
  if (run.mode === "stage" && run.won && run.powerUpsUsed === 0) grant("supervisor-approved");
  if (state.totalBricks + run.bricks >= 100) grant("high-rise-mason");
  return out;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialPersisted,
      screen: "splash" as Screen,
      pendingMode: "classic" as const,
      pendingStageId: 1,
      selectedPowerUps: [],
      lastRun: null,
      lastNewBadges: [],
      lastLeveledUp: false,

      setScreen: (s) => set({ screen: s }),

      setupPlayer: (name, avatar) => {
        const clean = name.trim().replace(/[<>]/g, ""); // escape input asas
        const key = playerKey(clean);
        const s = get();
        const existing = s.players[key];
        set({
          playerName: existing?.displayName ?? clean,
          avatar,
          activePlayer: key,
          players: {
            ...s.players,
            [key]: existing ?? { displayName: clean, avatar, levels: {} },
          },
          screen: "menu",
        });
      },

      switchPlayer: (name) => {
        const clean = name.trim().replace(/[<>]/g, "");
        if (clean.length < 2 || clean.length > 16) return false;
        const key = playerKey(clean);
        const s = get();
        const existing = s.players[key];
        set({
          playerName: existing?.displayName ?? clean,
          activePlayer: key,
          avatar: existing?.avatar ?? s.avatar,
          players: {
            ...s.players,
            [key]: existing ?? { displayName: clean, avatar: s.avatar, levels: {} },
          },
        });
        return true;
      },

      setDifficulty: (id) => set({ selectedDifficulty: id }),

      resetPlayerData: () => {
        const s = get();
        const key = s.activePlayer || playerKey(s.playerName);
        const players = { ...s.players };
        delete players[key];
        // buang baris pemain ini daripada semua leaderboard level
        const boards = { ...s.challengeBoards };
        for (const d of difficultyOrder) {
          boards[d] = (boards[d] ?? []).filter((e) => playerKey(e.name) !== key);
        }
        set({
          players,
          challengeBoards: boards,
          activePlayer: "",
          playerName: "",
          classicHighScore: 0,
          screen: "setup",
        });
      },

      startGame: (mode, stageId = 1, powerUpsSel = []) =>
        set({ pendingMode: mode, pendingStageId: stageId, selectedPowerUps: powerUpsSel, screen: "game" }),

      finishRun: (run) => {
        const s = get();
        const prevLevel = levelForXp(s.xp).level;
        const newBadges = checkBadges(s, run);
        const badgeCoins = newBadges.length * 30;
        const badgeXp = newBadges.length * 50;

        let stageResults = s.stageResults;
        let unlockedStage = s.unlockedStage;
        let coins = s.coins + run.coinsEarned + badgeCoins;
        let xp = s.xp + badgeXp;
        let certificateUnlocked = s.certificateUnlocked;
        let earned = [...s.earnedBadges, ...newBadges];

        if (run.mode === "stage" && run.stageId) {
          const stage = stages.find((st) => st.id === run.stageId)!;
          if (run.won) {
            let stars = 1;
            if (run.score >= stage.targetScore) stars = 2;
            if (run.score >= stage.targetScore && run.bonusDone) stars = 3;
            const prev = stageResults[run.stageId];
            stageResults = {
              ...stageResults,
              [run.stageId]: {
                stars: Math.max(prev?.stars ?? 0, stars),
                bestScore: Math.max(prev?.bestScore ?? 0, run.score),
              },
            };
            unlockedStage = Math.max(unlockedStage, Math.min(15, run.stageId + 1));
            coins += stage.rewardCoins;
            xp += stage.rewardXp + Math.round(run.score / 50);
            const allDone = stages.every((st) => (stageResults[st.id]?.stars ?? 0) >= 1);
            if (allDone && !earned.includes("banglo-champion")) {
              earned = [...earned, "banglo-champion"];
              newBadges.push("banglo-champion");
              certificateUnlocked = true;
            }
            const allThree = stages.every((st) => (stageResults[st.id]?.stars ?? 0) >= 3);
            if (allThree && !earned.includes("mahligai-champion")) {
              earned = [...earned, "mahligai-champion"];
              newBadges.push("mahligai-champion");
            }
          } else {
            xp += Math.round(run.score / 100);
          }
        } else {
          xp += Math.round(run.score / 40);
        }

        // daily challenge check
        let dailyDone = s.dailyDone;
        let dailyDate = s.dailyDate;
        const tk = todayKey();
        if (dailyDate !== tk) {
          dailyDate = tk;
          dailyDone = false;
        }
        if (!dailyDone) {
          const ch = challengeForDate(tk);
          const c = ch.check;
          const ok =
            (c.type === "score" && run.score >= c.value) ||
            (c.type === "perfect" && run.perfect >= c.value) ||
            (c.type === "height" && run.height >= c.value) ||
            (c.type === "noPowerUp" && run.powerUpsUsed === 0 && run.bricks >= 10) ||
            (c.type === "quality" && run.quality >= c.value) ||
            (c.type === "combo" && run.longestCombo >= c.value);
          if (ok) {
            dailyDone = true;
            coins += ch.rewardCoins;
            xp += ch.rewardXp;
          }
        }

        // rekod mod Cabaran — per pemain & per level, leaderboard berasingan
        let players = s.players;
        let challengeBoards = s.challengeBoards;
        if (run.difficultyId && run.mode !== "stage") {
          const did = run.difficultyId as DifficultyId;
          const key = s.activePlayer || playerKey(s.playerName);
          const acc = run.bricks > 0 ? Math.round(((run.perfect + run.great) / run.bricks) * 100) : 0;
          const today = todayKey();
          const p = players[key] ?? { displayName: s.playerName || "Pemain", avatar: s.avatar, levels: {} };
          const prev = p.levels[did];
          const rec: LevelRecord = {
            bestScore: Math.max(prev?.bestScore ?? 0, run.score),
            highestFloor: Math.max(prev?.highestFloor ?? 0, run.bricks),
            completed: (prev?.completed ?? false) || run.won,
            perfectLandings: Math.max(prev?.perfectLandings ?? 0, run.perfect),
            bestAccuracy: Math.max(prev?.bestAccuracy ?? 0, acc),
            fastestTime: run.won
              ? Math.min(prev?.fastestTime ?? Number.POSITIVE_INFINITY, run.timeUsed)
              : (prev?.fastestTime ?? null),
            lastDate: today,
          };
          if (rec.fastestTime === Number.POSITIVE_INFINITY) rec.fastestTime = null;
          players = { ...players, [key]: { ...p, levels: { ...p.levels, [did]: rec } } };
          const entry: ChallengeEntry = {
            name: p.displayName,
            score: rec.bestScore,
            floor: rec.highestFloor,
            perfect: rec.perfectLandings,
            accuracy: rec.bestAccuracy,
            date: today,
            completed: rec.completed,
            time: rec.fastestTime,
          };
          const others = (challengeBoards[did] ?? []).filter((e) => playerKey(e.name) !== key);
          challengeBoards = { ...challengeBoards, [did]: [...others, entry].sort(rankChallenge).slice(0, 10) };
        }

        // leaderboards
        let boards = s.leaderboards;
        if (run.mode === "classic") {
          boards = updateBoard(boards, "score", s.playerName, run.score).boards;
        }
        boards = updateBoard(boards, "tower", s.playerName, Math.round(run.height * 10) / 10).boards;
        boards = updateBoard(boards, "perfect", s.playerName, run.perfect).boards;
        boards = updateBoard(boards, "combo", s.playerName, run.longestCombo).boards;
        boards = updateBoard(boards, "quality", s.playerName, Math.round(run.quality)).boards;

        set({
          lastRun: run,
          lastNewBadges: newBadges,
          lastLeveledUp: levelForXp(xp).level > prevLevel,
          players,
          challengeBoards,
          stageResults,
          unlockedStage,
          coins,
          xp,
          certificateUnlocked,
          earnedBadges: earned,
          dailyDate,
          dailyDone,
          leaderboards: boards,
          classicHighScore: run.mode === "classic" ? Math.max(s.classicHighScore, run.score) : s.classicHighScore,
          highestTower: Math.max(s.highestTower, run.height),
          longestCombo: Math.max(s.longestCombo, run.longestCombo),
          highestQuality: Math.max(s.highestQuality, run.quality),
          mostPerfect: Math.max(s.mostPerfect, run.perfect),
          totalBricks: s.totalBricks + run.bricks,
          totalPerfect: s.totalPerfect + run.perfect,
          tutorialDone: true,
          screen: "result",
        });
      },

      buyPowerUp: (id, cost) => {
        const s = get();
        if (s.coins < cost) return false;
        set({
          coins: s.coins - cost,
          powerUpInventory: { ...s.powerUpInventory, [id]: (s.powerUpInventory[id] ?? 0) + 1 },
        });
        return true;
      },

      consumePowerUp: (id) => {
        const s = get();
        if ((s.powerUpInventory[id] ?? 0) <= 0) return;
        set({ powerUpInventory: { ...s.powerUpInventory, [id]: s.powerUpInventory[id] - 1 } });
      },

      buyCosmetic: (id, cost) => {
        const s = get();
        if (s.coins < cost || s.unlockedCosmetics.includes(id)) return false;
        set({ coins: s.coins - cost, unlockedCosmetics: [...s.unlockedCosmetics, id] });
        return true;
      },

      equipCosmetic: (category, id) => {
        const s = get();
        if (!s.unlockedCosmetics.includes(id)) return;
        set({ equipped: { ...s.equipped, [category]: id } });
      },

      updateSettings: (partial) => set({ settings: { ...get().settings, ...partial } }),

      resetProgress: () =>
        set({ ...initialPersisted, leaderboards: initialLeaderboards(), screen: "setup" }),

      refreshDaily: () => {
        const s = get();
        const tk = todayKey();
        if (s.dailyDate !== tk) set({ dailyDate: tk, dailyDone: false });
      },
    }),
    {
      name: "mahligai-brick-stack-v1",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      // Migration v1 -> v2: bina rekod pemain daripada playerName lama (data lama tidak rosak)
      migrate: (persisted: unknown) => {
        const p = (persisted ?? {}) as Record<string, unknown> & Partial<GameState>;
        if (!p.players || typeof p.players !== "object") {
          const players: Record<string, PlayerData> = {};
          let activePlayer = "";
          if (typeof p.playerName === "string" && p.playerName.trim()) {
            const key = playerKey(p.playerName);
            players[key] = {
              displayName: p.playerName,
              avatar: (p.avatar as string) ?? "tukang",
              levels: {},
            };
            activePlayer = key;
          }
          p.players = players;
          p.activePlayer = activePlayer;
        }
        if (!p.selectedDifficulty) p.selectedDifficulty = "semiD";
        if (!p.challengeBoards) p.challengeBoards = seedChallengeBoards();
        p.version = 2;
        return p as GameState;
      },
      partialize: (s) => ({
        version: s.version,
        playerName: s.playerName,
        avatar: s.avatar,
        players: s.players,
        activePlayer: s.activePlayer,
        selectedDifficulty: s.selectedDifficulty,
        challengeBoards: s.challengeBoards,
        coins: s.coins,
        xp: s.xp,
        stageResults: s.stageResults,
        unlockedStage: s.unlockedStage,
        classicHighScore: s.classicHighScore,
        highestTower: s.highestTower,
        longestCombo: s.longestCombo,
        highestQuality: s.highestQuality,
        mostPerfect: s.mostPerfect,
        totalBricks: s.totalBricks,
        totalPerfect: s.totalPerfect,
        earnedBadges: s.earnedBadges,
        unlockedCosmetics: s.unlockedCosmetics,
        equipped: s.equipped,
        powerUpInventory: s.powerUpInventory,
        tutorialDone: s.tutorialDone,
        certificateUnlocked: s.certificateUnlocked,
        dailyDate: s.dailyDate,
        dailyDone: s.dailyDone,
        settings: s.settings,
        leaderboards: s.leaderboards,
      }),
    },
  ),
);

export function badgeName(id: string) {
  return badges.find((b) => b.id === id)?.name ?? id;
}
