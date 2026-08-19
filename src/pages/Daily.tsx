import { useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { challengeForDate, todayKey } from "../data/challenges";
import { BigButton, ScreenHeader } from "../components/common";

export function Daily() {
  const s = useGameStore();
  useEffect(() => {
    s.refreshDaily();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const ch = challengeForDate(todayKey());

  return (
    <div className="flex-1 overflow-y-auto pb-8 page-sky">
      <ScreenHeader title="Daily Challenge" onBack={() => s.setScreen("menu")} />
      <div className="px-4 flex flex-col gap-4">
        <div className="game-card p-5 text-center">
          <p className="text-4xl" aria-hidden="true">
            📅
          </p>
          <p className="text-xs text-cement mt-1">{new Date().toLocaleDateString("ms-MY", { weekday: "long", day: "numeric", month: "long" })}</p>
          <h2 className="text-lg font-black text-charcoal mt-2">{ch.desc}</h2>
          <p className="text-sm font-bold text-gold mt-2">
            Ganjaran: 🪙 {ch.rewardCoins} MI Coin + {ch.rewardXp} XP
          </p>
          {s.dailyDone ? (
            <p className="mt-3 text-sm font-black text-green-700 bg-green-50 rounded-xl py-2">
              ✅ SELESAI! Kembali esok untuk cabaran baharu.
            </p>
          ) : (
            <p className="mt-3 text-[11px] text-cement">
              Mainkan mana-mana mode — cabaran dikira secara automatik.
            </p>
          )}
        </div>
        {!s.dailyDone && <BigButton onClick={() => s.startGame("daily")}>Main Sekarang</BigButton>}
        <BigButton variant="ghost" onClick={() => s.setScreen("menu")}>
          Main Menu
        </BigButton>
      </div>
    </div>
  );
}
