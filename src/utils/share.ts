// Share result: Web Share API dengan fallback clipboard + toast
export async function shareText(text: string): Promise<"shared" | "copied" | "failed"> {
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return "shared";
    } catch {
      /* pengguna batal — cuba clipboard */
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return "copied";
    } catch {
      return "failed";
    }
  }
}
