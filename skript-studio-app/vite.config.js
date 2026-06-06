import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Das Frontend laeuft auf Port 5173, der lokale Express-Server auf 8787.
// Alle /api-Aufrufe werden zum Server durchgereicht – so landet der API-Key nie im Browser.
//
// host: true bindet den Dev-Server an alle Netzwerk-Adressen (0.0.0.0), damit Handy/Tablet
// im selben WLAN ueber http://<PC-IP>:5173 zugreifen koennen.
// Der Proxy laeuft auf dem PC und spricht den Backend weiter ueber localhost:8787 an –
// das Backend bleibt also vom Netzwerk abgeschirmt, der API-Key verlaesst den PC nie.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    open: true,
    proxy: {
      "/api": "http://localhost:8787",
    },
  },
});
