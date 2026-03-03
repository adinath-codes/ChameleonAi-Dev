# 🦎 Chameleon AI 🎧✨

> **The Future of Native Audio Advertising. Seamless. Hyper-Personalized. Unskippable.** 🚀🔥

---

## 🤔 Why We Built It (The Problem) 🛑📉

Let's face it: **Audio advertising is fundamentally broken.** 💔
You are deep into your favorite Spotify playlist, the vibe is absolutely perfect 🎶✨, and suddenly—**BAM!** 💥 A loud, jarring, completely out-of-context car commercial ruins the moment. 🚗🔊

Listeners hate it 😠, skip rates are through the roof ⏭️, and advertisers are wasting millions of dollars 💸🗑️.

### 💡 The Solution: Make the ad *become* the vibe. 🦎🎵

**Chameleon AI** is a Just-In-Time (JIT) ⏱️ audio engine that reinvents the ad break. We use RVC voice cloning 🗣️, LLM contextual scripting 🧠, and automated studio mastering 🎛️ to generate native ads in **real-time** that perfectly match the tempo 🥁, musical key 🎹, and emotional vibe 🌊 of whatever the user is currently listening to.

---

## 🌟 Key Advantages & Features 🚀🏆

* **🎯 Hyper-Contextual "Vibe Matching":** Listenting to a 130 BPM workout track? 🏋️‍♂️ The ad is hype and fast. Lo-fi study beats? 📚 The ad is whispered and chill. Skip rates drop to near zero! 📉
* **🌍 Dynamic Creative Optimization (DCO):** Ads are generated *milliseconds* before playing. We inject real-time data! 🌧️ *"Raining in Chennai right now? Order a hot coffee..."* ☕📍
* **🎙️ Synthetic Host-Read Ads:** Podcast listeners love host-read ads! We clone the host's voice so advertisers can buy dynamic slots without the podcaster going into a studio. 🎧🎤
* **🖼️ Multi-Modal Ad Delivery:** When the AI audio plays, the frontend UI dynamically swaps the album artwork to an AI-generated visual of the artist using the product! 📸🥤
* **💰 The Creator Economy Marketplace:** It's not piracy; it's a licensing platform! Artists opt-in their voice models and earn a 20% royalty 🤑 every time an advertiser generates a Chameleon Ad. Passive income while they sleep! 🛌💸

---

## 📂 File Structure 🏗️📁

```text
ChameleonAI/
│
├── 🎨 frontend/                  # React + Vite Spotify Clone
│   ├── public/
│   │   ├── images/               # 🖼️ Album art & AI Ad generated images
│   │   └── music/                # 🎵 Local .mp3 files for seamless hot-swapping
│   ├── src/
│   │   └── components/
│   │       └── SpotifyClone.jsx  # 💻 Main UI, Dashboard & Fullscreen Player
│   ├── package.json
│   └── vite.config.js            # ⚙️ Configured to ignore backend watcher limits
│
└── ⚙️ backend/                   # FastAPI + Python ML Pipeline
    ├── jobs/                     # 📁 Temporary storage for in-progress audio files
    ├── music/                    # 🧠 The Core AI Pipeline
    │   ├── s1_seperator.py       # ✂️ Demucs: Splits vocals & instrumentals
    │   ├── s2_analysis.py        # 🎼 Extracts BPM, Key, and beat grid
    │   ├── s3_lyrics_tts.py      # 🤖 Mistral DCO + ElevenLabs TTS
    │   ├── s4_rvc.py             # 🗣️ RVC: Clones artist voice
    │   ├── s4_5_autotune.py      # 🎛️ Pedalboard: Platinum studio mastering & EQ
    │   ├── s5_mixall.py          # 🎚️ Mixes AI vocals back into the instrumental
    │   └── s6_hybridsong.py      # 🪡 Stitches the ad seamlessly into the timeline
    ├── main.py                   # 🚦 FastAPI Orchestrator (JIT Endpoints)
    └── pyproject.toml / uv.lock

```

---

## 🛠️ How to Use & Test It 🧪💻

### 1️⃣ Backend Setup (The AI Brain) 🧠🐍

1. Navigate to the backend folder: `cd backend` 📂
2. Install dependencies using `uv`: `uv sync` or `uv pip install -r requirements.txt` 📦
3. Set up your `.env` file with your API keys 🔑:
```env
MISTRAL_API_KEY="your_mistral_key"
ELEVENLABS_API_KEY="your_elevenlabs_key"

```


4. Start the FastAPI server 🚦:
```bash
uv run uvicorn main:app --reload

```



### 2️⃣ Frontend Setup (The Spotify UI) 🎧📱

1. Open a new terminal and navigate to the frontend: `cd frontend` 📂
2. Install Node packages 📦:
```bash
npm install

```


3. Run the Vite development server ⚡:
```bash
npm run dev

```



### 3️⃣ Run the Demo! 🎉🔥

1. Open your browser to `http://localhost:5173` 🌐
2. You will see the hyper-realistic Spotify clone! 🟢🎵
3. Click on the **Harry Styles "As It Was"** or **Taylor Swift "Blank Space"** track (marked with the green `AI DEMO` badge). 🖱️✨
4. **Watch the magic happen:** 🤯
* The UI will pop open a beautiful Cinematic Full-Screen Player! 🖥️✨
* The terminal will start printing ML pipeline steps (`[INFO] Fetching weather...`, `[INFO] Generating Mistral Lyrics...`). 💻🤖
* A glowing green marker 🟩 will appear on the timeline indicating the JIT Ad insertion point.
* When the playhead crosses the marker, the massive album cover will dynamically swap to an ad visual 🖼️, and the AI-generated ad will play seamlessly over the beat! 🎧🔥



---

### 🏆 Built with ❤️ for the Hackathon by Team Chameleon. 🦎✨
