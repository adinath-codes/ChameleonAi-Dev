import { useState, useEffect, useRef, useCallback } from "react";

const API_URL = "http://localhost:8000";

// ── Data ─────────────────────────────────────────────────────────────────────
const TRACKS = [
  {
    id: 2,
    title: "As It Was",
    artist: "Harry Styles",
    duration: 167,
    color1: "#102a5e",
    color2: "#0f3a6b",
    accent: "#6bd4ff",
    ismost: true,
    cover: "◈",
    imgUrl: "/images/asitwas.png", // 🚀 REAL IMAGE PATH
    isAiDemo: true,
    fileName: "original.mp3",
    adFileName: "final_with_ad.mp3",
    modelFolder: "harry_styles",
  },
  {
    id: 13,
    title: "Blank Space",
    artist: "Taylor Swift",
    duration: 231,
    color1: "#3b1a2a",
    color2: "#6b0f3a",
    accent: "#ff6bd6",
    cover: "✧",
    imgUrl: "/images/blankspace.png", // 🚀 REAL IMAGE PATH
    isAiDemo: true,
    fileName: "Original2.mp3",
    adFileName: "final_with_ad2.mp3",
    modelFolder: "taylor_swift",
  },
  {
    id: 1,
    title: "Blinding Lights",
    artist: "The Weeknd",
    imgUrl: "/images/blindinglights.png",
    duration: 200,
    ismost: true,

    color1: "#2e0a0f",
    isAiDemo: true,
    color2: "#6b0f1a",
    accent: "#ff6b9d",
    cover: "⬡",
  },
  {
    id: 3,
    title: "Levitating",
    artist: "Dua Lipa",
    isAiDemo: true,
    imgUrl: "/images/levitation.png",
    duration: 203,
    color1: "#1a2a1a",
    color2: "#3a6b0f",
    accent: "#c6ff6b",
    ismost: true,

    cover: "✦",
  },
  {
    id: 4,
    title: "Stay",
    artist: "The Kid LAROI",
    isAiDemo: true,
    imgUrl: "/images/stay.png",
    duration: 141,
    color1: "#2e1a0a",
    color2: "#6b1a0f",
    accent: "#ffaa6b",
    cover: "⬤",
  },
  {
    id: 5,
    title: "Heat Waves",
    artist: "Glass Animals",
    isAiDemo: true,
    imgUrl: "/images/heatwaves.png",
    duration: 238,
    color1: "#0a2e1a",
    color2: "#0f6b3a",
    accent: "#6bffcc",
    ismost: true,

    cover: "◎",
  },
  {
    id: 1,
    title: "Blinding Lights",
    artist: "The Weeknd",
    imgUrl: "/images/blindinglights.png",
    duration: 200,
    color1: "#2e0a0f",
    color2: "#6b0f1a",
    accent: "#ff6b9d",
    cover: "⬡",
  },
  {
    id: 3,
    title: "Levitating",
    artist: "Dua Lipa",
    imgUrl: "/images/levitation.png",
    duration: 203,
    ismost: true,

    color1: "#1a2a1a",
    color2: "#3a6b0f",
    accent: "#c6ff6b",
    cover: "✦",
  },
  {
    id: 4,
    title: "Stay",
    artist: "The Kid LAROI",
    imgUrl: "/images/stay.png",
    duration: 141,
    color1: "#2e1a0a",
    color2: "#6b1a0f",
    accent: "#ffaa6b",
    cover: "⬤",
  },
  {
    id: 5,
    title: "Heat Waves",
    artist: "Glass Animals",
    imgUrl: "/images/heatwaves.png",
    duration: 238,
    color1: "#0a2e1a",
    color2: "#0f6b3a",
    accent: "#6bffcc",
    cover: "◎",
  },
];

const FRIENDS = [
  {
    name: "Alex Chen",
    listeningTo: "Starboy",
    artist: "The Weeknd",
    time: "2 hr",
  },
  {
    name: "Sarah Jenkins",
    listeningTo: "Cruel Summer",
    artist: "Taylor Swift",
    time: "4 hr",
  },
  {
    name: "David Kim",
    listeningTo: "Rich Flex",
    artist: "Drake",
    time: "5 hr",
  },
];

function fmt(s) {
  const m = Math.floor(s / 60),
    ss = Math.floor(s % 60);
  return `${m}:${ss.toString().padStart(2, "0")}`;
}

// ── UI Components ────────────────────────────────────────────────────────────

function CoverArt({
  track,
  size = 48,
  radius = 4,
  spinning = true,
  shadow = true,
}) {
  if (!track)
    return (
      <div
        style={{
          width: size,
          height: size,
          background: "#282828",
          borderRadius: radius,
        }}
      />
    );

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: radius,
    flexShrink: 0,
    boxShadow: shadow ? `0 8px 24px rgba(0,0,0,0.6)` : "none",
    animation: spinning ? "spin 8s linear infinite" : "none",
    overflow: "hidden",
  };

  if (track.imgUrl) {
    return (
      <div style={containerStyle}>
        <img
          src={track.imgUrl}
          alt={track.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>
    );
  }

  const fontSizeCalc = typeof size === "number" ? `${size * 0.38}px` : "64px";
  return (
    <div
      style={{
        ...containerStyle,
        background: `linear-gradient(135deg, ${track.color1}, ${track.color2})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: fontSizeCalc,
        color: track.accent,
      }}
    >
      {track.cover}
    </div>
  );
}

function SquareCard({ track, onClick, isPlaying, isCurrent }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{
        width: "180px",
        padding: "16px",
        background: hov ? "#282828" : "#181818",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "background 0.3s ease",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        position: "relative",
      }}
    >
      <div style={{ position: "relative", width: "100%", aspectRatio: "1" }}>
        <CoverArt track={track} size="100%" radius={6} shadow={true} />
        <div
          style={{
            position: "absolute",
            bottom: "8px",
            right: "8px",
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: "#1ed760",
            color: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            opacity: hov || (isCurrent && isPlaying) ? 1 : 0,
            transform:
              hov || (isCurrent && isPlaying)
                ? "translateY(0)"
                : "translateY(8px)",
            transition: "all 0.3s ease",
            boxShadow: "0 8px 8px rgba(0,0,0,0.3)",
          }}
        >
          {isCurrent && isPlaying ? "⏸" : "▶"}
        </div>
      </div>
      <div>
        <div
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: "#fff",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginBottom: "4px",
          }}
        >
          {track.title}
        </div>
        <div
          style={{
            fontSize: "14px",
            color: "#a7a7a7",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {track.artist}
        </div>
      </div>
      {track.ismost && (
        <div
          style={{
            position: "absolute",
            top: "24px",
            left: "24px",
            background: "rgba(0,0,0,0.8)",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "10px",
            fontWeight: "bold",
            color: "#1ed760",
          }}
        >
          most listened
        </div>
      )}
    </div>
  );
}

function ProgressBarWithAd({ progress, duration, adPosition, onChange }) {
  const pct = duration > 0 ? (progress / duration) * 100 : 0;
  const adPct =
    adPosition !== null && duration > 0 ? (adPosition / duration) * 100 : null;

  return (
    <div
      className="progress-container"
      style={{
        width: "100%",
        height: "12px",
        display: "flex",
        alignItems: "center",
        position: "relative",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "4px",
          background: "#4d4d4d",
          borderRadius: "2px",
          position: "relative",
        }}
      >
        <div
          className="progress-fill"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${pct}%`,
            background: "#fff",
            borderRadius: "2px",
          }}
        />

        {/* Glowy Ad Marker */}
        {adPct !== null && (
          <div
            style={{
              position: "absolute",
              left: `${adPct}%`,
              top: "-2px",
              bottom: "-2px",
              width: "4px",
              transform: "translateX(-50%)",
              background: "#1ed760",
              borderRadius: "2px",
              zIndex: 2,
              boxShadow: "0 0 6px #1ed760",
            }}
          />
        )}
      </div>
      <input
        type="range"
        min={0}
        max={duration || 100}
        value={progress}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          opacity: 0,
          cursor: "pointer",
          zIndex: 4,
        }}
      />
    </div>
  );
}

function AdOverlay({ track, onSkip, timeLeft }) {
  if (!track) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: "100px",
        right: "32px",
        zIndex: 9999,
        animation: "slideIn 0.4s cubic-bezier(0.23,1,0.32,1) forwards",
      }}
    >
      <div
        style={{
          background: "#282828",
          border: `1px solid #1ed760`,
          borderRadius: "8px",
          overflow: "hidden",
          width: "320px",
          boxShadow: `0 16px 48px rgba(0,0,0,0.8)`,
        }}
      >
        <div
          style={{
            padding: "8px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: `#1ed76020`,
            borderBottom: `1px solid #1ed76040`,
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#1ed760",
              letterSpacing: "0.05em",
            }}
          >
            CHAMELEON AI NATIVE AD
          </span>
          <span style={{ fontSize: "11px", color: "#a7a7a7" }}>
            :{String(timeLeft).padStart(2, "0")}
          </span>
        </div>
        <div
          style={{
            padding: "16px",
            display: "flex",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <CoverArt track={track} size={56} radius={4} shadow={false} />
          <div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#fff",
                marginBottom: "4px",
              }}
            >
              NovaBrew Cold Brew
            </div>
            <div style={{ fontSize: "12px", color: "#a7a7a7" }}>
              Sung by {track.artist}
            </div>
          </div>
        </div>
        <div style={{ padding: "0 16px 16px", display: "flex", gap: "8px" }}>
          <button
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "20px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 700,
              background: `#fff`,
              border: "none",
              color: "#000",
              transition: "transform 0.1s",
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = "scale(0.96)")
            }
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Explore Now
          </button>
          <button
            onClick={onSkip}
            style={{
              padding: "10px 16px",
              borderRadius: "20px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 700,
              background: "transparent",
              border: "1px solid #878787",
              color: "#fff",
            }}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main App Component ────────────────────────────────────────────────────────
export default function SpotifyClone() {
  const [currentTrack, setCurrentTrack] = useState(TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const [showAd, setShowAd] = useState(false);
  const [adTimeLeft, setAdTimeLeft] = useState(30);
  const [showRightSidebar, setShowRightSidebar] = useState(true);

  // 🚀 NEW: Fullscreen UI State
  const [isFullScreen, setIsFullScreen] = useState(false);

  // AI Backend State
  const [jobId, setJobId] = useState(null);
  const [pipelineStatus, setPipelineStatus] = useState("");
  const [adPosition, setAdPosition] = useState(null);

  const originalAudioRef = useRef(new Audio());
  const intervalRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const adRef = useRef(null);
  const adTriggeredRef = useRef(false);

  useEffect(() => {
    originalAudioRef.current.volume = volume / 100;
  }, [volume]);

  const togglePlay = () => {
    if (isPlaying) originalAudioRef.current.pause();
    else originalAudioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const playTrack = async (track) => {
    setCurrentTrack(track);
    setProgress(0);
    setAdPosition(null);
    setShowAd(false);
    setPipelineStatus("");
    adTriggeredRef.current = false;

    // 🚀 Instantly pop open the Fullscreen view when clicked
    setIsFullScreen(true);

    originalAudioRef.current.pause();
    originalAudioRef.current.currentTime = 0;

    if (track.isAiDemo) {
      setPipelineStatus("Triggering AI Engine...");
      try {
        const response = await fetch(`/music/${track.fileName}`);
        if (!response.ok) throw new Error(`Missing ${track.fileName}`);
        const blob = await response.blob();

        const formData = new FormData();
        formData.append("file", blob, track.fileName);
        formData.append("artist_name", track.artist);
        formData.append("artist_folder", track.modelFolder);
        formData.append("song_name", track.title);
        formData.append("company", "NovaBrew");
        formData.append("product", "Midnight Nitro");
        formData.append("tagline", "The smoothest kick to start your night.");
        formData.append("speciality", "Nitrogen infused creamy finish.");
        formData.append("description", "Premium canned coffee.");
        formData.append("tone", "energetic.");

        const apiRes = await fetch(`${API_URL}/process`, {
          method: "POST",
          body: formData,
        });
        if (!apiRes.ok) throw new Error("API Backend not running!");

        const data = await apiRes.json();
        setJobId(data.job_id);
        setAdPosition(data.ad_timestamp);

        originalAudioRef.current.src = `/music/${track.fileName}`;
        await originalAudioRef.current.play();

        setIsPlaying(true);
        setPipelineStatus("AI generating ad...");
      } catch (err) {
        console.error("Playback error:", err);
        setPipelineStatus(`Error: ${err.message}`);
      }
    } else {
      originalAudioRef.current.src = `/music/original.mp3`;
      originalAudioRef.current.play().catch((e) => console.log(e));
      setIsPlaying(true);
    }
  };

  // Polling & HOT-SWAP Logic
  useEffect(() => {
    if (!jobId) return;

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/status/${jobId}`);
        const data = await res.json();
        setPipelineStatus(data.progress || data.status);

        if (data.status === "ready") {
          clearInterval(pollIntervalRef.current);
          setPipelineStatus("Ad Ready & Injected!");
          if (data.ad_timestamp) setAdPosition(data.ad_timestamp);

          const currentPlaybackTime = originalAudioRef.current.currentTime;
          originalAudioRef.current.src = `/music/${currentTrack.adFileName}`;

          originalAudioRef.current.onloadedmetadata = () => {
            originalAudioRef.current.currentTime = currentPlaybackTime;
            if (isPlaying) originalAudioRef.current.play();
          };
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 3000);

    return () => clearInterval(pollIntervalRef.current);
  }, [jobId, isPlaying, currentTrack]);

  // Progress Tracking & Overlay Trigger
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        const currentAudioTime = originalAudioRef.current.currentTime;
        setProgress(currentAudioTime);

        if (
          adPosition !== null &&
          !adTriggeredRef.current &&
          currentAudioTime >= adPosition
        ) {
          adTriggeredRef.current = true;
          setShowAd(true);
          setAdTimeLeft(30);
        }
      }, 500);
    } else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, adPosition]);

  useEffect(() => {
    if (showAd) {
      adRef.current = setInterval(() => {
        setAdTimeLeft((t) => {
          if (t <= 1) {
            setShowAd(false);
            return 30;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(adRef.current);
  }, [showAd]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#000",
        color: "#fff",
        fontFamily:
          "'Circular', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Montserrat', sans-serif; }
        @keyframes slideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar { width: 12px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border: 3px solid #121212; border-radius: 8px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.5); }
        .progress-container:hover .progress-fill { background: #1ed760 !important; }
        .progress-container input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:12px; height:12px; border-radius:50%; background:#fff; cursor:pointer; opacity:0; transition:opacity 0.1s; }
        .progress-container:hover input[type=range]::-webkit-slider-thumb { opacity:1; }
        button { outline:none; border:none; cursor:pointer; }
        .nav-item:hover { color: #fff !important; }
        .hover-bg:hover { background: #1a1a1a !important; }
      `}</style>

      {/* ── MAIN DASHBOARD (Visible when NOT Fullscreen) ── */}
      <div
        style={{
          flex: 1,
          display: isFullScreen ? "none" : "flex",
          overflow: "hidden",
          gap: "8px",
          padding: "8px 8px 0",
        }}
      >
        {/* Left Sidebar */}
        <div
          style={{
            width: "280px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div
            style={{
              background: "#121212",
              borderRadius: "8px",
              padding: "20px 24px",
            }}
          >
            <button
              className="nav-item"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                background: "none",
                color: "#fff",
                fontSize: "16px",
                fontWeight: 700,
                marginBottom: "20px",
                transition: "color 0.2s",
              }}
            >
              <span style={{ fontSize: "24px" }}>⌂</span> Home
            </button>
            <button
              className="nav-item"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                background: "none",
                color: "#a7a7a7",
                fontSize: "16px",
                fontWeight: 700,
                transition: "color 0.2s",
              }}
            >
              <span style={{ fontSize: "24px" }}>⌕</span> Search
            </button>
          </div>
          <div
            style={{
              flex: 1,
              background: "#121212",
              borderRadius: "8px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 24px 8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <button
                className="nav-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  background: "none",
                  color: "#a7a7a7",
                  fontSize: "16px",
                  fontWeight: 700,
                  transition: "color 0.2s",
                }}
              >
                <span style={{ fontSize: "24px", transform: "rotate(-90deg)" }}>
                  ▤
                </span>{" "}
                Your Library
              </button>
              <button
                className="nav-item"
                style={{
                  background: "none",
                  color: "#a7a7a7",
                  fontSize: "24px",
                  transition: "color 0.2s",
                }}
              >
                +
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px" }}>
              <div
                className="hover-bg"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "8px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    background: "linear-gradient(135deg, #450af5, #c4efd9)",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                  }}
                >
                  ♥
                </div>
                <div>
                  <div
                    style={{ fontSize: "16px", color: "#fff", fontWeight: 500 }}
                  >
                    Liked Songs
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#a7a7a7",
                      marginTop: "4px",
                    }}
                  >
                    Playlist • 248 songs
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div
          style={{
            flex: 1,
            borderRadius: "8px",
            overflow: "hidden",
            position: "relative",
            background: "#121212",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              height: "64px",
              padding: "0 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(18,18,18,0.8)",
              backdropFilter: "blur(12px)",
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10,
            }}
          >
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.7)",
                  color: "#fff",
                  fontSize: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ‹
              </button>
              <button
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.7)",
                  color: "#a7a7a7",
                  fontSize: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "not-allowed",
                }}
              >
                ›
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <button
                style={{
                  padding: "6px 16px",
                  borderRadius: "20px",
                  background: "#fff",
                  color: "#000",
                  fontSize: "13px",
                  fontWeight: 700,
                  transition: "transform 0.1s",
                }}
                onMouseDown={(e) =>
                  (e.currentTarget.style.transform = "scale(0.96)")
                }
                onMouseUp={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                Explore Premium
              </button>
              <button
                style={{
                  padding: "6px 16px",
                  borderRadius: "20px",
                  background: "#000",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 700,
                  border: "1px solid #878787",
                }}
              >
                <span style={{ marginRight: "4px" }}>⬇</span> Install App
              </button>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "#000",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #282828",
                }}
              >
                D
              </div>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              paddingTop: "80px",
              paddingBottom: "40px",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "332px",
                background: `linear-gradient(180deg, ${currentTrack.color1}40 0%, #121212 100%)`,
                zIndex: 0,
                pointerEvents: "none",
                transition: "background 1s ease",
              }}
            />
            <div style={{ padding: "0 24px", position: "relative", zIndex: 1 }}>
              <div style={{ marginBottom: "40px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: "16px",
                  }}
                >
                  <h2
                    style={{ fontSize: "24px", fontWeight: 700, color: "#fff" }}
                  >
                    Chameleon AI Ad Demos
                  </h2>
                  <span
                    className="nav-item"
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#a7a7a7",
                      cursor: "pointer",
                    }}
                  >
                    Show all
                  </span>
                </div>
                <div
                  style={{ display: "flex", gap: "24px", overflowX: "auto" }}
                >
                  {TRACKS.filter((t) => t.isAiDemo).map((track) => (
                    <SquareCard
                      key={track.id}
                      track={track}
                      isPlaying={isPlaying}
                      isCurrent={currentTrack.id === track.id}
                      onClick={() => playTrack(track)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: "16px",
                  }}
                >
                  <h2
                    style={{ fontSize: "24px", fontWeight: 700, color: "#fff" }}
                  >
                    Made For You
                  </h2>
                  <span
                    className="nav-item"
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#a7a7a7",
                      cursor: "pointer",
                    }}
                  >
                    Show all
                  </span>
                </div>
                <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                  {TRACKS.filter((t) => !t.isAiDemo).map((track) => (
                    <SquareCard
                      key={track.id}
                      track={track}
                      isPlaying={isPlaying}
                      isCurrent={currentTrack.id === track.id}
                      onClick={() => playTrack(track)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        {showRightSidebar && (
          <div
            style={{
              width: "280px",
              flexShrink: 0,
              background: "#121212",
              borderRadius: "8px",
              padding: "20px 16px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
                padding: "0 8px",
              }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>
                Friend Activity
              </h3>
              <button
                onClick={() => setShowRightSidebar(false)}
                className="nav-item"
                style={{
                  background: "none",
                  color: "#a7a7a7",
                  fontSize: "16px",
                }}
              >
                ✖
              </button>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {FRIENDS.map((friend, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "12px",
                    padding: "0 8px",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "#282828",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: "14px",
                      flexShrink: 0,
                    }}
                  >
                    {friend.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "4px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#fff",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {friend.name}
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#a7a7a7",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {friend.time}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#a7a7a7",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        marginBottom: "2px",
                      }}
                    >
                      {friend.listeningTo}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#a7a7a7",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      ☻ {friend.artist}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── CINEMATIC FULL SCREEN OVERLAY ── */}
      {isFullScreen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9000, // Very high z-index
            background: `linear-gradient(180deg, ${currentTrack.color1} 0%, #000 100%)`,
            display: "flex",
            flexDirection: "column",
            animation: "fadeIn 0.3s ease-out forwards",
          }}
        >
          {/* Top Bar with Close Button */}
          <div
            style={{
              padding: "32px 40px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <button
              onClick={() => setIsFullScreen(false)}
              style={{
                background: "rgba(0,0,0,0.3)",
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                color: "#fff",
                fontSize: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(0,0,0,0.5)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(0,0,0,0.3)")
              }
            >
              ⌄
            </button>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "12px",
                  letterSpacing: "0.1em",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                PLAYING FROM PLAYLIST
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#fff",
                  marginTop: "4px",
                }}
              >
                Chameleon AI
              </div>
            </div>
            <div style={{ width: "48px" }} /> {/* Spacer */}
          </div>

          {/* Center Massive Image */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CoverArt
              track={currentTrack}
              size="min(450px, 60vh)"
              radius={12}
              shadow={true}
            />
          </div>

          {/* Bottom Controls */}
          <div
            style={{
              padding: "20px 10vw 60px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: "48px",
                    fontWeight: 800,
                    margin: 0,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {currentTrack.title}
                </h1>
                <p
                  style={{
                    fontSize: "20px",
                    color: "rgba(255,255,255,0.7)",
                    margin: "4px 0 0 0",
                    fontWeight: 500,
                  }}
                >
                  {currentTrack.artist}
                </p>
              </div>

              {/* 🚀 The Backend Status Badge shines prominently here! */}
              {pipelineStatus && (
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    padding: "8px 16px",
                    background: "rgba(30,215,96,0.1)",
                    borderRadius: "8px",
                    color: "#1ed760",
                    border: "1px solid rgba(30,215,96,0.3)",
                  }}
                >
                  {pipelineStatus}
                </div>
              )}
            </div>

            {/* Giant Progress Bar */}
            <div>
              <ProgressBarWithAd
                progress={progress}
                duration={currentTrack.duration}
                adPosition={adPosition}
                onChange={(v) => (originalAudioRef.current.currentTime = v)}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "12px",
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.6)",
                  fontWeight: 500,
                }}
              >
                <span>{fmt(progress)}</span>
                <span>{fmt(currentTrack.duration)}</span>
              </div>
            </div>

            {/* Play Controls */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "40px",
              }}
            >
              <button
                className="nav-item"
                style={{
                  fontSize: "32px",
                  color: "rgba(255,255,255,0.7)",
                  background: "none",
                }}
              >
                ⏮
              </button>
              <button
                onClick={togglePlay}
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "#1ed760",
                  color: "#000",
                  fontSize: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(30,215,96,0.4)",
                  transition: "transform 0.1s",
                }}
                onMouseDown={(e) =>
                  (e.currentTarget.style.transform = "scale(0.96)")
                }
                onMouseUp={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                {isPlaying ? "⏸" : "▶"}
              </button>
              <button
                className="nav-item"
                style={{
                  fontSize: "32px",
                  color: "rgba(255,255,255,0.7)",
                  background: "none",
                }}
              >
                ⏭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STANDARD BOTTOM BAR (Hidden during fullscreen) ── */}
      {!isFullScreen && (
        <div
          style={{
            height: "90px",
            background: "#000",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            zIndex: 50,
            position: "relative",
          }}
        >
          {/* Left: Track Info */}
          <div
            style={{
              flex: "0 0 30%",
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <CoverArt
              track={currentTrack}
              size={56}
              radius={4}
              shadow={false}
            />
            <div style={{ minWidth: 0, marginRight: "12px" }}>
              <div
                onClick={() => setIsFullScreen(true)}
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#fff",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  cursor: "pointer",
                }}
                className="nav-item"
              >
                {currentTrack.title}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#a7a7a7",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {currentTrack.artist}
              </div>
            </div>
            <button
              className="nav-item"
              style={{ background: "none", color: "#1ed760", fontSize: "18px" }}
            >
              ♥
            </button>
          </div>

          {/* Center: Controls */}
          <div
            style={{
              flex: "1",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
              <button
                className="nav-item"
                style={{
                  background: "none",
                  color: "#a7a7a7",
                  fontSize: "16px",
                }}
              >
                ⇄
              </button>
              <button
                className="nav-item"
                style={{
                  background: "none",
                  color: "#a7a7a7",
                  fontSize: "20px",
                }}
              >
                ⏮
              </button>
              <button
                onClick={togglePlay}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "#fff",
                  color: "#000",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform 0.1s",
                }}
                onMouseDown={(e) =>
                  (e.currentTarget.style.transform = "scale(0.9)")
                }
                onMouseUp={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                {isPlaying ? "⏸" : "▶"}
              </button>
              <button
                className="nav-item"
                style={{
                  background: "none",
                  color: "#a7a7a7",
                  fontSize: "20px",
                }}
              >
                ⏭
              </button>
              <button
                className="nav-item"
                style={{
                  background: "none",
                  color: "#a7a7a7",
                  fontSize: "16px",
                }}
              >
                ↺
              </button>
            </div>
            <div
              style={{
                width: "100%",
                maxWidth: "600px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  color: "#a7a7a7",
                  width: "32px",
                  textAlign: "right",
                }}
              >
                {fmt(progress)}
              </span>
              <ProgressBarWithAd
                progress={progress}
                duration={currentTrack.duration}
                adPosition={adPosition}
                onChange={(v) => (originalAudioRef.current.currentTime = v)}
              />
              <span
                style={{ fontSize: "11px", color: "#a7a7a7", width: "32px" }}
              >
                {fmt(currentTrack.duration)}
              </span>
            </div>
          </div>

          {/* Right: Extra Controls */}
          <div
            style={{
              flex: "0 0 30%",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "16px",
            }}
          >
            {pipelineStatus && (
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  color: "#1ed760",
                  border: "1px solid #1ed760",
                  padding: "2px 8px",
                  borderRadius: "4px",
                }}
              >
                {pipelineStatus}
              </div>
            )}
            <button
              onClick={() => setIsFullScreen(true)}
              className="nav-item"
              style={{ background: "none", color: "#a7a7a7", fontSize: "16px" }}
              title="Full Screen View"
            >
              ⤢
            </button>
            <button
              className="nav-item"
              style={{ background: "none", color: "#a7a7a7", fontSize: "16px" }}
              title="Queue"
            >
              ≣
            </button>
            <button
              className="nav-item"
              style={{ background: "none", color: "#a7a7a7", fontSize: "16px" }}
              title="Connect to a device"
            >
              💻
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                width: "100px",
              }}
            >
              <span style={{ color: "#a7a7a7", fontSize: "14px" }}>🔊</span>
              <ProgressBarWithAd
                progress={volume}
                duration={100}
                adPosition={null}
                onChange={setVolume}
              />
            </div>
            {!showRightSidebar && (
              <button
                onClick={() => setShowRightSidebar(true)}
                className="nav-item"
                style={{
                  background: "none",
                  color: "#a7a7a7",
                  fontSize: "16px",
                }}
                title="Friend Activity"
              >
                👤
              </button>
            )}
          </div>
        </div>
      )}

      {/* AI Ad Overlay - Kept above everything! */}
      {showAd && (
        <AdOverlay
          track={currentTrack}
          timeLeft={adTimeLeft}
          onSkip={() => setShowAd(false)}
        />
      )}
    </div>
  );
}
