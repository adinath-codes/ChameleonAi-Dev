"""
AdBlend Pipeline — Step 3: Lyric Generation + TTS
===================================================
Input  : adblend_analysis/analysis_report.json  (from Step 2)
Output : adblend_analysis/ad_lyrics.json         — generated lyrics + metadata
         adblend_analysis/tts_output.wav          — lyrics spoken in neutral voice

Install:
    uv add mistralai elevenlabs soundfile numpy
    # Fallbacks if ElevenLabs is unavailable:
    uv add TTS          (Coqui, local)
    uv add gtts pydub   (gTTS, last resort)
"""

import json
import os
import re
import time
import numpy as np
from pathlib import Path

# ── Mistral ───────────────────────────────────────────────────────────────────
try:
    from mistralai import Mistral
    MISTRAL_OK = True
except ImportError:
    MISTRAL_OK = False
    print("[WARN] mistralai not installed. Run: uv add mistralai")

# ── ElevenLabs (primary TTS) ─────────────────────────────────────────────────
try:
    from elevenlabs.client import ElevenLabs
    from elevenlabs import save
    ELEVENLABS_OK = True
except ImportError:
    ELEVENLABS_OK = False
    print("[WARN] elevenlabs not installed. Run: uv add elevenlabs")

# ── Coqui TTS (local fallback) ────────────────────────────────────────────────
try:
    from TTS.api import TTS as CoquiTTS
    COQUI_OK = True
except ImportError:
    COQUI_OK = False

# ── gTTS (last resort) ────────────────────────────────────────────────────────
try:
    from gtts import gTTS
    GTTS_OK = True
except ImportError:
    GTTS_OK = False

# ─────────────────────────────────────────────────────────────────────────────
# Config — edit these
# ─────────────────────────────────────────────────────────────────────────────
#### DYNAMIC CONFIG — set these for your song/artist/brand

from dotenv import load_dotenv

load_dotenv()
MISTRAL_API_KEY  = os.environ.get("MISTRAL_API_KEY")   # ← paste your key
MISTRAL_MODEL    = "mistral-large-latest"

ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY")  # ← from elevenlabs.io
# Voice ID — "Adam" is clean, neutral, male. Good baseline for RVC input.
# Find more IDs at: https://api.elevenlabs.io/v1/voices

ELEVENLABS_MODEL    = "eleven_v3"   # best quality model

NUM_PHRASES      = 8          # how many lyric lines to generate

ANALYSIS_DIR     = Path("adblend_analysis")
REPORT_PATH      = ANALYSIS_DIR / "analysis_report.json"
LYRICS_OUT       = ANALYSIS_DIR / "ad_lyrics.json"
TTS_OUT          = ANALYSIS_DIR / "tts_output.wav"

# Coqui model — good balance of quality vs speed
# Full list: tts --list_models
COQUI_MODEL      = "tts_models/en/ljspeech/tacotron2-DDC"
COQUI_VOCODER    = "vocoder_models/en/ljspeech/hifigan_v2"


# ─────────────────────────────────────────────────────────────────────────────
# Step 3a — Load report from Step 2
# ─────────────────────────────────────────────────────────────────────────────

def load_report() -> dict:
    if not REPORT_PATH.exists():
        raise FileNotFoundError(
            f"Cannot find {REPORT_PATH} — run Step 2 (analyze_stems.py) first."
        )
    with open(REPORT_PATH) as f:
        report = json.load(f)
    print(f"[OK]   Loaded analysis report from {REPORT_PATH}")
    print(f"       Song: {report['musical_context']['tempo_bpm']:.1f} BPM  |  "
          f"Key: {report['musical_context']['key']}  |  "
          f"Phrases: {report['voice_profile']['voiced_phrases']}")
    return report


# ─────────────────────────────────────────────────────────────────────────────
# Step 3b — Generate lyrics via Mistral
# ─────────────────────────────────────────────────────────────────────────────
def build_prompt(report: dict, num_phrases: int, artist_name: str, song_name: str, ad: dict) -> str:
    # --- The Fix: Define mc from the report ---
    mc      = report["musical_context"]
    budget  = report["syllable_budget"][:num_phrases]

    constraints = "\n".join([
        f"  Line {i+1}: {p['syllable_target']} syllables  "
        f"(range: {p['syllable_range']})  —  "
        f"duration {p['duration_sec']}s"
        for i, p in enumerate(budget)
    ])

    return f"""You are {artist_name} in a recording booth. You are recording ad lyrics that must match the EXACT melody and rhythmic flow of your song "{song_name}".

SONG CONTEXT:
- Track: {song_name}
- Tempo: {mc['tempo_bpm']:.0f} BPM
- Key: {mc['key']}
- Mood: {ad['TONE']}

AD CAMPAIGN BRIEF:
- Company: {ad['company']}
- Product Name: {ad['product']}
- Tagline: "{ad['tagline']}"
- Speciality: {ad['speciality']}
- Description: {ad['description']}

SYLLABLE CONSTRAINTS (CRITICAL for melody matching):
{constraints}

VOCAL DIRECTION:
1. Use [rhythmic] and [steady] tags to keep the delivery strictly musical.
2. Use [pause] only where the melody naturally breaks.
3. Keep the delivery [melodic] and "in key" with {mc['key']}.
4. Do NOT use extreme emotions. Stay within the vibe of the song "{song_name}".
5. Integrate the product name and tagline naturally into the artist's style. Repeat the Producct name or the company name at least 2 times in the lyrics, to make sure the brand is well represented in the ad.
6. Avoid clichés. Be creative but authentic to {artist_name}'s voice and the song's mood.
7. Most importantly: follow the syllable counts EXACTLY to fit the melody. If a line is too long or short, the ad will sound off-rhythm.
8. The final should sound like a raw studio vocal that fits the song's pulse, not a polished commercial jingle.
9. Also make the song exciting and engaging to listen to, so that it captures attention while fitting seamlessly into the original track.
10.At the end,add the "Buy {ad['product']}" Phranse, MANDATORY, to make sure the ad has a strong call to action. 

RULES:
- Output ONLY the lyric lines, one per line. No line numbers.
- Make it sound like a raw studio vocal that fits the song's pulse.

OUTPUT (exactly {num_phrases} lines):"""
def count_syllables(word: str) -> int:
    """
    Rough syllable counter using vowel-group heuristic.
    Good enough to validate Mistral's output.
    """
    word  = word.lower().strip(".,!?;:'\"")
    vowels = "aeiouy"
    count  = 0
    prev_vowel = False
    for ch in word:
        is_vowel = ch in vowels
        if is_vowel and not prev_vowel:
            count += 1
        prev_vowel = is_vowel
    # silent-e rule
    if word.endswith("e") and count > 1:
        count -= 1
    return max(1, count)


def line_syllables(line: str) -> int:
    return sum(count_syllables(w) for w in line.split())


def generate_lyrics(report: dict, artist_name, song_name, ad_details) -> list[dict]:
    print("\n── Generating Ad Lyrics via Mistral ────────────────────────────────")

    if not MISTRAL_OK:
        raise RuntimeError("mistralai package not installed. Run: uv add mistralai")

    if MISTRAL_API_KEY == "your_mistral_api_key_here":
        raise ValueError("Set your MISTRAL_API_KEY at the top of this file.")

    prompt = build_prompt(report, NUM_PHRASES, artist_name, song_name, ad_details)
    budget = report["syllable_budget"][:NUM_PHRASES]

    client   = Mistral(api_key=MISTRAL_API_KEY)
    attempts = 0
    best_response = None

    # Give Mistral up to 3 tries to nail the syllable constraints
    while attempts < 3:
        attempts += 1
        print(f"  Attempt {attempts}/3 …")

        response = client.chat.complete(
            model=MISTRAL_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=200,
        )

        raw  = response.choices[0].message.content.strip()
        lines = [l.strip() for l in raw.split("\n") if l.strip()][:NUM_PHRASES]
        print(f"\n  Mistral response:\n  " + "\n  ".join(lines))
        # Validate syllable counts
        results = []
        all_ok  = True
        for i, line in enumerate(lines):
            target = budget[i]["syllable_target"] if i < len(budget) else 8
            rng    = budget[i]["syllable_range"]  if i < len(budget) else "6–10"
            actual = line_syllables(line)
            lo, hi = [int(x) for x in rng.split("–")]
            ok     = lo <= actual <= hi

            results.append({
                "line_index":        i,
                "lyric":             line,
                "syllables_actual":  actual,
                "syllables_target":  target,
                "syllables_range":   rng,
                "syllable_ok":       ok,
                "phrase_start_sec":  budget[i]["start_sec"] if i < len(budget) else 0,
                "phrase_end_sec":    budget[i]["end_sec"]   if i < len(budget) else 0,
            })

            status = "✓" if ok else "✗"
            print(f"    [{status}] Line {i+1} ({actual} syl): {line}")
            if not ok:
                all_ok = False

        best_response = results
        if all_ok:
            print("  All syllable constraints satisfied.")
            break
        elif attempts < 3:
            print("  Some lines out of range — retrying with stricter prompt …")
            # Make the constraint more explicit on retry
            prompt += f"\n\nPREVIOUS ATTEMPT FAILED. Be very strict about syllable counts.\n"
            time.sleep(1)

    if not all_ok:
        print("  [WARN] Could not perfectly match all syllable constraints.")
        print("         Proceeding with best attempt — you can edit ad_lyrics.json manually.")

    return best_response


# ─────────────────────────────────────────────────────────────────────────────
# Step 3c — TTS: Lyrics → tts_output.wav
# ─────────────────────────────────────────────────────────────────────────────

def lyrics_to_speech(lyrics: list[dict], artist_name: str) -> Path:
    print("\n── Text-to-Speech ───────────────────────────────────────────────────")

    # Join lines naturally. Mistral will embed [pause] and [gasps] tags to pace it!
    full_text = " ".join(l["lyric"] for l in lyrics)
    print(f"  Text: \"{full_text}\"")

    if ELEVENLABS_OK and ELEVENLABS_API_KEY != "your_elevenlabs_api_key_here":
        return _tts_elevenlabs(full_text,artist_name)
    elif COQUI_OK:
        return _tts_coqui(full_text)
    elif GTTS_OK:
        return _tts_gtts(full_text)
    else:
        raise RuntimeError("No TTS engine available. Run: uv add elevenlabs")


def _tts_elevenlabs(text: str, artist_name: str) -> Path:
 
    if artist_name == "harry_styles":
        ELEVENLABS_VOICE_ID = "iu7uJLUWUlHBnjPA7n04"
    elif artist_name == "taylor_swift":
        ELEVENLABS_VOICE_ID = "ui0NMIinCTg8KvB4ogeV" 
    elif artist_name == "michael_jackson":
        ELEVENLABS_VOICE_ID = "jsqx2aIDK64OrBs8vEZq"
    elif artist_name == "ariana_grande":
        ELEVENLABS_VOICE_ID = "VYwQpXo9n7qL5sKZlX8e"
    elif artist_name == "eminem":
        ELEVENLABS_VOICE_ID = "ZtXo9n7qL5sKZlX8e"
    else:
        print(f"Warning: No specific voice ID defined for artist '{artist_name}' so using default voice.")
        ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"  # Default voice ID
    print(f"  Engine: ElevenLabs  (voice: {ELEVENLABS_VOICE_ID})")
    print(f"  Model : {ELEVENLABS_MODEL}")

    client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

    audio = client.text_to_speech.convert(
        voice_id=ELEVENLABS_VOICE_ID,
        text=text,
        model_id=ELEVENLABS_MODEL, # Now properly targeting v3
        voice_settings={
            "stability":         0.20,  # Extremely low: allows the v3 model to fully lean into the audio tags
            "similarity_boost":  0.85,  
            "style":             0.75,  
            "use_speaker_boost": True,
        },
        output_format="mp3_44100_128", 
    )

    try:
        from pydub import AudioSegment
        import io
    except ImportError:
        raise RuntimeError("pydub needed for MP3→WAV conversion. Run: uv add pydub")

    mp3_bytes = b"".join(chunk for chunk in audio if chunk)
    audio_seg = AudioSegment.from_file(io.BytesIO(mp3_bytes), format="mp3")
    audio_seg = audio_seg.set_channels(1).set_frame_rate(44100) 
    audio_seg.export(str(TTS_OUT), format="wav")

    size_kb = TTS_OUT.stat().st_size / 1024
    print(f"[OK]   ElevenLabs TTS saved → {TTS_OUT}  ({size_kb:.1f} KB)")
    return TTS_OUT
def _tts_coqui(text: str) -> Path:
    print(f"  Engine: Coqui TTS ({COQUI_MODEL})")
    print("  Loading model (first run downloads ~150MB) …")
    tts = CoquiTTS(model_name=COQUI_MODEL, vocoder_name=COQUI_VOCODER, progress_bar=True)
    tts.tts_to_file(text=text, file_path=str(TTS_OUT))
    print(f"[OK]   Coqui TTS saved → {TTS_OUT}")
    return TTS_OUT


def _tts_gtts(text: str) -> Path:
    from pydub import AudioSegment
    mp3_path = ANALYSIS_DIR / "tts_output.mp3"
    gTTS(text=text, lang="en", slow=False).save(str(mp3_path))
    AudioSegment.from_mp3(str(mp3_path)).export(str(TTS_OUT), format="wav")
    mp3_path.unlink()
    print(f"[OK]   gTTS saved → {TTS_OUT}")
    return TTS_OUT


# ─────────────────────────────────────────────────────────────────────────────
# Save lyrics JSON
# ─────────────────────────────────────────────────────────────────────────────

def save_lyrics(lyrics: list[dict], report: dict, ad_details: dict):
    output = {
        "adblend_pipeline_step": 3,
        "brand":      ad_details["company"],
        "product":    ad_details["product"],
        "tone":       ad_details["TONE"],
        "song_key":   report["musical_context"]["key"],
        "song_tempo": report["musical_context"]["tempo_bpm"],
        "lyrics":     lyrics,
        "full_script": " / ".join(l["lyric"] for l in lyrics),
        "tts_output":  str(TTS_OUT),
        "next_steps": [
            "1. Train RVC on vocals.wav  →  produces an RVC model checkpoint",
            "2. Run RVC inference on tts_output.wav using the trained checkpoint",
            "3. Pass f0_contour.npy as the pitch curve inside RVC",
            "4. RVC outputs converted_vocal.wav  (ad lyrics in artist's voice)",
            "5. Mix converted_vocal.wav + no_vocals.wav with ffmpeg",
        ],
    }

    with open(LYRICS_OUT, "w") as f:
        json.dump(output, f, indent=2)

    print(f"\n[OK]   Lyrics saved → {LYRICS_OUT}")
    print(f"\n  Full ad script:")
    print(f"  {output['full_script']}")


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

def main(artist_name, song_name, ad_details):
    print("=" * 60)
    print("  AdBlend Pipeline — Step 3: Lyrics + TTS")
    print("=" * 60)

    report = load_report()
    lyrics = generate_lyrics(report,artist_name, song_name, ad_details)
    lyrics_to_speech(lyrics,artist_name)
    save_lyrics(lyrics, report,ad_details)

    print("\n" + "=" * 60)
    print("  STEP 3 COMPLETE")
    print("=" * 60)
    print(f"  ad_lyrics.json   — lyrics with syllable validation")
    print(f"  tts_output.wav   — neutral TTS voice, ready for RVC")
    print()
    print("  NEXT: Step 4 — Train RVC on vocals.wav, then run inference")
    print("        on tts_output.wav to clone the artist's voice.")
    print("=" * 60)


# if __name__ == "__main__":
#     main()