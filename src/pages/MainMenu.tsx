import { useState } from "react";
import { BigButton, BrandLogo, Signboard, Modal, Toast } from "../components/common";
import { BungalowSvg } from "../components/common/Bungalow";
import { HouseIcon } from "../components/common/HouseIcons";
import { useGameStore } from "../store/gameStore";
import { mahligaiBrand } from "../config/brand";
import { avatars, levelForXp } from "../data/cosmetics";
import { difficultyConfig, difficultyOrder, type DifficultyId } from "../data/difficulty";
import { challengeForDate, todayKey } from "../data/challenges";
import { stages } from "../data/stages";
import { badges } from "../data/badges";
import { sfx } from "../utils/audio";

function DifficultyCard({ id, selected, onSelect }: { id: DifficultyId; selected: boolean; onSelect: () => void }) {
  const d = difficultyConfig[id];
  const rec = useGameStore((s) => s.players[s.activePlayer]?.levels[id]);
  return (
    <button
      onClick={() => {
        sfx.button();
        onSelect();
      }}
      aria-pressed={selected}
      aria-label={`${d.name}: ${d.subLabel}. Target ${d.targetFloors} tingkat. ${selected ? "Dipilih" : ""}`}
      className={`relative text-left game-card p-3 transition-all active:scale-[0.97] ${
        selected ? "ring-4 scale-[1.02]" : "opacity-90"
      }`}
      style={selected ? ({ ["--tw-ring-color" as string]: d.accent } as React.CSSProperties) : undefined}
    >
      {selected && (
        <span
          className="absolute -top-2 -right-2 w-7 h-7 rounded-full text-white text-sm font-black flex items-center justify-center shadow-md anim-brickdrop"
          style={{ background: d.accent }}
          aria-hidden="true"
        >
          ✓
        </span>
      )}
      <div className="flex items-center gap-2">
        <HouseIcon id={id} className="w-12 h-9 shrink-0" />
        <div className="min-w-0">
          <p className="font-display font-semibold text-charcoal text-sm leading-tight">{d.name}</p>
          <p className="text-[9px] font-bold" style={{ color: d.accent }}>
            {d.subLabel}
          </p>
        </div>
      </div>
      <p className="text-[10px] text-cement leading-snug mt-1.5 min-h-[26px]">{d.desc}</p>
      <div className="flex items-center justify-between mt-1.5">
        <p className="text-[10px] font-black text-charcoal">
          🎯 {d.targetFloors} Tingkat
        </p>
        <p className="text-[10px] font-black text-gold">x{d.scoreMultiplier}</p>
      </div>
      <div className="flex items-center justify-between mt-1">
        <div className="flex gap-1" aria-label={`Kesukaran ${d.dots} daripada 4`}>
          {[1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ background: i <= d.dots ? d.accent : "rgba(32,32,32,0.15)" }}
            />
          ))}
        </div>
        {rec && (
          <p className="text-[9px] font-bold text-cement">
            {rec.completed ? "✅ Siap" : `Terbaik: T${rec.highestFloor}`}
          </p>
        )}
      </div>
    </button>
  );
}

export function MainMenu() {
  const s = useGameStore();
  const lvl = levelForXp(s.xp);
  const avatarDef = avatars.find((a) => a.id === s.avatar) ?? avatars[0];
  const stagesDone = stages.filter((st) => (s.stageResults[st.id]?.stars ?? 0) >= 1).length;
  const progressPct = Math.round((stagesDone / 15) * 100);
  const daily = challengeForDate(todayKey());
  const latestBadge = s.earnedBadges.length ? badges.find((b) => b.id === s.earnedBadges[s.earnedBadges.length - 1]) : null;
  const selDiff = difficultyConfig[s.selectedDifficulty];

  const [changeOpen, setChangeOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [nameErr, setNameErr] = useState("");
  const [validationMsg, setValidationMsg] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const saveNewPlayer = () => {
    const n = newName.trim();
    if (n.length < 2) {
      setNameErr("Sila masukkan nama pemain (minimum 2 aksara).");
      return;
    }
    if (n.length > 16) {
      setNameErr("Nama maksimum 16 aksara.");
      return;
    }
    const existed = !!s.players[n.toLowerCase()];
    s.switchPlayer(n);
    setChangeOpen(false);
    setNewName("");
    setNameErr("");
    setToast(existed ? `Selamat kembali, ${n}! Rekod lama dimuatkan.` : `Pemain baharu: ${n}`);
    setTimeout(() => setToast(null), 2200);
  };

  const play = () => {
    if (!s.playerName.trim()) {
      setValidationMsg("Sila masukkan nama pemain.");
      setChangeOpen(true);
      return;
    }
    if (!s.selectedDifficulty) {
      setValidationMsg("Sila pilih jenis cabaran.");
      return;
    }
    setValidationMsg("");
    s.startGame("classic");
  };

  return (
    <div className="flex-1 overflow-y-auto pb-8 page-sky relative">
      <Toast message={toast} />
      {/* header jenama */}
      <div className="bg-charcoal text-white px-4 pt-4 pb-5 rounded-b-[2rem] shadow-xl relative overflow-hidden">
        <div className="hazard-strip absolute top-0 left-0 right-0 rounded-none" aria-hidden="true" />
        <BrandLogo white className="h-11 mx-auto mb-1 mt-1" />
        <p className="text-center text-gold font-semibold text-2xl leading-tight font-display drop-shadow">
          BRICK STACK CHALLENGE
        </p>
        <p className="text-center text-[10px] text-white/70">{mahligaiBrand.gameTagline}</p>
        <p className="text-center text-[9px] text-white/45 mb-3 tracking-widest uppercase">
          Presented by {mahligaiBrand.shortName}
        </p>

        {/* profil pemain semasa */}
        <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-3 border border-white/10">
          <span className="text-3xl" aria-hidden="true">
            {avatarDef.icon}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold text-white/50 uppercase tracking-wider">Pemain Semasa</p>
            <p className="font-display font-semibold text-lg truncate leading-tight">{s.playerName || "—"}</p>
            <p className="text-[10px] text-white/70">
              Level {lvl.level} · {lvl.name} · 🪙 {s.coins}
            </p>
          </div>
          <button
            onClick={() => {
              sfx.button();
              setNewName("");
              setChangeOpen(true);
            }}
            className="shrink-0 min-h-[44px] px-3 rounded-xl bg-white/15 border border-white/20 text-xs font-bold active:scale-95"
          >
            Tukar
            <br />
            Pemain
          </button>
        </div>
      </div>

      <div className="px-4 mt-4 flex flex-col gap-3">
        {/* PILIH CABARAN */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display font-semibold text-charcoal text-lg">Pilih Cabaran</h2>
            <p className="text-[10px] font-bold text-cement">{selDiff.recommend}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {difficultyOrder.map((id) => (
              <div key={id} style={{ color: difficultyConfig[id].accent }}>
                <DifficultyCard id={id} selected={s.selectedDifficulty === id} onSelect={() => s.setDifficulty(id)} />
              </div>
            ))}
          </div>
        </div>

        {validationMsg && (
          <p className="text-center text-xs font-bold text-mahligai bg-white rounded-xl py-2 shadow" role="alert">
            ⚠️ {validationMsg}
          </p>
        )}

        <div className="anim-pulseglow">
          <BigButton onClick={play} disabled={!s.playerName.trim()}>
            🧱 MULA MEMBINA — {selDiff.name} ({selDiff.targetFloors} Tingkat)
          </BigButton>
        </div>

        {/* mod projek 15 stage */}
        <div className="game-card p-3">
          <div className="flex items-center justify-between">
            <p className="font-display font-semibold text-charcoal text-sm">Mod Projek Banglo</p>
            <p className="text-[10px] font-bold text-cement">15 stage · {progressPct}% siap</p>
          </div>
          <button
            onClick={() => s.setScreen("project")}
            className="w-full rounded-2xl overflow-hidden mt-2 active:scale-[0.99] border border-charcoal/10"
            aria-label={`Projek banglo: kemajuan ${progressPct} peratus`}
          >
            <BungalowSvg stagesDone={stagesDone} facade={s.equipped.facade} className="w-full h-24" />
          </button>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <BigButton variant="secondary" onClick={() => s.startGame("stage", Math.min(s.unlockedStage, 15))}>
              Sambung Stage {Math.min(s.unlockedStage, 15)}
            </BigButton>
            <BigButton variant="ghost" onClick={() => s.setScreen("stageSelect")}>
              Pilih Stage
            </BigButton>
          </div>
        </div>

        {/* daily + badge */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => s.setScreen("daily")} className="game-card p-3 text-left active:scale-95 transition">
            <p className="text-[10px] font-black text-mahligai">📅 DAILY CHALLENGE {s.dailyDone ? "✅" : ""}</p>
            <p className="text-[11px] text-charcoal leading-snug mt-1">{daily.desc}</p>
          </button>
          <button onClick={() => s.setScreen("badges")} className="game-card p-3 text-left active:scale-95 transition">
            <p className="text-[10px] font-black text-mahligai">🎖 BADGE TERBARU</p>
            <p className="text-[11px] text-charcoal mt-1">
              {latestBadge ? `${latestBadge.icon} ${latestBadge.name}` : "Belum ada — mula bermain!"}
            </p>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <BigButton variant="ghost" onClick={() => s.setScreen("leaderboard")}>
            🏆 Leaderboard
          </BigButton>
          <BigButton variant="ghost" onClick={() => s.setScreen("shop")}>
            🛒 Kedai & Koleksi
          </BigButton>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <BigButton variant="ghost" onClick={() => s.setScreen("howto")}>
            ❓ Cara Main
          </BigButton>
          <BigButton variant="ghost" onClick={() => s.setScreen("settings")}>
            ⚙️ Settings
          </BigButton>
        </div>
        {s.certificateUnlocked && (
          <BigButton variant="gold" onClick={() => s.setScreen("certificate")}>
            🏅 Lihat Sijil Master Builder
          </BigButton>
        )}
        <BigButton variant="ghost" onClick={() => s.setScreen("about")}>
          Tentang Mahligai Idaman
        </BigButton>

        <Signboard />
        <p className="text-center text-[10px] text-cement">{mahligaiBrand.legalName}</p>
      </div>

      {/* MODAL TUKAR PEMAIN */}
      <Modal open={changeOpen} onClose={() => setChangeOpen(false)} title="Tukar Pemain">
        <p className="text-xs text-cement mb-2">
          Rekod pemain lama <strong>tidak akan dipadam</strong> — masukkan nama yang sama untuk kembali ke rekod anda.
        </p>
        <label htmlFor="newPlayerName" className="text-sm font-bold text-charcoal">
          Nama Pemain
        </label>
        <input
          id="newPlayerName"
          value={newName}
          maxLength={16}
          onChange={(e) => {
            setNewName(e.target.value);
            setNameErr("");
          }}
          onKeyDown={(e) => e.key === "Enter" && saveNewPlayer()}
          placeholder="Contoh: Syamim"
          className="mt-1 w-full rounded-2xl border-2 border-cement/40 bg-white px-4 py-3 text-base font-bold text-charcoal focus:border-mahligai"
        />
        {nameErr && (
          <p className="text-xs font-bold text-mahligai mt-1" role="alert">
            {nameErr}
          </p>
        )}
        {Object.keys(s.players).length > 0 && (
          <div className="mt-3">
            <p className="text-[10px] font-bold text-cement uppercase mb-1">Pemain sedia ada</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(s.players).map(([key, p]) => (
                <button
                  key={key}
                  onClick={() => setNewName(p.displayName)}
                  className="px-3 py-2 rounded-full bg-charcoal/5 text-xs font-bold text-charcoal active:scale-95 min-h-[36px]"
                >
                  {p.displayName}
                  {key === s.activePlayer ? " ✓" : ""}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2 mt-4">
          <BigButton onClick={saveNewPlayer}>SIMPAN</BigButton>
          <BigButton variant="ghost" onClick={() => setChangeOpen(false)}>
            BATAL
          </BigButton>
        </div>
      </Modal>
    </div>
  );
}
