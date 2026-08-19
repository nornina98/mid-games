// Ilustrasi banglo Mahligai Idaman — dibina secara berperingkat mengikut
// bilangan stage yang telah selesai (0 hingga 15). Vector art procedural.
export function BungalowSvg({
  stagesDone,
  facade = "facade-modern",
  className = "",
  celebrate = false,
}: {
  stagesDone: number;
  facade?: string;
  className?: string;
  celebrate?: boolean;
}) {
  const s = stagesDone;
  const wallColor =
    facade === "facade-tropical" ? "#e8dcc8" : facade === "facade-contemporary" ? "#d8d8d4" : facade === "facade-minimalist" ? "#f0efeb" : "#efe7d8";
  const roofColor = facade === "facade-tropical" ? "#7a4a2e" : "#4a4a48";
  return (
    <svg viewBox="0 0 360 240" className={className} role="img" aria-label={`Projek banglo: ${s} daripada 15 fasa siap`}>
      {/* langit & tanah */}
      <rect x="0" y="0" width="360" height="240" fill={celebrate ? "#3d2c52" : "#bfe3f7"} />
      {celebrate && <circle cx="300" cy="40" r="16" fill="#f7e7a0" />}
      {!celebrate && <circle cx="300" cy="42" r="18" fill="#fff5c8" />}
      <rect x="0" y="190" width="360" height="50" fill={s >= 13 ? "#5a9e4c" : "#8a6f4d"} />

      {/* tapak kosong / setting out */}
      {s >= 0 && s < 2 && (
        <g stroke="#e8d44a" strokeWidth="2" strokeDasharray="6 4">
          <rect x="80" y="120" width="200" height="70" fill="none" />
        </g>
      )}

      {/* 1: foundation */}
      {s >= 1 && <rect x="76" y="182" width="208" height="10" fill="#9c9c96" />}
      {/* 2: columns & beams */}
      {s >= 2 && (
        <g fill="#b5b5ae">
          <rect x="84" y="130" width="10" height="54" />
          <rect x="172" y="130" width="10" height="54" />
          <rect x="266" y="130" width="10" height="54" />
          <rect x="84" y="126" width="192" height="8" />
        </g>
      )}
      {/* 3-4: dinding ground floor */}
      {s >= 3 && <rect x="84" y="134" width="192" height="50" fill={wallColor} />}
      {/* 5: bukaan pintu & tingkap */}
      {s >= 5 && (
        <g>
          <rect x="164" y="148" width="26" height="36" fill="#6e4a2e" rx="2" />
          <rect x="104" y="146" width="30" height="22" fill={s >= 14 ? "#bfe8f0" : "#3a3a38"} rx="2" />
          <rect x="226" y="146" width="30" height="22" fill={s >= 14 ? "#bfe8f0" : "#3a3a38"} rx="2" />
        </g>
      )}
      {/* 6: struktur utama - tingkat atas */}
      {s >= 6 && <rect x="110" y="88" width="140" height="46" fill={wallColor} />}
      {/* 7: porch */}
      {s >= 7 && (
        <g>
          <rect x="152" y="128" width="56" height="6" fill={roofColor} />
          <rect x="150" y="134" width="6" height="50" fill="#a8a8a2" />
          <rect x="204" y="134" width="6" height="50" fill="#a8a8a2" />
        </g>
      )}
      {/* 8: struktur bumbung */}
      {s >= 8 && <polygon points="100,88 180,58 260,88" fill="none" stroke={roofColor} strokeWidth="5" />}
      {/* 9: siap dinding utama + tingkap atas */}
      {s >= 9 && (
        <g>
          <rect x="126" y="98" width="26" height="20" fill={s >= 14 ? "#bfe8f0" : "#3a3a38"} rx="2" />
          <rect x="208" y="98" width="26" height="20" fill={s >= 14 ? "#bfe8f0" : "#3a3a38"} rx="2" />
        </g>
      )}
      {/* 10: bumbung penuh + parapet */}
      {s >= 10 && (
        <g>
          <polygon points="96,90 180,56 264,90" fill={roofColor} />
          <rect x="106" y="84" width="148" height="6" fill={roofColor} />
        </g>
      )}
      {/* 11: feature wall */}
      {s >= 11 && <rect x="84" y="134" width="24" height="50" fill="#a6614a" />}
      {/* 12: entrance feature */}
      {s >= 12 && (
        <g>
          <rect x="158" y="124" width="44" height="4" fill="#d2a84a" />
          <rect x="166" y="184" width="28" height="4" fill="#c9c4ba" />
        </g>
      )}
      {/* 13: pagar */}
      {s >= 13 && (
        <g fill="#5c5c58">
          <rect x="8" y="176" width="70" height="6" />
          <rect x="282" y="176" width="70" height="6" />
          {[12, 30, 48, 66, 286, 304, 322, 340].map((x) => (
            <rect key={x} x={x} y="166" width="5" height="16" />
          ))}
        </g>
      )}
      {/* 14: facade detailing + driveway + taman */}
      {s >= 14 && (
        <g>
          <rect x="150" y="190" width="60" height="46" fill="#b5b0a6" />
          <circle cx="120" cy="196" r="9" fill="#4a8e3c" />
          <circle cx="244" cy="196" r="9" fill="#4a8e3c" />
          <rect x="118" y="196" width="4" height="12" fill="#5c4630" />
          <rect x="242" y="196" width="4" height="12" fill="#5c4630" />
        </g>
      )}
      {/* 15: siap penuh — lampu menyala */}
      {s >= 15 && (
        <g>
          <rect x="164" y="148" width="26" height="36" fill="#8a5c38" rx="2" />
          <circle cx="146" cy="140" r="4" fill="#ffe9a0" />
          <circle cx="214" cy="140" r="4" fill="#ffe9a0" />
          {celebrate && (
            <>
              <rect x="104" y="146" width="30" height="22" fill="#ffe9a0" rx="2" />
              <rect x="226" y="146" width="30" height="22" fill="#ffe9a0" rx="2" />
              <rect x="126" y="98" width="26" height="20" fill="#ffe9a0" rx="2" />
              <rect x="208" y="98" width="26" height="20" fill="#ffe9a0" rx="2" />
            </>
          )}
        </g>
      )}
      {/* signboard kecil */}
      <g>
        <rect x="18" y="150" width="46" height="28" fill="#fff" stroke="#a6191e" strokeWidth="2" rx="2" />
        <text x="41" y="161" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#a6191e">
          MAHLIGAI
        </text>
        <text x="41" y="169" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#a6191e">
          IDAMAN
        </text>
        <rect x="24" y="178" width="3" height="12" fill="#7a5c34" />
        <rect x="55" y="178" width="3" height="12" fill="#7a5c34" />
      </g>
    </svg>
  );
}
