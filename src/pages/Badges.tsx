import { useGameStore } from "../store/gameStore";
import { badges } from "../data/badges";
import { ScreenHeader } from "../components/common";

export function Badges() {
  const s = useGameStore();
  return (
    <div className="flex-1 overflow-y-auto pb-8 page-sky">
      <ScreenHeader title="Koleksi Badge" onBack={() => s.setScreen("menu")} />
      <p className="px-4 text-xs text-cement mb-3">
        {s.earnedBadges.length}/{badges.length} badge diperoleh
      </p>
      <div className="px-4 grid grid-cols-1 gap-2">
        {badges.map((b) => {
          const got = s.earnedBadges.includes(b.id);
          return (
            <div
              key={b.id}
              className={`flex items-center gap-3 rounded-2xl p-3 shadow-sm ${got ? "bg-white" : "bg-charcoal/5 opacity-70"}`}
            >
              <span className={`text-3xl ${got ? "" : "grayscale opacity-50"}`} aria-hidden="true">
                {b.icon}
              </span>
              <div className="flex-1">
                <p className="text-sm font-extrabold text-charcoal">{b.name}</p>
                <p className="text-[11px] text-cement">{b.desc}</p>
              </div>
              <span className="text-lg" aria-label={got ? "Diperoleh" : "Belum diperoleh"}>
                {got ? "✅" : "🔒"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
