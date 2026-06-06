import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

// Magenta-Hintergrund für den Chroma-Key-Workflow.
// Wird nach dem Render per ffmpeg entfernt (kein Konflikt mit Content-Farben).
if (typeof document !== "undefined") {
  document.documentElement.style.background = "#ff00ff";
  document.body.style.background = "#ff00ff";
  document.body.style.margin = "0";
}

registerRoot(RemotionRoot);
