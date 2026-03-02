import { useState, useRef, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";

// ── Ambient ──────────────────────────────────────────────────────────────────
function Ambient() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-15%",
          left: "-10%",
          width: "550px",
          height: "550px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(110,231,183,0.05) 0%, transparent 65%)",
          animation: "orb1 14s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          right: "-5%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(167,139,250,0.045) 0%, transparent 65%)",
          animation: "orb2 18s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "30%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(245,158,11,0.03) 0%, transparent 65%)",
          animation: "orb3 22s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.011) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.011) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />
    </div>
  );
}

function Glass({ children, style = {}, onClick, onMouseEnter, onMouseLeave }) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        background: "rgba(255,255,255,0.038)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow:
          "0 4px 32px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.065)",
        borderRadius: "18px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Mock Data ────────────────────────────────────────────────────────────────
const CAMPAIGNS = [
  {
    id: 1,
    name: "Summer Heat Drop",
    status: "Live",
    objective: "Drive Sales",
    budget: "₹50,000",
    spent: "₹18,400",
    startDate: "Jun 1, 2025",
    endDate: "Jun 30, 2025",
    products: [
      {
        id: 1,
        name: "Cold Brew Original",
        category: "Beverage",
        price: "₹149",
      },
      { id: 2, name: "Nitro Blend Can", category: "Beverage", price: "₹199" },
    ],
    tools: {
      music: {
        enabled: true,
        status: "Live",
        plays: "14.2K",
        ctr: "6.4%",
        adsGenerated: 8,
      },
      video: {
        enabled: true,
        status: "Live",
        views: "8.8K",
        ctr: "4.1%",
        adsGenerated: 3,
      },
      twitter: {
        enabled: false,
        status: "Off",
        posts: "0",
        reach: "—",
        adsGenerated: 0,
      },
    },
    reach: "5.1M",
    engagement: "4.3%",
    conversions: "1,240",
  },
  {
    id: 2,
    name: "Run Free Campaign",
    status: "Scheduled",
    objective: "Brand Awareness",
    budget: "₹80,000",
    spent: "₹0",
    startDate: "Jul 15, 2025",
    endDate: "Aug 15, 2025",
    products: [
      { id: 3, name: "Running Shoes X9", category: "Apparel", price: "₹4,999" },
    ],
    tools: {
      music: {
        enabled: false,
        status: "Off",
        plays: "—",
        ctr: "—",
        adsGenerated: 0,
      },
      video: {
        enabled: true,
        status: "Scheduled",
        views: "—",
        ctr: "—",
        adsGenerated: 1,
      },
      twitter: {
        enabled: true,
        status: "Scheduled",
        posts: "—",
        reach: "—",
        adsGenerated: 4,
      },
    },
    reach: "—",
    engagement: "—",
    conversions: "—",
  },
  {
    id: 3,
    name: "Mindful Mondays",
    status: "Draft",
    objective: "App Downloads",
    budget: "₹25,000",
    spent: "₹0",
    startDate: "—",
    endDate: "—",
    products: [
      {
        id: 4,
        name: "Meditation App Pro",
        category: "App / SaaS",
        price: "₹299/mo",
      },
    ],
    tools: {
      music: {
        enabled: true,
        status: "Draft",
        plays: "—",
        ctr: "—",
        adsGenerated: 0,
      },
      video: {
        enabled: false,
        status: "Off",
        views: "—",
        ctr: "—",
        adsGenerated: 0,
      },
      twitter: {
        enabled: true,
        status: "Draft",
        posts: "—",
        reach: "—",
        adsGenerated: 2,
      },
    },
    reach: "—",
    engagement: "—",
    conversions: "—",
  },
];

const TOOL_META = {
  music: {
    icon: "🎵",
    name: "Music Ad",
    platform: "Spotify",
    accent: "#6EE7B7",
    accentDim: "rgba(110,231,183,0.1)",
    accentGlow: "rgba(110,231,183,0.22)",
    description:
      "Tone-matched audio ads that blend into the listener's current track seamlessly.",
    statKeys: [
      { key: "plays", label: "Total Plays" },
      { key: "ctr", label: "CTR" },
      { key: "adsGenerated", label: "Ads Made" },
    ],
  },
  video: {
    icon: "🎬",
    name: "Video Ad",
    platform: "YouTube",
    accent: "#F59E0B",
    accentDim: "rgba(245,158,11,0.1)",
    accentGlow: "rgba(245,158,11,0.22)",
    description:
      "AI inpainting places your product naturally inside the video scene.",
    statKeys: [
      { key: "views", label: "Total Views" },
      { key: "ctr", label: "CTR" },
      { key: "adsGenerated", label: "Ads Made" },
    ],
  },
  twitter: {
    icon: "𝕏",
    name: "Twitter Agent",
    platform: "X / Twitter",
    accent: "#A78BFA",
    accentDim: "rgba(167,139,250,0.1)",
    accentGlow: "rgba(167,139,250,0.22)",
    description:
      "24/7 trend-aware agent that posts brand-aligned content automatically.",
    statKeys: [
      { key: "posts", label: "Posts Made" },
      { key: "reach", label: "Total Reach" },
      { key: "adsGenerated", label: "Drafts" },
    ],
  },
};

const STATUS_STYLE = {
  Live: {
    color: "#6EE7B7",
    bg: "rgba(110,231,183,0.1)",
    border: "rgba(110,231,183,0.25)",
    dot: true,
  },
  Scheduled: {
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.25)",
    dot: false,
  },
  Draft: {
    color: "rgba(255,255,255,0.35)",
    bg: "rgba(255,255,255,0.05)",
    border: "rgba(255,255,255,0.1)",
    dot: false,
  },
  Off: {
    color: "rgba(255,255,255,0.2)",
    bg: "rgba(255,255,255,0.03)",
    border: "rgba(255,255,255,0.07)",
    dot: false,
  },
};

function StatusBadge({ status, small }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.Off;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        fontSize: small ? "10px" : "11px",
        fontWeight: 600,
        color: s.color,
        background: s.bg,
        border: `1px solid ${s.border}`,
        padding: small ? "2px 8px" : "4px 10px",
        borderRadius: "99px",
        whiteSpace: "nowrap",
      }}
    >
      {s.dot && (
        <span
          style={{
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            background: s.color,
            animation: "blink 2s infinite",
            display: "inline-block",
          }}
        />
      )}
      {status}
    </span>
  );
}

// ── Campaign Switcher Dropdown ────────────────────────────────────────────────
function CampaignSwitcher({ current, campaigns, onSwitch, onNew }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: open
            ? "rgba(255,255,255,0.07)"
            : "rgba(255,255,255,0.04)",
          border: `1px solid ${open ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.08)"}`,
          borderRadius: "14px",
          padding: "8px 14px 8px 12px",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        <StatusBadge status={current.status} small />
        <span
          style={{
            fontSize: "16px",
            fontWeight: 800,
            color: "#fff",
            fontFamily: "'Sora', sans-serif",
            maxWidth: "220px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {current.name}
        </span>
        <span
          style={{
            fontSize: "10px",
            color: "rgba(255,255,255,0.3)",
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            display: "inline-block",
          }}
        >
          ▼
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            minWidth: "320px",
            zIndex: 200,
            background: "rgba(8,8,14,0.95)",
            backdropFilter: "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "18px",
            overflow: "hidden",
            boxShadow:
              "0 24px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.07)",
            animation: "dropDown 0.18s ease forwards",
          }}
        >
          <div
            style={{
              padding: "10px 14px 8px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.3)",
                textTransform: "uppercase",
              }}
            >
              Your Campaigns
            </span>
          </div>

          {campaigns.map((c) => {
            const isCurrent = c.id === current.id;
            return (
              <div
                key={c.id}
                onClick={() => {
                  onSwitch(c);
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "13px 16px",
                  cursor: "pointer",
                  transition: "background 0.15s",
                  background: isCurrent
                    ? "rgba(110,231,183,0.06)"
                    : "transparent",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
                onMouseEnter={(e) => {
                  if (!isCurrent)
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }}
                onMouseLeave={(e) => {
                  if (!isCurrent)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "10px",
                    flexShrink: 0,
                    background: isCurrent
                      ? "rgba(110,231,183,0.15)"
                      : "rgba(255,255,255,0.05)",
                    border: `1px solid ${isCurrent ? "rgba(110,231,183,0.3)" : "rgba(255,255,255,0.08)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: 800,
                    color: isCurrent ? "#6EE7B7" : "rgba(255,255,255,0.4)",
                    fontFamily: "'Sora', sans-serif",
                  }}
                >
                  {c.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "13.5px",
                      fontWeight: isCurrent ? 700 : 500,
                      color: isCurrent ? "#fff" : "rgba(255,255,255,0.7)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.name}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.28)",
                      marginTop: "1px",
                    }}
                  >
                    {c.products.length} product
                    {c.products.length !== 1 ? "s" : ""} · {c.objective}
                  </div>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <StatusBadge status={c.status} small />
                  {isCurrent && (
                    <span style={{ fontSize: "10px", color: "#6EE7B7" }}>
                      ✓
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* New campaign */}
          <div
            onClick={() => {
              onNew();
              setOpen(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "13px 16px",
              cursor: "pointer",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(110,231,183,0.04)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "10px",
                background: "rgba(110,231,183,0.08)",
                border: "1px dashed rgba(110,231,183,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                color: "#6EE7B7",
              }}
            >
              +
            </div>
            <span
              style={{ fontSize: "13px", fontWeight: 600, color: "#6EE7B7" }}
            >
              New Campaign
            </span>
          </div>
          {/* New campaign */}
          <div
            onClick={() => {
              onNew();
              setOpen(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "13px 16px",
              cursor: "pointer",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(110,231,183,0.04)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "10px",
                background: "rgba(251, 139, 36,0.08) ",
                border: "1px dashed rgba(251, 139, 36,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                color: "#fb8b24",
              }}
            >
              +
            </div>
            <span
              style={{ fontSize: "13px", fontWeight: 600, color: "#fb8b24" }}
            >
              New Product
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tool Card ────────────────────────────────────────────────────────────────
function ToolCard({ toolKey, toolData, platform, meta, index }) {
  const [hov, setHov] = useState(false);
  const enabled = toolData.enabled;
  const isLive = toolData.status === "Live";
  const handleNewTab = () => {
    // Use window.open with '_blank' to trigger a new tab
    if (["Live", "Scheduled"].includes(toolData.status))
      window.open(`/test/${platform}`, "_blank", "noreferrer");
  };
  return (
    <div
      onClick={() => handleNewTab()}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov && enabled ? meta.accentDim : "rgba(255,255,255,0.03)",
        border: `1px solid ${hov && enabled ? meta.accent + "38" : enabled ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.05)"}`,
        backdropFilter: "blur(22px)",
        borderRadius: "22px",
        padding: "26px",
        cursor: enabled ? "pointer" : "default",
        opacity: enabled ? 1 : 0.45,
        transition: "all 0.3s cubic-bezier(0.23,1,0.32,1)",
        transform: hov && enabled ? "translateY(-5px)" : "translateY(0)",
        boxShadow:
          hov && enabled
            ? `0 20px 52px rgba(0,0,0,0.5), 0 0 36px ${meta.accentGlow}, inset 0 1px 0 rgba(255,255,255,0.09)`
            : "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
        position: "relative",
        overflow: "hidden",
        animation: "up 0.5s ease forwards",
        animationDelay: `${0.1 + index * 0.1}s`,
        opacity: 0,
      }}
    >
      {/* corner accent glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "110px",
          height: "110px",
          background: `radial-gradient(circle at top right, ${meta.accentGlow}, transparent 70%)`,
          opacity: hov && enabled ? 1 : 0,
          transition: "opacity 0.3s",
          borderRadius: "0 22px 0 0",
        }}
      />

      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "14px",
            background: meta.accentDim,
            border: `1px solid ${meta.accent}28`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
            boxShadow: hov && enabled ? `0 0 18px ${meta.accentGlow}` : "none",
            transition: "box-shadow 0.3s",
          }}
        >
          {meta.icon}
        </div>
        <StatusBadge status={toolData.status} small />
      </div>

      {/* Name */}
      <div style={{ marginBottom: "6px" }}>
        <div
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#fff",
            fontFamily: "'Sora', sans-serif",
            marginBottom: "2px",
          }}
        >
          {meta.name}
        </div>
        <div
          style={{
            fontSize: "11px",
            color: meta.accent,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <span
            style={{
              width: "4px",
              height: "4px",
              borderRadius: "50%",
              background: meta.accent,
              display: "inline-block",
            }}
          />
          {meta.platform}
        </div>
      </div>

      {/* Desc */}
      <p
        style={{
          fontSize: "13px",
          color: "rgba(255,255,255,0.38)",
          lineHeight: 1.65,
          marginBottom: "22px",
        }}
      >
        {meta.description}
      </p>

      {/* CTA */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "16px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: enabled ? meta.accent : "rgba(255,255,255,0.2)",
          }}
        >
          {enabled ? "Open Tool" : "Not active"}
        </span>
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "10px",
            background:
              hov && enabled ? meta.accentDim : "rgba(255,255,255,0.05)",
            border: `1px solid ${hov && enabled ? meta.accent + "35" : "rgba(255,255,255,0.08)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            color: enabled ? meta.accent : "rgba(255,255,255,0.2)",
            transition: "all 0.2s",
          }}
        >
          →
        </div>
      </div>

      {/* Disabled overlay label */}
      {!enabled && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "10px",
            color: "rgba(255,255,255,0.15)",
            whiteSpace: "nowrap",
            background: "rgba(255,255,255,0.04)",
            padding: "3px 10px",
            borderRadius: "99px",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          Not enabled in this campaign
        </div>
      )}
    </div>
  );
}

// ── Products In Campaign ─────────────────────────────────────────────────────
function ProductsPanel({ products }) {
  return (
    <Glass
      style={{
        padding: "0",
        overflow: "hidden",
        animation: "up 0.5s ease forwards",
        animationDelay: "0.45s",
        opacity: 0,
      }}
    >
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "#fff",
            fontFamily: "'Sora', sans-serif",
          }}
        >
          Products
        </span>
        <button
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.35)",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px",
            padding: "4px 10px",
            cursor: "pointer",
          }}
        >
          Manage
        </button>
      </div>
      {products.map((p, i) => (
        <div
          key={p.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 20px",
            borderBottom:
              i < products.length - 1
                ? "1px solid rgba(255,255,255,0.04)"
                : "none",
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.025)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
            }}
          >
            📦
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>
              {p.name}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.3)",
                marginTop: "1px",
              }}
            >
              {p.category} · {p.price}
            </div>
          </div>
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)" }}>
            →
          </span>
        </div>
      ))}
    </Glass>
  );
}

// ── Activity Feed ────────────────────────────────────────────────────────────
const ACTIVITY_MAP = {
  1: [
    {
      icon: "🎵",
      text: "Music Ad generated for Cold Brew Original",
      time: "4m ago",
      color: "#6EE7B7",
    },
    {
      icon: "🎬",
      text: "Video Ad render complete — Nitro Blend",
      time: "42m ago",
      color: "#F59E0B",
    },
    {
      icon: "📊",
      text: "CTR improved to 6.4% from 5.1%",
      time: "2h ago",
      color: "#A78BFA",
    },
    {
      icon: "🎵",
      text: "3 new Music Ad variants queued",
      time: "5h ago",
      color: "#6EE7B7",
    },
  ],
  2: [
    {
      icon: "🎬",
      text: "Video Ad draft created for Running Shoes X9",
      time: "1d ago",
      color: "#F59E0B",
    },
    {
      icon: "𝕏",
      text: "Twitter Agent configured — awaiting launch",
      time: "1d ago",
      color: "#A78BFA",
    },
    {
      icon: "✦",
      text: "Campaign scheduled for Jul 15",
      time: "2d ago",
      color: "rgba(255,255,255,0.4)",
    },
  ],
  3: [
    {
      icon: "🎵",
      text: "Music Ad draft started",
      time: "3d ago",
      color: "#6EE7B7",
    },
    {
      icon: "𝕏",
      text: "Twitter strategy document added",
      time: "4d ago",
      color: "#A78BFA",
    },
    {
      icon: "✦",
      text: "Campaign created as Draft",
      time: "5d ago",
      color: "rgba(255,255,255,0.3)",
    },
  ],
};

function ActivityPanel({ campaignId }) {
  const items = ACTIVITY_MAP[campaignId] || [];
  return (
    <Glass
      style={{
        padding: "0",
        overflow: "hidden",
        animation: "up 0.5s ease forwards",
        animationDelay: "0.5s",
        opacity: 0,
      }}
    >
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "#fff",
            fontFamily: "'Sora', sans-serif",
          }}
        >
          Trends (top 3)
        </span>
      </div>
      {items.map((a, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "flex-start",
            padding: "12px 20px",
            borderBottom:
              i < items.length - 1
                ? "1px solid rgba(255,255,255,0.04)"
                : "none",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              flexShrink: 0,
              background: `${a.color}18`,
              border: `1px solid ${a.color}25`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
            }}
          >
            {a.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.55)",
                lineHeight: 1.55,
              }}
            >
              {a.text}
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "rgba(255,255,255,0.2)",
                marginTop: "2px",
              }}
            >
              {a.time}
            </div>
          </div>
        </div>
      ))}
    </Glass>
  );
}

// ── Floating Bottom Nav ──────────────────────────────────────────────────────
const NAV = [
  { id: "home", icon: "⌂", label: "Home" },
  { id: "music", icon: "🎵", label: "Music Ad" },
  { id: "video", icon: "🎬", label: "Video Ad" },
  { id: "twitter", icon: "𝕏", label: "Twitter" },
];

function BottomNav({ active, setActive }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 100,
        animation: "up 0.5s ease forwards",
        animationDelay: "0.65s",
        opacity: 0,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2px",
          background: "rgba(6,6,10,0.82)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "22px",
          padding: "6px 10px",
          boxShadow:
            "0 16px 48px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.08)",
          pointerEvents: "auto",
        }}
      >
        {NAV.map((item) => {
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "3px",
                padding: "9px 18px",
                borderRadius: "14px",
                cursor: "pointer",
                background: isActive ? "rgba(110,231,183,0.1)" : "transparent",
                border: `1px solid ${isActive ? "rgba(110,231,183,0.22)" : "transparent"}`,
                transition: "all 0.22s cubic-bezier(0.23,1,0.32,1)",
                boxShadow: isActive ? "0 0 14px rgba(110,231,183,0.1)" : "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ fontSize: "16px", lineHeight: 1 }}>
                {item.icon}
              </span>
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  color: isActive ? "#6EE7B7" : "rgba(255,255,255,0.28)",
                  transition: "color 0.2s",
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Section Divider ──────────────────────────────────────────────────────────
function SectionDivider({ label, delay = "0s" }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "16px",
        animation: "up 0.4s ease forwards",
        animationDelay: delay,
        opacity: 0,
      }}
    >
      <span
        style={{
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.13em",
          color: "rgba(255,255,255,0.28)",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <div
        style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }}
      />
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [currentCampaign, setCurrentCampaign] = useState(CAMPAIGNS[0]);
  const [activeNav, setActiveNav] = useState("home");
  const navigate = useNavigate();

  const handleSwitch = (c) => {
    setCurrentCampaign(c);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050508",
        color: "#fff",
        fontFamily: "'DM Sans', sans-serif",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes orb1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,25px)} }
        @keyframes orb2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-25px,-30px)} }
        @keyframes orb3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(15px,-20px)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes dropDown { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:translateY(0) } }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 99px; }
        button { outline: none; font-family: 'DM Sans', sans-serif; }
      `}</style>

      <Ambient />

      {/* ── Top Header ── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 90,
          background: "rgba(5,5,8,0.88)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "0 36px",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "9px",
                background: "linear-gradient(135deg, #6EE7B7, #3B82F6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 800,
                color: "#000",
              }}
            >
              ✦
            </div>
            <span
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#fff",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              ChameleonADs
            </span>
            <span
              style={{
                fontSize: "9px",
                fontWeight: 700,
                color: "#6EE7B7",
                background: "rgba(110,231,183,0.1)",
                border: "1px solid rgba(110,231,183,0.22)",
                borderRadius: "99px",
                padding: "2px 7px",
              }}
            >
              AI
            </span>
          </div>

          {/* Campaign switcher — centered */}
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <CampaignSwitcher
              current={currentCampaign}
              campaigns={CAMPAIGNS}
              onSwitch={handleSwitch}
              onNew={() => navigate("/onboard/campaign")}
            />
          </div>

          {/* Right actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexShrink: 0,
            }}
          >
            <button
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color:
                  currentCampaign.status === "Live"
                    ? "#6EE7B7"
                    : currentCampaign.status === "Draft"
                      ? "#F59E0B"
                      : "rgba(255,255,255,0.4)",
                background:
                  currentCampaign.status === "Live"
                    ? "rgba(110,231,183,0.08)"
                    : "rgba(255,255,255,0.04)",
                border: `1px solid ${currentCampaign.status === "Live" ? "rgba(110,231,183,0.2)" : "rgba(255,255,255,0.09)"}`,
                borderRadius: "10px",
                padding: "6px 14px",
                cursor: "pointer",
              }}
            >
              {currentCampaign.status === "Draft"
                ? "⚡ Launch"
                : currentCampaign.status === "Live"
                  ? "⏸ Pause"
                  : "▶ Activate"}
            </button>
            <button
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.35)",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                padding: "6px 14px",
                cursor: "pointer",
              }}
            >
              Edit
            </button>
            {/* Avatar */}
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #A78BFA, #6EE7B7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 800,
                color: "#000",
                cursor: "pointer",
              }}
            >
              N
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main
        key={currentCampaign.id}
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "28px 36px 120px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Section: Ad Tools */}
        <SectionDivider label="Ad Tools" delay="0.15s" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          {Object.entries(TOOL_META).map(([key, meta], i) => (
            <ToolCard
              key={`${currentCampaign.id}-${key}`}
              toolKey={key}
              platform={meta.platform}
              toolData={currentCampaign.tools[key]}
              meta={meta}
              index={i}
            />
          ))}
        </div>

        {/* Section: Bottom panels */}
        <SectionDivider label="Overview" delay="0.4s" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <ProductsPanel products={currentCampaign.products} />
          <ActivityPanel campaignId={currentCampaign.id} />
        </div>
      </main>

      {/* Floating nav */}
      <BottomNav active={activeNav} setActive={setActiveNav} />
    </div>
  );
}
