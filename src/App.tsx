import { useEffect } from "react";
import { useGameStore } from "./store/gameStore";
import { Splash } from "./pages/Splash";
import { PlayerSetup } from "./pages/PlayerSetup";
import { MainMenu } from "./pages/MainMenu";
import { StageSelect } from "./pages/StageSelect";
import { Game } from "./pages/Game";
import { Result } from "./pages/Result";
import { Project } from "./pages/Project";
import { Badges } from "./pages/Badges";
import { Leaderboard } from "./pages/Leaderboard";
import { Daily } from "./pages/Daily";
import { Settings } from "./pages/Settings";
import { About } from "./pages/About";
import { Certificate } from "./pages/Certificate";
import { Shop } from "./pages/Shop";
import { HowTo } from "./pages/HowTo";
import { setAudioPrefs, unlockAudio } from "./utils/audio";
import { setHapticsEnabled } from "./utils/haptics";

export default function App() {
  const screen = useGameStore((s) => s.screen);
  const settings = useGameStore((s) => s.settings);

  useEffect(() => {
    setAudioPrefs({ sfx: settings.sfx, music: settings.music });
    setHapticsEnabled(settings.vibration);
  }, [settings]);

  // unlock audio pada interaksi pertama (dasar autoplay)
  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  return (
    <div className={`app-frame ${settings.reducedMotion ? "reduced-motion" : ""}`}>
      <div key={screen} className="screen-enter flex-1 flex flex-col min-h-0">
      {screen === "splash" && <Splash />}
      {screen === "setup" && <PlayerSetup />}
      {screen === "menu" && <MainMenu />}
      {screen === "stageSelect" && <StageSelect />}
      {screen === "game" && <Game />}
      {screen === "result" && <Result />}
      {screen === "project" && <Project />}
      {screen === "badges" && <Badges />}
      {screen === "leaderboard" && <Leaderboard />}
      {screen === "daily" && <Daily />}
      {screen === "settings" && <Settings />}
      {screen === "about" && <About />}
      {screen === "certificate" && <Certificate />}
      {screen === "shop" && <Shop />}
      {screen === "howto" && <HowTo />}
      </div>
    </div>
  );
}
