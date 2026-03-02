"""
AdBlend Pipeline — Step 4: RVC Voice Conversion (Inference Only)
=================================================================
Input  : adblend_analysis/tts_output.wav
         adblend_analysis/f0_contour.npy
         adblend_analysis/rvc_model/*.pth    ← downloaded MJ model
         adblend_analysis/rvc_model/*.index  ← downloaded MJ index

Output : adblend_analysis/converted_vocal.wav

Install:
    uv add rvc-python torch torchaudio soundfile numpy
"""

import os
import json
import inspect
import numpy as np
import soundfile as sf
from pathlib import Path

try:
    from rvc_python.infer import RVCInference
    RVC_OK = True
except ImportError:
    RVC_OK = False
    print("[ERROR] rvc-python not installed. Run: uv add rvc-python")

try:
    import torch
    TORCH_OK = True
    
    # 💉 PYTORCH 2.6 SECURITY BYPASS
    # Forcefully overrides PyTorch's weights_only=True default so RVC can load the MJ .pth model
    _original_load = torch.load
    def _patched_load(*args, **kwargs):
        kwargs['weights_only'] = False
        return _original_load(*args, **kwargs)
    torch.load = _patched_load
    
except ImportError:
    TORCH_OK = False


# ─────────────────────────────────────────────────────────────────────────────
# Config — only edit these
# ─────────────────────────────────────────────────────────────────────────────
ARTIST_NAME = "harry_styles" # or michael_jackson
TTS_PATH     = "music/adblend_analysis/tts_output.wav"
F0_PATH      = "music/adblend_analysis/f0_contour.npy"
MODEL_DIR    = Path(f"music/adblend_analysis/models/{ARTIST_NAME}")  # where you put the downloaded .pth and .index files
OUTPUT_PATH  = Path("music/adblend_analysis/converted_vocal.wav")
ANALYSIS_DIR = Path("music/adblend_analysis")

# ── Tuning — adjust if output sounds wrong, re-run (takes ~30s) ─────────────

if ARTIST_NAME == "michael_jackson":
    PITCH_SHIFT = 8 # semitones (ElevenLabs Adam to MJ → start at 0)
elif ARTIST_NAME == "harry_styles":
    PITCH_SHIFT = 2
elif ARTIST_NAME == "taylor_swift":
    PITCH_SHIFT = 12
else:
    PITCH_SHIFT = 12      
F0_METHOD     = "rmvpe" # rmvpe = best (already verified on your machine)
INDEX_RATE    = 0.33    # 0.0–1.0  lower if sounds unnatural
FILTER_RADIUS = 5      # 0–7      raise to 5 if pitch wobbles
RESAMPLE_SR   = 44100   # output sample rate
RMS_MIX_RATE  = 1   # 0.0–1.0  raise if output too quiet
PROTECT       = 0.45    # 0.0–0.5  raise to 0.45 if consonants distort


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def get_device() -> str:
    if not TORCH_OK:
        return "cpu"
    if torch.cuda.is_available():
        name = torch.cuda.get_device_name(0)
        vram = torch.cuda.get_device_properties(0).total_memory / 1e9
        print(f"  GPU : {name}  ({vram:.1f} GB VRAM)")
        return "cuda:0"
    if hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        print("  GPU : Apple MPS")
        return "mps"
    print("  CPU mode (no GPU detected)")
    return "cpu"


def find_model_files() -> tuple[str, str]:
    """Find .pth and .index in MODEL_DIR, skip G_/D_ training checkpoints."""
    if not MODEL_DIR.exists():
        raise FileNotFoundError(
            f"\n[ERROR] Folder not found: {MODEL_DIR}\n"
            "Create it and copy your downloaded .pth and .index files there."
        )

    all_files = list(MODEL_DIR.rglob("*"))
    print(f"  Files in {MODEL_DIR}:")
    for f in all_files:
        print(f"    {f.name}  ({f.stat().st_size/1024/1024:.1f} MB)")

    pth_files = [
        p for p in MODEL_DIR.rglob("*.pth")
        if not p.name.startswith(("G_", "D_"))
    ]
    index_files = list(MODEL_DIR.rglob("*.index"))

    if not pth_files:
        raise FileNotFoundError(
            f"\n[ERROR] No .pth model file found in {MODEL_DIR}\n"
            "Make sure you copied the downloaded model file there.\n"
        )

    # Pick the largest .pth (usually the best/final checkpoint)
    model_path = str(sorted(pth_files, key=lambda p: p.stat().st_size)[-1])
    index_path = str(sorted(index_files, key=lambda p: p.stat().st_size)[-1]) if index_files else ""

    print(f"\n  Using model : {Path(model_path).name}")
    print(f"  Using index : {Path(index_path).name if index_path else 'none'}")
    return model_path, index_path


def audio_health_check(path, label: str):
    if not Path(path).exists():
        print(f"  {label} — FILE NOT FOUND")
        return
    y, sr = sf.read(str(path))
    if y.ndim > 1:
        y = y.mean(axis=1)
    rms  = float(np.sqrt(np.mean(y ** 2)))
    peak = float(np.abs(y).max())
    dur  = len(y) / sr
    print(f"  {label}")
    print(f"    {dur:.2f}s  |  RMS {rms:.4f}  |  Peak {peak:.4f}")
    if peak < 0.01:
        print("    [WARN] Nearly silent — conversion may have failed.")
    elif rms > 0.6:
        print("    [WARN] Hot signal — may clip when mixed. Lower RMS_MIX_RATE.")
    else:
        print("    [OK]")


def validate():
    print("\n── Inputs ───────────────────────────────────────────────────────────")
    # Force them to strings for the os.path.getsize call
    paths = [str(TTS_PATH), str(F0_PATH)] 
    for p in paths:
        if not os.path.exists(p):
            raise FileNotFoundError(f"Missing: {p}")
        print(f"  [✓] {p}  ({os.path.getsize(p)/1024:.1f} KB)")
# ─────────────────────────────────────────────────────────────────────────────
# Inference
# ─────────────────────────────────────────────────────────────────────────────

def run_inference(artist_name: str):
    print("\n── Voice Conversion ─────────────────────────────────────────────────")

    if not RVC_OK:
        raise RuntimeError("rvc-python not installed. Run: uv add rvc-python")

    device     = get_device()
    model_path, index_path = find_model_files()

    print(f"\n  Pitch shift : {PITCH_SHIFT:+d} semitones")
    print(f"  F0 method   : {F0_METHOD}")
    print(f"  Index rate  : {INDEX_RATE}")
    print(f"  Output      : {OUTPUT_PATH}")
    print()

    rvc = RVCInference(device=device)
    print("\n  Loading model...")
    # 1. Safely Load Model
    lm_params = list(inspect.signature(rvc.load_model).parameters.keys())
    print(f"  load_model parameters: {lm_params}")
    if "model_path_or_name" in lm_params:
        print("  Loading model using 'model_path_or_name' argument...")
        rvc.load_model(model_path_or_name=model_path, version="v2", index_path=index_path if index_path else None)
    elif "pth_path" in lm_params:
        print("  Loading model using 'pth_path' argument...")
        rvc.load_model(pth_path=model_path, version="v2", index_path=index_path if index_path else None)
    else:
        print("  Loading model using positional arguments...")
        args = [model_path, index_path]
        rvc.load_model(*args)
    # Fallback to load index if version relies on a separate set_index call
    if index_path and hasattr(rvc, "set_index"):
        rvc.set_index(index_path)

    # 2. Safely Map Keyword Arguments for infer_file
    sig = inspect.signature(rvc.infer_file)
    params = sig.parameters

    # Create a dictionary of all possible aliases rvc-python versions might use
    raw_kwargs = {
        "f0_up_key": PITCH_SHIFT,
        "f0up_key": PITCH_SHIFT,
        "pitch": PITCH_SHIFT,
        "f0_method": F0_METHOD,
        "f0method": F0_METHOD,
        "index_rate": INDEX_RATE,
        "filter_radius": FILTER_RADIUS,
        "resample_sr": RESAMPLE_SR,
        "rms_mix_rate": RMS_MIX_RATE,
        "protect": PROTECT,
        "f0_file": str(F0_PATH) if os.path.exists(F0_PATH) else None
    }

    # Only inject arguments that the active rvc-python version actually asks for
    valid_kwargs = {k: v for k, v in raw_kwargs.items() if k in params and v is not None}

    # Note: Passed as positional arguments to avoid 'input_path' vs 'audio_path' keyword crashes
    rvc.infer_file(str(TTS_PATH), str(OUTPUT_PATH), **valid_kwargs)

    if not OUTPUT_PATH.exists():
        raise RuntimeError(
            f"Conversion ran but {OUTPUT_PATH} was not created.\n"
            "Check rvc-python output above for silent errors."
        )

    size_kb = OUTPUT_PATH.stat().st_size / 1024
    print(f"\n[OK]   converted_vocal.wav  ({size_kb:.1f} KB)  → {OUTPUT_PATH}")


# ─────────────────────────────────────────────────────────────────────────────
# Report
# ─────────────────────────────────────────────────────────────────────────────

def save_report(artist_name: str):
    pth = [p for p in MODEL_DIR.rglob("*.pth") if not p.name.startswith(("G_","D_"))] if MODEL_DIR.exists() else []
    idx = list(MODEL_DIR.rglob("*.index")) if MODEL_DIR.exists() else []

    report = {
        "adblend_pipeline_step": 4,
        "output": str(OUTPUT_PATH),
        "model":  str(pth[0]) if pth else "unknown",
        "index":  str(idx[0]) if idx else "none",
        "settings": {
            "pitch_shift":   PITCH_SHIFT,
            "f0_method":     F0_METHOD,
            "index_rate":    INDEX_RATE,
            "filter_radius": FILTER_RADIUS,
            "resample_sr":   RESAMPLE_SR,
            "rms_mix_rate":  RMS_MIX_RATE,
            "protect":       PROTECT,
        },
        "next_step": "Run adblend_s5.py — mix converted_vocal.wav + no_vocals.wav → final ad",
    }

    out = ANALYSIS_DIR / "step4_report.json"
    with open(out, "w") as f:
        json.dump(report, f, indent=2)
    print(f"[OK]   Report → {out}")


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

def main(artist_name: str):
    print("=" * 60)
    print("  AdBlend Pipeline — Step 4: RVC Voice Conversion")
    print("=" * 60)

    validate()
    global ARTIST_NAME
    ARTIST_NAME = artist_name
    run_inference(artist_name)

    print("\n── Health Check ─────────────────────────────────────────────────────")
    audio_health_check(TTS_PATH,    "tts_output.wav        (input  — neutral TTS)")
    audio_health_check(OUTPUT_PATH, "converted_vocal.wav   (output — MJ's voice)")

    save_report(artist_name)

    print("\n" + "=" * 60)
    print("  STEP 4 COMPLETE")
    print("=" * 60)


# if __name__ == "__main__":
#     main()