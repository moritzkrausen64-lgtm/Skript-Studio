// Lokaler Persistenz-Store — JSON-Dateien im /data-Ordner (via Server-API)

export const store = {
  async get(key) {
    try {
      const res = await fetch(`/api/store/${encodeURIComponent(key)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.value ?? null;
    } catch (e) {
      return null;
    }
  },
  async set(key, value) {
    try {
      await fetch(`/api/store/${encodeURIComponent(key)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
    } catch (e) {}
  },
};

