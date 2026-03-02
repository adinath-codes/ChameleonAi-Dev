import os
import subprocess
import shutil
from pathlib import Path
def separate_stems_demucs(audio_file_path, output_dir="audios/seperated_audios"):
    if not os.path.exists(audio_file_path):
        print(f"❌ Error: Could not find '{audio_file_path}'")
        return None, None

    print(f"🎸 Firing up local AI to separate '{audio_file_path}'...")
    
    command = [
        "demucs",
        "--two-stems=vocals",
        "-o", output_dir,
        audio_file_path
    ]
    
    try:
        subprocess.run(command, check=True, capture_output=True, text=True)
        
        # Where Demucs ACTUALLY put the files
        track_name = Path(audio_file_path).stem 
        demucs_vocals = os.path.join(output_dir, "htdemucs", track_name, "vocals.wav")
        demucs_beat = os.path.join(output_dir, "htdemucs", track_name, "no_vocals.wav")
        
        # Where YOU want the files
        final_vocals = os.path.join(output_dir, "vocals.wav")
        final_beat = os.path.join(output_dir, "no_vocals.wav")
        
        # Move the files to the root output folder
        if os.path.exists(demucs_vocals) and os.path.exists(demucs_beat):
            shutil.move(demucs_vocals, final_vocals)
            shutil.move(demucs_beat, final_beat)
            
            # Clean up the annoying nested folders Demucs created
            shutil.rmtree(os.path.join(output_dir, "htdemucs"))
            
            print(f"\n✅ Separation & Cleanup complete!")
            print(f"🎤 Vocals saved to: {final_vocals}")
            print(f"🥁 Beat saved to: {final_beat}")
            return final_vocals, final_beat
        else:
            print("❌ Separation finished, but couldn't find the output files.")
            return None, None

    except subprocess.CalledProcessError as e:
        print(f"\n❌ Demucs crashed with exit code {e.returncode}!")
        print(f"🚨 THE REAL ERROR MESSAGE:\n{e.stderr}")
        return None, None

