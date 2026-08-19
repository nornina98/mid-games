// ============================================================
// MAHLIGAI IDAMAN — BRAND CONFIGURATION
// Semua nama, tagline, warna dan URL jenama dibaca dari sini.
// Jangan hardcode data jenama di tempat lain.
// ============================================================

export const mahligaiBrand = {
  shortName: "Mahligai Idaman",
  legalName: "Mahligai Idaman Development Sdn. Bhd.",
  gameName: "Mahligai Idaman: Brick Stack Challenge",
  gameShortName: "Brick Stack Challenge",
  gameTagline: "Susun Tepat. Bina Lebih Tinggi.",
  corporateTagline: "Membina Kediaman. Merealisasikan Impian.",
  logoPath: "assets/branding/mahligai-idaman-logo.png",
  logoWhitePath: "assets/branding/mahligai-idaman-logo-white.png",
  iconPath: "assets/branding/mahligai-idaman-icon.png",
  primaryColor: "#ED1C24", // merah rasmi logo Mahligai Idaman
  secondaryColor: "#202020",
  cementGrey: "#747474",
  backgroundColor: "#F4F1EC",
  accentColor: "#D2A84A",
  safetyYellow: "#F2C522",
  brickOrange: "#C25E3A",
  // Biarkan kosong jika belum ada — button berkaitan akan di-disable secara jelas.
  websiteUrl: "https://mahligaiidaman.com",
  whatsappUrl: "", // isikan link wa.me apabila tersedia
  portfolioUrl: "https://mahligaiidaman.com/rumah-siap/",
} as const;

export const signboardText = {
  title: "PROJEK PEMBINAAN BANGLO IMPIAN",
  ownerLabel: "Pemilik:",
  owner: "Keluarga Bahagia",
  contractorLabel: "Kontraktor:",
  contractor: mahligaiBrand.legalName,
  tagline: mahligaiBrand.corporateTagline,
} as const;

export const safetyBanners = [
  "Utamakan Keselamatan",
  "Kualiti Bermula Daripada Ketepatan",
  "Kerja Kemas, Hasil Berkualiti",
  "Tapak Projek Mahligai Idaman",
  "Membina Kediaman. Merealisasikan Impian.",
] as const;

export const loadingMessages = [
  "Menyediakan tapak pembinaan…",
  "Menghantar bata ke tapak…",
  "Memeriksa tahap kestabilan…",
  "Site Supervisor sedang membuat pemeriksaan…",
  "Menyediakan projek banglo anda…",
  "Memastikan kerja mengikut standard Mahligai…",
  "Menyusun material pembinaan…",
  "Menyediakan laporan tapak…",
] as const;
