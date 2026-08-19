import { useState } from "react";
import { useGameStore, playerKey } from "../store/gameStore";
import { ScreenHeader } from "../components/common";
import { HouseIcon } from "../components/common/HouseIcons";
import { difficultyConfig, difficultyOrder, type DifficultyId } from "../data/difficulty";
import { sfx } from "../utils/audio";

const TAB_LABEL: Record<DifficultyId, string> = {
  terrace: "TERES",
  semiD: "SEMI-D",
  bungalow: "BANGLO",
  premiumBungalow: "PREMIUM",
};

export function Leaderboard() {
  const s = useGameStore();
  const [tab, setTab] = useState<DifficultyId>(s.selectedDifficulty);
  const d = difficultyConfig[tab];
  const board = [...(s.challengeBoards[tab] ?? [])];
  const activeKey = s.activePlayer;

  return (
    <div className="flex-1 overflow-y-auto pb-8 page-sky">
      <ScreenHeader title="Leaderboard" onBack={() => s.setScreen("menu")} />

      {/* tab mengikut level */}
      <div className="px-4 grid grid-cols-4 gap-2 pb-3">
        {difficultyOrder.map((id) => {
          const active = tab === id;
          const dd = difficultyConfig[id];
          return (
            <button
              key={id}
              onClick={() => {
                sfx.button();
                setTab(id);
              }}
              aria-pressed={active}
              className={`min-h-[52px] rounded-2xl text-[10px] font-black flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
                active ? "text-white shadow-[0_4px_0_rgba(0,0,0,0.25)]" : "bg-white text-charcoal shadow-[0_3px_0_rgba(32,32,32,0.10)]"
              }`}
              style={active ? { background: dd.accent } : undefined}
            >
              <HouseIcon id={id} className={`w-8 h-6 ${active ? "text-white" : ""}`} />
              {TAB_LABEL[id]}
            </button>
          );
        })}
      </div>

      <div className="px-4">
        <div className="game-card overflow-hidden">
          <div className="px-4 py-2.5 text-white flex items-center justify-between" style={{ background: d.accent }}>
            <p className="font-display font-semibold text-sm">{d.name}</p>
            <p className="text-[10px] font-bold opacity-90">Target: {d.targetFloors} Tingkat</p>
          </div>
          <div className="divide-y divide-charcoal/5">
            {board.length === 0 && <p className="p-4 text-sm text-cement">Tiada rekod lagi — jadilah yang pertama!</p>}
            {board.map((e, i) => {
              const isMe = playerKey(e.name) === activeKey;
              return (
                <div key={`${e.name}-${i}`} className={`flex items-center gap-3 px-3 py-2.5 ${isMe ? "bg-gold/15" : ""}`}>
                  <span className={`w-8 text-center font-black ${i < 3 ? "text-xl" : "text-cement text-sm"}`}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-charcoal truncate">
                      {e.name.toUpperCase()}
                      {isMe && <span className="text-[9px] text-mahligai font-black ml-1">ANDA</span>}
                    </p>
                    <p className="text-[10px] text-cement">
                      {e.floor} / {d.targetFloors} Tingkat · Perfect: {e.perfect} · {e.accuracy}% · {e.date}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display font-semibold text-charcoal text-sm">{e.score.toLocaleString()}</p>
                    <p className={`text-[9px] font-black ${e.completed ? "text-green-700" : "text-cement"}`}>
                      {e.completed ? "✅ COMPLETED" : "INCOMPLETE"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <p className="text-center text-[10px] text-cement mt-3 px-4">
          Ranking: siap cabaran dahulu, kemudian score tertinggi, accuracy dan masa terpantas. Leaderboard disimpan
          pada peranti ini.
        </p>
      </div>
    </div>
  );
}
