// ============================================================
// BRICK STACK ENGINE — canvas 2D, physics ringan, 60 FPS
// Semua logik gameplay: movement, drop, overlap, cropping,
// grading, combo, quality, stability, collapse, cuaca, kamera.
// ============================================================
import type {
  DisturbanceId,
  EngineEvent,
  GameMode,
  HudState,
  PlacementGrade,
  PowerUpId,
  RunStats,
  StageDef,
  BrickTypeId,
} from "./types";
import { brickTypes } from "../data/bricks";
import type { DifficultyDef } from "../data/difficulty";
import { sfx } from "../utils/audio";
import { haptics } from "../utils/haptics";
import { mahligaiBrand, signboardText } from "../config/brand";

const BH = 34; // tinggi bata (px dunia)
const BASE_W = 190; // lebar bata asas
const MIN_W = 26; // lebar minimum (elak bug)
const METERS_PER_BRICK = 0.4;
const GRAVITY = 2400;

interface PlacedBrick {
  x: number; // kiri (px dunia)
  w: number;
  y: number; // bawah (px dunia, dari tanah ke atas)
  type: BrickTypeId;
  cracked: boolean;
}

interface Chip {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  type: BrickTypeId;
  life: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface FloatText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

export interface EngineOptions {
  mode: GameMode;
  stage?: StageDef;
  difficulty?: DifficultyDef; // untuk mod Cabaran (classic/daily)
  brickSkinColor?: string;
  backgroundId?: string;
  reducedMotion?: boolean;
  powerUpInventory: Record<PowerUpId, number>;
  onEvent: (e: EngineEvent) => void;
  onHud: (h: HudState) => void;
  onPowerUpConsumed: (id: PowerUpId) => void;
}

export class BrickStackEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private opts: EngineOptions;
  private raf = 0;
  private lastT = 0;
  private running = false;
  private destroyed = false;
  paused = false;

  // dunia
  private W = 480;
  private H = 800;
  private dpr = 1;
  private cameraY = 0; // y dunia di bahagian bawah viewport
  private camTarget = 0;

  private tower: PlacedBrick[] = [];
  private chips: Chip[] = [];
  private particles: Particle[] = [];
  private floats: FloatText[] = [];

  // bata bergerak
  private moving = { x: 0, w: BASE_W, dir: 1 as 1 | -1, type: "standard" as BrickTypeId, cracked: false };
  private dropping: { x: number; w: number; y: number; vy: number; type: BrickTypeId; cracked: boolean } | null = null;
  private speed = 150;
  private craneT = 0;

  // keadaan permainan
  private score = 0;
  private combo = 0;
  private perfectStreak = 0;
  private longestCombo = 0;
  private quality = 100;
  private stability = 100;
  private lives = 3;
  private stats: RunStats;
  private timeLeft: number | null = null;
  private elapsed = 0;
  private over = false;
  private collapseTimer = -1;
  private shake = 0;
  private swayPhase = 0;
  private towerShift = 0; // base-movement
  private baseTilt = 0; // tapak senget (radian visual + drift)
  private warned = false;

  // cuaca / gangguan
  private windLevel = 0; // 0..3
  private windDir: 1 | -1 = 1;
  private windT = 0;
  private rain = false;
  private crane = false;
  private randomSize = false;
  private crackedEvery = 0;
  private meterAwarded = 0;

  // power-ups
  private laserLeft = 0;
  private slowmoLeft = 0;
  private cementLeft = 0;
  private braceLeft = 0;
  private activePowerUps: PowerUpId[] = [];

  // visual polish (tidak mengubah gameplay)
  private flashA = 0; // white flash ketika perfect
  private themeVal = 0; // 0 pagi, 1 petang, 2 senja, 3 malam (dilerp perlahan)
  private ambientTimer = 0;

  // parameter cabaran (difficulty)
  private diff: DifficultyDef | null = null;
  private baseW = BASE_W;

  private hudTimer = 0;
  private supervisorCooldown = 0;

  constructor(canvas: HTMLCanvasElement, opts: EngineOptions) {
    this.canvas = canvas;
    this.opts = opts;
    this.ctx = canvas.getContext("2d")!;
    this.stats = this.blankStats();
    this.setupStage();
    this.resize();
    this.spawnMoving();
    window.addEventListener("resize", this.resize);
    document.addEventListener("visibilitychange", this.onVisibility);
  }

  private blankStats(): RunStats {
    return {
      mode: this.opts.mode,
      stageId: this.opts.stage?.id,
      difficultyId: this.opts.mode !== "stage" ? this.opts.difficulty?.id : undefined,
      score: 0,
      bricks: 0,
      height: 0,
      perfect: 0,
      great: 0,
      good: 0,
      risky: 0,
      miss: 0,
      longestCombo: 0,
      quality: 100,
      stability: 100,
      coinsEarned: 0,
      crackedUsed: 0,
      powerUpsUsed: 0,
      braceUsed: false,
      timeUsed: 0,
      collapsed: false,
      won: false,
      bonusDone: false,
      goldenBricks: 0,
    };
  }

  private setupStage() {
    const st = this.opts.stage;
    const dist: DisturbanceId[] = st?.disturbances ?? [];
    this.speed = st?.baseSpeed ?? 130;
    // mod Cabaran: guna parameter difficulty sebenar
    if (this.opts.mode !== "stage" && this.opts.difficulty) {
      this.diff = this.opts.difficulty;
      this.speed = 150 * this.diff.speedMultiplier;
      this.baseW = Math.round(BASE_W * this.diff.brickWidthMultiplier);
    }
    if (dist.includes("wind-light")) this.windLevel = 1;
    if (dist.includes("wind-medium")) this.windLevel = 2;
    if (dist.includes("wind-strong")) this.windLevel = 3;
    this.rain = dist.includes("rain");
    this.crane = dist.includes("crane-swing");
    this.randomSize = dist.includes("random-size");
    this.crackedEvery = dist.includes("cracked-bricks") ? 4 : 0;
    if (dist.includes("tilted-base")) this.baseTilt = 0.05;
    if (st?.timeLimit) this.timeLeft = st.timeLimit;
    // bata asas di tanah
    this.tower.push({ x: (this.W - this.baseW) / 2, w: this.baseW, y: 0, type: "cement", cracked: false });
  }

  // ---------- kitaran hayat ----------
  start() {
    if (this.running) return;
    this.running = true;
    this.lastT = performance.now();
    this.raf = requestAnimationFrame(this.loop);
    this.say("Tap skrin bila bata berada tepat di atas susunan sebelumnya.");
  }

  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.resize);
    document.removeEventListener("visibilitychange", this.onVisibility);
  }

  setPaused(p: boolean) {
    this.paused = p;
    if (!p) this.lastT = performance.now();
  }

  private onVisibility = () => {
    if (document.hidden) this.paused = true;
  };

  private resize = () => {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = 480;
    this.H = Math.max(640, (rect.height / rect.width) * 480);
    this.canvas.width = Math.round(this.W * this.dpr);
    this.canvas.height = Math.round(this.H * this.dpr);
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
  };

  // ---------- input ----------
  tap() {
    if (this.paused || this.over || this.dropping) return;
    sfx.drop();
    this.dropping = {
      x: this.moving.x,
      w: this.moving.w,
      y: this.topY() + BH + this.dropGap(),
      vy: 0,
      type: this.moving.type,
      cracked: this.moving.cracked,
    };
  }

  usePowerUp(id: PowerUpId): boolean {
    if (this.over || (this.opts.powerUpInventory[id] ?? 0) <= 0) return false;
    if (this.activePowerUps.length >= 2 && !this.activePowerUps.includes(id)) return false;
    this.opts.powerUpInventory[id]--;
    this.opts.onPowerUpConsumed(id);
    this.stats.powerUpsUsed++;
    switch (id) {
      case "laser":
        this.laserLeft = 3;
        break;
      case "slowmo":
        this.slowmoLeft = 5;
        break;
      case "cement":
        this.cementLeft = 2;
        break;
      case "brace":
        this.braceLeft = 8;
        this.stability = Math.min(100, this.stability + 25);
        this.stats.braceUsed = true;
        this.say("Tower Brace dipasang. Struktur dikukuhkan!");
        break;
    }
    this.refreshActive();
    return true;
  }

  private refreshActive() {
    this.activePowerUps = [];
    if (this.laserLeft > 0) this.activePowerUps.push("laser");
    if (this.slowmoLeft > 0) this.activePowerUps.push("slowmo");
    if (this.cementLeft > 0) this.activePowerUps.push("cement");
    if (this.braceLeft > 0) this.activePowerUps.push("brace");
  }

  // ---------- bantuan ----------
  private topBrick() {
    return this.tower[this.tower.length - 1];
  }
  private topY() {
    const t = this.topBrick();
    return t.y + BH;
  }
  private dropGap() {
    return 210;
  }
  private heightMeters() {
    return (this.tower.length - 1) * METERS_PER_BRICK;
  }

  private say(message: string) {
    if (this.supervisorCooldown > 0) return;
    this.supervisorCooldown = 3;
    this.opts.onEvent({ type: "supervisor", message });
  }

  private spawnMoving() {
    const n = this.tower.length; // termasuk asas
    let type: BrickTypeId = "standard";
    let cracked = false;
    if (this.perfectStreak >= 5) {
      type = "golden";
      sfx.golden();
      this.opts.onEvent({ type: "golden-brick" });
    } else if (this.crackedEvery && n % this.crackedEvery === 0) {
      type = "cracked";
      cracked = true;
    } else if (n % 13 === 0) type = "interlocking";
    else if (n % 7 === 0) type = "cement";
    else if (n % 5 === 0 && (this.opts.mode === "classic" || (this.opts.stage?.id ?? 0) > 6)) type = "lightweight";

    const def = brickTypes[type];
    const prevW = this.topBrick().w;
    let w = Math.min(prevW * def.widthMul, this.baseW * def.widthMul);
    if (this.randomSize) w *= 0.8 + Math.random() * 0.4;
    w = Math.max(MIN_W, Math.min(w, this.baseW * 1.25));
    this.moving = {
      x: Math.random() < 0.5 ? 10 : this.W - w - 10,
      w,
      dir: Math.random() < 0.5 ? 1 : -1,
      type,
      cracked,
    };
    this.craneT = 0;
  }

  private effSpeed() {
    let s = this.speed * (1 + this.tower.length * 0.018);
    if (this.opts.mode !== "stage") {
      // mod Cabaran: kelajuan meningkat progresif; lebih agresif untuk Banglo Premium
      const growth = this.diff && this.diff.speedMultiplier >= 1.6 ? 0.034 : 0.028;
      s = this.speed * (1 + this.tower.length * growth);
    }
    if (this.slowmoLeft > 0) s *= 0.45;
    return s;
  }

  // ---------- kemas kini ----------
  private loop = (t: number) => {
    if (this.destroyed) return;
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, (t - this.lastT) / 1000);
    this.lastT = t;
    if (this.paused) {
      this.render();
      return;
    }
    this.update(dt);
    this.render();
  };

  private update(dt: number) {
    this.elapsed += dt;
    if (this.supervisorCooldown > 0) this.supervisorCooldown -= dt;
    if (this.slowmoLeft > 0) this.slowmoLeft -= dt;
    if (this.braceLeft > 0) this.braceLeft -= dt;
    this.refreshActive();
    this.windT += dt;
    this.swayPhase += dt;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 30);
    if (this.flashA > 0) this.flashA = Math.max(0, this.flashA - dt * 1.4);

    // tema siang/malam: berubah setiap ~10 bata (pagi -> petang -> senja -> malam)
    let themeTarget = Math.min(3, Math.floor(this.stats.bricks / 10));
    if (this.opts.backgroundId === "bg-senja") themeTarget = Math.max(2, themeTarget);
    this.themeVal += (themeTarget - this.themeVal) * Math.min(1, dt * 0.6);

    // partikel ambient (habuk tapak) supaya dunia hidup
    this.ambientTimer -= dt;
    if (this.ambientTimer <= 0 && !this.opts.reducedMotion) {
      this.ambientTimer = 0.5;
      this.particles.push({
        x: Math.random() * this.W,
        y: Math.random() * this.H * 0.75,
        vx: 6 + Math.random() * 10,
        vy: 8 + Math.random() * 10,
        life: 2.4,
        maxLife: 2.4,
        color: "rgba(220,205,180,0.35)",
        size: 2.2 + Math.random() * 1.5,
      });
    }

    // timer stage
    if (this.timeLeft !== null && !this.over) {
      this.timeLeft -= dt;
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.endRun(false, false);
        return;
      }
    }

    // angin bertukar arah sekali-sekala
    if (this.windLevel > 0 && Math.floor(this.windT) % 8 === 0 && this.windT % 8 < dt) {
      this.windDir = Math.random() < 0.5 ? 1 : -1;
    }

    // angin mod Cabaran mengikut windStrength difficulty
    if (this.diff && this.opts.mode !== "stage") {
      const ws = this.diff.windStrength;
      const floors = this.stats.bricks;
      if (ws === 0) this.windLevel = 0;
      else if (ws <= 0.2) this.windLevel = floors >= 12 ? 1 : 0; // Semi-D: sangat ringan selepas tingkat 12
      else if (ws <= 0.4) this.windLevel = floors >= 10 ? (floors >= 25 ? 2 : 1) : 0; // Banglo: aktif selepas tingkat 10
      else this.windLevel = 1 + Math.round((Math.sin(this.elapsed * 0.25) + 1) * 0.9); // Premium: aktif & berubah-ubah (1-3)
    }

    // base movement (tapak tidak stabil)
    if (this.opts.stage?.disturbances.includes("base-movement")) {
      this.towerShift = Math.sin(this.elapsed * 0.9) * 10;
    }

    // stability decay dari angin ketika tidak stabil
    if (this.windLevel > 0 && this.stability < 50 && this.braceLeft <= 0) {
      this.stability = Math.max(0, this.stability - this.windLevel * dt * 0.8);
    }

    // amaran runtuh
    if (this.stability <= 25 && !this.warned && !this.over) {
      this.warned = true;
      sfx.warning();
      this.opts.onEvent({ type: "collapse-warning" });
      this.say("Bahaya! Struktur hampir runtuh. Guna Tower Brace jika ada!");
    }
    if (this.stability > 35) this.warned = false;

    if (this.stability <= 0 && !this.over && this.collapseTimer < 0) {
      this.startCollapse();
    }
    if (this.collapseTimer >= 0) {
      this.collapseTimer -= dt;
      if (this.collapseTimer <= 0) {
        this.endRun(false, true);
        return;
      }
    }

    // pergerakan bata
    if (!this.dropping && !this.over) {
      const sp = this.effSpeed();
      if (this.crane) {
        this.craneT += dt;
        const cx = this.W / 2 - this.moving.w / 2;
        const amp = (this.W - this.moving.w - 30) / 2;
        this.moving.x = cx + Math.sin(this.craneT * (sp / 110)) * amp;
      } else {
        this.moving.x += this.moving.dir * sp * dt;
        // wind drift pada bata bergerak
        if (this.windLevel > 0) {
          this.moving.x += this.windDir * this.windLevel * brickTypes[this.moving.type].windMul * 14 * dt;
        }
        if (this.moving.x <= 6) {
          this.moving.x = 6;
          this.moving.dir = 1;
        }
        if (this.moving.x + this.moving.w >= this.W - 6) {
          this.moving.x = this.W - 6 - this.moving.w;
          this.moving.dir = -1;
        }
      }
    }

    // bata sedang jatuh
    if (this.dropping) {
      const d = this.dropping;
      d.vy += GRAVITY * brickTypes[d.type].fallSpeedMul * dt;
      d.y -= d.vy * dt;
      const landY = this.topY();
      if (d.y <= landY) {
        d.y = landY;
        this.land();
      }
    }

    // serpihan physics
    for (const c of this.chips) {
      c.vy += GRAVITY * dt;
      c.x += c.vx * dt;
      c.y -= c.vy * dt;
      c.rot += c.vrot * dt;
      c.life -= dt;
    }
    this.chips = this.chips.filter((c) => c.life > 0 && c.y > this.cameraY - 200);

    // partikel
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const f of this.floats) f.life -= dt;
    this.floats = this.floats.filter((f) => f.life > 0);

    // hujan
    if (this.rain && !this.opts.reducedMotion) {
      for (let i = 0; i < 2; i++) {
        this.particles.push({
          x: Math.random() * this.W,
          y: this.cameraY + this.H + 10,
          vx: -30 - this.windLevel * 20,
          vy: -520,
          life: 1.4,
          maxLife: 1.4,
          color: "rgba(160,190,220,0.55)",
          size: 2,
        });
      }
    }

    // kamera
    const topScreenTarget = this.H * 0.52;
    // kekalkan puncak menara lebih rendah pada skrin supaya bata bergerak
    // dan tali crane sentiasa kelihatan di bawah HUD
    this.camTarget = Math.max(0, this.topY() - this.H * 0.4);
    this.cameraY += (this.camTarget - this.cameraY) * Math.min(1, dt * 4);

    // HUD throttle ~10Hz
    this.hudTimer -= dt;
    if (this.hudTimer <= 0) {
      this.hudTimer = 0.1;
      this.pushHud();
    }
  }

  private startCollapse() {
    this.over = true;
    this.collapseTimer = 1.6;
    sfx.collapse();
    haptics.collapse();
    this.shake = 14;
    this.opts.onEvent({ type: "collapsed" });
    // tukar bata teratas kepada serpihan bertaburan
    const n = Math.min(this.tower.length - 1, 12);
    for (let i = 0; i < n; i++) {
      const b = this.tower[this.tower.length - 1 - i];
      this.chips.push({
        x: b.x,
        y: b.y,
        w: b.w,
        h: BH,
        vx: (Math.random() - 0.5) * 320,
        vy: -Math.random() * 240,
        rot: 0,
        vrot: (Math.random() - 0.5) * 7,
        type: b.type,
        life: 2,
      });
    }
    this.tower = this.tower.slice(0, Math.max(1, this.tower.length - n));
    this.stats.collapsed = true;
  }

  // ---------- pendaratan ----------
  private land() {
    const d = this.dropping!;
    this.dropping = null;
    const top = this.topBrick();
    const topX = top.x + this.towerShift;
    const l = Math.max(d.x, topX);
    const r = Math.min(d.x + d.w, topX + top.w);
    const overlap = r - l;
    const alignment = overlap / d.w; // peratus bertindih

    if (overlap <= d.w * 0.2 || overlap < 8) {
      this.onMiss(d);
      return;
    }

    // toleransi perfect mengikut difficulty (Teres lebih pemaaf, Premium sangat ketat)
    const perfectThresh = this.diff
      ? Math.min(0.99, Math.max(0.9, 1 - 0.05 * this.diff.perfectToleranceMultiplier))
      : 0.95;
    let grade: PlacementGrade;
    if (alignment >= perfectThresh) grade = "perfect";
    else if (alignment >= 0.8) grade = "great";
    else if (alignment >= 0.55) grade = "good";
    else grade = "risky";

    const def = brickTypes[d.type];
    let newX = l;
    let newW = overlap;

    if (grade === "perfect") {
      // snap tepat — tiada pemotongan
      newX = topX + (top.w - d.w) / 2 <= 0 ? topX : topX + (top.w - d.w) / 2;
      newX = Math.abs(d.w - top.w) < 4 ? topX : Math.max(topX, Math.min(d.x, topX + top.w - d.w));
      newW = Math.min(d.w, top.w);
      // reward: kembalikan sedikit lebar selepas combo
      if (this.perfectStreak >= 2) newW = Math.min(BASE_W, newW + 7);
    } else {
      // crop — serpihan jatuh
      sfx.cut();
      const chipW = d.w - overlap;
      if (chipW > 3) {
        const chipX = d.x < topX ? d.x : r;
        this.chips.push({
          x: chipX,
          y: d.y,
          w: chipW,
          h: BH,
          vx: d.x < topX ? -120 - Math.random() * 80 : 120 + Math.random() * 80,
          vy: -60,
          rot: 0,
          vrot: (Math.random() - 0.5) * 6,
          type: d.type,
          life: 1.6,
        });
      }
    }

    // hujan: permukaan licin — gelincir sedikit (melainkan perfect / cement lock)
    if (this.rain && grade !== "perfect" && this.cementLeft <= 0) {
      const slide = (Math.random() - 0.5) * 10;
      newX += slide;
    }
    // tapak senget: drift ke arah kecerunan
    if (this.baseTilt !== 0 && grade !== "perfect" && this.cementLeft <= 0) {
      newX += this.baseTilt * 60;
    }
    newW = Math.max(MIN_W, newW);

    this.tower.push({ x: newX - this.towerShift, w: newW, y: d.y, type: d.type, cracked: d.cracked });

    // kesan visual pendaratan: habuk + impak kecil (tidak mengubah gameplay)
    this.dustPuff(newX, newW, d.y);
    this.shake = Math.max(this.shake, grade === "perfect" ? 3 : 2);

    this.applyGrade(grade, d, newX, newW);

    if (this.laserLeft > 0) this.laserLeft--;
    if (this.cementLeft > 0) {
      this.cementLeft--;
      this.stability = Math.min(100, this.stability + 5);
    }
    this.refreshActive();

    if (!this.over) {
      this.checkObjective();
      if (!this.over) this.spawnMoving();
    }
    this.pushHud();
  }

  private onMiss(d: { x: number; y: number; w: number; type: BrickTypeId }) {
    sfx.fall();
    haptics.miss();
    this.shake = 8;
    this.combo = 0;
    this.perfectStreak = 0;
    this.stats.miss++;
    this.quality = Math.max(0, this.quality - 8);
    this.stability = Math.max(0, this.stability - 15);
    this.lives--;
    this.chips.push({
      x: d.x, y: d.y, w: d.w, h: BH,
      vx: (Math.random() - 0.5) * 100, vy: 50,
      rot: 0, vrot: (Math.random() - 0.5) * 5,
      type: d.type, life: 1.6,
    });
    this.addFloat(this.W / 2, d.y, "MISS!", "#e74c3c");
    this.opts.onEvent({ type: "placement", grade: "miss" });
    this.say("Bata terjatuh! Fokus pada kedudukan bata sebelum tap.");
    if (this.lives <= 0 && !this.over) {
      this.endRun(false, false);
      return;
    }
    if (!this.over) this.spawnMoving();
    this.pushHud();
  }

  private applyGrade(grade: PlacementGrade, d: { type: BrickTypeId; cracked: boolean }, x: number, w: number) {
    const def = brickTypes[d.type];
    this.stats.bricks++;
    if (d.cracked) this.stats.crackedUsed++;
    if (d.type === "golden") this.stats.goldenBricks++;

    let base = 0;
    switch (grade) {
      case "perfect": {
        base = 150;
        this.combo++;
        this.perfectStreak++;
        this.stats.perfect++;
        this.quality = Math.min(100, this.quality + 1.5);
        this.stability = Math.min(100, this.stability + 5 + def.stabilityBonus);
        sfx.perfect();
        haptics.perfect();
        this.flashA = 0.32; // flash putih kecil
        const tier =
          this.perfectStreak >= 7
            ? "UNSTOPPABLE!"
            : this.perfectStreak >= 5
              ? "MASTER BUILDER!"
              : this.perfectStreak >= 3
                ? "AWESOME!"
                : "PERFECT!";
        this.addFloat(x + w / 2, this.topY(), tier, this.perfectStreak >= 3 ? "#ffd24a" : "#2ecc71");
        this.burst(x + w / 2, this.topY(), "#ffd965", 14);
        if (this.perfectStreak === 3) this.say("Bagus! Placement tepat membantu struktur kekal stabil.");
        break;
      }
      case "great": {
        base = 100;
        this.combo++; // combo dikekalkan
        this.perfectStreak = 0;
        this.stats.great++;
        this.quality = Math.min(100, this.quality + 0.4);
        this.stability = Math.min(100, this.stability + 1 + def.stabilityBonus);
        sfx.great();
        haptics.great();
        this.addFloat(x + w / 2, this.topY(), "GREAT!", "#3f9df0");
        break;
      }
      case "good": {
        base = 50;
        this.combo = 0;
        this.perfectStreak = 0;
        this.stats.good++;
        this.quality = Math.max(0, this.quality - 1.5);
        this.stability = Math.max(0, this.stability + Math.min(0, def.stabilityBonus));
        sfx.good();
        break;
      }
      case "risky": {
        base = 20;
        this.combo = 0;
        this.perfectStreak = 0;
        this.stats.risky++;
        this.quality = Math.max(0, this.quality - 5);
        this.stability = Math.max(0, this.stability - 10 + Math.min(0, def.stabilityBonus));
        sfx.shake();
        this.shake = 5;
        this.addFloat(x + w / 2, this.topY(), "RISKY!", "#e67e22");
        this.say("Jangan tergesa-gesa. Ketepatan lebih penting daripada kelajuan.");
        break;
      }
      case "miss":
        return;
    }

    // bata rosak menjejaskan stability tambahan
    if (d.cracked) this.stability = Math.max(0, this.stability - 3);

    // combo bonus
    let mult = 1;
    if (this.combo >= 5) mult = 1.5;
    else if (this.combo === 4) mult = 1.3;
    else if (this.combo === 3) mult = 1.2;
    else if (this.combo === 2) mult = 1.1;
    let pts = Math.round(base * mult * def.scoreMul * (this.diff?.scoreMultiplier ?? 1));
    if (d.cracked && grade !== "risky") pts += 30; // bonus berjaya guna cracked brick
    this.score += pts;

    this.longestCombo = Math.max(this.longestCombo, this.combo);

    // bonus 5 perfect berturut-turut
    if (this.perfectStreak === 5) {
      this.score += 500;
      this.quality = Math.min(100, this.quality + 4);
      this.stability = Math.min(100, this.stability + 10);
      this.stats.coinsEarned += 20;
      sfx.badge();
      this.addFloat(this.W / 2, this.topY() + 40, "MASTER MASON +500", "#d2a84a");
      this.burst(this.W / 2, this.topY(), "#d2a84a", 24);
      this.say("Ini standard Mahligai Idaman. Kemas, stabil dan diperiksa!");
      this.opts.onEvent({ type: "combo", message: "5 Perfect berturut-turut!" });
    }

    // bonus ketinggian setiap meter
    const m = Math.floor(this.heightMeters());
    if (m > this.meterAwarded) {
      this.score += (m - this.meterAwarded) * 100;
      this.meterAwarded = m;
    }

    if (d.type === "golden") {
      this.score += 200;
      this.stats.coinsEarned += 15;
      sfx.coin();
    }

    this.opts.onEvent({ type: "placement", grade });
  }

  // ---------- objektif ----------
  private checkObjective() {
    // mod Cabaran: tamat terkawal apabila target tingkat dicapai
    if (this.opts.mode !== "stage") {
      if (this.diff && this.stats.bricks >= this.diff.targetFloors) {
        this.endRun(true, false);
      }
      return;
    }
    const st = this.opts.stage;
    if (!st) return;
    const o = st.objective;
    const s = this.stats;
    const h = this.heightMeters();
    let done = false;
    switch (o.type) {
      case "bricks":
        done = s.bricks >= o.value && s.perfect >= (o.perfect ?? 0);
        break;
      case "height":
        done = h >= o.value;
        break;
      case "score":
        done = this.score >= o.value && this.longestCombo >= (o.combo ?? 0);
        break;
      case "perfect":
        done = s.perfect >= o.value;
        break;
      case "greatOrPerfect":
        done = s.perfect + s.great >= o.value;
        break;
      case "stabilityEnd":
        done = s.bricks >= (o.bricks ?? 12);
        break;
      case "bricksInTime":
        done = s.bricks >= o.value;
        break;
      default:
        done = false;
    }
    if (done) {
      // syarat tambahan semasa tamat
      let won = true;
      if (o.type === "stabilityEnd") won = this.stability >= o.value;
      if (o.stabilityMin) won = won && this.stability >= o.stabilityMin;
      if (st.minQuality) won = won && this.quality >= st.minQuality;
      this.endRun(won, false);
    }
  }

  private objectiveProgress(): { text: string; progress: number } {
    if (this.opts.mode !== "stage") {
      if (this.diff) {
        return {
          text: `Tingkat ${this.stats.bricks} / ${this.diff.targetFloors}`,
          progress: this.stats.bricks / this.diff.targetFloors,
        };
      }
      return { text: "Susun setinggi mungkin!", progress: 0 };
    }
    const st = this.opts.stage!;
    const o = st.objective;
    const s = this.stats;
    const h = this.heightMeters();
    switch (o.type) {
      case "bricks":
        return { text: `Bata: ${s.bricks}/${o.value}`, progress: s.bricks / o.value };
      case "height":
        return { text: `Tinggi: ${h.toFixed(1)}/${o.value}m`, progress: h / o.value };
      case "score":
        return { text: `Mata: ${this.score}/${o.value}`, progress: this.score / o.value };
      case "perfect":
        return { text: `Perfect: ${s.perfect}/${o.value}`, progress: s.perfect / o.value };
      case "greatOrPerfect":
        return { text: `Great/Perfect: ${s.perfect + s.great}/${o.value}`, progress: (s.perfect + s.great) / o.value };
      case "stabilityEnd":
        return { text: `Bata: ${s.bricks}/${o.bricks} (stab>${o.value}%)`, progress: s.bricks / (o.bricks ?? 12) };
      case "bricksInTime":
        return { text: `Bata: ${s.bricks}/${o.value}`, progress: s.bricks / o.value };
      default:
        return { text: o.label, progress: 0 };
    }
  }

  private checkBonus(): boolean {
    const st = this.opts.stage;
    if (!st) return false;
    const b = st.bonus;
    const s = this.stats;
    switch (b.type) {
      case "perfectCount":
        return s.perfect >= b.value;
      case "qualityMin":
        return this.quality >= b.value;
      case "riskyMax":
        return s.risky <= b.value;
      case "combo":
        return this.longestCombo >= b.value;
      case "stabilityMin":
        return this.stability >= b.value;
      case "noMiss":
        return s.miss === 0;
      case "missMax":
        return s.miss <= b.value;
      case "crackedUsed":
        return s.crackedUsed >= b.value && !s.collapsed;
      case "timeLeft":
        return (this.timeLeft ?? 0) >= b.value;
      case "noBrace":
        return !s.braceUsed;
      case "noPowerUp":
        return s.powerUpsUsed === 0;
      default:
        return false;
    }
  }

  private endRun(won: boolean, collapsed: boolean) {
    if (this.over && !collapsed && this.collapseTimer < 0) return;
    this.over = true;
    this.collapseTimer = -1;
    const s = this.stats;
    s.won = won;
    s.collapsed = s.collapsed || collapsed;
    s.height = this.heightMeters();
    s.longestCombo = this.longestCombo;
    s.quality = Math.round(this.quality);
    s.stability = Math.round(this.stability);
    s.timeUsed = Math.round(this.elapsed);
    s.bonusDone = won && this.checkBonus();

    // bonus kualiti akhir
    let qBonus = 0;
    if (this.quality >= 90) qBonus = 1200;
    else if (this.quality >= 75) qBonus = 900;
    else if (this.quality >= 60) qBonus = 600;
    else if (this.quality >= 40) qBonus = 300;
    this.score += qBonus;

    if (won && this.opts.stage) {
      this.score += 500; // stage selesai
      if (s.bonusDone) this.score += 1000;
      if (s.miss === 0) this.score += 500;
      if (s.miss === 0 && s.risky === 0 && s.good === 0) this.score += 1500; // perfect run
      sfx.stageComplete();
      haptics.stageComplete();
    } else if (won && this.diff) {
      // Cabaran selesai — bonus siap + tanpa miss
      this.score += Math.round(500 * this.diff.scoreMultiplier);
      if (s.miss === 0) this.score += Math.round(500 * this.diff.scoreMultiplier);
      sfx.stageComplete();
      haptics.stageComplete();
    }
    s.score = this.score;
    // MI Coin daripada gameplay
    s.coinsEarned += Math.round(this.score / 100) + s.perfect * 2;

    this.pushHud();
    setTimeout(() => {
      if (!this.destroyed) this.opts.onEvent({ type: "gameover", stats: s });
    }, won ? 900 : 1400);
  }

  // ---------- kesan ----------
  private addFloat(x: number, y: number, text: string, color: string) {
    this.floats.push({ x, y: y + 30, text, color, life: 1.1 });
  }

  private dustPuff(x: number, w: number, worldY: number) {
    if (this.opts.reducedMotion) return;
    const sy = this.worldToScreenY(worldY);
    for (let i = 0; i < 8; i++) {
      const side = i < 4 ? -1 : 1;
      this.particles.push({
        x: x + (side < 0 ? 0 : w),
        y: sy - 4,
        vx: side * (30 + Math.random() * 70),
        vy: -(10 + Math.random() * 30),
        life: 0.5 + Math.random() * 0.3,
        maxLife: 0.8,
        color: "rgba(200,190,170,0.6)",
        size: 3 + Math.random() * 3,
      });
    }
  }

  private burst(x: number, y: number, color: string, n: number) {
    if (this.opts.reducedMotion) return;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 60 + Math.random() * 160;
      this.particles.push({
        x, y: this.worldToScreenY(y),
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 80,
        life: 0.7, maxLife: 0.7, color, size: 3 + Math.random() * 3,
      });
    }
  }

  private pushHud() {
    const { text, progress } = this.objectiveProgress();
    this.opts.onHud({
      score: this.score,
      height: Math.round(this.heightMeters() * 10) / 10,
      combo: this.combo,
      quality: Math.round(this.quality),
      stability: Math.round(this.stability),
      bricks: this.stats.bricks,
      lives: this.lives,
      timeLeft: this.timeLeft === null ? null : Math.ceil(this.timeLeft),
      windLevel: this.windLevel,
      windDir: this.windDir,
      objectiveText: text,
      objectiveProgress: Math.min(1, progress),
      activePowerUps: [...this.activePowerUps],
      running: !this.over,
    });
  }

  // ---------- render ----------
  private worldToScreenY(worldY: number) {
    return this.H - 90 - (worldY - this.cameraY);
  }

  private render() {
    const g = this.ctx;
    g.save();
    g.scale(this.dpr, this.dpr);
    if (this.shake > 0 && !this.opts.reducedMotion) {
      g.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
    }
    this.drawBackground(g);
    this.drawTower(g);
    this.drawChips(g);
    if (!this.over) this.drawMoving(g);
    this.drawParticles(g);
    this.drawFloats(g);
    // flash putih ketika perfect landing
    if (this.flashA > 0 && !this.opts.reducedMotion) {
      g.fillStyle = `rgba(255,255,255,${this.flashA})`;
      g.fillRect(0, 0, this.W, this.H);
    }
    // ambient lighting hangat (vignette lembut)
    const vig = g.createRadialGradient(this.W / 2, this.H * 0.45, this.H * 0.3, this.W / 2, this.H * 0.45, this.H * 0.75);
    vig.addColorStop(0, "rgba(255,240,210,0.05)");
    vig.addColorStop(1, "rgba(30,20,10,0.16)");
    g.fillStyle = vig;
    g.fillRect(0, 0, this.W, this.H);
    g.restore();
  }

  // ---------- tema siang/malam ----------
  private static PHASES: { top: string; bot: string; sun: string; cloud: number }[] = [
    { top: "#4a8ec2", bot: "#c9e9fa", sun: "#fff5c8", cloud: 0.8 }, // pagi
    { top: "#3f7fb0", bot: "#ffe3b0", sun: "#ffe9a0", cloud: 0.7 }, // petang
    { top: "#43305e", bot: "#ee8d4e", sun: "#ff9d4a", cloud: 0.4 }, // senja
    { top: "#0d1430", bot: "#2b3a5c", sun: "#e8ecf5", cloud: 0.15 }, // malam
  ];

  private lerpHex(a: string, b: string, t: number): string {
    const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
    const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
    const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
    return `rgb(${c[0]},${c[1]},${c[2]})`;
  }

  private theme() {
    const P = BrickStackEngine.PHASES;
    const i = Math.min(2, Math.floor(this.themeVal));
    const t = Math.min(1, this.themeVal - i);
    const A = P[i];
    const B = P[Math.min(3, i + 1)];
    return {
      top: this.lerpHex(A.top, B.top, t),
      bot: this.lerpHex(A.bot, B.bot, t),
      sun: this.lerpHex(A.sun, B.sun, t),
      cloud: A.cloud + (B.cloud - A.cloud) * t,
      night: Math.max(0, this.themeVal - 2), // 0..1 apabila menuju malam
    };
  }

  private skyColors(): [string, string] {
    if (this.opts.backgroundId === "bg-hujan" || this.rain) return ["#4a5a6a", "#8b98a5"];
    const th = this.theme();
    return [th.top, th.bot];
  }

  private drawBackground(g: CanvasRenderingContext2D) {
    const [c1, c2] = this.skyColors();
    const grad = g.createLinearGradient(0, 0, 0, this.H);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);
    g.fillStyle = grad;
    g.fillRect(0, 0, this.W, this.H);

    const par = this.cameraY * 0.25; // parallax
    const groundScreen = this.worldToScreenY(0);
    const th = this.theme();
    const night = this.rain ? 0 : th.night;

    // bintang pada waktu malam (kedudukan deterministik)
    if (night > 0.05) {
      g.fillStyle = `rgba(255,255,255,${0.7 * night})`;
      for (let i = 0; i < 40; i++) {
        const sx = (i * 137.5) % this.W;
        const sy = ((i * 89.3) % (this.H * 0.5)) + par * 0.1;
        const tw = 0.5 + 0.5 * Math.sin(this.elapsed * 2 + i);
        g.globalAlpha = 0.4 * night + 0.4 * night * tw;
        g.fillRect(sx, sy % this.H, 2, 2);
      }
      g.globalAlpha = 1;
    }

    // matahari / bulan dengan cahaya lembut
    const sunX = this.W - 70;
    const sunY = 80 + par * 0.15;
    const glow = g.createRadialGradient(sunX, sunY, 4, sunX, sunY, 70);
    glow.addColorStop(0, th.sun);
    glow.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = glow;
    g.fillRect(sunX - 70, sunY - 70, 140, 140);
    g.fillStyle = th.sun;
    g.beginPath();
    g.arc(sunX, sunY, night > 0.5 ? 20 : 26, 0, Math.PI * 2);
    g.fill();
    if (night > 0.5) {
      // kawah bulan
      g.fillStyle = "rgba(180,190,205,0.5)";
      g.beginPath();
      g.arc(sunX - 6, sunY - 4, 4, 0, Math.PI * 2);
      g.arc(sunX + 6, sunY + 5, 3, 0, Math.PI * 2);
      g.fill();
    }

    // awan bergerak perlahan
    g.fillStyle = `rgba(255,255,255,${th.cloud})`;
    const cloudY = 120 + par * 0.4;
    const drift = this.opts.reducedMotion ? 0 : this.elapsed * 7;
    for (const [cx0, cy, s] of [
      [60, cloudY, 1], [230, cloudY + 60, 0.8], [370, cloudY - 30, 1.2],
    ] as const) {
      const cx = (((cx0 + drift * s) % (this.W + 120)) + this.W + 120) % (this.W + 120) - 60;
      g.beginPath();
      g.ellipse(cx, cy, 34 * s, 13 * s, 0, 0, Math.PI * 2);
      g.ellipse(cx + 24 * s, cy + 4 * s, 24 * s, 11 * s, 0, 0, Math.PI * 2);
      g.fill();
    }

    // skyline jauh (bukit + pokok kelapa)
    if (groundScreen < this.H + 400) {
      const hillY = groundScreen - 40;
      g.fillStyle = "rgba(60,110,70,0.5)";
      g.beginPath();
      g.moveTo(0, hillY);
      g.quadraticCurveTo(this.W * 0.25, hillY - 60, this.W * 0.5, hillY - 15);
      g.quadraticCurveTo(this.W * 0.75, hillY + 20, this.W, hillY - 35);
      g.lineTo(this.W, this.H);
      g.lineTo(0, this.H);
      g.fill();
      // pokok kelapa halus
      this.palm(g, 40, hillY - 6, 0.8);
      this.palm(g, 420, hillY - 24, 0.9);
    }

    // tanah tapak — concrete slab dengan detail
    if (groundScreen < this.H + 100) {
      const gy = groundScreen + BH;
      const dark = night * 0.35;
      // slab konkrit
      const slab = g.createLinearGradient(0, gy, 0, gy + 30);
      slab.addColorStop(0, this.lerpHex("#c2beb4", "#5a5850", dark));
      slab.addColorStop(1, this.lerpHex("#9c9890", "#45443e", dark));
      g.fillStyle = slab;
      g.fillRect(0, gy, this.W, 30);
      // tanah bawah slab
      g.fillStyle = this.lerpHex("#6e5b44", "#332a20", dark);
      g.fillRect(0, gy + 30, this.W, this.H);
      // garisan safety kuning-hitam di birai slab
      for (let x = 0; x < this.W; x += 26) {
        g.fillStyle = (x / 26) % 2 === 0 ? "#e8c22a" : "#2a2a2a";
        g.fillRect(x, gy, 26, 4);
      }
      // retakan kecil (deterministik)
      g.strokeStyle = "rgba(60,58,52,0.45)";
      g.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const cx = ((i * 97 + 40) % this.W);
        g.beginPath();
        g.moveTo(cx, gy + 8);
        g.lineTo(cx + 8, gy + 16);
        g.lineTo(cx + 4, gy + 26);
        g.stroke();
      }
      // kesan tayar
      g.strokeStyle = "rgba(50,45,40,0.25)";
      g.lineWidth = 5;
      g.beginPath();
      g.moveTo(150, gy + 12);
      g.quadraticCurveTo(210, gy + 20, 290, gy + 14);
      g.stroke();
      // construction marking
      g.fillStyle = "rgba(232,194,42,0.75)";
      g.font = "bold 9px sans-serif";
      g.fillText("MI-01", 12, gy + 24);
      // elemen tapak Mahligai — hanya dekat tanah
      this.drawSiteElements(g, groundScreen);
      this.drawCrane(g, groundScreen, night);
    }

    // scaffolding di tepi (ikut ketinggian)
    g.strokeStyle = "rgba(120,90,50,0.5)";
    g.lineWidth = 4;
    const scaffX = 26;
    const sTop = Math.max(0, this.worldToScreenY(this.topY() + 300));
    for (let y = groundScreen + BH; y > sTop; y -= 70) {
      g.beginPath();
      g.moveTo(scaffX, y);
      g.lineTo(scaffX, y - 70);
      g.moveTo(scaffX + 34, y);
      g.lineTo(scaffX + 34, y - 70);
      g.moveTo(scaffX, y);
      g.lineTo(scaffX + 34, y - 70);
      g.moveTo(scaffX, y - 35);
      g.lineTo(scaffX + 34, y - 35);
      g.stroke();
    }
  }

  // crane latar belakang yang berayun perlahan + spotlight malam
  private drawCrane(g: CanvasRenderingContext2D, groundScreen: number, night: number) {
    const gy = groundScreen + BH;
    const baseX = 88;
    const topY = gy - 300;
    const sway = this.opts.reducedMotion ? 0 : Math.sin(this.elapsed * 0.35) * 8;
    g.save();
    g.globalAlpha = 0.55;
    g.strokeStyle = this.lerpHex("#b08a2a", "#5c4a1e", night * 0.5);
    g.lineWidth = 5;
    // tiang
    g.beginPath();
    g.moveTo(baseX, gy);
    g.lineTo(baseX, topY);
    g.stroke();
    // lengan jib (sway perlahan)
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(baseX - 46, topY + 8 + sway * 0.3);
    g.lineTo(baseX, topY);
    g.lineTo(baseX + 130 + sway, topY + 10);
    g.stroke();
    // penyangga
    g.lineWidth = 1.6;
    for (let i = 1; i <= 4; i++) {
      g.beginPath();
      g.moveTo(baseX, topY + 26);
      g.lineTo(baseX + i * 30 + sway * (i / 4), topY + 10);
      g.stroke();
    }
    // tali dan cangkuk
    const hookX = baseX + 108 + sway;
    g.beginPath();
    g.moveTo(hookX, topY + 10);
    g.lineTo(hookX, topY + 60 + sway * 0.6);
    g.stroke();
    g.fillStyle = "#8a4a2e";
    g.fillRect(hookX - 9, topY + 60 + sway * 0.6, 18, 11);
    g.restore();

    // spotlight tapak pada waktu malam
    if (night > 0.3 && !this.rain) {
      const lx = 34;
      const ly = gy - 210;
      g.fillStyle = `rgba(255,235,170,${0.85 * night})`;
      g.fillRect(lx - 6, ly - 4, 12, 8);
      const cone = g.createLinearGradient(lx, ly, this.W / 2, gy);
      cone.addColorStop(0, `rgba(255,240,190,${0.22 * night})`);
      cone.addColorStop(1, "rgba(255,240,190,0)");
      g.fillStyle = cone;
      g.beginPath();
      g.moveTo(lx, ly);
      g.lineTo(this.W * 0.6, gy);
      g.lineTo(this.W * 0.2, gy);
      g.closePath();
      g.fill();
    }
  }

  private palm(g: CanvasRenderingContext2D, x: number, y: number, s: number) {
    g.strokeStyle = "rgba(80,60,40,0.7)";
    g.lineWidth = 3 * s;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + 6 * s, y - 22 * s, x + 2 * s, y - 40 * s);
    g.stroke();
    g.strokeStyle = "rgba(50,110,60,0.8)";
    g.lineWidth = 2 * s;
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i - 2) * 0.5;
      g.beginPath();
      g.moveTo(x + 2 * s, y - 40 * s);
      g.quadraticCurveTo(
        x + 2 * s + Math.cos(a) * 20 * s,
        y - 40 * s + Math.sin(a) * 16 * s - 4,
        x + 2 * s + Math.cos(a) * 30 * s,
        y - 40 * s + Math.sin(a) * 22 * s + 6,
      );
      g.stroke();
    }
  }

  private drawSiteElements(g: CanvasRenderingContext2D, groundScreen: number) {
    const gy = groundScreen + BH;
    const night = this.rain ? 0 : this.theme().night;
    // site cabin
    g.fillStyle = this.lerpHex("#3b6ea8", "#1d3550", night * 0.7);
    g.fillRect(370, gy - 56, 96, 56);
    g.fillStyle = this.lerpHex("#2c5583", "#16283c", night * 0.7);
    g.fillRect(370, gy - 64, 96, 10);
    // tingkap menyala pada waktu malam
    g.fillStyle = night > 0.4 ? "#ffe9a0" : "#dce8f2";
    g.fillRect(380, gy - 46, 20, 16);
    g.fillRect(436, gy - 46, 20, 16);
    if (night > 0.4) {
      g.fillStyle = `rgba(255,233,160,${0.25 * night})`;
      g.fillRect(374, gy - 52, 32, 28);
      g.fillRect(430, gy - 52, 32, 28);
    }
    g.fillStyle = "#fff";
    g.font = "bold 8px sans-serif";
    g.textAlign = "center";
    g.fillText("TAPAK PROJEK", 418, gy - 24);
    g.fillText("MAHLIGAI IDAMAN", 418, gy - 14);

    // project signboard
    const sx = 60,
      sy = gy - 88;
    g.fillStyle = "#f4f1ec";
    g.fillRect(sx, sy, 118, 64);
    g.strokeStyle = mahligaiBrand.primaryColor;
    g.lineWidth = 3;
    g.strokeRect(sx, sy, 118, 64);
    g.fillStyle = "#7a5c34";
    g.fillRect(sx + 14, sy + 64, 6, 24);
    g.fillRect(sx + 98, sy + 64, 6, 24);
    g.fillStyle = mahligaiBrand.primaryColor;
    g.font = "bold 8px sans-serif";
    g.fillText("PROJEK PEMBINAAN", sx + 59, sy + 12);
    g.fillText("BANGLO IMPIAN", sx + 59, sy + 22);
    g.fillStyle = "#202020";
    g.font = "7px sans-serif";
    g.fillText(`${signboardText.ownerLabel} ${signboardText.owner}`, sx + 59, sy + 34);
    g.fillText("Kontraktor:", sx + 59, sy + 44);
    g.fillText("Mahligai Idaman Dev. Sdn. Bhd.", sx + 59, sy + 53);
    g.fillStyle = mahligaiBrand.accentColor;
    g.fillRect(sx + 8, sy + 57, 102, 3);

    // pallet bata
    g.fillStyle = "#8a4a2e";
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 4; j++) g.fillRect(216 + j * 16, gy - 12 - i * 9, 14, 8);
    g.fillStyle = "#6e5334";
    g.fillRect(212, gy - 4, 72, 4);

    // banner keselamatan Mahligai pada pagar
    g.fillStyle = "#e8c22a";
    g.fillRect(196, gy - 76, 128, 15);
    g.strokeStyle = "#b8940e";
    g.strokeRect(196, gy - 76, 128, 15);
    g.fillStyle = "#202020";
    g.font = "bold 7px sans-serif";
    g.textAlign = "center";
    g.fillText("UTAMAKAN KESELAMATAN · MAHLIGAI IDAMAN", 260, gy - 66);

    // kon keselamatan
    for (const cx of [200, 330]) {
      g.fillStyle = "#e67e22";
      g.beginPath();
      g.moveTo(cx, gy);
      g.lineTo(cx + 6, gy - 16);
      g.lineTo(cx + 12, gy);
      g.fill();
      g.fillStyle = "#fff";
      g.fillRect(cx + 2, gy - 8, 8, 3);
    }
    g.textAlign = "left";
  }

  private brickFill(
    g: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    type: BrickTypeId,
    cracked: boolean,
    seed = 0,
  ) {
    const def = brickTypes[type];
    const color = type === "standard" && this.opts.brickSkinColor ? this.opts.brickSkinColor : def.color;
    // gradient 3D: cahaya dari atas, gelap ke bawah
    const grad = g.createLinearGradient(0, y, 0, y + h);
    grad.addColorStop(0, this.lerpHex(color.startsWith("#") ? color : "#b34a2e", "#ffffff", 0.22));
    grad.addColorStop(0.45, color);
    grad.addColorStop(1, this.lerpHex(color.startsWith("#") ? color : "#b34a2e", "#000000", 0.28));
    g.fillStyle = grad;
    g.fillRect(x, y, w, h);
    // highlight atas
    g.fillStyle = "rgba(255,255,255,0.22)";
    g.fillRect(x, y, w, 3);
    // sisi kiri terang, kanan gelap (kedalaman)
    g.fillStyle = "rgba(255,255,255,0.10)";
    g.fillRect(x, y, 3, h);
    g.fillStyle = "rgba(0,0,0,0.14)";
    g.fillRect(x + w - 3, y, 3, h);
    // tekstur roughness (bintik deterministik supaya tidak berkelip)
    g.fillStyle = "rgba(0,0,0,0.10)";
    for (let i = 0; i < 6; i++) {
      const px = x + ((seed * 31 + i * 53) % Math.max(8, Math.floor(w - 10))) + 5;
      const py = y + ((seed * 17 + i * 29) % (h - 12)) + 6;
      g.fillRect(px, py, 2, 2);
    }
    g.fillStyle = "rgba(255,255,255,0.08)";
    for (let i = 0; i < 4; i++) {
      const px = x + ((seed * 13 + i * 71) % Math.max(8, Math.floor(w - 10))) + 5;
      const py = y + ((seed * 23 + i * 41) % (h - 12)) + 6;
      g.fillRect(px, py, 2, 2);
    }
    g.strokeStyle = def.edge;
    g.lineWidth = 2;
    g.strokeRect(x + 1, y + 1, w - 2, h - 2);
    // garis mortar
    g.strokeStyle = "rgba(0,0,0,0.12)";
    g.lineWidth = 1;
    const seg = Math.max(24, w / 3);
    for (let sx = x + seg; sx < x + w - 4; sx += seg) {
      g.beginPath();
      g.moveTo(sx, y + 3);
      g.lineTo(sx, y + h - 3);
      g.stroke();
    }
    if (cracked) {
      g.strokeStyle = "rgba(30,10,5,0.7)";
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(x + w * 0.3, y + 2);
      g.lineTo(x + w * 0.45, y + h * 0.5);
      g.lineTo(x + w * 0.35, y + h - 2);
      g.moveTo(x + w * 0.45, y + h * 0.5);
      g.lineTo(x + w * 0.6, y + h * 0.7);
      g.stroke();
    }
    if (type === "golden" && !this.opts.reducedMotion) {
      g.fillStyle = `rgba(255,235,160,${0.25 + 0.2 * Math.sin(this.elapsed * 6)})`;
      g.fillRect(x, y, w, h);
    }
  }

  private towerSway(i: number): number {
    if (this.braceLeft > 0) return 0;
    const instab = (100 - this.stability) / 100;
    let amp = instab * instab * 9 + this.windLevel * 0.9;
    if (this.diff) amp *= this.diff.swayMultiplier;
    if (this.opts.reducedMotion) return 0;
    return Math.sin(this.swayPhase * 1.8 + i * 0.12) * amp * (i / Math.max(1, this.tower.length));
  }

  private drawTower(g: CanvasRenderingContext2D) {
    // contact shadow di tapak tower supaya nampak berat
    const base = this.tower[0];
    const baseSy = this.worldToScreenY(0);
    if (baseSy < this.H + 40) {
      const cx = base.x + this.towerShift + base.w / 2;
      const sh = g.createRadialGradient(cx, baseSy + 6, 4, cx, baseSy + 6, base.w * 0.75);
      sh.addColorStop(0, "rgba(0,0,0,0.30)");
      sh.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = sh;
      g.save();
      g.translate(cx, baseSy + 6);
      g.scale(1, 0.22);
      g.beginPath();
      g.arc(0, 0, base.w * 0.75, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }
    for (let i = 0; i < this.tower.length; i++) {
      const b = this.tower[i];
      const sy = this.worldToScreenY(b.y) - BH;
      if (sy > this.H + BH || sy < -BH * 2) continue;
      const sway = this.towerSway(i);
      const bx = b.x + this.towerShift + sway;
      // bayang lembut bata ke atas bata di bawahnya
      g.fillStyle = "rgba(0,0,0,0.12)";
      g.fillRect(bx + 2, sy + BH, b.w - 4, 4);
      this.brickFill(g, bx, sy, b.w, BH, b.type, b.cracked, Math.floor(b.y));
    }
    // tapak senget indicator
    if (this.baseTilt !== 0) {
      const gy = this.worldToScreenY(0);
      g.save();
      g.translate(this.W / 2, gy + 6);
      g.rotate(this.baseTilt);
      g.fillStyle = "#5c4a33";
      g.fillRect(-130, 0, 260, 10);
      g.restore();
    }
  }

  private drawMoving(g: CanvasRenderingContext2D) {
    // laser guide
    if (this.laserLeft > 0) {
      const top = this.topBrick();
      const tx = top.x + this.towerShift;
      g.strokeStyle = "rgba(46,204,113,0.85)";
      g.setLineDash([6, 6]);
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(tx, 0);
      g.lineTo(tx, this.H);
      g.moveTo(tx + top.w, 0);
      g.lineTo(tx + top.w, this.H);
      g.stroke();
      g.setLineDash([]);
    }

    if (this.dropping) {
      const d = this.dropping;
      this.brickFill(g, d.x, this.worldToScreenY(d.y) - BH, d.w, BH, d.type, d.cracked);
      return;
    }

    const m = this.moving;
    const y = this.worldToScreenY(this.topY() + this.dropGap()) - BH;
    // tali crane
    g.strokeStyle = "rgba(60,60,60,0.6)";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(m.x + m.w / 2, 0);
    g.lineTo(m.x + m.w / 2, y);
    g.stroke();
    if (this.crane) {
      g.fillStyle = "#d9a521";
      g.fillRect(m.x + m.w / 2 - 14, y - 8, 28, 8);
    }
    const bob = this.opts.reducedMotion ? 0 : Math.sin(this.elapsed * 5) * 2;
    this.brickFill(g, m.x, y + bob, m.w, BH, m.type, m.cracked);
    // bayang sasaran
    const top = this.topBrick();
    g.fillStyle = "rgba(0,0,0,0.14)";
    g.fillRect(m.x, this.worldToScreenY(this.topY()) - BH, m.w, BH);
  }

  private drawChips(g: CanvasRenderingContext2D) {
    for (const c of this.chips) {
      g.save();
      const sy = this.worldToScreenY(c.y) - c.h;
      g.translate(c.x + c.w / 2, sy + c.h / 2);
      g.rotate(c.rot);
      g.globalAlpha = Math.min(1, c.life);
      this.brickFill(g, -c.w / 2, -c.h / 2, c.w, c.h, c.type, false);
      g.restore();
    }
    g.globalAlpha = 1;
  }

  private drawParticles(g: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      g.globalAlpha = Math.max(0, p.life / p.maxLife);
      g.fillStyle = p.color;
      if (p.size <= 2) {
        // titisan hujan
        g.fillRect(p.x, this.worldToScreenY(p.y), 1.5, 12);
      } else {
        g.beginPath();
        g.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        g.fill();
      }
    }
    g.globalAlpha = 1;
    // indikator angin
    if (this.windLevel > 0 && !this.opts.reducedMotion) {
      g.strokeStyle = "rgba(255,255,255,0.35)";
      g.lineWidth = 1.5;
      for (let i = 0; i < this.windLevel * 2; i++) {
        const y = 100 + ((this.elapsed * 40 + i * 90) % 300);
        const x = ((this.elapsed * this.windLevel * 90 * this.windDir + i * 160) % (this.W + 160) + this.W + 160) % (this.W + 160) - 80;
        g.beginPath();
        g.moveTo(x, y);
        g.quadraticCurveTo(x + 20 * this.windDir, y - 4, x + 44 * this.windDir, y);
        g.stroke();
      }
    }
  }

  private drawFloats(g: CanvasRenderingContext2D) {
    g.textAlign = "center";
    for (const f of this.floats) {
      g.globalAlpha = Math.min(1, f.life * 2);
      g.fillStyle = f.color;
      g.font = "bold 22px sans-serif";
      const sy = this.worldToScreenY(f.y) - (1.1 - f.life) * 50;
      g.strokeStyle = "rgba(0,0,0,0.5)";
      g.lineWidth = 3;
      g.strokeText(f.text, f.x, sy);
      g.fillText(f.text, f.x, sy);
    }
    g.globalAlpha = 1;
    g.textAlign = "left";
  }
}
