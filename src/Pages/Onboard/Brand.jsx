import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const STEPS = [
  { id: 1, label: "Brand Identity", icon: "✦" },
  { id: 2, label: "Brand Voice", icon: "◈" },
  { id: 3, label: "Target Audience", icon: "⬡" },
  { id: 4, label: "First Product", icon: "◎" },
  { id: 5, label: "Launch", icon: "⟡" },
];

const industries = [
  "Fashion & Apparel",
  "Food & Beverage",
  "Tech & SaaS",
  "Health & Wellness",
  "Entertainment",
  "Automotive",
  "Finance",
  "Beauty & Cosmetics",
  "Sports",
  "Travel",
];

const tones = [
  { label: "Bold & Loud", emoji: "🔥", desc: "Fearless, provocative, loud" },
  { label: "Witty & Fun", emoji: "😄", desc: "Playful, clever, relatable" },
  { label: "Professional", emoji: "💼", desc: "Trusted, authoritative, clean" },
  { label: "Luxury", emoji: "✨", desc: "Refined, exclusive, aspirational" },
  { label: "Empathetic", emoji: "💚", desc: "Warm, human, community-driven" },
  { label: "Edgy & Gen-Z", emoji: "⚡", desc: "Raw, chaotic, meme-native" },
];

const audiences = [
  "Gen Z (16–24)",
  "Millennials (25–40)",
  "Gen X (41–56)",
  "Boomers (57+)",
  "Parents",
  "Professionals",
  "Students",
  "Athletes",
];

function GlassCard({ children, className = "" }) {
  return (
    <div
      className={`relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl ${className}`}
      style={{
        boxShadow:
          "0 8px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      {children}
    </div>
  );
}

function ProgressBar({ step, total }) {
  return (
    <div className="flex items-center gap-2 mb-10">
      {STEPS.map((s, i) => (
        <div key={s.id} className="flex items-center gap-2 flex-1">
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500"
              style={{
                background:
                  i < step
                    ? "linear-gradient(135deg, #6EE7B7, #3B82F6)"
                    : i === step
                      ? "linear-gradient(135deg, #A78BFA, #6EE7B7)"
                      : "rgba(255,255,255,0.07)",
                border:
                  i === step
                    ? "2px solid rgba(167,139,250,0.6)"
                    : "2px solid rgba(255,255,255,0.1)",
                boxShadow:
                  i === step ? "0 0 20px rgba(167,139,250,0.4)" : "none",
                color: i <= step ? "#000" : "rgba(255,255,255,0.3)",
              }}
            >
              {i < step ? "✓" : s.icon}
            </div>
            <span
              className="text-[10px] font-medium whitespace-nowrap hidden sm:block"
              style={{
                color:
                  i === step
                    ? "#A78BFA"
                    : i < step
                      ? "#6EE7B7"
                      : "rgba(255,255,255,0.25)",
              }}
            >
              {s.label}
            </span>
          </div>
          {i < total - 1 && (
            <div
              className="flex-1 h-px mb-4"
              style={{
                background:
                  i < step
                    ? "linear-gradient(90deg, #6EE7B7, #3B82F6)"
                    : "rgba(255,255,255,0.08)",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function Step1({ data, setData }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-semibold tracking-widest text-emerald-400 uppercase mb-2">
          Brand Name
        </label>
        <input
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-400/60 focus:bg-white/8 transition-all text-lg font-light"
          placeholder="e.g. Nike, Zomato, Notion..."
          value={data.name || ""}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          style={{ fontFamily: "'Sora', sans-serif" }}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold tracking-widest text-emerald-400 uppercase mb-2">
          Tagline
        </label>
        <input
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-400/60 transition-all"
          placeholder="What's your one-liner?"
          value={data.tagline || ""}
          onChange={(e) => setData({ ...data, tagline: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold tracking-widest text-emerald-400 uppercase mb-3">
          Industry
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {industries.map((ind) => (
            <button
              key={ind}
              onClick={() => setData({ ...data, industry: ind })}
              className="px-3 py-2 rounded-xl text-sm transition-all duration-200 text-left border"
              style={{
                background:
                  data.industry === ind
                    ? "rgba(167,139,250,0.2)"
                    : "rgba(255,255,255,0.03)",
                borderColor:
                  data.industry === ind
                    ? "rgba(167,139,250,0.6)"
                    : "rgba(255,255,255,0.08)",
                color:
                  data.industry === ind ? "#A78BFA" : "rgba(255,255,255,0.5)",
                boxShadow:
                  data.industry === ind
                    ? "0 0 12px rgba(167,139,250,0.15)"
                    : "none",
              }}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold tracking-widest text-emerald-400 uppercase mb-2">
          Brand Description
        </label>
        <textarea
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-400/60 transition-all resize-none"
          rows={3}
          placeholder="Briefly describe what your brand does and stands for..."
          value={data.description || ""}
          onChange={(e) => setData({ ...data, description: e.target.value })}
        />
      </div>
    </div>
  );
}

function Step2({ data, setData }) {
  return (
    <div className="space-y-6">
      <p className="text-white/40 text-sm">
        How does your brand speak? Choose the voice that fits best.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tones.map((tone) => (
          <button
            key={tone.label}
            onClick={() => setData({ ...data, tone: tone.label })}
            className="flex items-start gap-4 p-4 rounded-2xl border text-left transition-all duration-200 group"
            style={{
              background:
                data.tone === tone.label
                  ? "rgba(110,231,183,0.1)"
                  : "rgba(255,255,255,0.03)",
              borderColor:
                data.tone === tone.label
                  ? "rgba(110,231,183,0.5)"
                  : "rgba(255,255,255,0.08)",
              boxShadow:
                data.tone === tone.label
                  ? "0 0 20px rgba(110,231,183,0.1)"
                  : "none",
            }}
          >
            <span className="text-2xl">{tone.emoji}</span>
            <div>
              <div className="font-semibold text-white text-sm">
                {tone.label}
              </div>
              <div className="text-white/40 text-xs mt-0.5">{tone.desc}</div>
            </div>
            {data.tone === tone.label && (
              <div className="ml-auto w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center text-black text-xs font-bold">
                ✓
              </div>
            )}
          </button>
        ))}
      </div>
      <div>
        <label className="block text-xs font-semibold tracking-widest text-emerald-400 uppercase mb-2">
          Brand Keywords
        </label>
        <input
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-400/60 transition-all"
          placeholder="innovative, bold, community, trust... (comma separated)"
          value={data.keywords || ""}
          onChange={(e) => setData({ ...data, keywords: e.target.value })}
        />
      </div>
    </div>
  );
}

function Step3({ data, setData }) {
  const toggle = (aud) => {
    const current = data.audiences || [];
    const updated = current.includes(aud)
      ? current.filter((a) => a !== aud)
      : [...current, aud];
    setData({ ...data, audiences: updated });
  };
  return (
    <div className="space-y-6">
      <p className="text-white/40 text-sm">
        Select all that describe your ideal customer.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {audiences.map((aud) => {
          const selected = (data.audiences || []).includes(aud);
          return (
            <button
              key={aud}
              onClick={() => toggle(aud)}
              className="py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-200"
              style={{
                background: selected
                  ? "rgba(59,130,246,0.15)"
                  : "rgba(255,255,255,0.03)",
                borderColor: selected
                  ? "rgba(59,130,246,0.6)"
                  : "rgba(255,255,255,0.08)",
                color: selected ? "#93C5FD" : "rgba(255,255,255,0.45)",
                boxShadow: selected ? "0 0 16px rgba(59,130,246,0.12)" : "none",
              }}
            >
              {aud}
            </button>
          );
        })}
      </div>
      <div>
        <label className="block text-xs font-semibold tracking-widest text-emerald-400 uppercase mb-2">
          Primary Market
        </label>
        <input
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-400/60 transition-all"
          placeholder="e.g. India, Southeast Asia, Global..."
          value={data.market || ""}
          onChange={(e) => setData({ ...data, market: e.target.value })}
        />
      </div>
    </div>
  );
}

function Step4({ data, setData }) {
  return (
    <div className="space-y-6">
      <p className="text-white/40 text-sm">
        Add your first product. You can add more later inside campaigns.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold tracking-widest text-emerald-400 uppercase mb-2">
            Product Name
          </label>
          <input
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-400/60 transition-all"
            placeholder="e.g. Air Max 2025"
            value={data.productName || ""}
            onChange={(e) => setData({ ...data, productName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-widest text-emerald-400 uppercase mb-2">
            Price
          </label>
          <input
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-400/60 transition-all"
            placeholder="e.g. ₹4,999 / $59"
            value={data.price || ""}
            onChange={(e) => setData({ ...data, price: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold tracking-widest text-emerald-400 uppercase mb-2">
          Product Description
        </label>
        <textarea
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-400/60 transition-all resize-none"
          rows={3}
          placeholder="What makes this product special? Key features, USPs..."
          value={data.productDesc || ""}
          onChange={(e) => setData({ ...data, productDesc: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold tracking-widest text-emerald-400 uppercase mb-2">
          Ad Goal
        </label>
        <div className="flex gap-3 flex-wrap">
          {[
            "Brand Awareness",
            "Drive Sales",
            "App Downloads",
            "Community Growth",
          ].map((goal) => (
            <button
              key={goal}
              onClick={() => setData({ ...data, adGoal: goal })}
              className="px-4 py-2 rounded-full border text-sm transition-all"
              style={{
                background:
                  data.adGoal === goal
                    ? "rgba(167,139,250,0.2)"
                    : "rgba(255,255,255,0.04)",
                borderColor:
                  data.adGoal === goal
                    ? "rgba(167,139,250,0.6)"
                    : "rgba(255,255,255,0.1)",
                color:
                  data.adGoal === goal ? "#C4B5FD" : "rgba(255,255,255,0.4)",
              }}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step5({ data }) {
  const [animating, setAnimating] = useState(false);
  useEffect(() => {
    setTimeout(() => setAnimating(true), 100);
  }, []);

  return (
    <div className="text-center space-y-6 py-4">
      <div
        className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl transition-all duration-700"
        style={{
          background: animating
            ? "linear-gradient(135deg, #6EE7B7, #3B82F6, #A78BFA)"
            : "rgba(255,255,255,0.05)",
          boxShadow: animating ? "0 0 50px rgba(110,231,183,0.4)" : "none",
          transform: animating ? "scale(1)" : "scale(0.5)",
        }}
      >
        🚀
      </div>
      <div>
        <h3
          className="text-2xl font-bold text-white mb-2"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          {data.name || "Your Brand"} is ready!
        </h3>
        <p className="text-white/40 text-sm">
          Your brand workspace has been created. Here's a summary:
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 text-left">
        {[
          { label: "Brand", value: data.name || "—" },
          { label: "Industry", value: data.industry || "—" },
          { label: "Voice", value: data.tone || "—" },
          { label: "Market", value: data.market || "—" },
          { label: "First Product", value: data.productName || "—" },
          { label: "Ad Goal", value: data.adGoal || "—" },
        ].map((item) => (
          <div
            key={item.label}
            className="p-3 rounded-xl border border-white/8 bg-white/4"
          >
            <div className="text-xs text-white/30 uppercase tracking-wider mb-1">
              {item.label}
            </div>
            <div className="text-white/80 text-sm font-medium truncate">
              {item.value}
            </div>
          </div>
        ))}
      </div>
      <p className="text-white/25 text-xs">
        You can now create campaigns and start your first ad →
      </p>
    </div>
  );
}

export default function BrandOnboarding() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});
  const [direction, setDirection] = useState(1);
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();
  const goTo = (next) => {
    setDirection(next > step ? 1 : -1);
    setVisible(false);
    setTimeout(() => {
      setStep(next);
      setVisible(true);
    }, 220);
  };

  const canProceed = () => {
    if (step === 0) return data.name && data.industry;
    if (step === 1) return data.tone;
    if (step === 2) return (data.audiences || []).length > 0;
    if (step === 3) return data.productName;
    return true;
  };

  const stepComponents = [
    <Step1 data={data} setData={setData} />,
    <Step2 data={data} setData={setData} />,
    <Step3 data={data} setData={setData} />,
    <Step4 data={data} setData={setData} />,
    <Step5 data={data} />,
  ];

  const stepTitles = [
    "Tell us about your brand",
    "Define your brand voice",
    "Who's your audience?",
    "Your first product",
    "You're all set!",
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-8"
      style={{
        background: "#050508",
        backgroundImage: `
          radial-gradient(ellipse at 20% 20%, rgba(110,231,183,0.06) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, rgba(167,139,250,0.06) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.04) 0%, transparent 60%)
        `,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Font imports */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
        input, textarea { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
            style={{ background: "linear-gradient(135deg, #6EE7B7, #3B82F6)" }}
          >
            ✦
          </div>
          <span className="text-white/60 text-sm font-medium tracking-wide">
            ChameleonADS AI — Brand Setup
          </span>
        </div>

        {/* Progress */}
        <ProgressBar step={step} total={STEPS.length} />

        {/* Card */}
        <GlassCard className="p-6 sm:p-8">
          {/* Step header */}
          <div className="mb-6">
            <div className="text-xs font-semibold tracking-widest text-violet-400 uppercase mb-1">
              Step {step + 1} of {STEPS.length}
            </div>
            <h2
              className="text-2xl sm:text-3xl font-bold text-white"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              {stepTitles[step]}
            </h2>
          </div>

          {/* Step content */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible
                ? "translateY(0)"
                : `translateY(${direction * 12}px)`,
              transition: "all 0.22s ease",
            }}
          >
            {stepComponents[step]}
          </div>

          {/* Navigation */}
          {step < STEPS.length - 1 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/8">
              <button
                onClick={() => step > 0 && goTo(step - 1)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  color:
                    step === 0
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(255,255,255,0.45)",
                  cursor: step === 0 ? "not-allowed" : "pointer",
                  background:
                    step === 0 ? "transparent" : "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                ← Back
              </button>
              <button
                onClick={() => canProceed() && goTo(step + 1)}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  background: canProceed()
                    ? "linear-gradient(135deg, #6EE7B7, #3B82F6)"
                    : "rgba(255,255,255,0.06)",
                  color: canProceed() ? "#000" : "rgba(255,255,255,0.2)",
                  cursor: canProceed() ? "pointer" : "not-allowed",
                  boxShadow: canProceed()
                    ? "0 0 20px rgba(110,231,183,0.3)"
                    : "none",
                }}
              >
                Continue →
              </button>
            </div>
          )}

          {step === STEPS.length - 1 && (
            <div className="mt-8 pt-6 border-t border-white/8">
              <button
                onClick={() => navigate("/")}
                className="w-full py-3.5 rounded-xl font-semibold text-black transition-all duration-200"
                style={{
                  background:
                    "linear-gradient(135deg, #6EE7B7, #3B82F6, #A78BFA)",
                  boxShadow: "0 0 30px rgba(110,231,183,0.3)",
                  fontFamily: "'Sora', sans-serif",
                  fontSize: "15px",
                }}
              >
                Launch My Brand Dashboard →
              </button>
            </div>
          )}
        </GlassCard>

        {/* Footer hint */}
        <p className="text-center text-white/15 text-xs mt-6">
          All data is used to personalize your AI ad campaigns
        </p>
      </div>
    </div>
  );
}
