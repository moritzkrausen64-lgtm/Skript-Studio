# ===========================================================================
#  Skript-Studio - lokale Transkription mit faster-whisper
#  Aufruf (vom Express-Server):
#    python transcribe.py --file <video> --language de --model small --models-dir <ordner>
#
#  Ausgabe (stdout, eine JSON-Zeile):
#  {
#    "text": "...",              # Volltext
#    "language": "de",
#    "duration": 123.4,         # Videolänge in Sekunden
#    "segments": [              # Satz-Segmente
#      { "start": 0.0, "end": 2.5, "text": "Das Herz pumpt." }
#    ],
#    "words": [                 # Wort-genaue Timestamps
#      { "word": "Das", "start": 0.1, "end": 0.3, "probability": 0.99 }
#    ]
#  }
# ===========================================================================
import sys
import os
import json
import argparse


def log(*a):
    print(*a, file=sys.stderr, flush=True)


def emit(obj):
    print(json.dumps(obj, ensure_ascii=False), flush=True)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--file", required=True)
    p.add_argument("--language", default="de")
    p.add_argument("--model", default="small")
    p.add_argument("--models-dir", default=None)
    args = p.parse_args()

    if not os.path.isfile(args.file):
        emit({"error": f"Datei nicht gefunden: {args.file}"})
        sys.exit(3)

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        emit({"error": "faster-whisper nicht installiert. whisper-setup.bat ausfuehren."})
        sys.exit(2)

    log(f"[whisper] Lade Modell '{args.model}' ...")
    try:
        model = WhisperModel(
            args.model,
            device="cpu",
            compute_type="int8",
            download_root=args.models_dir,
        )
    except Exception as e:
        emit({"error": f"Modell konnte nicht geladen werden: {e}"})
        sys.exit(4)

    log("[whisper] Transkribiere (mit Wort-Timestamps) ...")
    try:
        segments_gen, info = model.transcribe(
            args.file,
            language=args.language,
            vad_filter=True,
            beam_size=5,
            word_timestamps=True,   # ← Wort-genaue Timestamps aktiviert
        )

        segments_out = []
        words_out = []
        full_text_parts = []

        for seg in segments_gen:
            text = seg.text.strip()
            if not text:
                continue

            segments_out.append({
                "start": round(seg.start, 3),
                "end":   round(seg.end, 3),
                "text":  text,
            })
            full_text_parts.append(text)
            log(f"[whisper] [{seg.start:6.1f}s – {seg.end:5.1f}s] {text}")

            # Wort-Timestamps aus dem Segment
            if seg.words:
                for w in seg.words:
                    words_out.append({
                        "word":        w.word.strip(),
                        "start":       round(w.start, 3),
                        "end":         round(w.end, 3),
                        "probability": round(w.probability, 3),
                    })

    except Exception as e:
        emit({"error": f"Transkription fehlgeschlagen: {e}"})
        sys.exit(5)

    log(f"[whisper] Fertig. {len(segments_out)} Segmente, {len(words_out)} Woerter.")
    emit({
        "text":     " ".join(full_text_parts).strip(),
        "language": getattr(info, "language", args.language),
        "duration": round(getattr(info, "duration", 0.0), 1),
        "segments": segments_out,
        "words":    words_out,
    })


if __name__ == "__main__":
    main()
