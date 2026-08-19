export interface DailyChallengeDef {
  id: string;
  desc: string;
  check:
    | { type: "score"; value: number }
    | { type: "perfect"; value: number }
    | { type: "height"; value: number }
    | { type: "noPowerUp" }
    | { type: "quality"; value: number }
    | { type: "combo"; value: number };
  rewardCoins: number;
  rewardXp: number;
}

export const dailyChallenges: DailyChallengeDef[] = [
  { id: "score3000", desc: "Capai 3,000 mata dalam satu permainan", check: { type: "score", value: 3000 }, rewardCoins: 80, rewardXp: 100 },
  { id: "perfect5", desc: "Dapatkan 5 Perfect Placement dalam satu permainan", check: { type: "perfect", value: 5 }, rewardCoins: 80, rewardXp: 100 },
  { id: "height6", desc: "Capai ketinggian 6 meter", check: { type: "height", value: 6 }, rewardCoins: 70, rewardXp: 90 },
  { id: "nopower", desc: "Selesaikan satu permainan tanpa power-up (min 10 bata)", check: { type: "noPowerUp" }, rewardCoins: 60, rewardXp: 80 },
  { id: "quality80", desc: "Tamat permainan dengan Quality minimum 80%", check: { type: "quality", value: 80 }, rewardCoins: 90, rewardXp: 110 },
  { id: "combo4", desc: "Dapatkan combo x4", check: { type: "combo", value: 4 }, rewardCoins: 85, rewardXp: 100 },
];

// Pilih challenge berdasarkan tarikh local (deterministik)
export function challengeForDate(dateKey: string): DailyChallengeDef {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
  return dailyChallenges[hash % dailyChallenges.length];
}

export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
