"""
AdBlend Pipeline — Step 6: Insert Ad Into Original Song
=========================================================
Input  : original.mp3                               ← original full song
         adblend_analysis/converted_vocal.wav   ← MJ singing ad script (Step 4)
         no_vocals.wav                          ← Billie Jean instrumental (Demucs)

Output : adblend_analysis/final_with_ad.mp3
         → The original song plays normally.
           At the best natural low-energy gap (between sections),
           the song fades down slightly, MJ sings the NovaBrew ad
           over the Billie Jean beat, then the original song
           crossfades back in and continues as normal.
           Exactly like Spotify — but the ad sounds like part of the song.

HOW INSERTION POINT IS CHOSEN:
  We compute the RMS energy of the original song every 10ms.
  We search the middle 40–80% of the song for the longest
  low-energy gap — a natural breath between verse/chorus/bridge.
  The ad is dropped at the centre of that gap so it feels seamless.

Install:
    uv add pydub soundfile numpy scipy librosa
    sudo apt install ffmpeg
"""

import json
import numpy as np
import soundfile as sf
import librosa
from pathlib import Path
from scipy.ndimage import uniform_filter1d
from scipy import signal

try:
    from pydub import AudioSegment
    from pydub.effects import normalize
    PYDUB_OK = True
except ImportError:
    PYDUB_OK = False
    print("[ERROR] pydub not installed.  Run: uv add pydub")


# ─────────────────────────────────────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────────────────────────────────────

CONVERTED_VOCAL = "music/adblend_analysis/autotuned_vocal.wav"
INSTRUMENTAL    = "music/audios/seperated_audios/no_vocals.wav"
ANALYSIS_DIR    = Path("adblend_analysis")
SONG_NAME       = ""  
parent = Path(__file__).resolve().parents[2]
ORIGINAL_SONG   = parent / "public" / "music" / SONG_NAME /"original.mp3"
OUTPUT_PATH     = parent / "public" / "music" / SONG_NAME /"final_with_ad.mp3"

# ── Where to look for a natural gap ─────────────────────────────────────────
SEARCH_FROM_PCT = 0.50      # start search at 40% of song duration
SEARCH_TO_PCT   = 0.90      # end search at 80% of song duration
MIN_GAP_SEC     = 1.0       # gap must be at least this long to qualify

# ── Mix levels ───────────────────────────────────────────────────────────────
VOCAL_GAIN_DB      =  3   # ad vocal gain  — raise to +3 if too quiet
AD_INST_GAIN_DB    = -2.0   # ad instrumental gain
SONG_DUCK_DB       = -7.0   # how much to duck the original song during ad
                             # makes the transition feel intentional

# ── Transitions ─────────────────────────────────────────────────────────────
FADE_OUT_MS        = 600    # original song fades down before ad
FADE_IN_MS         = 600    # original song fades back in after ad
AD_FADE_IN_MS      = 500    # ad fades in
AD_FADE_OUT_MS     = 500    # ad fades out
CROSSFADE_MS       = 300    # crossfade overlap when stitching back

# ── Vocal EQ ────────────────────────────────────────────────────────────────
HPF_HZ             = 250    # remove low-end rumble from cloned vocal
LPF_HZ             = 12000  # remove harsh highs


# ─────────────────────────────────────────────────────────────────────────────
# 1. Find the best insertion point in the original song
# ─────────────────────────────────────────────────────────────────────────────


def find_insertion_point(song_path: str) -> float:
    """
    Load the original song, compute smoothed RMS energy, find the
    longest low-energy gap in the search window, return its centre (seconds).
    """
    print("\n── Analyzing Song Energy ────────────────────────────────────────────")

    y, sr = librosa.load(song_path, sr=22050, mono=True)
    duration = len(y) / sr
    print(f"  Song duration    : {duration:.1f}s")

    hop_len   = int(0.01 * sr)      # 10ms hop
    frame_len = int(0.05 * sr)      # 50ms frame

    rms   = librosa.feature.rms(y=y, frame_length=frame_len, hop_length=hop_len)[0]
    times = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop_len)

    # Smooth over 300ms to ignore micro-silences
    smooth = uniform_filter1d(rms, size=int(0.3 / (hop_len / sr)))
    norm   = smooth / (smooth.max() + 1e-8)

    # Search window
    t_start = duration * SEARCH_FROM_PCT
    t_end   = duration * SEARCH_TO_PCT
    print(f"  Search window    : {t_start:.1f}s – {t_end:.1f}s")

    # Threshold = bottom 15% of energy in the search window
    in_window = (times >= t_start) & (times <= t_end)
    threshold = float(np.percentile(norm[in_window], 15))
    threshold = max(threshold, 0.04)   # floor to avoid all-silence edge case
    print(f"  Silence threshold: {threshold:.4f} ({threshold*100:.1f}% of peak)")

    # Find contiguous quiet regions
    quiet  = (norm < threshold) & in_window
    gaps   = []
    in_gap = False
    g_start = 0

    for i, q in enumerate(quiet):
        if q and not in_gap:
            in_gap  = True
            g_start = i
        elif not q and in_gap:
            in_gap  = False
            dur_gap = float(times[i] - times[g_start])
            if dur_gap >= MIN_GAP_SEC:
                gaps.append({
                    "start":   float(times[g_start]),
                    "end":     float(times[i]),
                    "dur":     dur_gap,
                    "energy":  float(norm[g_start:i].mean()),
                    "centre":  float((times[g_start] + times[i]) / 2),
                })

    if not gaps:
        # Fallback: use the single quietest frame in the window
        masked = norm.copy()
        masked[~in_window] = 999
        best   = float(times[np.argmin(masked)])
        print(f"  No gap found — using quietest frame at {best:.2f}s")
        global Insertion_point
        Insertion_point = best
        return best

    # Pick gap with the lowest average energy (deepest natural silence)
    best = sorted(gaps, key=lambda g: g["energy"])[0]

    print(f"\n  Gaps found       : {len(gaps)}")
    for i, g in enumerate(sorted(gaps, key=lambda g: g["energy"])[:5]):
        tag = "  ← BEST" if g is best else ""
        print(f"    {g['start']:6.2f}s – {g['end']:6.2f}s  "
              f"({g['dur']:.2f}s)  energy={g['energy']:.4f}{tag}")

    print(f"\n  Insertion point  : {best['centre']:.2f}s")
  
    return best["centre"]


# ─────────────────────────────────────────────────────────────────────────────
# 2. Build the ad segment  (converted vocal + Billie Jean instrumental)
# ─────────────────────────────────────────────────────────────────────────────

def apply_eq(y: np.ndarray, sr: int) -> np.ndarray:
    nyq = sr / 2.0
    if HPF_HZ > 0:
        b, a = signal.butter(4, HPF_HZ / nyq, btype="high")
        y = signal.filtfilt(b, a, y)
    if LPF_HZ > 0 and LPF_HZ < nyq:
        b, a = signal.butter(4, LPF_HZ / nyq, btype="low")
        y = signal.filtfilt(b, a, y)
    return y


def numpy_to_segment(y: np.ndarray, sr: int = 44100) -> AudioSegment:
    y16 = np.clip(y * 32767, -32768, 32767).astype(np.int16)
    return AudioSegment(y16.tobytes(), frame_rate=sr, sample_width=2, channels=1)


def match_loudness(vocal: AudioSegment, reference: AudioSegment,
                   target_boost: float = 1.4) -> AudioSegment:
    """Level vocal to sit slightly above the reference RMS."""
    ref_rms = reference.rms
    voc_rms = vocal.rms
    if voc_rms == 0:
        return vocal
    ratio  = (ref_rms * target_boost) / voc_rms
    gain   = float(np.clip(20 * np.log10(max(ratio, 1e-8)), -12, 12))
    print(f"  Auto-level       : {gain:+.1f} dB")
    return vocal.apply_gain(gain)


def build_ad_segment() -> AudioSegment:
    print("\n── Building Ad Segment ──────────────────────────────────────────────")

    # Load and process converted vocal
    y, sr = sf.read(CONVERTED_VOCAL)
    if y.ndim > 1:
        y = y.mean(axis=1)
    if sr != 44100:
        from scipy.signal import resample_poly
        from math import gcd
        g = gcd(44100, sr)
        y = resample_poly(y, 44100 // g, sr // g)
        sr = 44100

    y  = apply_eq(y, sr)
    pk = np.abs(y).max()
    if pk > 0:
        y = y * (0.891 / pk)

    vocal = numpy_to_segment(y, sr)
    vocal = vocal.apply_gain(VOCAL_GAIN_DB)
    vocal = vocal.fade_in(AD_FADE_IN_MS).fade_out(AD_FADE_OUT_MS)
    print(f"  Vocal duration   : {len(vocal)/1000:.2f}s")

    # Load instrumental and trim to vocal length + small buffer
    inst = AudioSegment.from_file(INSTRUMENTAL)
    inst = inst.set_frame_rate(44100).set_channels(1).set_sample_width(2)
    inst = inst.apply_gain(AD_INST_GAIN_DB)

    ad_len_ms = len(vocal) + 500
    inst_trim = inst[:ad_len_ms]

    # Auto-level vocal against instrumental
    vocal = match_loudness(vocal, inst_trim)

    # Mix vocal over instrumental
    ad = inst_trim.overlay(vocal, position=0)
    ad = ad.fade_in(200).fade_out(400)
    ad = normalize(ad)

    print(f"  Ad duration      : {len(ad)/1000:.2f}s")
    print(f"  [OK]")
    return ad


# ─────────────────────────────────────────────────────────────────────────────
# 3. Stitch: song_part_1 → ad → song_part_2
# ─────────────────────────────────────────────────────────────────────────────

def stitch(original: AudioSegment, ad: AudioSegment,
           insert_sec: float) -> AudioSegment:
    """
    Split the original song at insert_sec.
    Part 1: everything before insert_sec  — fade out at the end
    Ad    : plays in full
    Part 2: everything after insert_sec   — fades in at the start

    The crossfade makes the join smooth so it doesn't sound like
    a hard cut — exactly how a broadcast ad break works.
    """
    print("\n── Stitching Song + Ad ──────────────────────────────────────────────")

    insert_ms = int(insert_sec * 1000)

    part1 = original[:insert_ms]
    part2 = original[insert_ms:]

    # Duck the last FADE_OUT_MS of part1 and first FADE_IN_MS of part2
    # so the ad doesn't crash in over a loud section
    part1 = part1[:-FADE_OUT_MS] + part1[-FADE_OUT_MS:].fade(
        to_gain=SONG_DUCK_DB, start=0, end=FADE_OUT_MS
    )
    part2_intro = part2[:FADE_IN_MS].fade(
        from_gain=SONG_DUCK_DB, start=0, end=FADE_IN_MS
    )
    part2 = part2_intro + part2[FADE_IN_MS:]

    # Crossfade ad into part2 for a smooth exit
    # pydub append with crossfade overlaps the two segments
    ad_then_song = ad.append(part2, crossfade=CROSSFADE_MS)

    # Combine everything
    result = part1 + ad_then_song
    result = normalize(result)

    print(f"  Part 1           : {len(part1)/1000:.1f}s  (up to {insert_sec:.1f}s)")
    print(f"  Ad               : {len(ad)/1000:.1f}s")
    print(f"  Part 2           : {len(part2)/1000:.1f}s  (resumes after ad)")
    print(f"  Total output     : {len(result)/1000:.1f}s")
    print(f"  [OK]")
    return result


# ─────────────────────────────────────────────────────────────────────────────
# 4. Validate inputs
# ─────────────────────────────────────────────────────────────────────────────

def validate():
    print("\n── Inputs ───────────────────────────────────────────────────────────")
    missing = []
    for p in [ORIGINAL_SONG, CONVERTED_VOCAL, INSTRUMENTAL]:
        if not Path(p).exists():
            missing.append(p)
        else:
            mb = Path(p).stat().st_size / 1024 / 1024
            print(f"  [✓] {p}  ({mb:.1f} MB)")
    if missing:
        raise FileNotFoundError(
            f"\nMissing files: {missing}\n"
            "Make sure:\n"
            "  original.mp3        — original song in this folder\n"
            "  no_vocals.wav   — from Demucs (same folder)\n"
            "  converted_vocal.wav — from Step 4\n"
        )


# ─────────────────────────────────────────────────────────────────────────────
# 5. Save report
# ─────────────────────────────────────────────────────────────────────────────

def save_report(insert_sec: float, ad_dur: float, total_dur: float):
    report = {
        "adblend_pipeline_step": 6,
        "original_song":    ORIGINAL_SONG,
        "insertion_point_sec": round(insert_sec, 2),
        "ad_duration_sec":     round(ad_dur, 2),
        "output_duration_sec": round(total_dur, 2),
        "output_file":         str(OUTPUT_PATH),
        "settings": {
            "search_from_pct":  SEARCH_FROM_PCT,
            "search_to_pct":    SEARCH_TO_PCT,
            "min_gap_sec":      MIN_GAP_SEC,
            "vocal_gain_db":    VOCAL_GAIN_DB,
            "song_duck_db":     SONG_DUCK_DB,
        },
        "tuning_guide": {
            "ad too quiet":        "raise VOCAL_GAIN_DB to +3, re-run",
            "ad too loud":         "lower VOCAL_GAIN_DB to -2, re-run",
            "bad insertion point": "change SEARCH_FROM_PCT / SEARCH_TO_PCT, re-run",
            "abrupt transition":   "raise FADE_OUT_MS / FADE_IN_MS, re-run",
            "muddy vocal":         "raise HPF_HZ to 180, re-run",
        },
    }
    out = ANALYSIS_DIR / "step6_report.json"
    with open(out, "w") as f:
        json.dump(report, f, indent=2)
    print(f"\n[OK]   Report → {out}")


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

def main(song_name: str):
    global SONG_NAME
    SONG_NAME = song_name.strip().lower().replace(" ", "") # e.g., "watermelonsugar"
    print(song_name ,"->", SONG_NAME)
    parent = Path(__file__).resolve().parents[2]
    global ORIGINAL_SONG, OUTPUT_PATH
    ORIGINAL_SONG = parent / "public" / "music" / SONG_NAME / "original.mp3"
    OUTPUT_PATH = parent / "public" / "music" / SONG_NAME / "final_with_ad.mp3"
    print(ORIGINAL_SONG,OUTPUT_PATH)
    print("=" * 60)
    print("  AdBlend Pipeline — Step 6: Insert Ad Into Song")
    print("=" * 60)

    if not PYDUB_OK:
        raise RuntimeError("pydub not installed. Run: uv add pydub")

    validate()

    # Step 1 — find where to insert
    insert_sec = find_insertion_point(ORIGINAL_SONG)

    # Step 2 — build the ad (converted vocal + Billie Jean beat)
    ad = build_ad_segment()

    # Step 3 — load original song
    print("\n── Loading Original Song ────────────────────────────────────────────")
    original = AudioSegment.from_file(ORIGINAL_SONG)
    original = original.set_frame_rate(44100).set_channels(1).set_sample_width(2)
    print(f"  Duration         : {len(original)/1000:.1f}s")

    # Step 4 — stitch together
    final = stitch(original, ad, insert_sec)

    # Step 5 — export
    print("\n── Exporting ────────────────────────────────────────────────────────")
    ANALYSIS_DIR.mkdir(exist_ok=True)
    final.export(str(OUTPUT_PATH), format="mp3", bitrate="320k")
    mb  = OUTPUT_PATH.stat().st_size / 1024 / 1024
    dur = len(final) / 1000
    print(f"  [OK]   {OUTPUT_PATH}  ({dur:.1f}s  |  {mb:.1f} MB)")

    save_report(insert_sec, len(ad) / 1000, dur)

    print("\n" + "=" * 60)
    print("  ✅  ADBLEND PIPELINE COMPLETE")
    print("=" * 60)
    print()
    print(f"  Output → adblend_analysis/final_with_ad.mp3")
    print()
    print(f"  What you'll hear:")
    print(f"    0:00 – {insert_sec:.0f}s   Original song plays normally")
    print(f"    {insert_sec:.0f}s          Song ducks slightly")
    print(f"    {insert_sec:.0f}s – {insert_sec + len(ad)/1000:.0f}s   MJ sings NovaBrew ad over Billie Jean beat")
    print(f"    {insert_sec + len(ad)/1000:.0f}s          Original song crossfades back in")
    print(f"    {insert_sec + len(ad)/1000:.0f}s – end   Song continues as normal")
    print()
    print("  Needs adjusting?")
    print("    Vocal too quiet  → raise VOCAL_GAIN_DB to +3")
    print("    Wrong spot       → change SEARCH_FROM_PCT / SEARCH_TO_PCT")
    print("    Abrupt cut       → raise FADE_OUT_MS / FADE_IN_MS")
    print()
    print("  This is your hackathon demo 🎉")
    print("=" * 60)
    return insert_sec


