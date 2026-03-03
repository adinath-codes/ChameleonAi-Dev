# 🦎 Chameleon AI

**The Future of Native Audio Advertising. Seamless. Hyper-Personalized. Unskippable.**

Chameleon AI is a Just-In-Time (JIT) audio engine that completely reinvents the ad break. It uses RVC voice cloning, LLM contextual scripting, and automated studio mastering to generate native ads in real-time that perfectly match the tempo, musical key, and emotional vibe of whatever the user is currently listening to. Say goodbye to jarring radio commercials and high skip rates.

## 🌄 Demo
 
[Check out Demo video on youtube](https://www.youtube.com/watch?v=ZYPAXa34CuA)

<img width="1918" height="1073" alt="image" src="https://github.com/user-attachments/assets/07a48207-ec66-4452-960d-acd352f41ca7" />
<img width="1919" height="1064" alt="image" src="https://github.com/user-attachments/assets/3da080ac-7597-44f8-95a2-763f71a5baf5" />
<img width="1919" height="1069" alt="image" src="https://github.com/user-attachments/assets/53e99dee-5995-4e0e-86bb-7dac57fe6e38" />
<img width="1919" height="1067" alt="image" src="https://github.com/user-attachments/assets/29dedb24-96c1-44cd-a6dd-81fd5818cac3" />


---

## 🚀 Key Features

* **🎯 Hyper-Contextual "Vibe Matching":** Analyzes the currently playing song using Demucs and automatically generates an ad that perfectly matches the track's BPM, musical key, and mood.
* **🌍 Dynamic Creative Optimization (DCO):** Injects real-time environmental data (listener's city, weather, and time of day) directly into the generated lyrics for hyper-personalized messaging.
* **🎙️ Synthetic Host-Read Ads:** Utilizes Retrieval-based Voice Conversion (RVC) to clone the artist's or podcast host's voice, making the ad sound like a natural continuation of the audio stream.
* **🖼️ Multi-Modal Ad Delivery:** Synchronizes the frontend UI to dynamically swap the song's album artwork with an AI-generated visual of the artist using the advertised product during the ad break.
* **💰 Creator Economy Marketplace:** Artists can officially license their voice models to the Chameleon platform, earning passive royalty cuts every time an advertiser generates an ad using their voice.

---

## 🛠️ Tech Stack

### Frontend

* **ReactJS** + **Vite**: High-performance UI rendering for the Spotify clone.
* **CSS/Inline Styles**: For accurate, responsive Spotify desktop mimicking and animations.
* **HTML5 Audio API**: For seamless, millisecond-accurate track crossfading and hot-swapping.

### Backend & ML Infrastructure

* **FastAPI**: Asynchronous API gateway for orchestrating heavy background ML jobs.
* **Demucs**: Deep learning source separation to extract instrumentals and vocals.
* **Librosa**: Audio analysis for beat tracking (BPM) and pitch/key extraction.
* **Mistral AI (LLM)**: Generates rhythmically accurate, syllable-matched ad lyrics based on real-time data.
* **ElevenLabs**: High-fidelity Text-to-Speech (TTS) generation.
* **RVC (Retrieval-based Voice Conversion)**: Clones specific artist vocal timbres over the TTS output.
* **Pedalboard**: Studio-grade audio mastering (High-pass filters, limiters, reverb, and delay) to blend the AI vocals into the mix.

---

## 💻 Local Installation Guide

Follow these steps to run Chameleon AI locally on your machine.

### Prerequisites

* **OS:** Linux or Windows (via WSL2 - Recommended).
* **Python:** Version 3.10 or higher.
* **Node.js:** Version 18+.
* **GPU:** NVIDIA GPU with CUDA support (Recommended for Demucs and RVC processing).
* **API Keys:** Mistral AI and ElevenLabs.

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/chameleon-ai.git
cd chameleon-ai

```

## 📂 Project Structure

Here is an overview of the repository's architecture:

```text
chameleon-ai/
├── frontend/                  # 🎨 Frontend Source Code (Spotify Clone)
│   ├── public/
│   │   ├── images/            # Static assets, album art, and AI Ad visuals
│   │   └── music/             # Local test tracks (.mp3) for seamless hot-swapping
│   ├── src/
│   │   └── App.jsx            # Main React UI and Audio Engine logic
│   ├── package.json           # Node dependencies
│   └── vite.config.js         # Vite configuration (configured to ignore backend)
│
├── backend/                   # 🧠 Backend & AI Infrastructure
│   ├── jobs/                  # Temporary processing folders for JIT audio
│   ├── music/                 # The Core ML Pipeline Steps
│   │   ├── s1_seperator.py    # Demucs audio separation
│   │   ├── s2_analysis.py     # Librosa BPM and pitch analysis
│   │   ├── s3_lyrics_tts.py   # Mistral DCO and ElevenLabs TTS
│   │   ├── s4_rvc.py          # RVC voice cloning inference
│   │   ├── s4_5_autotune.py   # Pedalboard studio mastering
│   │   ├── s5_mixall.py       # Final audio mixing
│   │   └── s6_hybridsong.py   # Stitching ad seamlessly into the original song
│   ├── main.py                # FastAPI Orchestrator & Endpoints
│   └── requirements.txt       # Python dependencies
│
└── README.md                  # Project Documentation

```

## ⚙️ Setup Guidelines

To run Chameleon AI locally, follow these environment configurations.

### 1. Environment Setup (Backend)

The backend requires a Python environment capable of handling audio processing and ML tasks.

```bash
# Navigate to backend
cd backend

# Create & Activate Virtual Environment
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate

# Install Dependencies
pip install -r requirements.txt
# (Or use 'uv' if preferred: uv pip install -r requirements.txt)

# Set Environment Variables (Create a .env file)
echo "MISTRAL_API_KEY=your_key_here" >> .env
echo "ELEVENLABS_API_KEY=your_key_here" >> .env

# Run the FastAPI Server
uvicorn main:app --reload

```

### 2. Environment Setup (Frontend)

The frontend uses a React + Vite setup.

```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install Dependencies
npm install

# Run the Development Server
npm run dev

```

Open your browser to `http://localhost:5173`. Click on the tracks labeled **AI DEMO** (like Harry Styles or Taylor Swift) to watch the Just-In-Time pipeline trigger in the backend and seamlessly inject the ad into the frontend player!
