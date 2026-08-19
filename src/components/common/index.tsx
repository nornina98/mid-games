import { type ReactNode, useEffect, useState } from "react";
import { mahligaiBrand, signboardText } from "../../config/brand";
import { sfx } from "../../utils/audio";

// ---------- Butang utama ----------
export function BigButton({
  children,
  onClick,
  variant = "primary",
  disabled,
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "gold" | "ghost" | "danger";
  disabled?: boolean;
  ariaLabel?: string;
}) {
  // Butang "chunky 3D" gaya mobile game: ada tebal bawah & tenggelam bila ditekan
  const styles: Record<string, string> = {
    primary:
      "bg-gradient-to-b from-[#ff4a50] via-[#ED1C24] to-[#c41219] text-white shadow-[0_5px_0_#8a0d12,0_10px_18px_rgba(237,28,36,0.35)] active:shadow-[0_1px_0_#8a0d12]",
    secondary:
      "bg-gradient-to-b from-[#4a4a4a] to-charcoal text-white shadow-[0_5px_0_#0a0a0a,0_10px_18px_rgba(0,0,0,0.30)] active:shadow-[0_1px_0_#0a0a0a]",
    gold: "bg-gradient-to-b from-[#f2cf74] to-[#c49a38] text-charcoal shadow-[0_5px_0_#8a6a1e,0_10px_18px_rgba(210,168,74,0.40)] active:shadow-[0_1px_0_#8a6a1e]",
    ghost:
      "bg-white text-charcoal border-2 border-charcoal/10 shadow-[0_4px_0_rgba(32,32,32,0.12)] active:shadow-[0_1px_0_rgba(32,32,32,0.12)]",
    danger:
      "bg-gradient-to-b from-red-500 to-red-800 text-white shadow-[0_5px_0_#5f0a0a,0_10px_18px_rgba(180,20,20,0.35)] active:shadow-[0_1px_0_#5f0a0a]",
  };
  return (
    <button
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => {
        sfx.button();
        onClick?.();
      }}
      className={`w-full min-h-[52px] rounded-2xl px-5 py-3 font-display font-semibold text-base transition-all active:translate-y-[4px] disabled:opacity-40 disabled:pointer-events-none ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

// ---------- Logo (placeholder-aware) ----------
// Logo di-import daripada src/assets supaya turut ter-inline dalam build satu-fail.
// Untuk menukar logo, ganti fail PNG dalam src/assets/branding/ (dan public/assets/branding/ untuk favicon).
import logoUrl from "../../assets/branding/mahligai-idaman-logo.png";
import logoWhiteUrl from "../../assets/branding/mahligai-idaman-logo-white.png";

export function BrandLogo({ white = false, className = "" }: { white?: boolean; className?: string }) {
  const [failed, setFailed] = useState(false);
  const src = white ? logoWhiteUrl : logoUrl;
  if (failed) {
    return (
      <div
        className={`border-2 border-dashed ${white ? "border-white text-white" : "border-mahligai text-mahligai"} rounded-lg px-4 py-3 text-center text-xs font-bold ${className}`}
      >
        OFFICIAL MAHLIGAI IDAMAN LOGO HERE
      </div>
    );
  }
  return (
    <img
      src={src}
      onError={() => setFailed(true)}
      alt={`Logo ${mahligaiBrand.shortName}`}
      className={`object-contain ${className}`}
    />
  );
}

// ---------- Meter dengan teks (aksesibiliti: bukan warna sahaja) ----------
export function Meter({
  label,
  value,
  statusText,
  color,
}: {
  label: string;
  value: number;
  statusText?: string;
  color: string;
}) {
  return (
    <div role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={`${label}: ${value}%`}>
      <div className="flex justify-between text-[11px] font-bold text-charcoal/80">
        <span>{label}</span>
        <span>
          {value}%{statusText ? ` · ${statusText}` : ""}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-charcoal/15 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }}
        />
      </div>
    </div>
  );
}

export function qualityStatus(q: number): string {
  if (q >= 90) return "Standard Mahligai";
  if (q >= 75) return "Kualiti Baik";
  if (q >= 50) return "Perlu Diperiksa";
  if (q >= 25) return "Risiko Struktur";
  return "Kerja Tidak Selamat";
}

// ---------- Modal ----------
export function Modal({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  title?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-5"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="bg-offwhite rounded-3xl w-full max-w-sm p-5 shadow-2xl max-h-[85%] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 className="text-lg font-extrabold text-charcoal mb-3">{title}</h2>}
        {children}
      </div>
    </div>
  );
}

// ---------- Project Signboard ----------
export function Signboard({ compact = false }: { compact?: boolean }) {
  return (
    <div className="bg-white border-4 border-mahligai rounded-lg p-3 text-center shadow-md">
      <BrandLogo className="h-8 mx-auto mb-1" />
      <p className="text-[11px] font-extrabold text-mahligai leading-tight">{signboardText.title}</p>
      {!compact && (
        <>
          <p className="text-[10px] text-charcoal mt-1">
            {signboardText.ownerLabel} <strong>{signboardText.owner}</strong>
          </p>
          <p className="text-[10px] text-charcoal">
            {signboardText.contractorLabel} <strong>{signboardText.contractor}</strong>
          </p>
        </>
      )}
      <p className="text-[9px] text-gold font-bold mt-1">{signboardText.tagline}</p>
    </div>
  );
}

// ---------- Abang Site (Site Supervisor) ----------
export function AbangSiteAvatar({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      {/* helmet */}
      <path d="M10 20 a14 12 0 0 1 28 0 z" fill="#f2c522" stroke="#b8940e" strokeWidth="1.5" />
      <rect x="8" y="19" width="32" height="4" rx="2" fill="#d9a521" />
      <rect x="20" y="9" width="8" height="4" rx="2" fill="#d9a521" />
      {/* logo MI pada helmet */}
      <text x="24" y="18" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#ED1C24">
        MI
      </text>
      {/* muka */}
      <ellipse cx="24" cy="30" rx="11" ry="10" fill="#b97b4d" />
      <circle cx="20" cy="29" r="1.4" fill="#241a12" />
      <circle cx="28" cy="29" r="1.4" fill="#241a12" />
      <path d="M20 34 q4 3 8 0" stroke="#241a12" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {/* misai */}
      <path d="M20 32.5 q4 2 8 0" stroke="#3d2b1a" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* vest */}
      <path d="M12 46 q2 -8 12 -8 q10 0 12 8 z" fill="#e8762c" />
      <rect x="14" y="42" width="20" height="2.4" fill="#f5f2a3" />
    </svg>
  );
}

export function SupervisorBubble({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="flex items-end gap-2 pointer-events-none" aria-live="polite">
      <div className="shrink-0 anim-brickdrop">
        <AbangSiteAvatar size={46} />
      </div>
      <div className="bg-white/95 border border-charcoal/15 rounded-2xl rounded-bl-none px-3 py-2 shadow-lg max-w-[75%] anim-brickdrop">
        <p className="text-[10px] font-bold text-mahligai">ABANG SITE · Site Supervisor</p>
        <p className="text-xs text-charcoal leading-snug">{message}</p>
      </div>
    </div>
  );
}

// ---------- Toast ----------
export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[60] bg-charcoal text-white text-sm font-bold px-4 py-2.5 rounded-full shadow-xl anim-brickdrop">
      {message}
    </div>
  );
}

// ---------- Header skrin (gaya sticker game) ----------
export function ScreenHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="px-4 pt-4 pb-3">
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            sfx.button();
            onBack();
          }}
          aria-label="Kembali"
          className="w-11 h-11 rounded-2xl bg-white shadow-[0_4px_0_rgba(32,32,32,0.12)] flex items-center justify-center text-charcoal font-bold text-lg active:translate-y-[3px] active:shadow-none transition-all"
        >
          ←
        </button>
        <div>
          <h1 className="text-xl font-semibold font-display text-charcoal drop-shadow-sm leading-none">{title}</h1>
          <div className="hazard-strip w-24 mt-1.5" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

// ---------- Stamp kelulusan ----------
export function QualityStamp({ status }: { status: "approved" | "inspection" | "rectify" }) {
  const map = {
    approved: { text: "MAHLIGAI QUALITY APPROVED", color: "#1e8449", icon: "✓" },
    inspection: { text: "INSPECTION REQUIRED", color: "#b9770e", icon: "!" },
    rectify: { text: "RECTIFICATION NEEDED", color: "#a6191e", icon: "✗" },
  } as const;
  const m = map[status];
  return (
    <div
      className="mx-auto rounded-full border-4 w-36 h-36 flex flex-col items-center justify-center text-center rotate-[-8deg] shadow"
      style={{ borderColor: m.color, color: m.color }}
      role="img"
      aria-label={m.text}
    >
      <span className="text-3xl font-black">{m.icon}</span>
      <span className="text-[10px] font-extrabold leading-tight px-3">{m.text}</span>
      <span className="text-[9px] font-bold mt-1">{mahligaiBrand.shortName}</span>
      <span className="text-[9px]">{new Date().toLocaleDateString("ms-MY")}</span>
    </div>
  );
}
