import { useEffect, useState } from "react";
import { mahligaiBrand, loadingMessages } from "../config/brand";
import { BrandLogo } from "../components/common";
import { useGameStore } from "../store/gameStore";

export function Splash() {
  const setScreen = useGameStore((s) => s.setScreen);
  const playerName = useGameStore((s) => s.playerName);
  const [msg] = useState(() => loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
  const [bricks, setBricks] = useState(0);

  useEffect(() => {
    const int = setInterval(() => setBricks((b) => Math.min(b + 1, 5)), 250);
    const t = setTimeout(() => setScreen(playerName ? "menu" : "setup"), 2300);
    return () => {
      clearTimeout(t);
      clearInterval(int);
    };
  }, [setScreen, playerName]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-charcoal text-white px-8 text-center gap-3">
      <BrandLogo white className="h-20 anim-brickdrop" />
      <h2 className="text-sm font-bold tracking-[0.3em] text-white/80 mt-2">MAHLIGAI IDAMAN</h2>
      <h1 className="text-3xl font-black text-gold leading-tight font-display">BRICK STACK CHALLENGE</h1>
      <p className="text-sm font-bold text-white/90">{mahligaiBrand.gameTagline}</p>
      <p className="text-xs text-white/60">{mahligaiBrand.corporateTagline}</p>

      {/* animasi bata membentuk outline rumah */}
      <div className="flex flex-col-reverse items-center gap-1 h-24 justify-start mt-2" aria-hidden="true">
        {Array.from({ length: bricks }).map((_, i) => (
          <div
            key={i}
            className="anim-brickdrop rounded-sm bg-brick border border-black/30"
            style={{ width: `${90 - i * 12}px`, height: "12px" }}
          />
        ))}
        {bricks >= 5 && <div className="text-2xl anim-brickdrop">🏠</div>}
      </div>

      <p className="text-xs text-white/50 anim-pulse-soft" aria-live="polite">
        {msg}
      </p>
    </div>
  );
}
