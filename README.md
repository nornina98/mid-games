# Mahligai Idaman: Brick Stack Challenge

**Susun Tepat. Bina Lebih Tinggi.**
*Membina Kediaman. Merealisasikan Impian.* — Mahligai Idaman Development Sdn. Bhd.

Web-based mobile game bertemakan pembinaan rumah banglo di Malaysia. Pemain menyusun bata setinggi dan setepat mungkin, mengekalkan Mahligai Quality dan kestabilan struktur, menghadapi gangguan tapak (hujan, angin, crane, bata rosak), melengkapkan 15 stage dan akhirnya menyiapkan Projek Banglo Impian.

---

## Cara Paling Mudah Untuk Cuba (tanpa install apa-apa)

Buka fail **`dist-single/index.html`** terus dalam browser (double-click sahaja). Semua game termuat dalam satu fail HTML.

## Cara Jalankan Untuk Development

Perlu [Node.js](https://nodejs.org) (versi 18 ke atas).

```bash
npm install
npm run dev
```

Kemudian buka URL yang dipaparkan (biasanya http://localhost:5173). Untuk uji pada telefon, pastikan telefon dan komputer dalam WiFi sama dan jalankan `npm run dev -- --host`.

## Build Untuk Production

```bash
npm run build          # hasil dalam folder dist/ (untuk hosting web)
npm run build:single   # hasil satu fail dalam dist-single/index.html
```

Folder `dist/` boleh di-upload ke mana-mana web hosting statik (Netlify, Vercel, cPanel, GitHub Pages, dll).

---

## Struktur Folder

```text
public/assets/branding/    <- LETAKKAN LOGO RASMI DI SINI (lihat bawah)
src/
  config/brand.ts          <- SEMUA data jenama: nama, tagline, warna, URL
  data/
    stages.ts              <- 15 stage + fasa projek banglo
    bricks.ts              <- 6 jenis bata
    badges.ts              <- 13 badge
    challenges.ts          <- daily challenge
    cosmetics.ts           <- power-up, helmet, brick skin, background, facade, level XP
  game/
    engine.ts              <- game engine (canvas): movement, drop, overlap, cropping,
                              grading, combo, quality, stability, collapse, cuaca, kamera
    types.ts               <- jenis data gameplay
  store/gameStore.ts       <- state + localStorage berversi (Zustand persist)
  pages/                   <- semua screen (Splash, Setup, Menu, StageSelect, Game,
                              Result, Project, Badges, Leaderboard, Daily, Settings,
                              About, Certificate, Shop, HowTo)
  components/common/       <- butang, modal, meter, signboard, Abang Site, stamp, banglo SVG
  utils/                   <- audio (Web Audio, tiada fail audio), haptics, share, sijil
```

## Dependency

React 18, TypeScript, Vite 5, Tailwind CSS 4, Zustand, Framer Motion, Lucide React (UI), Web Audio API (bunyi dijana secara procedural — tiada fail audio), Canvas API (gameplay + sijil). Tiada API key, tiada backend, tiada database luar — semuanya berjalan secara local dan progress disimpan dalam localStorage.

## LOGO MAHLIGAI IDAMAN

Logo Mahligai Idaman (versi vector recreation daripada logo rasmi) sudah dimasukkan. Jika mahu menggantikannya dengan fail logo rasmi asal, gantikan fail PNG berikut dan kekalkan nama fail:

- `src/assets/branding/mahligai-idaman-logo.png` — logo penuh (latar cerah), digunakan dalam app
- `src/assets/branding/mahligai-idaman-logo-white.png` — logo versi putih (latar gelap), digunakan dalam app
- `public/assets/branding/` — salinan sama untuk favicon (`mahligai-idaman-icon.png` ialah icon browser)

Untuk URL laman web / WhatsApp / portfolio, isikan dalam `src/config/brand.ts` (`websiteUrl`, `whatsappUrl`, `portfolioUrl`). Selagi kosong, butang berkaitan dipaparkan sebagai "(akan datang)" dan di-disable — tiada URL rekaan digunakan.

## Fungsi Yang Telah Siap

Gameplay penuh (movement, drop, overlap, brick cropping dengan serpihan physics, Perfect/Great/Good/Risky/Miss), combo + Golden Brick, Mahligai Quality meter, stability + tower collapse, sistem cuaca (hujan, angin 3 tahap), gangguan (crane swing, tapak senget, base movement, bata rosak, saiz rawak, timer), 6 jenis bata, 4 power-up, MI Coin, Classic Mode, 15 Stage Mode dengan star rating 3 bintang, Daily Challenge (reset ikut tarikh local), progres projek banglo 15 fasa dengan ilustrasi berkembang, final house reveal, 13 badge, 8 level XP, kedai kosmetik (helmet/brick skin/background/facade), leaderboard local 5 kategori dengan fake players, Quality Approved stamp, Site Performance Report, Sijil Master Builder (download sebagai imej), share (Web Share API + fallback clipboard), tutorial interaktif Abang Site, settings (muzik/SFX/getaran/reduced motion/reset 2 langkah), sokongan sentuhan + tetikus + papan kekunci (Space/Enter), pause automatik bila tab tidak aktif, responsive mobile-first (max 480px, safe area notch).

## Asset Yang Masih Placeholder

- Logo semasa ialah vector recreation yang rapat dengan logo rasmi — boleh diganti dengan fail PNG rasmi bila-bila masa (lihat bahagian LOGO di atas)
- Semua grafik lain adalah vector/procedural (SVG + canvas) dan boleh diganti dengan ilustrasi sebenar kemudian

## Nota Teknikal

Gameplay menggunakan enjin canvas 2D custom yang ringan (physics ringan ditulis khusus untuk stacking) dan bukannya Phaser — ia lebih kecil, lebih laju dimuat pada telefon, dan lebih stabil untuk mekanik susun bata ini. Struktur `game/engine.ts` diasingkan sepenuhnya daripada UI React, jadi ia boleh ditukar kepada Phaser pada masa hadapan tanpa mengubah screen lain.
