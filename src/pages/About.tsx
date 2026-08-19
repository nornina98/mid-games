import { useGameStore } from "../store/gameStore";
import { BigButton, BrandLogo, ScreenHeader, AbangSiteAvatar } from "../components/common";
import { mahligaiBrand } from "../config/brand";

function LinkButton({ label, url }: { label: string; url: string }) {
  const disabled = !url;
  return (
    <BigButton
      variant={disabled ? "ghost" : "primary"}
      disabled={disabled}
      onClick={() => window.open(url, "_blank", "noopener")}
      ariaLabel={disabled ? `${label} (belum tersedia)` : label}
    >
      {label}
      {disabled ? " (akan datang)" : ""}
    </BigButton>
  );
}

export function About() {
  const s = useGameStore();
  return (
    <div className="flex-1 overflow-y-auto pb-8 page-sky">
      <ScreenHeader title="Tentang Mahligai Idaman" onBack={() => s.setScreen("menu")} />
      <div className="px-4 flex flex-col gap-4">
        <div className="game-card p-5 text-center">
          <BrandLogo className="h-16 mx-auto" />
          <h2 className="text-lg font-black text-charcoal mt-3">{mahligaiBrand.shortName}</h2>
          <p className="text-[11px] text-cement">{mahligaiBrand.legalName}</p>
          <p className="text-sm text-charcoal mt-3 leading-relaxed">
            Mahligai Idaman merupakan syarikat pembinaan yang memberi fokus kepada pembinaan rumah banglo idaman
            dengan penekanan terhadap perancangan, kualiti kerja dan pengalaman pelanggan.
          </p>
          <p className="text-sm font-black text-gold mt-3 italic">{mahligaiBrand.corporateTagline}</p>
        </div>

        <div className="bg-charcoal rounded-2xl p-4 flex items-center gap-3">
          <AbangSiteAvatar size={52} />
          <p className="text-xs text-white/85 leading-relaxed">
            "Setiap rumah yang kami bina melalui pemeriksaan kualiti yang teliti — sama seperti standard Mahligai
            Quality dalam permainan ini."
          </p>
        </div>

        <LinkButton label="Lawati Laman Web" url={mahligaiBrand.websiteUrl} />
        <LinkButton label="WhatsApp Mahligai Idaman" url={mahligaiBrand.whatsappUrl} />
        <LinkButton label="Lihat Projek Kami" url={mahligaiBrand.portfolioUrl} />

        <BigButton variant="ghost" onClick={() => s.setScreen("menu")}>
          Main Menu
        </BigButton>
      </div>
    </div>
  );
}
