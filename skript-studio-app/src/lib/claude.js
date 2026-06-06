// Claude-API über den lokalen Server (API-Key bleibt serverseitig)

export async function callClaude(prompt, maxTokens = 3000) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, maxTokens }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error || "API-Aufruf fehlgeschlagen.");
  }
  const data = await res.json();
  const text = data.text || "";
  const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(clean);
}
