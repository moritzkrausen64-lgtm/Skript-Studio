// ============================================================
//  Animations-Bibliothek — Katalog aller verfügbaren Organe
//  und Körperteil-Animationen für Skript-Studio.
//
//  Neue Animation hinzufügen:
//  1. Komposition in src/remotion/compositions/ erstellen
//  2. Hier eintragen (id, name, category, tags, component, ...)
//  3. In Root.jsx registrieren
// ============================================================

import { HeartPump } from "./compositions/HeartPump";
import { Mitochondria } from "./compositions/Mitochondria";
import { KneeJoint } from "./compositions/KneeJoint";
import { OrganAnim } from "./compositions/OrganAnim";

export const LIBRARY = [
  {
    id: "heart-pump",
    name: "Herzschlag",
    category: "Organe",
    tags: [
      "Herz", "Herzschlag", "Herzfrequenz", "BPM", "Puls", "Pumpe",
      "Kreislauf", "Blut", "Ausdauer", "Kardio", "VO2max", "Schlagvolumen",
      "Herzvolumen", "Herzmuskel", "Herzzeitvolumen", "aerob",
    ],
    description: "Pulsierendes Herz mit EKG-Linie, BPM-Anzeige und Cardiac-Output-Daten.",
    component: HeartPump,
    duration: 90,
    fps: 30,
    defaultProps: { bpm: 72, label: "HERZFREQUENZ" },
  },
  {
    id: "mitochondria",
    name: "Mitochondrien",
    category: "Zellbiologie",
    tags: [
      "Mitochondrien", "Mitochondrium", "ATP", "Energie", "Energiestoffwechsel",
      "PGC-1α", "PGC1", "Biogenese", "Mitochondrien-Biogenese", "oxidativ",
      "Ausdauer", "Ausdauertraining", "Zelle", "Muskelzelle", "Stoffwechsel",
      "aerober Stoffwechsel", "Sauerstoff", "VO2max",
    ],
    description: "Mitochondrium mit ATP-Partikeln, Cristae-Membranfalten und Energie-Counter.",
    component: Mitochondria,
    duration: 90,
    fps: 30,
    defaultProps: { label: "MITOCHONDRIEN" },
  },
  {
    id: "knee-joint",
    name: "Kniegelenk",
    category: "Gelenke",
    tags: [
      "Knie", "Kniegelenk", "Gelenk", "Flexion", "Extension", "Beugung",
      "Streckung", "Knorpel", "Meniskus", "Laufen", "Knieschmerz", "Patella",
      "Kniescheibe", "Tibia", "Femur", "Fibula", "ROM", "Beweglichkeit",
      "Knieprobleme", "Kreuzband", "Scharniergelenk", "Rehabilitation",
    ],
    description: "Kniegelenk mit Femur, Tibia und Patella — beugt und streckt sich mit Knorpel-Belastungsanzeige.",
    component: KneeJoint,
    duration: 120,
    fps: 30,
    defaultProps: { label: "KNIEGELENK", speed: 1 },
  },

  // ── OrganAnim: detaillierte SVG-Assets ──────────────────────────────────
  {
    id: "organ-heart",
    name: "Herz-Anatomie",
    category: "Anatomie",
    tags: ["Herz", "Herzquerschnitt", "Ventrikel", "Vorhof", "Aorta", "Septum", "Klappe", "Mitralklappe", "Herzanatomie", "Kardiologie", "Kreislauf"],
    description: "Detaillierter Herzquerschnitt mit Kammern, Klappen, Gefäßen — Scan-Effekt + Highlight-Sequenz.",
    component: OrganAnim,
    duration: 150,
    fps: 30,
    compositionId: "OrganHeart",
    defaultProps: { organ: "heart", label: "HERZ", kicker: "ANATOMIE" },
  },
  {
    id: "organ-lung",
    name: "Lungen-Anatomie",
    category: "Anatomie",
    tags: ["Lunge", "Lungen", "Bronchien", "Alveolen", "Bronchialbaum", "Atmung", "Atemwege", "Trachea", "Sauerstoff", "Gasaustausch", "VO2max", "Lungenfunktion"],
    description: "Beide Lungen mit Bronchialbaum, Alveolen-Clustern und animiertem Atemzyklus.",
    component: OrganAnim,
    duration: 150,
    fps: 30,
    compositionId: "OrganLung",
    defaultProps: { organ: "lung", label: "LUNGE", kicker: "ANATOMIE" },
  },
  {
    id: "organ-muscle",
    name: "Muskelfaser-Sarkomer",
    category: "Anatomie",
    tags: ["Muskelfaser", "Sarkomer", "Myosin", "Aktin", "Myofibrillen", "Kontraktion", "Muskelaufbau", "Z-Linie", "A-Band", "I-Band", "Krafttraining", "Hypertrophie", "Muskelzelle"],
    description: "Muskelfaser-Längsschnitt mit Sarkomer-Struktur, A/I-Band, Z-Linie — animierte Kontraktion.",
    component: OrganAnim,
    duration: 150,
    fps: 30,
    compositionId: "OrganMuscle",
    defaultProps: { organ: "muscle", label: "MUSKELFASER", kicker: "ANATOMIE" },
  },
];

// Kategorien für den Filter
export const CATEGORIES = ["Alle", ...new Set(LIBRARY.map((e) => e.category))];

// Suche: gibt passende Einträge zurück, sortiert nach Relevanz
export function searchLibrary(query) {
  if (!query || !query.trim()) return LIBRARY;
  const q = query.toLowerCase().trim();
  return LIBRARY
    .map((entry) => {
      const nameMatch = entry.name.toLowerCase().includes(q) ? 10 : 0;
      const descMatch = entry.description.toLowerCase().includes(q) ? 5 : 0;
      const tagMatch = entry.tags.filter((t) => t.toLowerCase().includes(q)).length * 3;
      const catMatch = entry.category.toLowerCase().includes(q) ? 4 : 0;
      const score = nameMatch + descMatch + tagMatch + catMatch;
      return { ...entry, _score: score };
    })
    .filter((e) => e._score > 0)
    .sort((a, b) => b._score - a._score);
}

// Auto-Match: prüft ob ein Text-Schnipsel auf einen Bibliothekseintrag passt
// Gibt das beste Match zurück oder null
export function matchToLibrary(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const entry of LIBRARY) {
    const score = entry.tags.filter((t) => lower.includes(t.toLowerCase())).length * 3
      + (lower.includes(entry.name.toLowerCase()) ? 10 : 0);
    if (score > bestScore) { bestScore = score; best = entry; }
  }
  return bestScore >= 3 ? best : null;
}
