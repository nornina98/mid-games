import { useState } from "react";
import { BigButton, BrandLogo } from "../components/common";
import { avatars } from "../data/cosmetics";
import { useGameStore } from "../store/gameStore";
import { mahligaiBrand } from "../config/brand";
import { unlockAudio } from "../utils/audio";

export function PlayerSetup() {
  const setupPlayer = useGameStore((s) => s.setupPlayer);
  const [name, setName] = useState(useGameStore.getState().playerName);
  const [avatar, setAvatar] = useState("tukang");
  const [err, setErr] = useState("");

  const submit = () => {
    const n = name.trim();
    if (n.length < 2) {
      setErr("Sila masukkan nama pemain (minimum 2 aksara).");
      return;
    }
    if (n.length > 16) {
      setErr("Nama maksimum 16 aksara.");
      return;
    }
    unlockAudio();
    setupPlayer(n, avatar);
  };

  return (
    <div className="flex-1 flex flex-col px-6 py-8 gap-5 overflow-y-auto page-sky">
      <BrandLogo className="h-14 mx-auto" />
      <div className="text-center">
        <h1 className="text-xl font-black text-charcoal">Selamat Datang ke Tapak!</h1>
        <p className="text-sm text-cement mt-1">
          Anda kini sebahagian daripada pasukan pembinaan {mahligaiBrand.shortName}. Daftar nama untuk mula bekerja.
        </p>
      </div>

      <div>
        <label htmlFor="playerName" className="text-sm font-bold text-charcoal">
          Nama Pemain
        </label>
        <input
          id="playerName"
          value={name}
          maxLength={16}
          onChange={(e) => {
            setName(e.target.value);
            setErr("");
          }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Contoh: Wan"
          className="mt-1 w-full rounded-full border-2 border-cement/40 bg-white px-4 py-3 text-base font-bold text-charcoal focus:border-mahligai"
        />
        {err && (
          <p className="text-xs font-bold text-mahligai mt-1" role="alert">
            {err}
          </p>
        )}
      </div>

      <div>
        <p className="text-sm font-bold text-charcoal mb-2">Pilih Watak</p>
        <div className="grid grid-cols-2 gap-3">
          {avatars.map((a) => (
            <button
              key={a.id}
              onClick={() => setAvatar(a.id)}
              aria-pressed={avatar === a.id}
              className={`rounded-2xl p-3 border-2 text-center bg-white min-h-[72px] active:scale-95 transition ${
                avatar === a.id ? "border-mahligai shadow-md" : "border-cement/30"
              }`}
            >
              <span className="text-3xl" aria-hidden="true">
                {a.icon}
              </span>
              <p className="text-xs font-bold text-charcoal mt-1">{a.name}</p>
            </button>
          ))}
        </div>
      </div>

      <BigButton onClick={submit}>Mula Bermain</BigButton>
      <p className="text-center text-[11px] text-cement">{mahligaiBrand.corporateTagline}</p>
    </div>
  );
}
