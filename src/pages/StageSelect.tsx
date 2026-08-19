import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import { stages } from "../data/stages";
import { BigButton, Modal, ScreenHeader } from "../components/common";
import { powerUps } from "../data/cosmetics";
import type { PowerUpId } from "../game/types";

export function StageSelect() {
  const s = useGameStore();
  const [pick, setPick] = useState<number | null>(null);
  const [chosen, setChosen] = useState<PowerUpId[]>([]);
  const stage = pick ? stages.find((st) => st.id === pick) : null;

  const togglePU = (id: PowerUpId) => {
    setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length < 2 ? [...c, id] : c));
  };

  return (
    <div className="flex-1 overflow-y-auto pb-8 page-sky">
      <ScreenHeader title="Pilih Stage" onBack={() => s.setScreen("menu")} />
      <div className="px-4 grid grid-cols-3 gap-3">
        {stages.map((st) => {
          const unlocked = st.id <= s.unlockedStage;
          const res = s.stageResults[st.id];
          return (
            <button
              key={st.id}
              disabled={!unlocked}
              onClick={() => {
                setPick(st.id);
                setChosen([]);
              }}
              aria-label={`Stage ${st.id}: ${st.title}${unlocked ? "" : " (berkunci)"}`}
              className={`rounded-3xl p-3 min-h-[92px] text-center shadow active:scale-95 transition ${
                unlocked ? "bg-white" : "bg-charcoal/10 opacity-60"
              }`}
            >
              <p className="text-lg font-black text-charcoal">{unlocked ? st.id : "🔒"}</p>
              <p className="text-[10px] font-bold text-charcoal leading-tight">{st.title}</p>
              <p className="text-xs mt-1" aria-label={`${res?.stars ?? 0} bintang`}>
                {res ? "⭐".repeat(res.stars) : unlocked ? "—" : ""}
              </p>
            </button>
          );
        })}
      </div>

      <Modal open={!!stage} onClose={() => setPick(null)} title={stage ? `Stage ${stage.id}: ${stage.title}` : ""}>
        {stage && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-cement">
              Fasa: <strong className="text-charcoal">{stage.phase}</strong>
            </p>
            <div className="bg-white rounded-xl p-3 border border-charcoal/10">
              <p className="text-sm font-bold text-charcoal">🎯 {stage.objective.label}</p>
              <p className="text-xs text-gold font-bold mt-1">⭐ Bonus: {stage.bonus.label}</p>
              <p className="text-[11px] text-cement mt-1">Target 2 bintang: {stage.targetScore.toLocaleString()} mata</p>
              {stage.disturbances.length > 0 && (
                <p className="text-[11px] text-mahligai font-bold mt-1">
                  ⚠️ Gangguan: {stage.disturbances.join(", ").replace(/-/g, " ")}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-charcoal mb-1">Bawa power-up (maksimum 2):</p>
              <div className="grid grid-cols-4 gap-2">
                {powerUps.map((p) => {
                  const count = s.powerUpInventory[p.id] ?? 0;
                  const sel = chosen.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      disabled={count <= 0}
                      onClick={() => togglePU(p.id)}
                      aria-pressed={sel}
                      aria-label={`${p.name} (${count})`}
                      className={`rounded-xl p-2 text-center border-2 min-h-[56px] ${
                        sel ? "border-mahligai bg-mahligai/10" : "border-charcoal/15 bg-white"
                      } disabled:opacity-30`}
                    >
                      <span className="text-xl">{p.icon}</span>
                      <p className="text-[9px] font-bold">{count}</p>
                    </button>
                  );
                })}
              </div>
            </div>
            <BigButton onClick={() => s.startGame("stage", stage.id, chosen)}>Mula Stage {stage.id}</BigButton>
          </div>
        )}
      </Modal>
    </div>
  );
}
