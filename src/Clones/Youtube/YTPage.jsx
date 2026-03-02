import { useState, useEffect, useRef, useCallback } from "react";

// ── Data ──────────────────────────────────────────────────────────────────────
const VIDEOS = [
  {
    id: 1,
    title: "Tokyo Street Food Tour — Hidden Gems Only Locals Know",
    channel: "WanderEats",
    views: "4.2M",
    ago: "3 days",
    duration: 1842,
    thumb: "🍜",
    bg1: "#1a0a0a",
    bg2: "#4a1a0a",
    accent: "#ff6b35",
    subs: "2.1M",
    category: "Travel",
  },
  {
    id: 2,
    title: "I Built a Full-Stack App in 24 Hours (Next.js + Supabase)",
    channel: "CodeWithKai",
    views: "892K",
    ago: "1 week",
    duration: 3612,
    thumb: "💻",
    bg1: "#0a0a1a",
    bg2: "#0a1a4a",
    accent: "#6b8fff",
    subs: "540K",
    category: "Tech",
  },
  {
    id: 3,
    title: "The Science of Black Holes — Explained Simply",
    channel: "CosmosNow",
    views: "12.1M",
    ago: "2 months",
    duration: 2241,
    thumb: "🌌",
    bg1: "#050510",
    bg2: "#150530",
    accent: "#c06bff",
    subs: "8.4M",
    category: "Science",
  },
  {
    id: 4,
    title: "Minimal Home Office Setup 2025 — Under ₹20,000",
    channel: "DeskSetup",
    views: "1.8M",
    ago: "5 days",
    duration: 912,
    thumb: "🖥️",
    bg1: "#0a0a0a",
    bg2: "#1a1a1a",
    accent: "#e8e8e8",
    subs: "890K",
    category: "Lifestyle",
  },
  {
    id: 5,
    title: "Making the BEST Cold Brew at Home (The NovaBrew Method)",
    channel: "CaffeineChronicles",
    views: "3.4M",
    ago: "2 weeks",
    duration: 1122,
    thumb: "☕",
    bg1: "#0a1a0a",
    bg2: "#1a3a1a",
    accent: "#6EE7B7",
    subs: "1.2M",
    category: "Food",
  },
  {
    id: 6,
    title: "Lo-fi Hip Hop Radio 🎵 beats to study/relax to",
    channel: "ChillWaves",
    views: "89M",
    ago: "2 years",
    duration: 7200,
    thumb: "🎵",
    bg1: "#0a0a1a",
    bg2: "#1a1a2e",
    accent: "#a78bfa",
    subs: "5.2M",
    category: "Music",
  },
  {
    id: 7,
    title: "Explaining Quantum Computing to a 5 Year Old",
    channel: "MindBlown",
    views: "6.7M",
    ago: "1 month",
    duration: 1534,
    thumb: "⚛️",
    bg1: "#001a0a",
    bg2: "#003a1a",
    accent: "#6bffcc",
    subs: "3.1M",
    category: "Science",
  },
  {
    id: 8,
    title: "I Tried Every Viral Recipe This Week So You Don't Have To",
    channel: "TasteTest",
    views: "2.3M",
    ago: "4 days",
    duration: 1845,
    thumb: "🍳",
    bg1: "#2e1a0a",
    bg2: "#4a2a0a",
    accent: "#ffd96b",
    subs: "760K",
    category: "Food",
  },
  {
    id: 9,
    title: "How I Got Into IIT With Zero Coaching (My Real Story)",
    channel: "StudyGrind",
    views: "5.1M",
    ago: "3 weeks",
    duration: 2134,
    thumb: "📚",
    bg1: "#1a0a1a",
    bg2: "#3a1a3a",
    accent: "#ff6bff",
    subs: "4.3M",
    category: "Education",
  },
  {
    id: 10,
    title: "The Perfect Workout Split for Beginners (Science-Based)",
    channel: "FitFormula",
    views: "7.8M",
    ago: "6 days",
    duration: 1678,
    thumb: "💪",
    bg1: "#1a0a0a",
    bg2: "#3a1a0a",
    accent: "#ff6b6b",
    subs: "2.8M",
    category: "Fitness",
  },
  {
    id: 11,
    title: "Building a SaaS from $0 to $10K MRR in 6 Months",
    channel: "IndieMakers",
    views: "1.1M",
    ago: "2 weeks",
    duration: 4512,
    thumb: "📈",
    bg1: "#0a1a0a",
    bg2: "#1a3a1a",
    accent: "#6EE7B7",
    subs: "320K",
    category: "Business",
  },
  {
    id: 12,
    title: "Night Drive Through Mumbai — No Commentary",
    channel: "CityScapes",
    views: "980K",
    ago: "1 week",
    duration: 3600,
    thumb: "🌃",
    bg1: "#020208",
    bg2: "#08081a",
    accent: "#ffd96b",
    subs: "210K",
    category: "Travel",
  },
];

const CATEGORIES = [
  "All",
  "Travel",
  "Tech",
  "Science",
  "Food",
  "Music",
  "Lifestyle",
  "Fitness",
  "Education",
  "Business",
];

function fmt(s) {
  const h = Math.floor(s / 3600),
    m = Math.floor((s % 3600) / 60),
    ss = s % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  return `${m}:${String(ss).padStart(2, "0")}`;
}
function fmtShort(s) {
  const m = Math.floor(s / 60),
    ss = s % 60;
  return `${m}:${String(ss).padStart(2, "0")}`;
}

// ── Ad Data ───────────────────────────────────────────────────────────────────
const AD_SPOTS = [
  {
    id: "a1",
    brand: "NovaBrew",
    product: "Cold Brew Original",
    frame: "hand",
    desc: "Product appears in character's hand",
    accent: "#6EE7B7",
    emoji: "☕",
    skippable: true,
    skipAfter: 5,
  },
  {
    id: "a2",
    brand: "NovaBrew",
    product: "Nitro Blend Can",
    frame: "table",
    desc: "Can placed naturally on the table",
    accent: "#6EE7B7",
    emoji: "🥤",
    skippable: false,
    skipAfter: null,
  },
];

function getAdPositions(duration) {
  const positions = [];
  // pre-roll at 0
  positions.push({ time: 0, type: "pre", adIdx: 0 });
  // mid-roll at 35–55%
  const midPct = 0.35 + Math.random() * 0.2;
  positions.push({
    time: Math.floor(duration * midPct),
    type: "mid",
    adIdx: 1,
  });
  // end-roll at 88–95%
  const endPct = 0.88 + Math.random() * 0.07;
  positions.push({
    time: Math.floor(duration * endPct),
    type: "end",
    adIdx: 0,
  });
  return positions;
}

// ── Thumbnail ─────────────────────────────────────────────────────────────────
function Thumb({
  video,
  width = 320,
  height = 180,
  radius = 10,
  showDuration = true,
}) {
  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius: radius,
        overflow: "hidden",
        flexShrink: 0,
        background: `linear-gradient(135deg, ${video.bg1}, ${video.bg2})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          fontSize: width * 0.22,
          filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))",
        }}
      >
        {video.thumb}
      </span>
      {showDuration && (
        <div
          style={{
            position: "absolute",
            bottom: 6,
            right: 8,
            background: "rgba(0,0,0,0.85)",
            borderRadius: 4,
            padding: "2px 6px",
            fontSize: 11,
            fontWeight: 700,
            color: "#fff",
          }}
        >
          {fmt(video.duration)}
        </div>
      )}
    </div>
  );
}

// ── Video Card ─────────────────────────────────────────────────────────────────
function VideoCard({ video, onClick, horizontal = false }) {
  const [hov, setHov] = useState(false);
  if (horizontal)
    return (
      <div
        onClick={onClick}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: "flex",
          gap: 10,
          cursor: "pointer",
          padding: "6px 0",
        }}
      >
        <div style={{ position: "relative", flexShrink: 0 }}>
          <Thumb video={video} width={160} height={90} radius={6} />
          {hov && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.3)",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
              }}
            >
              ▶
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#fff",
              lineHeight: 1.4,
              marginBottom: 4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {video.title}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
            {video.channel}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.3)",
              marginTop: 1,
            }}
          >
            {video.views} views · {video.ago}
          </div>
        </div>
      </div>
    );

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ cursor: "pointer" }}
    >
      <div
        style={{
          position: "relative",
          borderRadius: 10,
          overflow: "hidden",
          marginBottom: 10,
        }}
      >
        <Thumb
          video={video}
          width="100%"
          height={undefined}
          radius={10}
          showDuration
        />
        <div
          style={{
            paddingTop: "56.25%",
            position: "absolute",
            inset: 0,
            background: `linear-gradient(135deg, ${video.bg1}, ${video.bg2})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: 48,
              filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))",
            }}
          >
            {video.thumb}
          </span>
          {hov && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
              }}
            >
              ▶
            </div>
          )}
          <div
            style={{
              position: "absolute",
              bottom: 8,
              right: 10,
              background: "rgba(0,0,0,0.85)",
              borderRadius: 4,
              padding: "2px 7px",
              fontSize: 12,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {fmt(video.duration)}
          </div>
        </div>
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "#fff",
          lineHeight: 1.4,
          marginBottom: 4,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {video.title}
      </div>
      <div
        style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.5)",
          marginBottom: 1,
        }}
      >
        {video.channel}
      </div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
        {video.views} views · {video.ago}
      </div>
    </div>
  );
}

// ── Ad Marker Timeline ────────────────────────────────────────────────────────
function AdMarker({ pct, type, isPast, accent }) {
  const color = isPast ? "rgba(255,215,0,0.25)" : "#FFD700";
  return (
    <div
      style={{
        position: "absolute",
        left: `${pct}%`,
        top: 0,
        bottom: 0,
        zIndex: 4,
        transform: "translateX(-50%)",
        pointerEvents: "none",
      }}
    >
      {/* vertical line */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "-3px",
          bottom: "-3px",
          width: "2px",
          transform: "translateX(-50%)",
          background: color,
          borderRadius: "99px",
          boxShadow: isPast
            ? "none"
            : `0 0 6px ${color}, 0 0 14px rgba(255,215,0,0.3)`,
          transition: "background 0.4s, box-shadow 0.4s",
        }}
      />
      {/* diamond */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%,-50%) rotate(45deg)",
          width: 7,
          height: 7,
          background: color,
          borderRadius: 1,
          boxShadow: isPast ? "none" : `0 0 8px ${color}`,
          transition: "background 0.4s",
        }}
      />
    </div>
  );
}

function VideoTimeline({ progress, duration, adPositions, onChange, showAd }) {
  const [hov, setHov] = useState(false);
  const [hovPct, setHovPct] = useState(null);
  const barRef = useRef(null);
  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  const handleMouseMove = (e) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    setHovPct(
      Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)),
    );
  };

  return (
    <div style={{ width: "100%", userSelect: "none" }}>
      {/* Bar area */}
      <div
        ref={barRef}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => {
          setHov(false);
          setHovPct(null);
        }}
        onMouseMove={handleMouseMove}
        style={{
          position: "relative",
          height: hov ? 6 : 4,
          cursor: "pointer",
          transition: "height 0.1s",
          marginBottom: 2,
        }}
      >
        {/* Track bg */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(255,255,255,0.2)",
            borderRadius: "99px",
          }}
        >
          {/* Buffer */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${Math.min(pct + 15, 100)}%`,
              background: "rgba(255,255,255,0.3)",
              borderRadius: "99px",
            }}
          />
          {/* Played */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${pct}%`,
              background: "#FF0000",
              borderRadius: "99px",
              transition: "width 0.5s linear",
            }}
          />
          {/* Ad zones */}
          {adPositions.map((ap, i) => {
            const aPct = (ap.time / duration) * 100;
            const isPast = progress > ap.time;
            return (
              <AdMarker
                key={i}
                pct={aPct}
                type={ap.type}
                isPast={isPast}
                accent="#FFD700"
              />
            );
          })}
          {/* Hover preview */}
          {hov && hovPct !== null && (
            <div
              style={{
                position: "absolute",
                left: `${hovPct}%`,
                top: 0,
                bottom: 0,
                width: 2,
                background: "rgba(255,255,255,0.6)",
                transform: "translateX(-50%)",
                borderRadius: "99px",
              }}
            />
          )}
        </div>
        {/* Playhead dot */}
        <div
          style={{
            position: "absolute",
            left: `${pct}%`,
            top: "50%",
            transform: "translate(-50%,-50%)",
            width: hov ? 14 : 0,
            height: hov ? 14 : 0,
            borderRadius: "50%",
            background: "#FF0000",
            boxShadow: "0 0 6px rgba(255,0,0,0.5)",
            transition: "width 0.1s, height 0.1s",
            zIndex: 5,
            pointerEvents: "none",
          }}
        />
        {/* Hover time tooltip */}
        {hov && hovPct !== null && (
          <div
            style={{
              position: "absolute",
              bottom: "calc(100% + 8px)",
              left: `${hovPct}%`,
              transform: "translateX(-50%)",
              background: "rgba(0,0,0,0.9)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              padding: "3px 7px",
              borderRadius: 4,
              whiteSpace: "nowrap",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            {fmtShort(Math.floor((hovPct / 100) * duration))}
          </div>
        )}
        {/* invisible range */}
        <input
          type="range"
          min={0}
          max={duration}
          value={progress}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            opacity: 0,
            cursor: "pointer",
            zIndex: 6,
            margin: 0,
          }}
        />
      </div>

      {/* Ad labels row */}
      <div style={{ position: "relative", height: 14, marginTop: 2 }}>
        {adPositions.map((ap, i) => {
          const aPct = (ap.time / duration) * 100;
          const isPast = progress > ap.time;
          const clamped = Math.min(Math.max(aPct, 5), 88);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${clamped}%`,
                transform: "translateX(-50%)",
                display: "flex",
                alignItems: "center",
                gap: 3,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.05em",
                color: isPast ? "rgba(255,215,0,0.3)" : "#FFD700",
                whiteSpace: "nowrap",
                transition: "color 0.4s",
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  display: "inline-block",
                  transform: "rotate(45deg)",
                  background: isPast ? "rgba(255,215,0,0.3)" : "#FFD700",
                  borderRadius: 1,
                }}
              />
              {isPast
                ? "✓"
                : ap.type === "pre"
                  ? "Pre"
                  : ap.type === "mid"
                    ? "Mid"
                    : "End"}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Ad Overlay In Video ───────────────────────────────────────────────────────
function VideoAdOverlay({ ad, timeLeft, canSkip, onSkip, adNumber, totalAds }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 20,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        background:
          "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)",
        animation: "adIn 0.3s ease forwards",
      }}
    >
      {/* Product placement badge — top left */}
      <div
        style={{
          position: "absolute",
          top: 14,
          left: 14,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(8px)",
          border: `1px solid ${ad.accent}40`,
          borderRadius: 8,
          padding: "6px 12px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 18 }}>{ad.emoji}</span>
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: ad.accent,
              letterSpacing: "0.08em",
            }}
          >
            ChameleonADS AI — IN-SCENE AD
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>
            {ad.desc}
          </div>
        </div>
      </div>

      {/* Bottom ad bar */}
      <div
        style={{
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Brand logo placeholder */}
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 10,
              flexShrink: 0,
              background: `linear-gradient(135deg, #0a2e1a, #1a6b3a)`,
              border: `1px solid ${ad.accent}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              boxShadow: `0 0 16px ${ad.accent}30`,
            }}
          >
            {ad.emoji}
          </div>
          <div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.5)",
                marginBottom: 2,
              }}
            >
              {adNumber} of {totalAds} · Advertisement
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
              {ad.product}
            </div>
            <div style={{ fontSize: 12, color: ad.accent }}>{ad.brand}</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            style={{
              padding: "8px 18px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "#fff",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.22)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.12)";
            }}
          >
            Shop Now →
          </button>

          {canSkip ? (
            <button
              onClick={onSkip}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                background: ad.accent,
                border: "none",
                color: "#000",
                boxShadow: `0 0 14px ${ad.accent}50`,
              }}
            >
              Skip Ad ⏭
            </button>
          ) : (
            <div
              style={{
                padding: "8px 14px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              Skip in {timeLeft}s
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Video Player ──────────────────────────────────────────────────────────────
function VideoPlayer({ video, onVideoEnd }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(85);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [adPositions, setAdPositions] = useState([]);
  const [activeAd, setActiveAd] = useState(null); // { adPos, countIdx }
  const [adTimer, setAdTimer] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [triggeredAds, setTriggeredAds] = useState(new Set());
  const [quality, setQuality] = useState("1080p");

  const tickRef = useRef(null);
  const adTickRef = useRef(null);
  const hideCtrlRef = useRef(null);
  const playerRef = useRef(null);

  // Reset on video change
  useEffect(() => {
    setProgress(0);
    setPlaying(false);
    setActiveAd(null);
    setTriggeredAds(new Set());
    setCanSkip(false);
    const positions = getAdPositions(video.duration);
    setAdPositions(positions);
    // pre-roll triggers immediately on play
  }, [video.id]);

  // Main tick
  useEffect(() => {
    if (playing && !activeAd) {
      tickRef.current = setInterval(() => {
        setProgress((p) => {
          const next = p + 1;
          if (next >= video.duration) {
            onVideoEnd();
            return video.duration;
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(tickRef.current);
    }
    return () => clearInterval(tickRef.current);
  }, [playing, activeAd, video.duration]);

  // Check ad triggers
  useEffect(() => {
    if (!playing || activeAd) return;
    adPositions.forEach((ap, i) => {
      if (
        !triggeredAds.has(i) &&
        progress >= ap.time &&
        (ap.time > 0 || progress <= 1)
      ) {
        setTriggeredAds((s) => new Set([...s, i]));
        setPlaying(false);
        const ad = AD_SPOTS[ap.adIdx];
        setActiveAd({ ap, idx: i, ad });
        setAdTimer(ad.skippable ? ad.skipAfter : 15);
        setCanSkip(false);
      }
    });
  }, [progress, playing, adPositions, triggeredAds, activeAd]);

  // Ad countdown
  useEffect(() => {
    if (!activeAd) return;
    adTickRef.current = setInterval(() => {
      setAdTimer((t) => {
        if (t <= 1) {
          if (!canSkip && activeAd.ad.skippable) {
            setCanSkip(true);
            return 0;
          }
          if (!activeAd.ad.skippable && t <= 1) {
            closeAd();
            return 0;
          }
          return 0;
        }
        if (activeAd.ad.skippable && t - 1 === 0) setCanSkip(true);
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(adTickRef.current);
  }, [activeAd]);

  const closeAd = () => {
    setActiveAd(null);
    setCanSkip(false);
    clearInterval(adTickRef.current);
    setTimeout(() => setPlaying(true), 100);
  };

  // Auto-hide controls
  const resetHideCtrl = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideCtrlRef.current);
    if (playing && !activeAd) {
      hideCtrlRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [playing, activeAd]);

  useEffect(() => {
    resetHideCtrl();
  }, [playing]);

  const handlePlay = () => {
    if (!playing) {
      // check pre-roll
      const preRoll = adPositions.find(
        (ap, i) => ap.type === "pre" && !triggeredAds.has(i),
      );
      if (preRoll) {
        const i = adPositions.indexOf(preRoll);
        setTriggeredAds((s) => new Set([...s, i]));
        const ad = AD_SPOTS[preRoll.adIdx];
        setActiveAd({ ap: preRoll, idx: i, ad });
        setAdTimer(ad.skippable ? ad.skipAfter : 15);
        setCanSkip(false);
        return;
      }
    }
    setPlaying((p) => !p);
  };

  const adCountIdx = activeAd
    ? [...triggeredAds].sort((a, b) => a - b).indexOf(activeAd.idx) + 1
    : 0;

  return (
    <div
      ref={playerRef}
      onMouseMove={resetHideCtrl}
      style={{
        position: "relative",
        width: "100%",
        paddingTop: "56.25%",
        background: `linear-gradient(135deg, ${video.bg1}, ${video.bg2})`,
        borderRadius: fullscreen ? 0 : 12,
        overflow: "hidden",
        cursor: showControls ? "default" : "none",
      }}
    >
      {/* Video "screen" */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: 96,
            filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.6))",
            animation: playing ? "videoBob 3s ease-in-out infinite" : "none",
          }}
        >
          {video.thumb}
        </span>

        {/* Simulated product placement overlay */}
        {activeAd && (
          <div
            style={{
              position: "absolute",
              bottom: "25%",
              left: "60%",
              width: 64,
              height: 64,
              borderRadius: 12,
              background: `linear-gradient(135deg, #0a2e1a, #1a6b3a)`,
              border: `2px solid ${activeAd.ad.accent}80`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              boxShadow: `0 0 24px ${activeAd.ad.accent}60, 0 0 48px ${activeAd.ad.accent}20`,
              animation: "productPop 0.4s cubic-bezier(0.23,1,0.32,1) forwards",
            }}
          >
            {activeAd.ad.emoji}
            <div
              style={{
                position: "absolute",
                top: -18,
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: 9,
                fontWeight: 700,
                color: activeAd.ad.accent,
                background: "rgba(0,0,0,0.8)",
                padding: "2px 7px",
                borderRadius: 99,
                whiteSpace: "nowrap",
                backdropFilter: "blur(4px)",
              }}
            >
              in-scene placement
            </div>
          </div>
        )}
      </div>

      {/* Big play button when paused */}
      {!playing && !activeAd && (
        <div
          onClick={handlePlay}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 8,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              color: "#fff",
              backdropFilter: "blur(4px)",
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.1)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            ▶
          </div>
        </div>
      )}

      {/* Ad overlay */}
      {activeAd && (
        <VideoAdOverlay
          ad={activeAd.ad}
          timeLeft={adTimer}
          canSkip={canSkip}
          onSkip={closeAd}
          adNumber={adCountIdx}
          totalAds={adPositions.length}
        />
      )}

      {/* Controls */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)",
          padding: "32px 14px 10px",
          opacity: showControls || !playing ? 1 : 0,
          transition: "opacity 0.3s",
          zIndex: 10,
        }}
      >
        {/* Timeline */}
        {!activeAd && (
          <div style={{ marginBottom: 8 }}>
            <VideoTimeline
              progress={progress}
              duration={video.duration}
              adPositions={adPositions}
              onChange={setProgress}
              showAd={!!activeAd}
            />
          </div>
        )}

        {/* Controls row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={handlePlay}
            style={{
              background: "none",
              color: "#fff",
              fontSize: 20,
              padding: "4px 6px",
            }}
          >
            {playing ? "⏸" : "▶"}
          </button>
          <button
            style={{
              background: "none",
              color: "rgba(255,255,255,0.7)",
              fontSize: 18,
              padding: "4px 6px",
            }}
          >
            ⏭
          </button>

          {/* Volume */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={() => setMuted((m) => !m)}
              style={{
                background: "none",
                color: "rgba(255,255,255,0.8)",
                fontSize: 16,
              }}
            >
              {muted || volume === 0 ? "🔇" : volume < 50 ? "🔉" : "🔊"}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={muted ? 0 : volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                setMuted(false);
              }}
              style={{ width: 70, accentColor: "#fff", height: 3 }}
            />
          </div>

          <div style={{ flex: 1 }} />

          {/* Time */}
          <span
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.8)",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {fmtShort(progress)} / {fmt(video.duration)}
          </span>

          {/* Quality */}
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "rgba(255,255,255,0.6)",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 4,
              padding: "2px 7px",
              cursor: "pointer",
            }}
          >
            {quality}
          </div>

          {/* Fullscreen */}
          <button
            onClick={() => setFullscreen((f) => !f)}
            style={{
              background: "none",
              color: "rgba(255,255,255,0.8)",
              fontSize: 16,
            }}
          >
            {fullscreen ? "⊡" : "⛶"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Comments ──────────────────────────────────────────────────────────────────
const COMMENTS = [
  {
    user: "@techie_travels",
    text: "This video is absolutely incredible, I watched it 3 times already 🔥",
    likes: 2341,
    time: "1 day ago",
  },
  {
    user: "@sahil_codes",
    text: "Production quality is insane. How long did this take to film?",
    likes: 892,
    time: "2 days ago",
  },
  {
    user: "@virajshetty",
    text: "The NovaBrew placement was so seamless I barely noticed it was an ad 😂 ChameleonADS doing its thing",
    likes: 1204,
    time: "3 days ago",
    isAdComment: true,
  },
  {
    user: "@foodie_forever",
    text: "Subscribed immediately. This is the content I've been missing.",
    likes: 456,
    time: "4 days ago",
  },
];

// ── Main App ──────────────────────────────────────────────────────────────────
export default function YouTubeClone() {
  const [currentVideo, setCurrentVideo] = useState(VIDEOS[0]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [liked, setLiked] = useState(new Set([1, 3]));
  const [subscribed, setSubscribed] = useState(new Set());
  const [showDesc, setShowDesc] = useState(false);
  const [sidebarTab, setSidebarTab] = useState("up-next");

  const filtered = VIDEOS.filter(
    (v) =>
      (activeCategory === "All" || v.category === activeCategory) &&
      (search === "" ||
        v.title.toLowerCase().includes(search.toLowerCase()) ||
        v.channel.toLowerCase().includes(search.toLowerCase())),
  );

  const recommendations = VIDEOS.filter((v) => v.id !== currentVideo.id).slice(
    0,
    8,
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f0f",
        color: "#fff",
        fontFamily: "'DM Sans',sans-serif",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes adIn { from{opacity:0} to{opacity:1} }
        @keyframes productPop { from{opacity:0;transform:scale(0.5) rotate(-10deg)} to{opacity:1;transform:scale(1) rotate(0deg)} }
        @keyframes videoBob { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-6px) scale(1.03)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:99px}
        button{outline:none;font-family:'DM Sans',sans-serif;border:none;cursor:pointer}
        input[type=range]{-webkit-appearance:none;appearance:none;height:3px;border-radius:99px;outline:none;cursor:pointer}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;border-radius:50%;background:#fff;cursor:pointer}
      `}</style>

      {/* ── TOP NAV ── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(15,15,15,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          padding: "0 20px",
          height: 56,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 32,
              height: 22,
              background: "#FF0000",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
            }}
          >
            ▶
          </div>
          <span
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: "#fff",
              fontFamily: "'Sora',sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            YouTube Clone
          </span>
        </div>

        {/* Search */}
        <div
          style={{
            flex: 1,
            maxWidth: 540,
            margin: "0 auto",
            display: "flex",
            gap: 0,
          }}
        >
          <div style={{ flex: 1, position: "relative" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search"
              style={{
                width: "100%",
                background: searchFocused
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(255,255,255,0.06)",
                border: `1px solid ${searchFocused ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)"}`,
                borderRight: "none",
                borderRadius: "24px 0 0 24px",
                padding: "8px 18px",
                color: "#fff",
                fontSize: 14,
                outline: "none",
                fontFamily: "'DM Sans',sans-serif",
              }}
            />
          </div>
          <button
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "0 24px 24px 0",
              padding: "8px 18px",
              color: "rgba(255,255,255,0.7)",
              fontSize: 16,
            }}
          >
            ⌕
          </button>
        </div>

        {/* Right */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#6EE7B7",
              background: "rgba(110,231,183,0.1)",
              border: "1px solid rgba(110,231,183,0.25)",
              padding: "4px 10px",
              borderRadius: 99,
              letterSpacing: "0.06em",
            }}
          >
            ✦ ChameleonADS Demo
          </div>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#FF0000,#ff6b35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 800,
              color: "#fff",
            }}
          >
            U
          </div>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* ── LEFT SIDEBAR ── */}
        <nav
          style={{
            width: 70,
            flexShrink: 0,
            background: "#0f0f0f",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            padding: "12px 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          {[
            { icon: "⌂", label: "Home" },
            { icon: "🔥", label: "Trending" },
            { icon: "📺", label: "Subs" },
            { icon: "⏱", label: "History" },
            { icon: "♥", label: "Liked" },
            { icon: "📋", label: "Watch Later" },
          ].map((n, i) => (
            <button
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                padding: "10px 0",
                width: "100%",
                background: "transparent",
                color: "rgba(255,255,255,0.6)",
                fontSize: 18,
                transition: "all 0.15s",
                borderRadius: 8,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(255,255,255,0.6)";
              }}
            >
              <span>{n.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 600 }}>{n.label}</span>
            </button>
          ))}
        </nav>

        {/* ── MAIN SCROLL AREA ── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* ── WATCH VIEW ── */}
          <div style={{ display: "flex", flex: 1, gap: 0 }}>
            {/* Left: video + info */}
            <div
              style={{ flex: 1, padding: "20px 20px 20px 24px", minWidth: 0 }}
            >
              <VideoPlayer video={currentVideo} onVideoEnd={() => {}} />

              {/* Video info */}
              <div
                style={{
                  marginTop: 14,
                  animation: "fadeUp 0.4s ease forwards",
                }}
              >
                <h1
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#fff",
                    lineHeight: 1.4,
                    marginBottom: 10,
                    fontFamily: "'Sora',sans-serif",
                  }}
                >
                  {currentVideo.title}
                </h1>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  {/* Channel info */}
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: `linear-gradient(135deg,${currentVideo.bg1},${currentVideo.accent})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                      }}
                    >
                      {currentVideo.thumb}
                    </div>
                    <div>
                      <div
                        style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}
                      >
                        {currentVideo.channel}
                      </div>
                      <div
                        style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}
                      >
                        {currentVideo.subs} subscribers
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setSubscribed((s) => {
                          const n = new Set(s);
                          n.has(currentVideo.id)
                            ? n.delete(currentVideo.id)
                            : n.add(currentVideo.id);
                          return n;
                        })
                      }
                      style={{
                        padding: "8px 18px",
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        background: subscribed.has(currentVideo.id)
                          ? "rgba(255,255,255,0.1)"
                          : "#fff",
                        color: subscribed.has(currentVideo.id)
                          ? "rgba(255,255,255,0.6)"
                          : "#0f0f0f",
                        border: subscribed.has(currentVideo.id)
                          ? "1px solid rgba(255,255,255,0.2)"
                          : "none",
                      }}
                    >
                      {subscribed.has(currentVideo.id)
                        ? "✓ Subscribed"
                        : "Subscribe"}
                    </button>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: "flex", gap: 8 }}>
                    {[
                      {
                        icon: liked.has(currentVideo.id) ? "👍" : "👍",
                        label: "12K",
                        action: () =>
                          setLiked((s) => {
                            const n = new Set(s);
                            n.has(currentVideo.id)
                              ? n.delete(currentVideo.id)
                              : n.add(currentVideo.id);
                            return n;
                          }),
                        active: liked.has(currentVideo.id),
                      },
                      { icon: "👎", label: "Dislike", action: () => {} },
                      { icon: "↗", label: "Share", action: () => {} },
                      { icon: "⋯", label: "More", action: () => {} },
                    ].map((btn, i) => (
                      <button
                        key={i}
                        onClick={btn.action}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "8px 14px",
                          borderRadius: 20,
                          fontSize: 13,
                          background: btn.active
                            ? "rgba(255,255,255,0.18)"
                            : "rgba(255,255,255,0.08)",
                          border: btn.active
                            ? "1px solid rgba(255,255,255,0.25)"
                            : "1px solid rgba(255,255,255,0.1)",
                          color: "#fff",
                          fontWeight: 500,
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          if (!btn.active)
                            e.currentTarget.style.background =
                              "rgba(255,255,255,0.14)";
                        }}
                        onMouseLeave={(e) => {
                          if (!btn.active)
                            e.currentTarget.style.background =
                              "rgba(255,255,255,0.08)";
                        }}
                      >
                        {btn.icon} {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div
                  style={{
                    marginTop: 14,
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 12,
                    padding: "12px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.7)",
                      marginBottom: 4,
                    }}
                  >
                    {currentVideo.views} views · {currentVideo.ago}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.5)",
                      lineHeight: 1.6,
                      maxHeight: showDesc ? "none" : "44px",
                      overflow: "hidden",
                    }}
                  >
                    This video explores the depths of{" "}
                    {currentVideo.title.toLowerCase()}. Subscribe for more
                    content like this every week. Sponsored by ChameleonADS AI —
                    making ads feel native to your content experience.
                  </div>
                  <button
                    onClick={() => setShowDesc((s) => !s)}
                    style={{
                      background: "none",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.5)",
                      marginTop: 4,
                      padding: 0,
                    }}
                  >
                    {showDesc ? "Show less" : "...more"}
                  </button>
                </div>

                {/* Comments */}
                <div style={{ marginTop: 20 }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#fff",
                      marginBottom: 16,
                    }}
                  >
                    {(Math.floor(Math.random() * 800) + 200).toLocaleString()}{" "}
                    Comments
                  </div>
                  {COMMENTS.map((c, i) => (
                    <div
                      key={i}
                      style={{ display: "flex", gap: 12, marginBottom: 18 }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: `hsl(${i * 60},50%,35%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#fff",
                        }}
                      >
                        {c.user.charAt(1).toUpperCase()}
                      </div>
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 3,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: c.isAdComment ? "#6EE7B7" : "#fff",
                            }}
                          >
                            {c.user}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              color: "rgba(255,255,255,0.3)",
                            }}
                          >
                            {c.time}
                          </span>
                          {c.isAdComment && (
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 700,
                                color: "#6EE7B7",
                                background: "rgba(110,231,183,0.1)",
                                padding: "1px 7px",
                                borderRadius: 99,
                                border: "1px solid rgba(110,231,183,0.25)",
                              }}
                            >
                              ChameleonADS ✦
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "rgba(255,255,255,0.7)",
                            lineHeight: 1.5,
                          }}
                        >
                          {c.text}
                        </div>
                        <div style={{ display: "flex", gap: 14, marginTop: 6 }}>
                          <button
                            style={{
                              background: "none",
                              fontSize: 12,
                              color: "rgba(255,255,255,0.4)",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            👍 {c.likes.toLocaleString()}
                          </button>
                          <button
                            style={{
                              background: "none",
                              fontSize: 12,
                              color: "rgba(255,255,255,0.4)",
                            }}
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: sidebar recommendations */}
            <div
              style={{
                width: 380,
                flexShrink: 0,
                borderLeft: "1px solid rgba(255,255,255,0.06)",
                padding: "16px 16px 16px 16px",
                overflowY: "auto",
              }}
            >
              {/* Tab */}
              <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                {["up-next", "chapters"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSidebarTab(t)}
                    style={{
                      flex: 1,
                      padding: "7px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      background:
                        sidebarTab === t
                          ? "rgba(255,255,255,0.12)"
                          : "rgba(255,255,255,0.04)",
                      border: `1px solid ${sidebarTab === t ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)"}`,
                      color:
                        sidebarTab === t ? "#fff" : "rgba(255,255,255,0.4)",
                    }}
                  >
                    {t === "up-next" ? "Up Next" : "Chapters"}
                  </button>
                ))}
              </div>

              {sidebarTab === "up-next" &&
                recommendations.map((v) => (
                  <VideoCard
                    key={v.id}
                    video={v}
                    horizontal
                    onClick={() => setCurrentVideo(v)}
                  />
                ))}

              {sidebarTab === "chapters" && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {[
                    { t: "0:00", label: "Introduction" },
                    { t: "2:14", label: "Main Content" },
                    { t: "8:30", label: "🥤 NovaBrew moment", isAd: true },
                    { t: "12:00", label: "Deep Dive" },
                    { t: "18:45", label: "Wrap Up" },
                  ].map((ch, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        padding: "8px 10px",
                        borderRadius: 8,
                        background: "rgba(255,255,255,0.03)",
                        border: `1px solid ${ch.isAd ? "rgba(110,231,183,0.2)" : "rgba(255,255,255,0.07)"}`,
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(255,255,255,0.07)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = ch.isAd
                          ? "rgba(110,231,183,0.03)"
                          : "rgba(255,255,255,0.03)")
                      }
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: ch.isAd ? "#6EE7B7" : "rgba(255,255,255,0.4)",
                          width: 36,
                        }}
                      >
                        {ch.t}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          color: ch.isAd ? "#6EE7B7" : "rgba(255,255,255,0.7)",
                          fontWeight: ch.isAd ? 600 : 400,
                        }}
                      >
                        {ch.label}
                      </span>
                      {ch.isAd && (
                        <span
                          style={{
                            marginLeft: "auto",
                            fontSize: 9,
                            fontWeight: 700,
                            color: "#6EE7B7",
                            background: "rgba(110,231,183,0.1)",
                            padding: "2px 7px",
                            borderRadius: 99,
                            border: "1px solid rgba(110,231,183,0.2)",
                          }}
                        >
                          AD
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── BROWSE ROW (below watch view) ── */}
          <div
            style={{
              padding: "16px 24px 24px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {/* Category chips */}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 18,
                overflowX: "auto",
                paddingBottom: 4,
              }}
            >
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 99,
                    fontSize: 13,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    background:
                      activeCategory === c ? "#fff" : "rgba(255,255,255,0.08)",
                    color:
                      activeCategory === c
                        ? "#0f0f0f"
                        : "rgba(255,255,255,0.7)",
                    border:
                      activeCategory === c
                        ? "none"
                        : "1px solid rgba(255,255,255,0.1)",
                    transition: "all 0.2s",
                  }}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Video grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
                gap: 18,
              }}
            >
              {filtered
                .filter((v) => v.id !== currentVideo.id)
                .slice(0, 8)
                .map((v) => (
                  <VideoCard
                    key={v.id}
                    video={v}
                    onClick={() => {
                      setCurrentVideo(v);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
