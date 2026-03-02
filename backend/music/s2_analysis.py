"""
AdBlend Music Ad Pipeline — Step 2: Stem Analysis
===================================================
Input  : vocal.wav, non_vocal.wav  (from Demucs)
Output : voice_embedding.npy
         f0_contour.npy
         beat_grid.npy
         analysis_report.json

Install:
    pip install resemblyzer librosa numpy soundfile scipy pyloudnorm
"""

import os
import json
import numpy as np
import librosa
import soundfile as sf
from pathlib import Path

# ── resemblyzer is optional-import so we can give a clean error ──────────────
try:
    from resemblyzer import VoiceEncoder, preprocess_wav as resemblyzer_preprocess
    RESEMBLYZER_OK = True
except ImportError:
    RESEMBLYZER_OK = False
    print("[WARN] resemblyzer not installed — voice embedding will be skipped.")
    print("       Run: pip install resemblyzer")

try:
    import pyloudnorm as pyln
    PYLOUDNORM_OK = True
except ImportError:
    PYLOUDNORM_OK = False
    print("[WARN] pyloudnorm not installed — loudness analysis will be skipped.")


# ─────────────────────────────────────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────────────────────────────────────

VOCAL_PATH     = "music/audios/seperated_audios/vocals.wav"
NON_VOCAL_PATH = "music/audios/seperated_audios/no_vocals.wav"
OUTPUT_DIR     = "adblend_analysis"

# F0 (pitch) search range — covers most human singing voices
F0_MIN_HZ = 65    # ~C2  (very low male)
F0_MAX_HZ = 1050  # ~C6  (high soprano)


# ─────────────────────────────────────────────────────────────────────────────
# Utilities
# ─────────────────────────────────────────────────────────────────────────────

def ensure_output_dir(path: str) -> Path:
    p = Path(path)
    p.mkdir(parents=True, exist_ok=True)
    return p


def load_audio(filepath: str, target_sr: int = 22050):
    """Load audio, convert to mono, resample to target_sr."""
    print(f"\n[LOAD] {filepath}")
    y, sr = librosa.load(filepath, sr=target_sr, mono=True)
    duration = librosa.get_duration(y=y, sr=sr)
    print(f"       duration: {duration:.2f}s  |  sr: {sr} Hz  |  samples: {len(y)}")
    return y, sr, duration


def hz_to_note(hz: float) -> str:
    """Convert a frequency in Hz to the closest musical note name."""
    if hz <= 0 or np.isnan(hz):
        return "—"
    note = librosa.hz_to_note(hz)
    return note


# ─────────────────────────────────────────────────────────────────────────────
# Step 1 — Voice Embedding  (from vocal.wav)
# ─────────────────────────────────────────────────────────────────────────────

def extract_voice_embedding(vocal_path: str, out_dir: Path) -> np.ndarray | None:
    """
    Use Resemblyzer to create a 256-dim voice fingerprint.
    This vector captures timbre, pitch tendencies, and resonance — everything
    that makes a voice sound unique.  Feed it into RVC later.
    """
    print("\n── Voice Embedding ──────────────────────────────────────────────────")

    if not RESEMBLYZER_OK:
        print("[SKIP] resemblyzer unavailable.")
        return None

    encoder = VoiceEncoder()
    wav = resemblyzer_preprocess(Path(vocal_path))
    embed = encoder.embed_utterance(wav)           # shape: (256,)

    out_path = out_dir / "voice_embedding.npy"
    np.save(out_path, embed)

    print(f"[OK]   Voice embedding saved → {out_path}")
    print(f"       Shape: {embed.shape}  |  norm: {np.linalg.norm(embed):.4f}")
    return embed


# ─────────────────────────────────────────────────────────────────────────────
# Step 2 — F0 Contour  (from vocal.wav)
# ─────────────────────────────────────────────────────────────────────────────

def extract_f0_contour(y: np.ndarray, sr: int, out_dir: Path) -> dict:
    """
    Extract the fundamental frequency (F0) over time using pYIN.

    pYIN is more accurate than plain YIN for singing — it handles vibrato
    and the unvoiced/voiced distinction much better.

    Returns a dict with:
      - times          : time axis (seconds)
      - f0             : Hz per frame (nan where unvoiced)
      - voiced_flag    : bool array — True where singing is detected
      - mean_f0        : average sung pitch in Hz
      - phrase_segments: list of (start_sec, end_sec) voiced segments
    """
    print("\n── F0 / Melody Contour ──────────────────────────────────────────────")

    f0, voiced_flag, voiced_probs = librosa.pyin(
        y,
        fmin=F0_MIN_HZ,
        fmax=F0_MAX_HZ,
        sr=sr,
        frame_length=2048,
        hop_length=512,
    )

    times = librosa.times_like(f0, sr=sr, hop_length=512)

    # Replace unvoiced frames with NaN so downstream tools can ignore them
    f0_clean = f0.copy()
    f0_clean[~voiced_flag] = np.nan

    # Detect phrase segments (contiguous voiced regions)
    phrase_segments = []
    in_phrase = False
    start_idx = 0
    for i, voiced in enumerate(voiced_flag):
        if voiced and not in_phrase:
            in_phrase = True
            start_idx = i
        elif not voiced and in_phrase:
            in_phrase = False
            phrase_segments.append({
                "start_sec": float(times[start_idx]),
                "end_sec":   float(times[i]),
                "duration":  float(times[i] - times[start_idx]),
            })
    if in_phrase:  # catch phrase that goes to end of file
        phrase_segments.append({
            "start_sec": float(times[start_idx]),
            "end_sec":   float(times[-1]),
            "duration":  float(times[-1] - times[start_idx]),
        })

    mean_f0 = float(np.nanmean(f0_clean)) if np.any(voiced_flag) else 0.0

    # Save
    out_path = out_dir / "f0_contour.npy"
    np.save(out_path, np.stack([times, f0_clean], axis=0))  # shape (2, N)

    print(f"[OK]   F0 contour saved → {out_path}")
    print(f"       Frames: {len(f0)}  |  Voiced: {voiced_flag.sum()}  ({voiced_flag.mean()*100:.1f}%)")
    print(f"       Mean pitch: {mean_f0:.1f} Hz  ({hz_to_note(mean_f0)})")
    print(f"       Phrase segments detected: {len(phrase_segments)}")
    for seg in phrase_segments[:5]:  # print first 5
        print(f"         {seg['start_sec']:.2f}s → {seg['end_sec']:.2f}s  ({seg['duration']:.2f}s)")
    if len(phrase_segments) > 5:
        print(f"         ... and {len(phrase_segments)-5} more")

    return {
        "times":           times,
        "f0":              f0_clean,
        "voiced_flag":     voiced_flag,
        "mean_f0_hz":      mean_f0,
        "mean_note":       hz_to_note(mean_f0),
        "phrase_segments": phrase_segments,
        "total_phrases":   len(phrase_segments),
    }


# ─────────────────────────────────────────────────────────────────────────────
# Step 3 — Beat Grid & Musical Context  (from non_vocal.wav)
# ─────────────────────────────────────────────────────────────────────────────

def extract_beat_grid(y: np.ndarray, sr: int, out_dir: Path) -> dict:
    """
    Extract BPM, beat timestamps, key, and chroma from the instrumental stem.

    The beat grid tells you exactly WHERE in time each beat falls — critical
    for aligning synthesized ad lyrics to the song's natural pulse.
    """
    print("\n── Beat Grid & Musical Context ──────────────────────────────────────")

    # ── Tempo + Beats ──
    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr, units="frames")
    beat_times = librosa.frames_to_time(beat_frames, sr=sr)

    # ── Key Detection via Chroma ──
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
    chroma_mean = chroma.mean(axis=1)                # average energy per pitch class
    pitch_classes = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"]
    key_idx  = int(np.argmax(chroma_mean))
    key_name = pitch_classes[key_idx]

    # Simple major/minor heuristic: compare major-profile vs minor-profile correlation
    major_profile = np.array([6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88])
    minor_profile = np.array([6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17])
    chroma_rolled  = np.roll(chroma_mean, -key_idx)
    mode = "major" if np.dot(chroma_rolled, major_profile) >= np.dot(chroma_rolled, minor_profile) else "minor"

    # ── Spectral Features (for EQ matching later) ──
    spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr).mean()
    spectral_rolloff  = librosa.feature.spectral_rolloff(y=y, sr=sr).mean()
    zero_crossing     = librosa.feature.zero_crossing_rate(y).mean()

    # ── Loudness ──
    loudness_lufs = None
    if PYLOUDNORM_OK:
        meter = pyln.Meter(sr)
        loudness_lufs = round(meter.integrated_loudness(y), 2)

    # ── Bar Grid (group beats into bars, assume 4/4) ──
    bar_times = beat_times[::4].tolist()   # every 4 beats = 1 bar

    # ── Save ──
    out_path = out_dir / "beat_grid.npy"
    np.save(out_path, beat_times)

    print(f"[OK]   Beat grid saved → {out_path}")
    print(f"       Tempo: {float(tempo[0]):.1f} BPM")
    print(f"       Beats detected: {len(beat_times)}")
    print(f"       Key: {key_name} {mode}")
    print(f"       Spectral centroid: {spectral_centroid:.1f} Hz")
    if loudness_lufs is not None:
        print(f"       Loudness: {loudness_lufs} LUFS")
    print(f"       First 8 beat timestamps (sec): {[round(t,3) for t in beat_times[:8].tolist()]}")

    return {
        "tempo_bpm":         float(tempo[0]),
        "beat_times":        beat_times.tolist(),
        "bar_times":         bar_times,
        "total_beats":       int(len(beat_times)),
        "key":               key_name,
        "mode":              mode,
        "key_full":          f"{key_name} {mode}",
        "spectral_centroid": float(spectral_centroid),
        "spectral_rolloff":  float(spectral_rolloff),
        "zero_crossing_rate":float(zero_crossing),
        "loudness_lufs":     loudness_lufs,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Step 4 — Syllable Budget for Ad Lyrics
# ─────────────────────────────────────────────────────────────────────────────

def compute_syllable_budget(f0_data: dict, beat_data: dict) -> list[dict]:
    """
    For each voiced phrase in the vocal, calculate how many syllables
    typically fit based on duration and BPM.

    This gives you the constraint you pass to Mistral when generating
    ad lyrics — so every line fits the melody without stretching or rushing.

    Rule of thumb: ~2–4 syllables per beat at normal singing pace.
    """
    print("\n── Syllable Budget per Phrase ───────────────────────────────────────")

    bpm        = beat_data["tempo_bpm"]
    beat_dur   = 60.0 / bpm          # seconds per beat
    syl_budget = []

    for i, phrase in enumerate(f0_data["phrase_segments"]):
        duration   = phrase["duration"]
        beats_in   = duration / beat_dur
        # Comfortable singing range: 2–3 syllables per beat
        syl_low    = max(1, int(beats_in * 2))
        syl_high   = max(1, int(beats_in * 3))
        syl_target = max(1, round(beats_in * 2.5))

        entry = {
            "phrase_index":  i,
            "start_sec":     phrase["start_sec"],
            "end_sec":       phrase["end_sec"],
            "duration_sec":  round(duration, 3),
            "beats_in_phrase": round(beats_in, 2),
            "syllable_range": f"{syl_low}–{syl_high}",
            "syllable_target": syl_target,
        }
        syl_budget.append(entry)

        print(f"  Phrase {i+1:02d}: {phrase['start_sec']:.1f}s–{phrase['end_sec']:.1f}s  "
              f"({beats_in:.1f} beats)  →  target {syl_target} syllables  [{syl_low}–{syl_high}]")

    return syl_budget


# ─────────────────────────────────────────────────────────────────────────────
# Step 5 — Build Mistral Prompt
# ─────────────────────────────────────────────────────────────────────────────

def build_mistral_prompt(
    syl_budget: list[dict],
    beat_data: dict,
    brand: str = "NovaBrew",
    product: str = "Cold Brew Coffee",
    tone: str = "energetic and warm",
    num_phrases: int = 4,
) -> str:
    """
    Build the exact prompt to send to Mistral for constrained ad lyric generation.
    Uses the syllable budget so the output fits the melody.
    """
    phrases_to_use = syl_budget[:num_phrases]
    constraints    = "\n".join([
        f"  Line {i+1}: exactly {p['syllable_target']} syllables  "
        f"(acceptable range: {p['syllable_range']})"
        for i, p in enumerate(phrases_to_use)
    ])

    prompt = f"""You are a music copywriter writing ad lyrics that will be sung in a {beat_data['key_full']} song at {beat_data['tempo_bpm']:.0f} BPM.

BRAND: {brand}
PRODUCT: {product}
TONE: {tone}

SYLLABLE CONSTRAINTS (you must match these exactly):
{constraints}

RULES:
- Output ONLY the lyrics, one line per phrase
- No titles, no explanations, no punctuation except commas
- Each line must flow naturally when sung
- Weave the brand or product name into at least one line
- Match the energy of a {beat_data['tempo_bpm']:.0f} BPM {beat_data['mode']} key song

OUTPUT FORMAT:
Line 1: <lyric>
Line 2: <lyric>
...
"""
    return prompt


# ─────────────────────────────────────────────────────────────────────────────
# Final Report
# ─────────────────────────────────────────────────────────────────────────────

def save_report(
    out_dir:     Path,
    vocal_dur:   float,
    nonvocal_dur:float,
    f0_data:     dict,
    beat_data:   dict,
    syl_budget:  list[dict],
    mistral_prompt: str,
):
    report = {
        "adblend_pipeline_step": 2,
        "files_analyzed": {
            "vocal_wav_duration_sec":     round(vocal_dur, 2),
            "non_vocal_wav_duration_sec": round(nonvocal_dur, 2),
        },
        "voice_profile": {
            "mean_pitch_hz":   f0_data["mean_f0_hz"],
            "mean_note":       f0_data["mean_note"],
            "voiced_phrases":  f0_data["total_phrases"],
            "embedding_saved": RESEMBLYZER_OK,
        },
        "musical_context": {
            "tempo_bpm":       beat_data["tempo_bpm"],
            "key":             beat_data["key_full"],
            "total_beats":     beat_data["total_beats"],
            "loudness_lufs":   beat_data["loudness_lufs"],
            "spectral_centroid_hz": round(beat_data["spectral_centroid"], 1),
        },
        "syllable_budget":    syl_budget,
        "mistral_prompt":     mistral_prompt,
        "next_steps": [
            "1. Send mistral_prompt to Mistral API to get ad lyrics",
            "2. Run TTS on the lyrics (Coqui or ElevenLabs) → tts_output.wav",
            "3. Train RVC on vocal.wav, then convert tts_output.wav",
            "4. Use f0_contour.npy as pitch guide inside RVC",
            "5. Mix converted_vocal.wav + non_vocal.wav with ffmpeg",
        ],
    }

    report_path = out_dir / "analysis_report.json"
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)

    print(f"\n[OK]   Full report saved → {report_path}")
    return report


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("  AdBlend Pipeline — Step 2: Stem Analysis")
    print("=" * 60)

    # Validate inputs
    for path in [VOCAL_PATH, NON_VOCAL_PATH]:
        if not os.path.exists(path):
            raise FileNotFoundError(f"Missing file: {path}  — run Demucs first.")

    out_dir = ensure_output_dir(OUTPUT_DIR)

    # ── Load both stems ──
    y_vocal,     sr_vocal,     dur_vocal     = load_audio(VOCAL_PATH)
    y_nonvocal,  sr_nonvocal,  dur_nonvocal  = load_audio(NON_VOCAL_PATH)

    # ── Run all analyses ──
    embed      = extract_voice_embedding(VOCAL_PATH, out_dir)
    f0_data    = extract_f0_contour(y_vocal, sr_vocal, out_dir)
    beat_data  = extract_beat_grid(y_nonvocal, sr_nonvocal, out_dir)
    syl_budget = compute_syllable_budget(f0_data, beat_data)
    prompt     = build_mistral_prompt(syl_budget, beat_data)

    report = save_report(
        out_dir, dur_vocal, dur_nonvocal,
        f0_data, beat_data, syl_budget, prompt,
    )

    # ── Summary ──
    print("\n" + "=" * 60)
    print("  ANALYSIS COMPLETE")
    print("=" * 60)
    print(f"  Tempo    : {beat_data['tempo_bpm']:.1f} BPM")
    print(f"  Key      : {beat_data['key_full']}")
    print(f"  Vocal    : {f0_data['mean_note']}  ({f0_data['mean_f0_hz']:.1f} Hz avg)")
    print(f"  Phrases  : {f0_data['total_phrases']} detected")
    print(f"\n  Output files in: ./{OUTPUT_DIR}/")
    print(f"    voice_embedding.npy  — feed into RVC")
    print(f"    f0_contour.npy       — pitch guide for singing synthesis")
    print(f"    beat_grid.npy        — beat timestamps for alignment")
    print(f"    analysis_report.json — full data + Mistral prompt")
    print("\n  NEXT: Copy the mistral_prompt from analysis_report.json")
    print("        and send it to the Mistral API to generate ad lyrics.")
    print("=" * 60)

    return report


# if __name__ == "__main__":
#     main()