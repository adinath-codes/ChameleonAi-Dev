"""
AdBlend Pipeline — Step 5: Final Mix
======================================
Input  : adblend_analysis/converted_vocal.wav   (MJ voice — from Step 4)
         no_vocals.wav                           (Billie Jean instrumental — from Demucs)
         adblend_analysis/f0_contour.npy         (phrase timestamps — from Step 2)
         adblend_analysis/ad_lyrics.json         (phrase timing — from Step 3)

Output : adblend_analysis/final_ad.wav           (complete seamless ad)
         adblend_analysis/full_song_with_ad.wav  (full song with ad inserted at marker)

Install:
    uv add pydub soundfile numpy scipy
    sudo apt install ffmpeg   ← required by pydub
"""

import json
import numpy as np
import soundfile as sf
from pathlib import Path
from scipy import signal

try:
    from pydub import AudioSegment
    from pydub.effects import normalize, compress_dynamic_range
    PYDUB_OK = True
except ImportError:
    PYDUB_OK = False
    print("[ERROR] pydub not installed. Run: uv add pydub")


# ─────────────────────────────────────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────────────────────────────────────

VOCAL_PATH      = "music/adblend_analysis/autotuned_vocal.wav"   # MJ cloned voice
INSTRUMENTAL    = "music/audios/seperated_audios/no_vocals.wav"                           # Billie Jean beat
F0_PATH         = "music/adblend_analysis/f0_contour.npy"
LYRICS_PATH     = "music/adblend_analysis/ad_lyrics.json"
ANALYSIS_DIR    = Path("music/adblend_analysis")

# Output files
FINAL_AD_OUT    = ANALYSIS_DIR / "final_ad.wav"            # just the ad segment
FULL_SONG_OUT   = ANALYSIS_DIR / "full_song_with_ad.wav"   # full song + ad inserted

# ── Where in the song to insert the ad ──────────────────────────────────────
# Time in seconds where the ad vocal replaces the original vocal
# Billie Jean is ~294s long — mid-song around 90s works well
AD_INSERT_SEC   = 10.0      # ← change this to move the ad insertion point

# ── Mix levels (dB) ──────────────────────────────────────────────────────────
VOCAL_GAIN_DB      =  3.0   # boost/cut the converted vocal
                            # if vocal is too quiet → try +3
                            # if vocal overpowers beat → try -2

INSTRUMENTAL_GAIN_DB = -1.0 # slight duck on instrumental during ad
                            # makes vocal sit forward in the mix

# ── Fade settings ────────────────────────────────────────────────────────────
FADE_IN_MS      = 500       # ms — fade in on the ad vocal start
FADE_OUT_MS     = 500       # ms — fade out at the end of ad vocal
CROSSFADE_MS    = 200       # ms — crossfade when rejoining original song

# ── EQ — simple high-pass to remove muddiness from cloned vocal ─────────────
VOCAL_HPF_HZ    = 120       # Hz — remove low-end rumble below this
VOCAL_LPF_HZ    = 12000     # Hz — remove harshness above this


# ─────────────────────────────────────────────────────────────────────────────
# Utilities
# ─────────────────────────────────────────────────────────────────────────────

def load_wav_as_segment(path: str) -> AudioSegment:
    seg = AudioSegment.from_file(str(path))
    seg = seg.set_frame_rate(44100).set_channels(1).set_sample_width(2)
    return seg


def numpy_to_segment(y: np.ndarray, sr: int = 44100) -> AudioSegment:
    y_int16 = (y * 32767).astype(np.int16)
    return AudioSegment(
        y_int16.tobytes(),
        frame_rate=sr,
        sample_width=2,
        channels=1,
    )


def segment_to_numpy(seg: AudioSegment) -> tuple[np.ndarray, int]:
    samples = np.array(seg.get_array_of_samples(), dtype=np.float32) / 32767.0
    return samples, seg.frame_rate


def apply_eq(y: np.ndarray, sr: int, hpf_hz: float, lpf_hz: float) -> np.ndarray:
    """Apply high-pass and low-pass filter to clean up the vocal."""
    nyq = sr / 2.0

    # High-pass — remove rumble
    if hpf_hz > 0:
        b, a = signal.butter(4, hpf_hz / nyq, btype="high")
        y = signal.filtfilt(b, a, y)

    # Low-pass — remove harshness
    if lpf_hz > 0 and lpf_hz < nyq:
        b, a = signal.butter(4, lpf_hz / nyq, btype="low")
        y = signal.filtfilt(b, a, y)

    return y


def match_loudness(vocal: AudioSegment, reference: AudioSegment) -> AudioSegment:
    """
    Roughly match the vocal loudness to the reference (instrumental).
    Uses RMS-based leveling — keeps the vocal audible but not overwhelming.
    """
    ref_rms  = reference.rms
    voc_rms  = vocal.rms

    if voc_rms == 0:
        return vocal

    # Target: vocal should be ~3dB louder than instrumental RMS
    # so it sits forward in the mix without overpowering
    target_rms = ref_rms * 1.4
    ratio      = target_rms / voc_rms
    gain_db    = 20 * np.log10(ratio)
    gain_db    = max(-12, min(12, gain_db))   # clamp to ±12dB safety range

    print(f"  Auto-level: applying {gain_db:+.1f} dB to vocal")
    return vocal.apply_gain(gain_db)


# ─────────────────────────────────────────────────────────────────────────────
# Step 5a — Process the converted vocal
# ─────────────────────────────────────────────────────────────────────────────

def process_vocal() -> AudioSegment:
    print("\n── Processing Converted Vocal ───────────────────────────────────────")

    y, sr = sf.read(VOCAL_PATH)
    if y.ndim > 1:
        y = y.mean(axis=1)

    dur = len(y) / sr
    print(f"  Loaded: {dur:.2f}s  |  SR: {sr} Hz")

    # Resample to 44100 if needed
    if sr != 44100:
        from scipy.signal import resample_poly
        from math import gcd
        g = gcd(44100, sr)
        y = resample_poly(y, 44100 // g, sr // g)
        sr = 44100
        print(f"  Resampled to 44100 Hz")

    # EQ
    print(f"  Applying EQ: HPF {VOCAL_HPF_HZ}Hz  LPF {VOCAL_LPF_HZ}Hz")
    y = apply_eq(y, sr, VOCAL_HPF_HZ, VOCAL_LPF_HZ)

    # Normalise to prevent clipping
    peak = np.abs(y).max()
    if peak > 0:
        y = y * (0.90 / peak)

    vocal_seg = numpy_to_segment(y, sr)

    # Apply configured gain
    vocal_seg = vocal_seg.apply_gain(VOCAL_GAIN_DB)

    # Fade in/out for smooth entry and exit
    vocal_seg = vocal_seg.fade_in(FADE_IN_MS).fade_out(FADE_OUT_MS)

    # Light compression to glue it together
    try:
        vocal_seg = compress_dynamic_range(vocal_seg)
    except Exception:
        pass  # not critical

    print(f"  Duration after processing: {len(vocal_seg)/1000:.2f}s")
    print(f"  [OK]")
    return vocal_seg


# ─────────────────────────────────────────────────────────────────────────────
# Step 5b — Load and prepare instrumental
# ─────────────────────────────────────────────────────────────────────────────

def process_instrumental() -> AudioSegment:
    print("\n── Loading Instrumental ─────────────────────────────────────────────")

    inst = load_wav_as_segment(INSTRUMENTAL)
    dur  = len(inst) / 1000
    print(f"  Loaded: {dur:.2f}s  |  {inst.frame_rate} Hz  |  {inst.channels}ch")

    inst = inst.apply_gain(INSTRUMENTAL_GAIN_DB)
    print(f"  Gain: {INSTRUMENTAL_GAIN_DB:+.1f} dB")
    print(f"  [OK]")
    return inst


# ─────────────────────────────────────────────────────────────────────────────
# Step 5c — Mix vocal over instrumental
# ─────────────────────────────────────────────────────────────────────────────

def mix_ad(vocal: AudioSegment, instrumental: AudioSegment) -> AudioSegment:
    """
    Overlay the vocal onto the instrumental starting at AD_INSERT_SEC.
    The instrumental plays underneath the entire time — we just ADD the vocal on top.
    """
    print("\n── Mixing Ad ────────────────────────────────────────────────────────")

    insert_ms   = int(AD_INSERT_SEC * 1000)
    vocal_dur_ms = len(vocal)
    inst_dur_ms  = len(instrumental)

    print(f"  Insert point : {AD_INSERT_SEC:.1f}s  ({insert_ms}ms)")
    print(f"  Vocal length : {vocal_dur_ms/1000:.2f}s")
    print(f"  Song length  : {inst_dur_ms/1000:.2f}s")

    if insert_ms + vocal_dur_ms > inst_dur_ms:
        print(f"  [WARN] Ad extends beyond song end — trimming")
        vocal = vocal[:inst_dur_ms - insert_ms]

    # Auto-level vocal to match instrumental loudness
    ref_slice = instrumental[insert_ms:insert_ms + vocal_dur_ms]
    vocal     = match_loudness(vocal, ref_slice)

    # Overlay vocal onto instrumental at the insert point
    mixed = instrumental.overlay(vocal, position=insert_ms)

    print(f"  [OK]  Mixed successfully")
    return mixed


# ─────────────────────────────────────────────────────────────────────────────
# Step 5d — Build standalone ad segment (just the ad, not the whole song)
# ─────────────────────────────────────────────────────────────────────────────

def build_standalone_ad(vocal: AudioSegment, instrumental: AudioSegment) -> AudioSegment:
    """
    Cut just the ad portion from the song — instrumental + vocal mixed together.
    Adds 1s of instrumental intro and 1s outro for context.
    """
    print("\n── Building Standalone Ad Clip ──────────────────────────────────────")

    insert_ms    = int(AD_INSERT_SEC * 1000)
    vocal_dur_ms = len(vocal)
    padding_ms   = 1000   # 1s of instrumental before and after

    start_ms = max(0, insert_ms - padding_ms)
    end_ms   = min(len(instrumental), insert_ms + vocal_dur_ms + padding_ms)

    # Slice the instrumental window
    inst_slice = instrumental[start_ms:end_ms]

    # Position vocal within this slice
    vocal_pos  = insert_ms - start_ms
    ad_clip    = inst_slice.overlay(vocal, position=vocal_pos)

    # Fade in/out the whole clip
    ad_clip = ad_clip.fade_in(400).fade_out(600)

    dur = len(ad_clip) / 1000
    print(f"  Ad clip: {start_ms/1000:.1f}s → {end_ms/1000:.1f}s  ({dur:.2f}s total)")
    print(f"  [OK]")
    return ad_clip


# ─────────────────────────────────────────────────────────────────────────────
# Step 5e — Export
# ─────────────────────────────────────────────────────────────────────────────

def export(seg: AudioSegment, path: Path, label: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    seg = normalize(seg)   # final loudness normalisation before export
    seg.export(str(path), format="wav")
    size_mb = path.stat().st_size / 1024 / 1024
    dur     = len(seg) / 1000
    print(f"  [OK]   {label}")
    print(f"         {path}  ({dur:.1f}s  |  {size_mb:.1f} MB)")


# ─────────────────────────────────────────────────────────────────────────────
# Save report
# ─────────────────────────────────────────────────────────────────────────────

def save_report():
    report = {
        "adblend_pipeline_step": 5,
        "outputs": {
            "final_ad":       str(FINAL_AD_OUT),
            "full_song":      str(FULL_SONG_OUT),
        },
        "settings": {
            "ad_insert_sec":        AD_INSERT_SEC,
            "vocal_gain_db":        VOCAL_GAIN_DB,
            "instrumental_gain_db": INSTRUMENTAL_GAIN_DB,
            "fade_in_ms":           FADE_IN_MS,
            "fade_out_ms":          FADE_OUT_MS,
            "vocal_hpf_hz":         VOCAL_HPF_HZ,
            "vocal_lpf_hz":         VOCAL_LPF_HZ,
        },
        "tuning_guide": {
            "vocal too quiet":      "raise VOCAL_GAIN_DB to +3",
            "vocal too loud":       "lower VOCAL_GAIN_DB to -2",
            "muddy sound":          "raise VOCAL_HPF_HZ to 180",
            "harsh/tinny":          "lower VOCAL_LPF_HZ to 8000",
            "move ad earlier":      "lower AD_INSERT_SEC",
            "move ad later":        "raise AD_INSERT_SEC",
            "abrupt transitions":   "raise FADE_IN_MS and FADE_OUT_MS",
        },
        "pipeline_complete": True,
        "files_produced": [
            str(FINAL_AD_OUT),
            str(FULL_SONG_OUT),
        ],
    }

    out = ANALYSIS_DIR / "step5_report.json"
    with open(out, "w") as f:
        json.dump(report, f, indent=2)
    print(f"\n[OK]   Report → {out}")


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("  AdBlend Pipeline — Step 5: Final Mix")
    print("=" * 60)

    if not PYDUB_OK:
        raise RuntimeError("pydub not installed. Run: uv add pydub")

    # Check inputs
    print("\n── Inputs ───────────────────────────────────────────────────────────")
    for p in [VOCAL_PATH, INSTRUMENTAL]:
        if not Path(p).exists():
            raise FileNotFoundError(
                f"Missing: {p}\n"
                f"{'Run Step 4 first.' if 'converted' in p else 'Make sure no_vocals.wav is in the same folder.'}"
            )
        size_mb = Path(p).stat().st_size / 1024 / 1024
        print(f"  [✓] {p}  ({size_mb:.1f} MB)")

    # Process
    vocal        = process_vocal()
    instrumental = process_instrumental()

    # Build outputs
    standalone_ad  = build_standalone_ad(vocal, instrumental)
    full_song      = mix_ad(vocal, instrumental)

    # Export
    print("\n── Exporting ────────────────────────────────────────────────────────")
    export(standalone_ad, FINAL_AD_OUT,  "final_ad.wav        ← just the ad segment")
    export(full_song,     FULL_SONG_OUT, "full_song_with_ad.wav ← complete song + ad")

    save_report()

    print("\n" + "=" * 60)
    print("  PIPELINE COMPLETE 🎉")
    print("=" * 60)
    print()
    print("  Listen to these two files:")
    print(f"  1. adblend_analysis/final_ad.wav")
    print(f"     → Just the ad — use this to evaluate quality")
    print()
    print(f"  2. adblend_analysis/full_song_with_ad.wav")
    print(f"     → Full Billie Jean with MJ singing your ad at {AD_INSERT_SEC:.0f}s")
    print(f"     → This is the demo to show at the hackathon")
    print()
    print("  Needs tuning? Edit the config at the top and re-run.")
    print("  This step takes only ~10 seconds so iterate freely.")
    print()
    print("  Common fixes:")
    print("    Vocal too quiet → raise VOCAL_GAIN_DB to +3")
    print("    Vocal too loud  → lower VOCAL_GAIN_DB to -2")
    print("    Move ad earlier → lower AD_INSERT_SEC")
    print("    Muddy sound     → raise VOCAL_HPF_HZ to 180")
    print("=" * 60)


# if __name__ == "__main__":
#     main()