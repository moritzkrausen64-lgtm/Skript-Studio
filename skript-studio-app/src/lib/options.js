import { Eye, Mic, Type, Zap } from "lucide-react";

export const VIDEO_TYPEN = ["Talking Head", "Voiceover + B-Roll", "POV", "Reaction / Stitch", "Tutorial / How-to", "Listicle", "Story / Narrativ", "Skit / Comedy", "Green-Screen-Kommentar", "Text-on-Screen", "Before / After", "Day-in-the-Life"];
export const HOOK_EBENEN = [{ k: "Visuell stark", icon: Eye }, { k: "Akustisch stark", icon: Mic }, { k: "Textlich stark", icon: Type }, { k: "Sprachlich stark", icon: Zap }];
export const HOOK_ARCHETYPEN = ["Automatisch wählen", "Neugier-Lücke", "Warnung / Negativität", "Social Proof", "Kontroverse", "Relatability", "Transformation", "FOMO"];
export const FRAMEWORKS = ["Pain – Problem – Solution", "PAS (Problem-Agitate-Solve)", "AIDA", "Hook – Retain – Reward", "Mythbusting", "3-Tipps-Listicle", "Story-Bogen"];
export const LAENGEN = ["7 s", "15 s", "30 s", "60 s", "90 s"];
export const TON = ["Edukativ-ruhig", "Locker-relatable", "Autoritär-Experte", "Energetisch-hype", "Provokant-frech"];
export const CTA_ZIELE = ["Follow", "Kommentar provozieren", "Save", "Share", "Link in Bio"];
export const CLAIM_STUFEN = ["Vorsichtig / wissenschaftlich", "Ausgewogen", "Zugespitzt", "Provokant"];
export const PLATTFORM = ["TikTok", "Instagram Reels", "Beide"];
export const DETAIL_OPTS = ["Anfänger", "Medium", "Experten"];
export const BILD_OPTS = ["Ohne Bildsprache", "Dezente Bildsprache", "Viel Bildsprache / Analogien"];
export const DETAIL_HINT = {
  "Anfänger": "einfache Alltagserklärungen, kaum bis keine Fachbegriffe, alles sofort verständlich",
  "Medium": "ausgewogen: ein paar Fachbegriffe, aber jeweils kurz erklärt",
  "Experten": "fachlich tief, rein in Physiologie/Mechanismen, Fachsprache erlaubt und erwünscht",
};
export const BILD_HINT = {
  "Ohne Bildsprache": "keine Metaphern, sachlich-direkt",
  "Dezente Bildsprache": "vereinzelt eine treffende Analogie zur Veranschaulichung",
  "Viel Bildsprache / Analogien": "komplexe Inhalte konsequent über Metaphern/Analogien greifbar machen",
};
export const BILD_RULE = {
  "Ohne Bildsprache": "Verzichte bewusst auf Metaphern und Vergleiche. Bleib sachlich und direkt.",
  "Dezente Bildsprache": "Baue mindestens EINE treffende, konkrete Analogie ins Skript ein (z.B. ein Körpervorgang als Alltagsbild). Setze sie gezielt dort, wo es am meisten hilft.",
  "Viel Bildsprache / Analogien": "PFLICHT: Erkläre die zentralen komplexen Punkte durchgehend mit konkreten, anschaulichen Metaphern/Analogien aus dem Alltag (z.B. Mitochondrien als Kraftwerke, Sehne als Sprungfeder). In der Mehrzahl der Beats MUSS ein konkretes Bild vorkommen. Vermeide rein abstrakte, sachliche Formulierungen überall dort, wo ein anschauliches Bild möglich ist.",
};

