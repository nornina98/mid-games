// Jana Sijil Master Builder sebagai imej (Canvas API)
import { mahligaiBrand } from "../config/brand";

export interface CertificateData {
  playerName: string;
  totalScore: number;
  finalQuality: number;
  badgeCount: number;
}

export function drawCertificate(data: CertificateData): HTMLCanvasElement {
  const W = 1000;
  const H = 700;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;

  // latar
  g.fillStyle = mahligaiBrand.backgroundColor;
  g.fillRect(0, 0, W, H);
  g.strokeStyle = mahligaiBrand.accentColor;
  g.lineWidth = 10;
  g.strokeRect(20, 20, W - 40, H - 40);
  g.strokeStyle = mahligaiBrand.primaryColor;
  g.lineWidth = 3;
  g.strokeRect(36, 36, W - 72, H - 72);

  g.textAlign = "center";
  g.fillStyle = mahligaiBrand.primaryColor;
  g.font = "bold 30px Georgia, serif";
  g.fillText(mahligaiBrand.shortName.toUpperCase(), W / 2, 100);
  g.fillStyle = mahligaiBrand.cementGrey;
  g.font = "16px Georgia, serif";
  g.fillText(mahligaiBrand.legalName, W / 2, 128);

  g.fillStyle = "#202020";
  g.font = "bold 44px Georgia, serif";
  g.fillText("SIJIL MASTER BUILDER", W / 2, 195);

  g.font = "20px Georgia, serif";
  g.fillText("Dengan ini diperakui bahawa", W / 2, 250);

  g.fillStyle = mahligaiBrand.primaryColor;
  g.font = "bold 52px Georgia, serif";
  g.fillText(data.playerName || "Pemain", W / 2, 320);

  g.fillStyle = "#202020";
  g.font = "19px Georgia, serif";
  g.fillText("telah berjaya melengkapkan Mahligai Idaman Brick Stack Challenge", W / 2, 370);
  g.fillText("dan menyiapkan sebuah projek banglo impian dengan", W / 2, 398);
  g.fillText("standard kualiti yang cemerlang.", W / 2, 426);

  g.font = "bold 20px Georgia, serif";
  g.fillText(
    `Jumlah Skor: ${data.totalScore.toLocaleString()}   ·   Kualiti Akhir: ${data.finalQuality}%   ·   Badge: ${data.badgeCount}`,
    W / 2,
    480,
  );

  g.fillStyle = mahligaiBrand.cementGrey;
  g.font = "16px Georgia, serif";
  g.fillText(`Tarikh: ${new Date().toLocaleDateString("ms-MY")}`, W / 2, 520);

  // stamp Quality Approved
  g.save();
  g.translate(810, 560);
  g.rotate(-0.15);
  g.strokeStyle = "#1e8449";
  g.lineWidth = 5;
  g.beginPath();
  g.arc(0, 0, 70, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = "#1e8449";
  g.font = "bold 16px Arial";
  g.fillText("MAHLIGAI", 0, -18);
  g.fillText("QUALITY", 0, 2);
  g.fillText("APPROVED", 0, 22);
  g.font = "26px Arial";
  g.fillText("✓", 0, 48);
  g.restore();

  // tagline
  g.fillStyle = mahligaiBrand.accentColor;
  g.font = "italic bold 20px Georgia, serif";
  g.fillText(mahligaiBrand.corporateTagline, W / 2 - 100, 610);

  g.fillStyle = mahligaiBrand.cementGrey;
  g.font = "14px Georgia, serif";
  g.fillText("Approved by Mahligai Site Supervisor", W / 2 - 100, 640);

  return c;
}

export function downloadCertificate(data: CertificateData) {
  const canvas = drawCertificate(data);
  const a = document.createElement("a");
  a.download = "sijil-master-builder-mahligai-idaman.png";
  a.href = canvas.toDataURL("image/png");
  a.click();
}
