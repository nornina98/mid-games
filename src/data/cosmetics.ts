export interface CosmeticDef {
  id: string;
  category: "helmet" | "brickSkin" | "background" | "facade";
  name: string;
  cost: number; // MI Coin (0 = default)
  color?: string;
}

export const cosmetics: CosmeticDef[] = [
  // Helmet
  { id: "helmet-white", category: "helmet", name: "Helmet Putih Mahligai", cost: 0, color: "#f4f1ec" },
  { id: "helmet-red", category: "helmet", name: "Helmet Merah Site Supervisor", cost: 150, color: "#a6191e" },
  { id: "helmet-yellow", category: "helmet", name: "Helmet Kuning Safety Team", cost: 150, color: "#f2c522" },
  { id: "helmet-gold", category: "helmet", name: "Helmet Emas Master Builder", cost: 400, color: "#d2a84a" },
  // Brick skin
  { id: "brick-standard", category: "brickSkin", name: "Standard Red Brick", cost: 0, color: "#b34a2e" },
  { id: "brick-premium", category: "brickSkin", name: "Premium Red Brick", cost: 200, color: "#8f2f1a" },
  { id: "brick-cement", category: "brickSkin", name: "Cement Grey", cost: 200, color: "#8d8d88" },
  { id: "brick-interlock", category: "brickSkin", name: "Interlocking", cost: 300, color: "#a8724a" },
  { id: "brick-gold", category: "brickSkin", name: "Mahligai Gold", cost: 500, color: "#d2a84a" },
  // Background
  { id: "bg-pagi", category: "background", name: "Tapak Pagi", cost: 0 },
  { id: "bg-senja", category: "background", name: "Tapak Senja", cost: 250 },
  { id: "bg-hujan", category: "background", name: "Tapak Hujan", cost: 250 },
  { id: "bg-bandar", category: "background", name: "Tapak Bandar", cost: 300 },
  { id: "bg-kampung", category: "background", name: "Tapak Kampung", cost: 300 },
  // Facade
  { id: "facade-modern", category: "facade", name: "Modern", cost: 0 },
  { id: "facade-tropical", category: "facade", name: "Modern Tropical", cost: 300 },
  { id: "facade-contemporary", category: "facade", name: "Contemporary", cost: 300 },
  { id: "facade-minimalist", category: "facade", name: "Minimalist", cost: 300 },
];

export interface PowerUpDef {
  id: "laser" | "slowmo" | "cement" | "brace";
  name: string;
  desc: string;
  cost: number;
  icon: string;
}

export const powerUps: PowerUpDef[] = [
  { id: "laser", name: "Laser Guide", desc: "Garis panduan menegak untuk 3 bata.", cost: 100, icon: "📡" },
  { id: "slowmo", name: "Slow Motion", desc: "Perlahankan pergerakan bata selama 5 saat.", cost: 120, icon: "🐢" },
  { id: "cement", name: "Extra Cement", desc: "Kunci 2 bata seterusnya + tambah stability.", cost: 150, icon: "🪣" },
  { id: "brace", name: "Tower Brace", desc: "Tambah stability 25% dan hentikan sway.", cost: 200, icon: "🛠️" },
];

export const avatars = [
  { id: "tukang", name: "Tukang Bata", icon: "🧱" },
  { id: "supervisor", name: "Site Supervisor", icon: "📋" },
  { id: "contractor", name: "Contractor", icon: "👷" },
  { id: "engineer", name: "Engineer", icon: "📐" },
] as const;

export const levels: { level: number; name: string; xp: number }[] = [
  { level: 1, name: "Trainee", xp: 0 },
  { level: 2, name: "Apprentice", xp: 300 },
  { level: 3, name: "Bricklayer", xp: 800 },
  { level: 4, name: "Senior Bricklayer", xp: 1600 },
  { level: 5, name: "Site Supervisor", xp: 2800 },
  { level: 6, name: "Master Mason", xp: 4500 },
  { level: 7, name: "Master Builder", xp: 7000 },
  { level: 8, name: "Pakar Banglo", xp: 10000 },
];

export function levelForXp(xp: number) {
  let cur = levels[0];
  for (const l of levels) if (xp >= l.xp) cur = l;
  const next = levels.find((l) => l.xp > xp);
  return {
    ...cur,
    nextXp: next ? next.xp : null,
    progress: next ? (xp - cur.xp) / (next.xp - cur.xp) : 1,
  };
}
