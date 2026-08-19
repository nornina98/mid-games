import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import { BigButton, Modal, ScreenHeader } from "../components/common";
import { setAudioPrefs } from "../utils/audio";
import { setHapticsEnabled } from "../utils/haptics";
import { mahligaiBrand } from "../config/brand";

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      aria-label={label}
      onClick={() => onChange(!value)}
      className="w-full flex items-center justify-between game-card px-4 py-3 min-h-[52px] active:scale-[0.99]"
    >
      <span className="text-sm font-bold text-charcoal">{label}</span>
      <span
        className={`w-12 h-7 rounded-full p-1 transition ${value ? "bg-green-600" : "bg-charcoal/20"}`}
        aria-hidden="true"
      >
        <span className={`block w-5 h-5 bg-white rounded-full transition-transform ${value ? "translate-x-5" : ""}`} />
      </span>
    </button>
  );
}

export function Settings() {
  const s = useGameStore();
  const [resetStep, setResetStep] = useState(0);
  const [playerResetStep, setPlayerResetStep] = useState(0);

  const upd = (k: keyof typeof s.settings, v: boolean) => {
    s.updateSettings({ [k]: v });
    const next = { ...s.settings, [k]: v };
    setAudioPrefs({ sfx: next.sfx, music: next.music });
    setHapticsEnabled(next.vibration);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-8 page-sky">
      <ScreenHeader title="Settings" onBack={() => s.setScreen("menu")} />
      <div className="px-4 flex flex-col gap-2">
        <ToggleRow label="🎵 Muzik" value={s.settings.music} onChange={(v) => upd("music", v)} />
        <ToggleRow label="🔊 Sound Effect" value={s.settings.sfx} onChange={(v) => upd("sfx", v)} />
        <ToggleRow label="📳 Getaran (Vibration)" value={s.settings.vibration} onChange={(v) => upd("vibration", v)} />
        <ToggleRow label="🌀 Reduced Motion" value={s.settings.reducedMotion} onChange={(v) => upd("reducedMotion", v)} />

        <div className="mt-4 flex flex-col gap-2">
          <BigButton variant="secondary" onClick={() => setPlayerResetStep(1)}>
            🧹 Reset Data Pemain ({s.playerName || "—"})
          </BigButton>
          <BigButton variant="danger" onClick={() => setResetStep(1)}>
            ⚠️ Reset Semua (Tetapan Kilang)
          </BigButton>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 mt-4 text-center">
          <p className="text-sm font-black text-charcoal">{mahligaiBrand.gameName}</p>
          <p className="text-[11px] text-cement mt-1">Versi 1.0.0 · {mahligaiBrand.legalName}</p>
          <p className="text-[10px] text-cement mt-2">
            Notis Privasi: Semua data permainan (nama, skor, progress) disimpan hanya pada peranti anda melalui
            localStorage. Tiada data dihantar ke mana-mana pelayan.
          </p>
        </div>
      </div>

      {/* RESET DATA PEMAIN — 2 langkah */}
      <Modal open={playerResetStep === 1} title="Reset Data Pemain?" onClose={() => setPlayerResetStep(0)}>
        <p className="text-sm text-charcoal mb-2">Tindakan ini akan memadam:</p>
        <ul className="text-sm text-charcoal mb-3 flex flex-col gap-1">
          <li>• Nama pemain semasa ({s.playerName})</li>
          <li>• High score</li>
          <li>• Rekod setiap level (Teres, Semi-D, Banglo, Premium)</li>
          <li>• Statistik permainan</li>
        </ul>
        <p className="text-xs font-bold text-mahligai mb-3">
          Tindakan ini tidak boleh dibatalkan. Pemain lain tidak terjejas.
        </p>
        <div className="flex flex-col gap-2">
          <BigButton variant="danger" onClick={() => setPlayerResetStep(2)}>
            RESET
          </BigButton>
          <BigButton variant="ghost" onClick={() => setPlayerResetStep(0)}>
            BATAL
          </BigButton>
        </div>
      </Modal>
      <Modal open={playerResetStep === 2} title="Pengesahan Terakhir">
        <p className="text-sm text-charcoal mb-3">
          Anda pasti mahu memadam semua data pemain <strong>{s.playerName}</strong>?
        </p>
        <div className="flex flex-col gap-2">
          <BigButton
            variant="danger"
            onClick={() => {
              setPlayerResetStep(0);
              s.resetPlayerData();
            }}
          >
            Ya, Padam Data Pemain
          </BigButton>
          <BigButton variant="ghost" onClick={() => setPlayerResetStep(0)}>
            BATAL
          </BigButton>
        </div>
      </Modal>

      <Modal open={resetStep === 1} title="Reset Semua?" onClose={() => setResetStep(0)}>
        <p className="text-sm text-charcoal mb-3">
          Semua progress, skor, badge dan MI Coin akan dipadam. Tindakan ini tidak boleh diundur.
        </p>
        <div className="flex flex-col gap-2">
          <BigButton variant="danger" onClick={() => setResetStep(2)}>
            Teruskan
          </BigButton>
          <BigButton variant="ghost" onClick={() => setResetStep(0)}>
            Batal
          </BigButton>
        </div>
      </Modal>
      <Modal open={resetStep === 2} title="Pengesahan Terakhir">
        <p className="text-sm text-charcoal mb-3">Anda benar-benar pasti? Semua data akan hilang serta-merta.</p>
        <div className="flex flex-col gap-2">
          <BigButton
            variant="danger"
            onClick={() => {
              setResetStep(0);
              s.resetProgress();
            }}
          >
            Ya, Padam Semua
          </BigButton>
          <BigButton variant="ghost" onClick={() => setResetStep(0)}>
            Batal
          </BigButton>
        </div>
      </Modal>
    </div>
  );
}
