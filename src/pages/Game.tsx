import { useEffect, useRef, useState, useCallback } from "react";
import { BrickStackEngine } from "../game/engine";
import type { HudState, PowerUpId, RunStats } from "../game/types";
import { useGameStore } from "../store/gameStore";
import { stages } from "../data/stages";
import { powerUps, cosmetics } from "../data/cosmetics";
import { difficultyConfig } from "../data/difficulty";
import { BigButton, Modal, SupervisorBubble, AbangSiteAvatar, qualityStatus, BrandLogo } from "../components/common";
import { mahligaiBrand } from "../config/brand";
import { sfx, startMusic, stopMusic } from "../utils/audio";

const TUTORIAL_STEPS = [
  "Tap skrin untuk menjatuhkan bata.",
  "Pastikan bata bertindih dengan bata sebelumnya.",
  "Placement tepat meningkatkan Mahligai Quality.",
  "Placement lemah menyebabkan struktur tidak stabil.",
  "Lengkapkan objektif untuk menyiapkan projek banglo.",
];

export function Game() {
  const store = useGameStore();
  const stage = store.pendingMode === "stage" ? stages.find((s) => s.id === store.pendingStageId) : undefined;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<BrickStackEngine | null>(null);
  const [hud, setHud] = useState<HudState | null>(null);
  const [intro, setIntro] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(store.tutorialDone ? -1 : 0);
  const [paused, setPaused] = useState(false);
  const [quitConfirm, setQuitConfirm] = useState(false);
  const [supMsg, setSupMsg] = useState<string | null>(null);
  const supTimer = useRef<number | null>(null);
  const [inventory, setInventory] = useState(store.powerUpInventory);
  const [count, setCount] = useState<string | null>(null); // countdown 3-2-1-BUILD!
  const startedRef = useRef(false);

  const diff = store.pendingMode !== "stage" ? difficultyConfig[store.selectedDifficulty] : undefined;
  const bestScore =
    store.pendingMode === "stage"
      ? (store.stageResults[store.pendingStageId]?.bestScore ?? 0)
      : (store.players[store.activePlayer]?.levels[store.selectedDifficulty]?.bestScore ?? 0);

  const showSup = useCallback((msg: string) => {
    setSupMsg(msg);
    if (supTimer.current) clearTimeout(supTimer.current);
    supTimer.current = window.setTimeout(() => setSupMsg(null), 3200);
  }, []);

  // mulakan engine selepas intro & tutorial selesai
  const beginPlay = useCallback(() => {
    if (startedRef.current || !canvasRef.current) return;
    startedRef.current = true;
    const st = useGameStore.getState();
    const skin = cosmetics.find((c) => c.id === st.equipped.brickSkin)?.color;
    const inv = { ...st.powerUpInventory };
    const engine = new BrickStackEngine(canvasRef.current, {
      mode: st.pendingMode,
      stage,
      difficulty: st.pendingMode !== "stage" ? difficultyConfig[st.selectedDifficulty] : undefined,
      brickSkinColor: skin,
      backgroundId: st.equipped.background,
      reducedMotion: st.settings.reducedMotion,
      powerUpInventory: inv,
      onHud: setHud,
      onPowerUpConsumed: (id) => {
        useGameStore.getState().consumePowerUp(id);
        setInventory({ ...inv });
      },
      onEvent: (e) => {
        if (e.type === "supervisor" && e.message) showSup(e.message);
        if (e.type === "gameover" && e.stats) {
          stopMusic();
          useGameStore.getState().finishRun(e.stats);
        }
      },
    });
    engineRef.current = engine;
    engine.start();
    setCount("3"); // countdown sebelum mula
  }, [stage, showSup]);

  // jujukan countdown 3 → 2 → 1 → BUILD!
  useEffect(() => {
    if (count === null) return;
    const seq = ["3", "2", "1", "BUILD!"];
    const idx = seq.indexOf(count);
    if (count !== "BUILD!") sfx.button();
    else {
      sfx.approved();
      if (useGameStore.getState().settings.music) startMusic();
    }
    const t = setTimeout(
      () => setCount(idx < seq.length - 1 ? seq[idx + 1] : null),
      count === "BUILD!" ? 550 : 720,
    );
    return () => clearTimeout(t);
  }, [count]);

  useEffect(() => {
    const t = setTimeout(() => setIntro(false), 2600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!intro && tutorialStep < 0) beginPlay();
  }, [intro, tutorialStep, beginPlay]);

  useEffect(() => {
    return () => {
      engineRef.current?.destroy();
      stopMusic();
      if (supTimer.current) clearTimeout(supTimer.current);
    };
  }, []);

  // papan kekunci: Space / Enter untuk drop
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        if (!paused && !intro && tutorialStep < 0 && count === null) engineRef.current?.tap();
      }
      if (e.code === "Escape" && !intro) setPaused((p) => !p);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paused, intro, tutorialStep, count]);

  useEffect(() => {
    engineRef.current?.setPaused(paused || quitConfirm || count !== null);
  }, [paused, quitConfirm, count]);

  const usePU = (id: PowerUpId) => {
    const ok = engineRef.current?.usePowerUp(id);
    if (ok) sfx.button();
  };

  const q = hud?.quality ?? 100;
  const stab = hud?.stability ?? 100;

  return (
    <div className="flex-1 relative bg-charcoal game-touch flex flex-col" style={{ minHeight: 0 }}>
      {/* kanvas gameplay */}
      <div
        className="absolute inset-0"
        onPointerDown={(e) => {
          e.preventDefault();
          if (!paused && !intro && tutorialStep < 0 && !quitConfirm && count === null) engineRef.current?.tap();
        }}
      >
        <canvas ref={canvasRef} className="block w-full h-full" aria-label="Kawasan permainan susun bata" />
      </div>

      {/* HUD atas — susun atur mobile game: logo kiri, skor tengah, best/pause kanan */}
      <div className="relative z-10 px-3 pt-2 pointer-events-none">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1 items-start">
            <div className="backdrop-blur-md bg-black/35 border border-white/10 rounded-2xl px-2.5 py-1.5 shadow-lg">
              <BrandLogo white className="h-7" />
            </div>
            {(hud?.windLevel ?? 0) > 0 && (
              <div
                className="backdrop-blur-md bg-black/35 border border-white/10 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white"
                aria-label={`Angin tahap ${hud!.windLevel}`}
              >
                💨 {hud!.windDir > 0 ? "→" : "←"} {"|".repeat(hud!.windLevel)}
              </div>
            )}
          </div>

          <div className="backdrop-blur-md bg-black/35 border border-white/10 rounded-2xl px-5 py-1.5 text-center text-white shadow-lg">
            <p className="text-[9px] font-bold text-white/60 tracking-widest">SCORE</p>
            <p key={hud?.score ?? 0} className="text-2xl font-black leading-none font-display anim-scorepop">
              {hud?.score ?? 0}
            </p>
            {(hud?.combo ?? 0) >= 2 && (
              <p className="text-[11px] font-black text-gold anim-pulse-soft">🔥 COMBO x{hud!.combo}</p>
            )}
            <p className="text-[9px] font-bold text-white/60">{(hud?.height ?? 0).toFixed(1)} m</p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <button
              onClick={() => setPaused(true)}
              aria-label="Pause"
              className="pointer-events-auto w-11 h-11 rounded-full backdrop-blur-md bg-black/35 border border-white/10 text-white font-black text-lg flex items-center justify-center active:scale-95 shadow-lg"
            >
              ⏸
            </button>
            <div className="backdrop-blur-md bg-black/35 border border-white/10 rounded-full px-2.5 py-1 text-[10px] font-black text-gold shadow-lg">
              🏆 {bestScore.toLocaleString()}
            </div>
            {hud?.timeLeft !== null && hud?.timeLeft !== undefined && (
              <div
                className={`rounded-full px-3 py-0.5 text-xs font-black shadow-lg ${
                  hud.timeLeft <= 10 ? "bg-mahligai text-white anim-pulse-soft" : "backdrop-blur-md bg-black/35 border border-white/10 text-white"
                }`}
              >
                ⏱ {hud.timeLeft}s
              </div>
            )}
          </div>
        </div>

        {/* HUD kompak satu strip — tidak menghalang zon bata atas */}
        <div className="mt-1.5 backdrop-blur-md bg-black/35 border border-white/10 rounded-xl px-2.5 py-1.5 flex flex-col gap-1 shadow-lg">
          <div className="flex items-center gap-2 text-[9px] font-black text-white/90">
            <span className="truncate max-w-[90px]">{store.playerName.toUpperCase()}</span>
            <span className="text-gold truncate">{diff ? diff.name.toUpperCase() : `STAGE ${stage?.id ?? ""}`}</span>
            <span className="ml-auto font-bold text-white/85">
              {hud?.objectiveText ?? (diff ? `Tingkat 0 / ${diff.targetFloors}` : (stage?.objective.label ?? ""))}
            </span>
            <span aria-label={`Nyawa ${hud?.lives ?? 3}`}>❤️{hud?.lives ?? 3}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] font-black text-white/60" title="Mahligai Quality">
              Q
            </span>
            <div
              className="h-1.5 flex-1 rounded-full bg-white/20"
              role="meter"
              aria-valuenow={q}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Mahligai Quality ${q}%: ${qualityStatus(q)}`}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${q}%`, background: q >= 75 ? "#2ecc71" : q >= 50 ? "#f2c522" : "#e74c3c" }}
              />
            </div>
            <span className="text-[8px] font-bold text-white/85 w-7 text-right">{q}%</span>
            <span className="text-[8px] font-black text-white/60 ml-1" title="Stability">
              S{stab <= 25 ? "⚠️" : ""}
            </span>
            <div
              className="h-1.5 flex-1 rounded-full bg-white/20"
              role="meter"
              aria-valuenow={stab}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Stability ${stab}%`}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${stab}%`, background: stab >= 50 ? "#3f9df0" : stab >= 25 ? "#f2c522" : "#e74c3c" }}
              />
            </div>
            <span className="text-[8px] font-bold text-white/85 w-7 text-right">{stab}%</span>
          </div>
          {diff && (
            <div
              className="h-1.5 rounded-full bg-white/15 overflow-hidden"
              role="progressbar"
              aria-valuenow={Math.round((hud?.objectiveProgress ?? 0) * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Kemajuan tingkat"
            >
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.round((hud?.objectiveProgress ?? 0) * 100)}%`, background: diff.accent }}
              />
            </div>
          )}
        </div>

        {/* Mesej Abang Site — strip nipis dalam zon HUD, tidak menutup kawasan gameplay */}
        {supMsg && (
          <div
            className="mt-1.5 max-w-[300px] flex items-center gap-1.5 bg-black/50 rounded-full pl-1 pr-3 py-1 anim-brickdrop"
            aria-live="polite"
          >
            <span className="shrink-0 bg-white/90 rounded-full p-0.5 flex">
              <AbangSiteAvatar size={22} />
            </span>
            <p className="text-[10px] font-bold text-gold leading-tight">
              <span className="text-white/60">Abang Site:</span> {supMsg}
            </p>
          </div>
        )}
      </div>

      {/* power-up bar */}
      <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-2 px-4">
        {powerUps.map((p) => {
          const count = inventory[p.id] ?? 0;
          const active = hud?.activePowerUps.includes(p.id);
          return (
            <button
              key={p.id}
              disabled={count <= 0 && !active}
              onClick={(e) => {
                e.stopPropagation();
                usePU(p.id);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label={`${p.name}: ${count} unit`}
              className={`pointer-events-auto w-12 h-12 rounded-full flex flex-col items-center justify-center text-lg shadow-lg active:scale-95 ${
                active ? "bg-gold text-charcoal" : count > 0 ? "bg-white/90 text-charcoal" : "bg-white/25 text-white/40"
              }`}
            >
              <span aria-hidden="true">{p.icon}</span>
              <span className="text-[9px] font-black leading-none">{count}</span>
            </button>
          );
        })}
      </div>

      {/* COUNTDOWN 3-2-1-BUILD! */}
      {count !== null && !intro && tutorialStep < 0 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <p
            key={count}
            className={`anim-countpop font-display font-black drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] ${
              count === "BUILD!" ? "text-6xl text-gold" : "text-8xl text-white"
            }`}
          >
            {count}
          </p>
        </div>
      )}

      {/* STAGE INTRO CARD */}
      {intro && (
        <button
          className="absolute inset-0 z-30 bg-charcoal/95 flex flex-col items-center justify-center px-8 text-center gap-2"
          onClick={() => setIntro(false)}
          aria-label="Tap untuk teruskan"
        >
          <BrandLogo white className="h-10 mb-2" />
          <p className="text-[11px] tracking-[0.25em] text-white/60 font-bold">PROJEK MAHLIGAI IDAMAN</p>
          {stage ? (
            <>
              <p className="text-gold font-black text-sm">STAGE {stage.id}</p>
              <h2 className="text-2xl font-black text-white uppercase">{stage.title}</h2>
              <p className="text-xs text-white/70">
                Fasa: <strong>{stage.phase}</strong>
              </p>
              <div className="bg-white/10 rounded-xl px-4 py-3 mt-2">
                <p className="text-sm font-bold text-white">🎯 {stage.objective.label}</p>
                <p className="text-xs text-gold mt-1">⭐ Bonus: {stage.bonus.label}</p>
                {stage.disturbances.length > 0 && (
                  <p className="text-[11px] text-white/60 mt-1">
                    Gangguan: {stage.disturbances.join(", ").replace(/-/g, " ")}
                  </p>
                )}
              </div>
            </>
          ) : diff ? (
            <>
              <p className="text-gold font-black text-sm">CABARAN</p>
              <h2 className="text-2xl font-semibold font-display text-white uppercase">{diff.name}</h2>
              <p className="text-xs text-white/70">{diff.subLabel}</p>
              <div className="bg-white/10 rounded-xl px-4 py-3 mt-2">
                <p className="text-sm font-bold text-white">🎯 Target: {diff.targetFloors} Tingkat</p>
                <p className="text-xs text-gold mt-1">Score multiplier x{diff.scoreMultiplier}</p>
                <p className="text-[11px] text-white/60 mt-1">{diff.desc}</p>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-black text-white">MOD BEBAS</h2>
              <p className="text-sm text-white/80">{mahligaiBrand.gameTagline}</p>
              <p className="text-xs text-white/60">Susun setinggi mungkin. 3 kali miss = tamat!</p>
            </>
          )}
          <p className="text-[11px] text-white/50 mt-4 anim-pulse-soft">Tap untuk teruskan</p>
        </button>
      )}

      {/* TUTORIAL */}
      {!intro && tutorialStep >= 0 && (
        <div className="absolute inset-0 z-30 bg-black/70 flex flex-col items-center justify-center px-8 gap-4">
          <SupervisorBubble message={TUTORIAL_STEPS[tutorialStep]} />
          <p className="text-white/70 text-xs font-bold">
            Langkah {tutorialStep + 1}/{TUTORIAL_STEPS.length}
          </p>
          <div className="w-full max-w-xs flex flex-col gap-2">
            {tutorialStep < TUTORIAL_STEPS.length - 1 ? (
              <BigButton onClick={() => setTutorialStep(tutorialStep + 1)}>Faham</BigButton>
            ) : (
              <BigButton onClick={() => setTutorialStep(-1)}>Cuba Sekarang</BigButton>
            )}
            <BigButton variant="ghost" onClick={() => setTutorialStep(-1)}>
              Skip Tutorial
            </BigButton>
          </div>
        </div>
      )}

      {/* PAUSE MENU */}
      <Modal open={paused && !quitConfirm} title="Pause" onClose={() => setPaused(false)}>
        <div className="flex flex-col gap-2">
          <BigButton onClick={() => setPaused(false)}>Resume</BigButton>
          <BigButton
            variant="secondary"
            onClick={() => {
              const st = useGameStore.getState();
              st.startGame(st.pendingMode, st.pendingStageId, st.selectedPowerUps);
              engineRef.current?.destroy();
              startedRef.current = false;
              setPaused(false);
              setHud(null);
              setIntro(true);
              setTimeout(() => setIntro(false), 1200);
            }}
          >
            Restart
          </BigButton>
          <BigButton variant="ghost" onClick={() => setQuitConfirm(true)}>
            Quit ke Menu
          </BigButton>
        </div>
      </Modal>

      <Modal open={quitConfirm} title="Keluar dari permainan?">
        <p className="text-sm text-charcoal mb-3">Progress permainan semasa akan hilang. Teruskan?</p>
        <div className="flex flex-col gap-2">
          <BigButton
            variant="danger"
            onClick={() => {
              stopMusic();
              store.setScreen("menu");
            }}
          >
            Ya, Keluar
          </BigButton>
          <BigButton variant="ghost" onClick={() => setQuitConfirm(false)}>
            Batal
          </BigButton>
        </div>
      </Modal>
    </div>
  );
}
