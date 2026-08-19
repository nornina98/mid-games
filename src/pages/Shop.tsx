import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import { cosmetics, powerUps } from "../data/cosmetics";
import { BigButton, ScreenHeader, Toast } from "../components/common";
import { sfx } from "../utils/audio";

const CATS = [
  { key: "powerup", label: "Power-Up" },
  { key: "helmet", label: "Helmet" },
  { key: "brickSkin", label: "Brick Skin" },
  { key: "background", label: "Background" },
  { key: "facade", label: "Facade Rumah" },
] as const;

export function Shop() {
  const s = useGameStore();
  const [cat, setCat] = useState<(typeof CATS)[number]["key"]>("powerup");
  const [toast, setToast] = useState<string | null>(null);

  const notify = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 1800);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-8 relative page-sky">
      <Toast message={toast} />
      <ScreenHeader title="Kedai & Koleksi" onBack={() => s.setScreen("menu")} />
      <p className="px-4 text-sm font-black text-charcoal mb-2">Baki: 🪙 {s.coins} MI Coin</p>
      <div className="px-4 flex gap-2 overflow-x-auto pb-2">
        {CATS.map((c) => (
          <button
            key={c.key}
            onClick={() => setCat(c.key)}
            aria-pressed={cat === c.key}
            className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold min-h-[44px] ${
              cat === c.key ? "bg-mahligai text-white" : "bg-white text-charcoal shadow-sm"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="px-4 mt-2 flex flex-col gap-2">
        {cat === "powerup"
          ? powerUps.map((p) => (
              <div key={p.id} className="game-card p-3 flex items-center gap-3">
                <span className="text-3xl" aria-hidden="true">
                  {p.icon}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-extrabold text-charcoal">
                    {p.name} <span className="text-[11px] text-cement">(x{s.powerUpInventory[p.id] ?? 0})</span>
                  </p>
                  <p className="text-[11px] text-cement">{p.desc}</p>
                </div>
                <button
                  onClick={() => {
                    if (s.buyPowerUp(p.id, p.cost)) {
                      sfx.coin();
                      notify(`${p.name} dibeli!`);
                    } else notify("MI Coin tidak mencukupi");
                  }}
                  className="min-h-[44px] rounded-full bg-gold px-4 font-black text-xs text-charcoal active:scale-95"
                  aria-label={`Beli ${p.name} dengan ${p.cost} MI Coin`}
                >
                  🪙 {p.cost}
                </button>
              </div>
            ))
          : cosmetics
              .filter((c) => c.category === cat)
              .map((c) => {
                const owned = s.unlockedCosmetics.includes(c.id);
                const equipped = s.equipped[c.category] === c.id;
                return (
                  <div key={c.id} className="game-card p-3 flex items-center gap-3">
                    <span
                      className="w-9 h-9 rounded-lg border border-charcoal/15 shrink-0"
                      style={{ background: c.color ?? "#e8e2d6" }}
                      aria-hidden="true"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-extrabold text-charcoal">{c.name}</p>
                      <p className="text-[11px] text-cement">
                        {equipped ? "Sedang dipakai" : owned ? "Dimiliki" : `Harga: 🪙 ${c.cost}`}
                      </p>
                    </div>
                    {equipped ? (
                      <span className="text-xs font-black text-green-700 px-2">✓ AKTIF</span>
                    ) : owned ? (
                      <button
                        onClick={() => {
                          s.equipCosmetic(c.category, c.id);
                          sfx.button();
                          notify(`${c.name} dipakai`);
                        }}
                        className="min-h-[44px] rounded-full bg-charcoal px-4 font-black text-xs text-white active:scale-95"
                      >
                        Pakai
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (s.buyCosmetic(c.id, c.cost)) {
                            sfx.coin();
                            notify(`${c.name} dibuka!`);
                          } else notify("MI Coin tidak mencukupi");
                        }}
                        className="min-h-[44px] rounded-full bg-gold px-4 font-black text-xs text-charcoal active:scale-95"
                        aria-label={`Beli ${c.name} dengan ${c.cost} MI Coin`}
                      >
                        🪙 {c.cost}
                      </button>
                    )}
                  </div>
                );
              })}
      </div>
      <div className="px-4 mt-4">
        <BigButton variant="ghost" onClick={() => s.setScreen("menu")}>
          Main Menu
        </BigButton>
      </div>
    </div>
  );
}
