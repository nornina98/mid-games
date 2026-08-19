// Icon vector custom untuk setiap jenis rumah (bukan emoji)
import type { DifficultyId } from "../../data/difficulty";

function Base({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 64 48" className={className} fill="none" aria-hidden="true">
      {children}
    </svg>
  );
}

// Rumah Teres — deretan rumah kecil bersambung
export function TerraceIcon({ className }: { className?: string }) {
  return (
    <Base className={className}>
      <rect x="4" y="22" width="18" height="20" fill="currentColor" opacity="0.85" rx="1" />
      <rect x="23" y="22" width="18" height="20" fill="currentColor" rx="1" />
      <rect x="42" y="22" width="18" height="20" fill="currentColor" opacity="0.85" rx="1" />
      <polygon points="3,23 13,12 23,23" fill="currentColor" />
      <polygon points="22,23 32,12 42,23" fill="currentColor" />
      <polygon points="41,23 51,12 61,23" fill="currentColor" />
      <rect x="10" y="30" width="6" height="12" fill="#fff" opacity="0.9" rx="1" />
      <rect x="29" y="30" width="6" height="12" fill="#fff" opacity="0.9" rx="1" />
      <rect x="48" y="30" width="6" height="12" fill="#fff" opacity="0.9" rx="1" />
    </Base>
  );
}

// Semi-D — dua rumah berkembar
export function SemiDIcon({ className }: { className?: string }) {
  return (
    <Base className={className}>
      <rect x="8" y="20" width="24" height="22" fill="currentColor" rx="1" />
      <rect x="32" y="20" width="24" height="22" fill="currentColor" opacity="0.8" rx="1" />
      <polygon points="6,21 20,8 34,21" fill="currentColor" />
      <polygon points="30,21 44,8 58,21" fill="currentColor" opacity="0.9" />
      <rect x="14" y="28" width="7" height="14" fill="#fff" opacity="0.9" rx="1" />
      <rect x="43" y="28" width="7" height="14" fill="#fff" opacity="0.9" rx="1" />
      <rect x="24" y="26" width="6" height="6" fill="#fff" opacity="0.75" rx="1" />
      <rect x="34" y="26" width="6" height="6" fill="#fff" opacity="0.75" rx="1" />
    </Base>
  );
}

// Banglo — rumah dua tingkat
export function BungalowIcon({ className }: { className?: string }) {
  return (
    <Base className={className}>
      <rect x="12" y="14" width="40" height="28" fill="currentColor" rx="2" />
      <polygon points="8,15 32,2 56,15" fill="currentColor" />
      <rect x="18" y="20" width="8" height="7" fill="#fff" opacity="0.9" rx="1" />
      <rect x="38" y="20" width="8" height="7" fill="#fff" opacity="0.9" rx="1" />
      <rect x="18" y="32" width="8" height="7" fill="#fff" opacity="0.75" rx="1" />
      <rect x="28" y="30" width="8" height="12" fill="#fff" opacity="0.9" rx="1" />
      <rect x="38" y="32" width="8" height="7" fill="#fff" opacity="0.75" rx="1" />
      <rect x="4" y="42" width="56" height="3" fill="currentColor" opacity="0.5" rx="1.5" />
    </Base>
  );
}

// Banglo Premium — rumah besar dengan bintang
export function PremiumIcon({ className }: { className?: string }) {
  return (
    <Base className={className}>
      <rect x="6" y="18" width="52" height="24" fill="currentColor" rx="2" />
      <polygon points="2,19 32,4 62,19" fill="currentColor" />
      <rect x="12" y="24" width="9" height="8" fill="#fff" opacity="0.9" rx="1" />
      <rect x="27" y="26" width="10" height="16" fill="#fff" opacity="0.9" rx="1" />
      <rect x="43" y="24" width="9" height="8" fill="#fff" opacity="0.9" rx="1" />
      <rect x="12" y="35" width="9" height="7" fill="#fff" opacity="0.7" rx="1" />
      <rect x="43" y="35" width="9" height="7" fill="#fff" opacity="0.7" rx="1" />
      {/* bintang premium */}
      <path
        d="M32 0 l1.9 3.9 4.3 0.6 -3.1 3 0.7 4.3 -3.8 -2 -3.8 2 0.7 -4.3 -3.1 -3 4.3 -0.6 z"
        fill="#D2A84A"
        transform="translate(16,-1) scale(0.9)"
      />
      <rect x="2" y="43" width="60" height="3" fill="#D2A84A" opacity="0.8" rx="1.5" />
    </Base>
  );
}

export function HouseIcon({ id, className }: { id: DifficultyId; className?: string }) {
  switch (id) {
    case "terrace":
      return <TerraceIcon className={className} />;
    case "semiD":
      return <SemiDIcon className={className} />;
    case "bungalow":
      return <BungalowIcon className={className} />;
    case "premiumBungalow":
      return <PremiumIcon className={className} />;
  }
}
