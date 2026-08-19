import { useGameStore } from "../store/gameStore";
import { BigButton, ScreenHeader, SupervisorBubble } from "../components/common";

const TIPS = [
  ["👆", "Tap skrin (atau tekan Space/Enter) untuk menjatuhkan bata ke atas susunan."],
  ["🎯", "Alignment 95%+ = PERFECT (150 mata). Bata tidak dipotong dan combo bertambah."],
  ["✂️", "Bata yang tersasar akan dipotong — bahagian terkeluar jatuh dan bata seterusnya semakin kecil."],
  ["📊", "Mahligai Quality mengukur ketepatan kerja anda. Kekalkan melebihi 70% untuk status QUALITY APPROVED."],
  ["⚖️", "Stability jatuh apabila placement risky, angin kuat atau bata rosak. Sifar = struktur runtuh!"],
  ["🔥", "5 Perfect berturut-turut = bonus 500 mata + Golden Brick istimewa."],
  ["🌧️", "Hujan menjadikan permukaan licin; angin menolak bata. Perhatikan penunjuk cuaca."],
  ["🪣", "Guna power-up (Laser Guide, Slow Motion, Extra Cement, Tower Brace) — beli di Kedai dengan MI Coin."],
  ["🏘️", "Pilih Cabaran ikut jenis rumah: Teres (santai), Semi-D (seimbang), Banglo (sukar), Banglo Premium (profesional). Capai target tingkat untuk menang!"],
  ["🏠", "Setiap stage yang selesai membina sebahagian banglo Mahligai Idaman. Siapkan semua 15 untuk Sijil Master Builder!"],
];

export function HowTo() {
  const s = useGameStore();
  return (
    <div className="flex-1 overflow-y-auto pb-8 page-sky">
      <ScreenHeader title="Cara Main" onBack={() => s.setScreen("menu")} />
      <div className="px-4 flex flex-col gap-3">
        <SupervisorBubble message="Selamat datang ke tapak! Ini panduan ringkas daripada saya." />
        {TIPS.map(([icon, tip], i) => (
          <div key={i} className="game-card p-3 flex gap-3 items-start">
            <span className="text-2xl shrink-0" aria-hidden="true">
              {icon}
            </span>
            <p className="text-sm text-charcoal leading-snug">{tip}</p>
          </div>
        ))}
        <BigButton onClick={() => s.startGame("stage", Math.min(s.unlockedStage, 15))}>Mula Bermain</BigButton>
        <BigButton variant="ghost" onClick={() => s.setScreen("menu")}>
          Main Menu
        </BigButton>
      </div>
    </div>
  );
}
