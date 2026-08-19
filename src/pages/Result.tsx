import { useState } from "react";
import { useGameStore, badgeName } from "../store/gameStore";
import { stages } from "../data/stages";
import { difficultyConfig, type DifficultyId } from "../data/difficulty";
import { BigButton, BrandLogo, QualityStamp, Toast, qualityStatus } from "../components/common";
import { BungalowSvg } from "../components/common/Bungalow";
import { mahligaiBrand } from "../config/brand";
import { shareText } from "../utils/share";
import { sfx } from "../utils/audio";

export function Result() {
  const s = useGameStore();
  const run = s.lastRun;
  const [toast, setToast] = useState<string | null>(null);
  if (!run) {
    s.setScreen("menu");
    return null;
  }
  const stage = run.stageId ? stages.find((st) => st.id === run.stageId) : undefined;
  const stagesDone = stages.filter((st) => (s.stageResults[st.id]?.stars ?? 0) >= 1).length;
  const isFinalReveal = run.mode === "stage" && run.stageId === 15 && run.won;
  const stars = run.mode === "stage" && run.won ? (s.stageResults[run.stageId!]?.stars ?? 1) : 0;

  const stampStatus: "approved" | "inspection" | "rectify" =
    run.quality > 70 && (run.mode !== "stage" || run.won) && run.miss < 3
      ? "approved"
      : run.quality >= 40
        ? "inspection"
        : "rectify";

  const isNewHighScore = run.mode === "classic" && run.score >= s.classicHighScore && run.score > 0;
  const showCta =
    (run.mode === "stage" && run.won && [5, 10, 15].includes(run.stageId!)) || isNewHighScore;

  const doShare = async () => {
    const text = isFinalReveal
      ? `Saya berjaya menyiapkan Projek Banglo Impian dalam ${mahligaiBrand.gameName} dan menerima status Quality Approved. ${mahligaiBrand.gameTagline}`
      : `Saya berjaya membina tower setinggi ${run.height.toFixed(1)} meter dengan Mahligai Quality ${run.quality}% dalam ${mahligaiBrand.gameName}. Boleh kalahkan saya?`;
    const r = await shareText(text);
    if (r === "copied") setToast("Keputusan telah disalin");
    else if (r === "failed") setToast("Tidak dapat berkongsi pada peranti ini");
    if (r !== "shared") setTimeout(() => setToast(null), 2200);
  };

  const diff = run.difficultyId ? difficultyConfig[run.difficultyId as DifficultyId] : undefined;
  const accuracy = run.bricks > 0 ? Math.round(((run.perfect + run.great) / run.bricks) * 100) : 0;
  const isChallenge = !!diff && run.mode !== "stage";
  const challengeWon = isChallenge && run.won;
  const confettiColors = ["#ED1C24", "#D2A84A", "#F2C522", "#2e9e4f", "#2f7fd6", "#ffffff"];

  return (
    <div className="flex-1 overflow-y-auto pb-8 relative page-sky">
      <Toast message={toast} />

      {/* CABARAN SELESAI — celebration */}
      {challengeWon && (
        <div className="relative bg-charcoal text-center px-4 pt-7 pb-6 overflow-hidden rounded-b-[2rem] shadow-xl">
          {Array.from({ length: 22 }).map((_, i) => (
            <span
              key={i}
              className="confetti-piece"
              aria-hidden="true"
              style={{
                left: `${(i * 47) % 100}%`,
                background: confettiColors[i % confettiColors.length],
                animationDelay: `${(i % 8) * 0.32}s`,
                animationDuration: `${2.2 + (i % 5) * 0.35}s`,
              }}
            />
          ))}
          <p className="text-gold font-display font-semibold text-3xl drop-shadow anim-countpop">CABARAN SELESAI!</p>
          <p className="text-white/70 text-xs mt-2">Anda berjaya menyiapkan:</p>
          <p className="text-white font-display font-semibold text-2xl uppercase">{diff!.name}</p>
          <p className="text-gold font-black text-lg">{diff!.targetFloors} TINGKAT</p>
          <div className="flex justify-center gap-4 mt-3 text-white text-xs font-bold">
            <span>Score: {run.score.toLocaleString()}</span>
            <span>Perfect: {run.perfect}</span>
            <span>Accuracy: {accuracy}%</span>
          </div>
        </div>
      )}

      {/* MENARA RUNTUH / TIDAK CAPAI TARGET */}
      {isChallenge && !run.won && (
        <div className="bg-charcoal text-center px-4 pt-7 pb-6 rounded-b-[2rem] shadow-xl">
          <p className="text-mahligai font-display font-semibold text-3xl drop-shadow">
            {run.collapsed ? "MENARA RUNTUH!" : "PERMAINAN TAMAT!"}
          </p>
          <p className="text-white/70 text-xs mt-2">Anda mencapai:</p>
          <p className="text-white font-display font-semibold text-3xl">
            {run.bricks} / {diff!.targetFloors} <span className="text-lg">TINGKAT</span>
          </p>
          <p className="text-gold text-sm font-bold mt-1">Score: {run.score.toLocaleString()}</p>
          <p className="text-white/50 text-[11px] mt-2">
            {diff!.name} · Cuba lagi — anda semakin hampir!
          </p>
        </div>
      )}

      {/* FINAL HOUSE REVEAL */}
      {isFinalReveal && (
        <div className="bg-charcoal text-center px-4 pt-6 pb-4">
          <p className="text-gold text-xs font-black tracking-widest">PROJEK SIAP SEPENUHNYA</p>
          <BungalowSvg stagesDone={15} facade={s.equipped.facade} celebrate className="w-full h-44 mt-2 rounded-xl" />
          <h2 className="text-white text-xl font-black mt-3">Rumah Impian Berjaya Disiapkan</h2>
          <p className="text-white/70 text-xs mt-1">
            Dibina dengan ketepatan, kestabilan dan perhatian pada setiap perincian.
          </p>
          <p className="text-gold text-sm font-bold mt-2">{mahligaiBrand.shortName}</p>
          <p className="text-white/60 text-[11px]">{mahligaiBrand.corporateTagline}</p>
        </div>
      )}

      <div className="px-4 pt-4 flex flex-col gap-4">
        {/* laporan tapak */}
        <div className="bg-white rounded-2xl shadow-md p-4">
          <div className="text-center border-b border-charcoal/10 pb-3">
            <BrandLogo className="h-8 mx-auto" />
            <p className="text-xs font-black text-charcoal mt-1 tracking-wider">SITE PERFORMANCE REPORT</p>
            <p className="text-[11px] text-cement">
              {stage
                ? `Stage ${stage.id}: ${stage.title}`
                : diff
                  ? `Cabaran: ${diff.name} (${diff.targetFloors} Tingkat)`
                  : "Daily Challenge"}
            </p>
            {run.mode === "stage" && (
              <p className={`text-sm font-black mt-1 ${run.won ? "text-green-700" : "text-mahligai"}`}>
                {run.won ? "STAGE SELESAI ✅" : run.collapsed ? "STRUKTUR RUNTUH 💥" : "TIDAK BERJAYA — CUBA LAGI"}
              </p>
            )}
            {stars > 0 && (
              <p className="text-2xl mt-1" aria-label={`${stars} bintang`}>
                {"⭐".repeat(stars)}
                <span className="opacity-25">{"⭐".repeat(3 - stars)}</span>
              </p>
            )}
            {isNewHighScore && <p className="text-xs font-black text-gold mt-1">🏆 HIGH SCORE BAHARU!</p>}
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-3">
            {(
              [
                ["Score", run.score.toLocaleString()],
                ["Brick Installed", `${run.bricks}`],
                ["Perfect Placement", `${run.perfect}`],
                ["Great Placement", `${run.great}`],
                ["Longest Combo", `x${run.longestCombo}`],
                ["Tower Height", `${run.height.toFixed(1)} m`],
                ["Final Stability", `${run.stability}%`],
                ["Mahligai Quality", `${run.quality}% (${qualityStatus(run.quality)})`],
                ["Accuracy", `${run.bricks > 0 ? Math.round(((run.perfect + run.great) / run.bricks) * 100) : 0}%`],
                ["MI Coin", `+${run.coinsEarned} 🪙`],
                ["Miss", `${run.miss}`],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className="flex flex-col">
                <dt className="text-[10px] font-bold text-cement uppercase">{k}</dt>
                <dd className="font-extrabold text-charcoal">{v}</dd>
              </div>
            ))}
          </dl>

          {s.lastNewBadges.length > 0 && (
            <div className="mt-3 bg-gold/15 border border-gold rounded-xl p-2 text-center">
              <p className="text-xs font-black text-charcoal">🎖 BADGE BAHARU</p>
              <p className="text-sm font-bold text-charcoal">{s.lastNewBadges.map(badgeName).join(", ")}</p>
            </div>
          )}
          {s.lastLeveledUp && (
            <p className="text-center text-xs font-black text-mahligai mt-2">⬆️ LEVEL NAIK!</p>
          )}

          <div className="mt-4">
            <QualityStamp status={stampStatus} />
            <p className="text-center text-[10px] text-cement mt-2">Approved by Mahligai Site Supervisor</p>
          </div>
        </div>

        {/* CTA ringan */}
        {showCta && (
          <div className="bg-charcoal rounded-2xl p-4 text-center">
            {stage?.ctaAfter && <p className="text-gold text-xs font-black mb-1">{stage.ctaAfter}</p>}
            <p className="text-white text-sm font-bold">Seronok bina rumah secara maya?</p>
            <p className="text-white/70 text-xs mt-1">
              Rumah impian sebenar memerlukan perancangan, ketepatan dan pasukan yang berpengalaman.
            </p>
            <div className="mt-3">
              <BigButton variant="gold" onClick={() => s.setScreen("about")}>
                Kenali Mahligai Idaman
              </BigButton>
            </div>
          </div>
        )}

        {/* butang */}
        <div className="flex flex-col gap-2">
          {challengeWon && diff!.next && (
            <BigButton
              variant="gold"
              onClick={() => {
                s.setDifficulty(diff!.next!);
                s.startGame("classic");
              }}
            >
              ⬆ NAIK TARAF CABARAN — {difficultyConfig[diff!.next!].name}
            </BigButton>
          )}
          {challengeWon && !diff!.next && (
            <p className="text-center text-sm font-black text-gold bg-charcoal rounded-2xl py-3">
              👑 CABARAN TERTINGGI SELESAI!
            </p>
          )}
          {isChallenge && !run.won && (
            <BigButton variant="secondary" onClick={() => s.setScreen("menu")}>
              Tukar Cabaran
            </BigButton>
          )}
          {isFinalReveal && (
            <BigButton variant="gold" onClick={() => s.setScreen("certificate")}>
              🏅 Lihat Sijil
            </BigButton>
          )}
          {run.mode === "stage" && run.won && run.stageId! < 15 && (
            <BigButton onClick={() => s.startGame("stage", run.stageId! + 1)}>
              Stage Seterusnya — {stages[run.stageId!]?.title}
            </BigButton>
          )}
          <BigButton
            variant={run.mode === "stage" && run.won ? "secondary" : "primary"}
            onClick={() => s.startGame(run.mode === "daily" ? "classic" : run.mode, run.stageId, [])}
          >
            Main Semula
          </BigButton>
          <div className="grid grid-cols-2 gap-2">
            <BigButton variant="ghost" onClick={doShare}>
              Share Result
            </BigButton>
            <BigButton variant="ghost" onClick={() => s.setScreen("project")}>
              Lihat Projek
            </BigButton>
          </div>
          <BigButton
            variant="ghost"
            onClick={() => {
              sfx.button();
              s.setScreen("menu");
            }}
          >
            Main Menu
          </BigButton>
        </div>
        <p className="text-center text-[10px] text-cement">
          Projek banglo: {stagesDone}/15 fasa siap · {mahligaiBrand.corporateTagline}
        </p>
      </div>
    </div>
  );
}
