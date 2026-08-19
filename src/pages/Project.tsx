import { useGameStore } from "../store/gameStore";
import { stages, projectPhases } from "../data/stages";
import { BigButton, ScreenHeader, Signboard } from "../components/common";
import { BungalowSvg } from "../components/common/Bungalow";
import { mahligaiBrand } from "../config/brand";

export function Project() {
  const s = useGameStore();
  const stagesDone = stages.filter((st) => (s.stageResults[st.id]?.stars ?? 0) >= 1).length;
  const pct = Math.round((stagesDone / 15) * 100);

  return (
    <div className="flex-1 overflow-y-auto pb-8 page-sky">
      <ScreenHeader title="Projek Banglo" onBack={() => s.setScreen("menu")} />
      <div className="px-4 flex flex-col gap-4">
        <div className="game-card overflow-hidden">
          <BungalowSvg stagesDone={stagesDone} facade={s.equipped.facade} className="w-full h-48" celebrate={stagesDone >= 15} />
          <div className="p-3 text-center">
            <p className="text-sm font-black text-charcoal">PROJEK BANGLO MAHLIGAI IDAMAN</p>
            <p className="text-xs text-cement">Kemajuan: {pct}%</p>
            <div className="h-2.5 bg-charcoal/10 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-mahligai rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-[11px] text-cement mt-2">
              Fasa semasa: <strong className="text-charcoal">{projectPhases[Math.min(stagesDone, 14)]}</strong>
            </p>
          </div>
        </div>

        <div className="game-card p-3">
          <p className="text-xs font-black text-charcoal mb-2">SENARAI FASA PEMBINAAN</p>
          <ol className="flex flex-col gap-1">
            {projectPhases.map((ph, i) => {
              const done = stagesDone > i;
              const current = stagesDone === i;
              return (
                <li
                  key={ph}
                  className={`flex items-center gap-2 text-xs rounded-lg px-2 py-1.5 ${
                    done ? "text-green-800 bg-green-50" : current ? "text-mahligai bg-mahligai/5 font-bold" : "text-cement"
                  }`}
                >
                  <span aria-hidden="true">{done ? "✅" : current ? "🔨" : "▫️"}</span>
                  <span>
                    {i + 1}. {ph}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        <Signboard />
        {stagesDone < 15 ? (
          <BigButton onClick={() => s.startGame("stage", Math.min(s.unlockedStage, 15))}>
            Stage Seterusnya — Stage {Math.min(s.unlockedStage, 15)}
          </BigButton>
        ) : (
          <BigButton variant="gold" onClick={() => s.setScreen("certificate")}>
            🏅 Lihat Sijil Master Builder
          </BigButton>
        )}
        <BigButton variant="ghost" onClick={() => s.setScreen("menu")}>
          Main Menu
        </BigButton>
        <p className="text-center text-[10px] text-cement">{mahligaiBrand.corporateTagline}</p>
      </div>
    </div>
  );
}
