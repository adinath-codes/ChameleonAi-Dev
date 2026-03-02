"""
AdBlend Pipeline — Step 4.5: The "Platinum Record" Vocal Chain
=================================================================
Input  : adblend_analysis/converted_harry_styles.wav
Output : adblend_analysis/autotuned_vocal.wav
"""

import json
import os
from pathlib import Path

try:
    from pedalboard import (
        Pedalboard, Compressor, Reverb, HighpassFilter, 
        Delay, Chorus, HighShelfFilter, PeakFilter, Limiter
    )
    from pedalboard import VST3Plugin
    from pedalboard.io import AudioFile
    PEDALBOARD_OK = True
except ImportError:
    PEDALBOARD_OK = False
    print("[ERROR] pedalboard not installed. Run: uv add pedalboard")

# ─────────────────────────────────────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────────────────────────────────────

ARTIST_FOLDER = "harry_styles"
INPUT_VOCAL   = f"music/adblend_analysis/converted_vocal.wav"
OUTPUT_VOCAL  = "music/adblend_analysis/autotuned_vocal.wav"
REPORT_PATH   = "music/adblend_analysis/analysis_report.json"
VST_PATH      = "music/adblend_analysis/Graillon2.vst3" 

# ─────────────────────────────────────────────────────────────────────────────
# Process
# ─────────────────────────────────────────────────────────────────────────────

def apply_studio_polish():
    print("=" * 60)
    print("  AdBlend Pipeline — Step 4.5: Platinum Record Polish")
    print("=" * 60)

    if not PEDALBOARD_OK:
        return

    # 1. Read Song Data for Rhythm Syncing
    with open(REPORT_PATH, "r") as f:
        report = json.load(f)
    
    bpm = report["musical_context"]["tempo_bpm"]
    song_key = report["musical_context"]["key"]
    
    # Advanced Timing: 1/8th note delay (creates a fast, modern pop bounce)
    eighth_note_sec = (60.0 / bpm) / 2.0
    
    print(f"\n  [INFO] Song Context : {bpm:.1f} BPM | Key: {song_key}")
    print(f"  [INFO] Syncing vocal echoes to {eighth_note_sec:.3f} seconds...")

    # 2. Build the Platinum Vocal Chain
    plugins = [
        # --- STAGE 1: SURGICAL EQ (Cleaning the AI audio) ---
        HighpassFilter(cutoff_frequency_hz=120),          # Kills low sub-bass rumble
        PeakFilter(cutoff_frequency_hz=400, gain_db=-3.0, q=1.5), # Scoops out the "muddy/boxy" AI sound
        HighShelfFilter(cutoff_frequency_hz=8000, gain_db=4.5),   # Adds expensive "air" and sparkle to the consonants
        
        # --- STAGE 2: DYNAMICS (Loud & Aggressive) ---
        Compressor(threshold_db=-22, ratio=5.0, attack_ms=2.0, release_ms=50.0),
    ]

    # --- STAGE 3: EXTERNAL AUTO-TUNE (If available) ---
    if os.path.exists(VST_PATH):
        print(f"  [OK]   Loading External Auto-Tune VST: {VST_PATH}")
        try:
            plugins.append(VST3Plugin(VST_PATH))
        except Exception as e:
            print(f"  [WARN] Failed to load VST: {e}")

    # --- STAGE 4: SPACE & SAUCE ---
    plugins.extend([
        # Thickens the vocal
        Chorus(rate_hz=1.0, depth=0.25, centre_delay_ms=7.0, mix=0.2),
        
        # Rhythmic bounce synced precisely to the song's BPM
        Delay(delay_seconds=eighth_note_sec, feedback=0.3, mix=0.15),
        
        # Wide, stadium pop reverb
        Reverb(room_size=0.65, damping=0.3, wet_level=0.25, dry_level=0.8),
        
        # --- STAGE 5: MASTERING ---
        # Catches any rogue volume spikes and pushes the whole vocal to commercial loudness
        Limiter(threshold_db=-0.5) 
    ])

    board = Pedalboard(plugins)

    # 3. Process the Audio
    print(f"\n  Processing {INPUT_VOCAL}...")
    with AudioFile(INPUT_VOCAL) as f:
        audio = f.read(f.frames)
        samplerate = f.samplerate

    effected_audio = board(audio, samplerate)

    with AudioFile(OUTPUT_VOCAL, 'w', samplerate, effected_audio.shape[0]) as f:
        f.write(effected_audio)

    print(f"  [OK]   Radio-ready vocal saved → {OUTPUT_VOCAL}")
    print("=" * 60)


# if __name__ == "__main__":
#     apply_studio_polish()