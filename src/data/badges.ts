export interface BadgeDef {
  id: string;
  name: string;
  desc: string;
  icon: string; // emoji ringkas untuk MVP
}

export const badges: BadgeDef[] = [
  { id: "perfect-start", name: "Perfect Start", desc: "Dapatkan Perfect Placement pertama.", icon: "🎯" },
  { id: "mahligai-precision", name: "Mahligai Precision", desc: "Dapatkan 5 Perfect Placement berturut-turut.", icon: "📐" },
  { id: "master-bricklayer", name: "Master Bricklayer", desc: "Capai 10 Perfect Placement keseluruhan.", icon: "🧱" },
  { id: "tower-master", name: "Tower Master", desc: "Capai tinggi 10 meter.", icon: "🏗️" },
  { id: "zero-waste", name: "Zero Waste", desc: "Selesaikan stage tanpa miss.", icon: "♻️" },
  { id: "weather-survivor", name: "Weather Survivor", desc: "Selesaikan stage hujan dan angin.", icon: "🌧️" },
  { id: "mahligai-quality", name: "Mahligai Quality", desc: "Tamatkan stage dengan Quality melebihi 90%.", icon: "✅" },
  { id: "stability-king", name: "Stability King", desc: "Tamatkan stage dengan stability melebihi 90%.", icon: "⚖️" },
  { id: "speed-builder", name: "Speed Builder", desc: "Selesaikan timed stage lebih awal.", icon: "⏱️" },
  { id: "supervisor-approved", name: "Site Supervisor Approved", desc: "Lengkapkan stage tanpa power-up.", icon: "👷" },
  { id: "banglo-champion", name: "Banglo Champion", desc: "Lengkapkan semua 15 stage.", icon: "🏠" },
  { id: "mahligai-champion", name: "Mahligai Champion", desc: "Dapatkan 3 bintang untuk semua stage.", icon: "🏆" },
  { id: "high-rise-mason", name: "High Rise Mason", desc: "Susun 100 bata keseluruhan.", icon: "🔝" },
];
