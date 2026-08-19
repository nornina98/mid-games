import { useEffect, useRef, useState } from "react";
import { useGameStore } from "../store/gameStore";
import { BigButton, ScreenHeader, Toast } from "../components/common";
import { drawCertificate, downloadCertificate } from "../utils/certificate";
import { shareText } from "../utils/share";
import { mahligaiBrand } from "../config/brand";
import { stages } from "../data/stages";

export function Certificate() {
  const s = useGameStore();
  const holder = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const totalScore = Object.values(s.stageResults).reduce((a, r) => a + r.bestScore, 0);
  const unlocked = s.certificateUnlocked || stages.every((st) => (s.stageResults[st.id]?.stars ?? 0) >= 1);
  const data = {
    playerName: s.playerName,
    totalScore,
    finalQuality: Math.round(s.highestQuality),
    badgeCount: s.earnedBadges.length,
  };

  useEffect(() => {
    if (!holder.current || !unlocked) return;
    holder.current.innerHTML = "";
    const c = drawCertificate(data);
    c.style.width = "100%";
    c.style.height = "auto";
    c.style.borderRadius = "12px";
    holder.current.appendChild(c);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked]);

  return (
    <div className="flex-1 overflow-y-auto pb-8 relative page-sky">
      <Toast message={toast} />
      <ScreenHeader title="Sijil Master Builder" onBack={() => s.setScreen("menu")} />
      <div className="px-4 flex flex-col gap-3">
        {unlocked ? (
          <>
            <div ref={holder} className="shadow-lg rounded-xl overflow-hidden" aria-label="Sijil Master Builder anda" />
            <BigButton variant="gold" onClick={() => downloadCertificate(data)}>
              ⬇ Download as Image
            </BigButton>
            <BigButton
              onClick={async () => {
                const r = await shareText(
                  `Saya berjaya menyiapkan Projek Banglo Impian dalam ${mahligaiBrand.gameName} dan menerima Sijil Master Builder dengan status Quality Approved!`,
                );
                if (r === "copied") {
                  setToast("Keputusan telah disalin");
                  setTimeout(() => setToast(null), 2000);
                }
              }}
            >
              Share Certificate
            </BigButton>
            <BigButton variant="secondary" onClick={() => s.startGame("classic")}>
              Main Cabaran Semula
            </BigButton>
          </>
        ) : (
          <div className="game-card p-6 text-center">
            <p className="text-4xl">🔒</p>
            <p className="text-sm font-bold text-charcoal mt-2">
              Lengkapkan semua 15 stage untuk membuka Sijil Master Builder.
            </p>
            <div className="mt-4">
              <BigButton onClick={() => s.setScreen("stageSelect")}>Pergi ke Stage</BigButton>
            </div>
          </div>
        )}
        <BigButton variant="ghost" onClick={() => s.setScreen("menu")}>
          Kembali ke Main Menu
        </BigButton>
      </div>
    </div>
  );
}
