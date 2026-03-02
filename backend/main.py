"""
AdBlend — main.py
==================
FastAPI server that orchestrates the existing pipeline steps.
"""

import uuid
import asyncio
import logging
import traceback
from enum import Enum
from pathlib import Path
from typing import Optional
from contextlib import asynccontextmanager
from concurrent.futures import ThreadPoolExecutor

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


# ── Import your existing pipeline steps ──────────────────────────────────────
import music.s1_seperator as step1   
import music.s2_analysis as step2   
import music.s3_lyrics_tts as step3   
import music.s4_rvc as step4   
import music.s4_5_autotune as step4_5 # The Platinum Polish!
import music.s5_mixall as step5   
import music.s6_hybridsong as step6   

# ─────────────────────────────────────────────────────────────────────────────
# Constants
# ─────────────────────────────────────────────────────────────────────────────



# ─────────────────────────────────────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────────────────────────────────────

JOBS_DIR    = Path("jobs")
WORKERS     = 1     # Keep at 1 for ML tasks to prevent GPU Out-Of-Memory errors!

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)
log = logging.getLogger("adblend")


# ─────────────────────────────────────────────────────────────────────────────
# Job tracking
# ─────────────────────────────────────────────────────────────────────────────

class Status(str, Enum):
    PENDING    = "pending"
    ANALYZING  = "analyzing"     
    PROCESSING = "processing"    
    READY      = "ready"
    ERROR      = "error"

class Job:
    def __init__(self, job_id: str, song_path: Path):
        self.job_id       : str            = job_id
        self.song_path    : Path           = song_path
        self.out_dir      : str           = str(JOBS_DIR / job_id)
        self.status       : Status         = Status.PENDING
        self.ad_timestamp : Optional[float] = None   
        self.song_duration: Optional[float] = None
        self.final_path   : Optional[Path] = None    
        self.error        : Optional[str]  = None
        self.progress     : str            = ""      
        
        # We need a place to store the Ad Brief for Mistral!
        self.ad_details   : dict           = {}

JOBS      : dict[str, Job] = {}
EXECUTOR  = ThreadPoolExecutor(max_workers=WORKERS)


# ─────────────────────────────────────────────────────────────────────────────
# Response models
# ─────────────────────────────────────────────────────────────────────────────

class ProcessResponse(BaseModel):
    job_id        : str
 

class StatusResponse(BaseModel):
    job_id       : str
    status       : str
    ad_ready     : bool
    ad_timestamp : Optional[float] = None
    progress     : str             = ""
    error        : Optional[str]   = None


# ─────────────────────────────────────────────────────────────────────────────
# Background pipeline
# ─────────────────────────────────────────────────────────────────────────────

def run_pipeline(job: Job):
    try:
        # job.out_dir.mkdir(parents=True, exist_ok=True)
        log.info("[%s] Pipeline started", job.job_id)

        job.status   = Status.PROCESSING
        
        job.progress = "Step 1/6 — Separating vocals from instrumental"
        log.info("[%s] %s", job.job_id, job.progress)
        public_dir = Path(__file__).parent.parent / "public"
        print(f"DEBUG: Looking for original song at {public_dir / 'music' / job.ad_details['song_name']}")
        ORIGINAL_PATH = public_dir /"music"/ job.ad_details["song_name"] / "original.mp3"
        print(f"DEBUG: Original song path: {ORIGINAL_PATH}")
        step1.separate_stems_demucs(str(ORIGINAL_PATH), "music/audios/seperated_audios")

        job.progress = "Step 2/6 — Extracting melody and beat grid"
        # log.info("[%s] %s", job.job_id, job.progress)
        step2.main()

        job.progress = "Step 3/6 — Generating ad lyrics and TTS"
        log.info("[%s] %s", job.job_id, job.progress)
        # BUG FIX: Pass the ad_details dictionary to Mistral
        specific_ad_details = {
    "company":     job.ad_details["company"],
    "product":     job.ad_details["product"],
    "tagline":     job.ad_details["tagline"],
    "speciality":  job.ad_details["speciality"],
    "TONE"             : job.ad_details["tone"],
    "description": job.ad_details["description"]
} 
        step3.main(job.ad_details["artist_name"], job.ad_details["song_name"], specific_ad_details)

        job.progress = "Step 4/6 — Cloning artist voice"
        log.info("[%s] %s", job.job_id, job.progress)
        # BUG FIX: Pass the artist name so RVC loads the correct folder!
        step4.main(job.ad_details["artist_name"])

        # BUG FIX: Step 4.5 is now in the chain!
        job.progress = "Step 4.5/6 — Applying Studio Polish & Echoes"
        log.info("[%s] %s", job.job_id, job.progress)
        step4_5.apply_studio_polish()

        job.progress = "Step 5/6 — Mixing ad segment"
        log.info("[%s] %s", job.job_id, job.progress)
        step5.main()

        job.progress = "Step 6/6 — Stitching ad into song"
        log.info("[%s] %s", job.job_id, job.progress)
        Insertion_point= step6.main(job.ad_details["song_name"])
        job.ad_timestamp = Insertion_point
        final_path = "music/adblend_analysis/final_with_ad.mp3" # step6.main() should return the final path, but for now we hardcode it since step6 is not fully implemented yet.
        # final_path = step6.stitch(
        #     song_path    = job.song_path,
        #     out_dir      = job.out_dir,
        #     insert_sec   = job.ad_timestamp,
        # )

        job.final_path = Path(final_path)
        job.status     = Status.READY
        job.progress   = "Done"
        log.info("[%s] Pipeline complete → %s", job.job_id, final_path)

    except Exception as e:
        job.status   = Status.ERROR
        job.error    = str(e)
        job.progress = f"Failed: {e}"
        log.error("[%s] Pipeline error:\n%s", job.job_id, traceback.format_exc())


# ─────────────────────────────────────────────────────────────────────────────
# App & Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    JOBS_DIR.mkdir(exist_ok=True)
    log.info("AdBlend API ready")
    yield
    EXECUTOR.shutdown(wait=False)
    log.info("AdBlend API shutdown")

app = FastAPI(title="AdBlend API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "active_jobs": len(JOBS)}

# BUG FIX: Added Form parameters so the frontend can send the Ad Brief!
@app.post("/process", response_model=ProcessResponse)
async def process_song(
    file: UploadFile = File(...),
    artist_name: str = Form(...),
    artist_folder: str = Form(...), # e.g., "harry_styles"
    song_name: str = Form(...),
    company: str = Form(...),
    product: str = Form(...),
    tagline: str = Form(...),
    speciality: str = Form(...),
    description: str = Form(...),
    tone: str = Form(...), # e.g., "upbeat and energetic, like a modern pop anthem"
):
    job_id   = str(uuid.uuid4())
    job_dir  = JOBS_DIR / job_id
    job_dir.mkdir(parents=True, exist_ok=True)
    song_path = job_dir / f"original.mp3"
    content   = await file.read()
    song_path.write_bytes(content)

    # try:
        # insert_sec, duration = step6.find_gap(song_path=song_path)
    # except Exception as e:
        # raise HTTPException(status_code=422, detail=f"Could not analyze song: {e}")

    job               = Job(job_id, song_path)
    # job.ad_timestamp  = insert_sec
    # job.song_duration = duration
    job.status        = Status.ANALYZING
    
    # Store the ad details so the background task can use them
    artist_name=artist_name.strip().lower().replace(" ", "_") # e.g., "harry_styles"
    song_name=song_name.strip().lower().replace(" ", "") # e.g., "watermelon_sugar"
    job.ad_details = {
        "artist_name": artist_name,
        "artist_folder": artist_folder,
        "song_name": song_name,
        "company": company,
        "product": product,
        "tagline": tagline,
        "speciality": speciality,
        "description": description,
        "tone":tone
    }
    print(f"DEBUG: Received job with details: {job.ad_details}")
    JOBS[job_id]      = job

    loop = asyncio.get_event_loop()
    loop.run_in_executor(EXECUTOR, run_pipeline, job)

    return ProcessResponse(job_id=job_id)

@app.get("/status/{job_id}", response_model=StatusResponse)
def get_status(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return StatusResponse(
        job_id       = job_id,
        status       = job.status.value,
        ad_ready     = job.status == Status.READY,
        ad_timestamp = job.ad_timestamp,
        progress     = job.progress,
        error        = job.error,
    )

@app.get("/ad/{job_id}")
def get_ad(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status == Status.ERROR:
        raise HTTPException(status_code=500, detail=job.error)
    if job.status != Status.READY:
        raise HTTPException(status_code=202, detail="Not ready yet")

    return FileResponse(
        path      = str(job.final_path),
        media_type= "audio/mpeg",
        headers   = {"Accept-Ranges": "bytes"},
    )

@app.get("/song/{job_id}")
def get_original(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return FileResponse(
        path      = str(job.song_path),
        media_type= "audio/mpeg",
        headers   = {"Accept-Ranges": "bytes"},
    )

if __name__ == "__main__":
    # import uvicorn
    step6.main("blank space") # For local testing without the frontend. Make sure to have a folder named "test_song" with an "original.mp3" inside the public/music directory.
    # uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False, workers=1)