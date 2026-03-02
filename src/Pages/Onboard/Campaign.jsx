import { useState, useEffect } from "react";
import CreateProductPage from "./Products";
import { useNavigate } from "react-router-dom";
import { addCamp, fetchProds } from "../../utils/firebaseFNS";
import { useForm, Controller } from "react-hook-form";

// ── Ambient ──────────────────────────────────────────────────────────────────
export function Ambient() {
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
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(110,231,183,0.055) 0%, transparent 65%)",
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
            "radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 65%)",
          animation: "orb2 18s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />
    </div>
  );
}

export function Glass({
  children,
  style = {},
  onClick,
  onMouseEnter,
  onMouseLeave,
}) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        background: "rgba(255,255,255,0.038)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
        boxShadow:
          "0 4px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
        borderRadius: "18px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Input({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  hint,
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: "#6EE7B7",
          textTransform: "uppercase",
          marginBottom: "8px",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          background: focused
            ? "rgba(255,255,255,0.06)"
            : "rgba(255,255,255,0.03)",
          border: `1px solid ${focused ? "rgba(110,231,183,0.4)" : "rgba(255,255,255,0.09)"}`,
          borderRadius: "12px",
          padding: "12px 16px",
          color: "#fff",
          fontSize: "14px",
          outline: "none",
          fontFamily: "'DM Sans', sans-serif",
          transition: "all 0.2s",
          boxShadow: focused ? "0 0 0 3px rgba(110,231,183,0.07)" : "none",
        }}
      />
      {hint && (
        <p
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.25)",
            marginTop: "5px",
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

export function Textarea({
  label,
  placeholder,
  value,
  onChange,
  rows = 3,
  hint,
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: "#6EE7B7",
          textTransform: "uppercase",
          marginBottom: "8px",
        }}
      >
        {label}
      </label>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={rows}
        style={{
          width: "100%",
          background: focused
            ? "rgba(255,255,255,0.06)"
            : "rgba(255,255,255,0.03)",
          border: `1px solid ${focused ? "rgba(110,231,183,0.4)" : "rgba(255,255,255,0.09)"}`,
          borderRadius: "12px",
          padding: "12px 16px",
          color: "#fff",
          fontSize: "14px",
          outline: "none",
          fontFamily: "'DM Sans', sans-serif",
          resize: "vertical",
          transition: "all 0.2s",
          boxShadow: focused ? "0 0 0 3px rgba(110,231,183,0.07)" : "none",
        }}
      />
      {hint && (
        <p
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.25)",
            marginTop: "5px",
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

const TOOL_CONFIG = {
  music: {
    icon: "🎵",
    label: "Music Ad",
    accent: "#6EE7B7",
    bg: "rgba(110,231,183,0.1)",
  },
  video: {
    icon: "🎬",
    label: "Video Ad",
    accent: "#F59E0B",
    bg: "rgba(245,158,11,0.1)",
  },
  twitter: {
    icon: "𝕏",
    label: "Twitter Agent",
    accent: "#A78BFA",
    bg: "rgba(167,139,250,0.1)",
  },
};

const OBJECTIVES = [
  {
    id: "awareness",
    icon: "📢",
    label: "Brand Awareness",
    desc: "Maximize reach and impressions",
  },
  {
    id: "sales",
    icon: "💰",
    label: "Drive Sales",
    desc: "Conversions & purchase intent",
  },
  {
    id: "launch",
    icon: "🚀",
    label: "Product Launch",
    desc: "Announce something new",
  },
  {
    id: "engagement",
    icon: "⚡",
    label: "Engagement",
    desc: "Likes, shares, replies",
  },
];

function ProductSelectCard({ product, selected, onToggle }) {
  const [hov, setHov] = useState(false);
  const adTools = product.adTools || [];

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onToggle(product.id)}
      style={{
        padding: "18px 20px",
        borderRadius: "16px",
        cursor: "pointer",
        background: selected
          ? "rgba(110,231,183,0.07)"
          : hov
            ? "rgba(255,255,255,0.04)"
            : "rgba(255,255,255,0.025)",
        border: `1px solid ${selected ? "rgba(110,231,183,0.35)" : hov ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.07)"}`,
        transition: "all 0.22s",
        position: "relative",
        boxShadow: selected ? "0 0 20px rgba(110,231,183,0.1)" : "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          width: "20px",
          height: "20px",
          borderRadius: "6px",
          background: selected
            ? "linear-gradient(135deg,#6EE7B7,#3B82F6)"
            : "rgba(255,255,255,0.06)",
          border: `1px solid ${selected ? "transparent" : "rgba(255,255,255,0.15)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "11px",
          color: "#000",
          fontWeight: 800,
          transition: "all 0.2s",
          boxShadow: selected ? "0 0 10px rgba(110,231,183,0.25)" : "none",
        }}
      >
        {selected && "✓"}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "11px",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
          }}
        >
          📦
        </div>
        <div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#fff",
              fontFamily: "'Sora', sans-serif",
            }}
          >
            {product.name}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.3)",
              marginTop: "1px",
            }}
          >
            {product.category || "General"} ·{" "}
            {product.price
              ? `${product.currency || "₹"}${product.price}`
              : "No price"}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {adTools.map((t) => {
          if (!TOOL_CONFIG[t]) return null;
          return (
            <span
              key={t}
              style={{
                fontSize: "10px",
                fontWeight: 600,
                color: TOOL_CONFIG[t].accent,
                background: TOOL_CONFIG[t].bg,
                border: `1px solid ${TOOL_CONFIG[t].accent}28`,
                padding: "3px 9px",
                borderRadius: "99px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              {TOOL_CONFIG[t].icon} {TOOL_CONFIG[t].label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function CreateCampaignPage({ products, onSave, onBack, onAddProduct }) {
  const [dbProducts, setDbProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);

  // Fetch products from Firebase on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const fetched = await fetchProds();
        setDbProducts(fetched || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoadingProducts(false);
      }
    };
    loadProducts();
  }, []);

  // Merge newly created products (passed via props) with DB products, deduplicating by ID
  const allProducts = Array.from(
    new Map(
      [...dbProducts, ...products].map((item) => [item.id, item]),
    ).values(),
  );

  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      name: "",
      objective: "",
      startDate: "",
      endDate: "",
      budget: "",
      selectedProducts: [],
      tools: [],
      notes: "",
    },
  });

  const wName = watch("name");
  const wObjective = watch("objective");
  const wSelectedProducts = watch("selectedProducts");
  const wTools = watch("tools");
  const wBudget = watch("budget");
  const wStartDate = watch("startDate");
  const wEndDate = watch("endDate");

  const toggleProduct = (id) => {
    const updated = wSelectedProducts.includes(id)
      ? wSelectedProducts.filter((x) => x !== id)
      : [...wSelectedProducts, id];

    // Auto-detect available tools from selected products
    const availTools = [
      ...new Set(
        allProducts
          .filter((p) => updated.includes(p.id))
          .flatMap((p) => p.adTools || []),
      ),
    ];

    setValue("selectedProducts", updated, { shouldValidate: true });
    // Filter out tools that are no longer available
    setValue(
      "tools",
      wTools.filter((t) => availTools.includes(t)),
      { shouldValidate: true },
    );
  };

  const toggleTool = (id) => {
    const updated = wTools.includes(id)
      ? wTools.filter((x) => x !== id)
      : [...wTools, id];
    setValue("tools", updated, { shouldValidate: true });
  };

  const selectedProductObjs = allProducts.filter((p) =>
    wSelectedProducts.includes(p.id),
  );
  const availableTools = [
    ...new Set(selectedProductObjs.flatMap((p) => p.adTools || [])),
  ];

  const steps = ["Details", "Products", "Ad Tools", "Review"];
  const canNext = [
    wName.trim() !== "" && wObjective !== "",
    wSelectedProducts.length > 0,
    wTools.length > 0,
    true,
  ];

  const onSubmit = async (data) => {
    setSaved(true);
    const finalPayload = { ...data, id: Date.now() };

    try {
      await addCamp(finalPayload);
      setTimeout(() => onSave(finalPayload), 900);
    } catch (error) {
      console.error("Failed to save campaign:", error);
      setSaved(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "32px 32px 120px",
        position: "relative",
        zIndex: 1,
      }}
    >
      <button
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "28px",
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.35)",
          cursor: "pointer",
          fontSize: "13px",
        }}
      >
        ← Back to Main
      </button>

      <div
        style={{
          marginBottom: "32px",
          animation: "up 0.4s ease forwards",
          opacity: 0,
        }}
      >
        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.14em",
            color: "#A78BFA",
            marginBottom: "8px",
          }}
        >
          CAMPAIGNS
        </div>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 800,
            color: "#fff",
            fontFamily: "'Sora', sans-serif",
            marginBottom: "6px",
          }}
        >
          Create Campaign
        </h1>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)" }}>
          Pick your products, choose your ad tools, and let the AI handle the
          rest.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: "4px",
          marginBottom: "28px",
          padding: "5px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "14px",
          animation: "up 0.4s ease forwards",
          animationDelay: "0.05s",
          opacity: 0,
        }}
      >
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => i <= step && setStep(i)}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "10px",
              cursor: i <= step ? "pointer" : "default",
              background: step === i ? "rgba(255,255,255,0.08)" : "transparent",
              border: `1px solid ${step === i ? "rgba(255,255,255,0.12)" : "transparent"}`,
              color:
                step === i
                  ? "#fff"
                  : i < step
                    ? "#6EE7B7"
                    : "rgba(255,255,255,0.25)",
              fontSize: "12.5px",
              fontWeight: step === i ? 600 : 400,
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "7px",
            }}
          >
            <span
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "6px",
                flexShrink: 0,
                background:
                  step === i
                    ? "rgba(255,255,255,0.12)"
                    : i < step
                      ? "rgba(110,231,183,0.15)"
                      : "rgba(255,255,255,0.05)",
                border: `1px solid ${i < step ? "rgba(110,231,183,0.3)" : "rgba(255,255,255,0.1)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: 700,
                color:
                  i < step
                    ? "#6EE7B7"
                    : step === i
                      ? "#fff"
                      : "rgba(255,255,255,0.3)",
              }}
            >
              {i < step ? "✓" : i + 1}
            </span>
            {s}
          </button>
        ))}
      </div>

      {/* ── STEP 0: Campaign Details ── */}
      {step === 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            animation: "up 0.35s ease forwards",
            opacity: 0,
          }}
        >
          <Glass style={{ padding: "28px" }}>
            <SectionLabel icon="◈" label="Campaign Info" />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "18px",
                marginTop: "20px",
              }}
            >
              <div style={{ gridColumn: "1 / -1" }}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Campaign Name *"
                      placeholder='e.g. "Summer Heat Drop 2025"'
                      {...field}
                    />
                  )}
                />
              </div>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <Input label="Start Date" type="date" {...field} />
                )}
              />
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <Input label="End Date" type="date" {...field} />
                )}
              />
            </div>
          </Glass>

          <Glass style={{ padding: "28px" }}>
            <SectionLabel icon="⟡" label="Campaign Objective *" />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2,1fr)",
                gap: "12px",
                marginTop: "20px",
              }}
            >
              {OBJECTIVES.map((obj) => {
                const active = wObjective === obj.id;
                return (
                  <button
                    key={obj.id}
                    onClick={() =>
                      setValue("objective", obj.id, { shouldValidate: true })
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "16px 18px",
                      borderRadius: "14px",
                      cursor: "pointer",
                      textAlign: "left",
                      background: active
                        ? "rgba(167,139,250,0.1)"
                        : "rgba(255,255,255,0.03)",
                      border: `1px solid ${active ? "rgba(167,139,250,0.4)" : "rgba(255,255,255,0.08)"}`,
                      transition: "all 0.2s",
                      boxShadow: active
                        ? "0 0 16px rgba(167,139,250,0.12)"
                        : "none",
                    }}
                  >
                    <span style={{ fontSize: "22px" }}>{obj.icon}</span>
                    <div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: active ? "#C4B5FD" : "#fff",
                        }}
                      >
                        {obj.label}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "rgba(255,255,255,0.3)",
                          marginTop: "2px",
                        }}
                      >
                        {obj.desc}
                      </div>
                    </div>
                    {active && (
                      <div
                        style={{
                          marginLeft: "auto",
                          width: "18px",
                          height: "18px",
                          borderRadius: "5px",
                          background: "rgba(167,139,250,0.3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "10px",
                          color: "#C4B5FD",
                          fontWeight: 800,
                        }}
                      >
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </Glass>

          <Glass style={{ padding: "28px" }}>
            <SectionLabel icon="✦" label="Campaign Notes" />
            <div style={{ marginTop: "18px" }}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <Textarea
                    label=""
                    placeholder="Any additional context, tone notes, or creative direction for the AI..."
                    rows={3}
                    {...field}
                  />
                )}
              />
            </div>
          </Glass>
        </div>
      )}

      {/* ── STEP 1: Select Products ── */}
      {step === 1 && (
        <div style={{ animation: "up 0.35s ease forwards", opacity: 0 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "18px",
            }}
          >
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>
              Select one or more products to feature in this campaign.
            </p>
            <button
              onClick={onAddProduct}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(110,231,183,0.08)",
                border: "1px solid rgba(110,231,183,0.22)",
                borderRadius: "10px",
                padding: "8px 14px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 600,
                color: "#6EE7B7",
              }}
            >
              + Add Product
            </button>
          </div>

          {loadingProducts ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                background: "rgba(255,255,255,0.02)",
                borderRadius: "16px",
                border: "1px dashed rgba(255,255,255,0.1)",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  border: "2px solid rgba(110,231,183,0.2)",
                  borderTopColor: "#6EE7B7",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 12px",
                }}
              />
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
                Syncing products from database...
              </div>
            </div>
          ) : allProducts.length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                background: "rgba(255,255,255,0.02)",
                borderRadius: "16px",
                border: "1px dashed rgba(255,255,255,0.1)",
              }}
            >
              <div style={{ fontSize: "28px", marginBottom: "12px" }}>📦</div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#fff",
                  fontWeight: 600,
                  marginBottom: "4px",
                }}
              >
                No products found
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                Add your first product to get started.
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              {allProducts.map((p) => (
                <ProductSelectCard
                  key={p.id}
                  product={p}
                  selected={wSelectedProducts.includes(p.id)}
                  onToggle={toggleProduct}
                />
              ))}
            </div>
          )}

          {wSelectedProducts.length > 0 && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px 18px",
                borderRadius: "12px",
                background: "rgba(110,231,183,0.06)",
                border: "1px solid rgba(110,231,183,0.2)",
                fontSize: "12.5px",
                color: "#6EE7B7",
              }}
            >
              ✓ {wSelectedProducts.length} product
              {wSelectedProducts.length > 1 ? "s" : ""} selected &nbsp;·&nbsp;
              Available tools:{" "}
              {availableTools
                .map((t) => TOOL_CONFIG[t]?.label)
                .filter(Boolean)
                .join(", ")}
            </div>
          )}
        </div>
      )}

      {/* ── STEP 2: Ad Tools ── */}
      {step === 2 && (
        <div style={{ animation: "up 0.35s ease forwards", opacity: 0 }}>
          <p
            style={{
              fontSize: "14px",
              color: "rgba(255,255,255,0.4)",
              marginBottom: "20px",
            }}
          >
            Choose which ad tools to activate. Only tools compatible with your
            selected products are available.
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            {Object.entries(TOOL_CONFIG).map(([id, tool]) => {
              const available = availableTools.includes(id);
              const active = wTools.includes(id);
              return (
                <div
                  key={id}
                  onClick={() => available && toggleTool(id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "18px",
                    padding: "22px 24px",
                    borderRadius: "18px",
                    cursor: available ? "pointer" : "not-allowed",
                    opacity: available ? 1 : 0.35,
                    background: active ? tool.bg : "rgba(255,255,255,0.03)",
                    border: `1px solid ${active ? `${tool.accent}40` : "rgba(255,255,255,0.08)"}`,
                    transition: "all 0.25s",
                    boxShadow: active ? `0 0 24px ${tool.accent}18` : "none",
                  }}
                >
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "14px",
                      flexShrink: 0,
                      background: active
                        ? `${tool.accent}20`
                        : "rgba(255,255,255,0.05)",
                      border: `1px solid ${active ? `${tool.accent}35` : "rgba(255,255,255,0.08)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "22px",
                      boxShadow: active ? `0 0 16px ${tool.accent}22` : "none",
                      transition: "all 0.25s",
                    }}
                  >
                    {tool.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        color: active ? "#fff" : "rgba(255,255,255,0.8)",
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      {tool.label}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.35)",
                        marginTop: "3px",
                      }}
                    >
                      {id === "music" &&
                        "Matches ad tone to the listener's current song on Spotify"}
                      {id === "video" &&
                        "Places your product inside the video scene using AI inpainting"}
                      {id === "twitter" &&
                        "Crawls trends and auto-posts on-brand content 24/7"}
                    </div>
                    {!available && (
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#F59E0B",
                          marginTop: "4px",
                        }}
                      >
                        ⚠ Not compatible with selected products
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "7px",
                      flexShrink: 0,
                      background: active
                        ? `linear-gradient(135deg, ${tool.accent}, #3B82F6)`
                        : "rgba(255,255,255,0.06)",
                      border: `1px solid ${active ? "transparent" : "rgba(255,255,255,0.12)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      color: "#000",
                      fontWeight: 800,
                      transition: "all 0.2s",
                    }}
                  >
                    {active && "✓"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STEP 3: Review ── */}
      {step === 3 && (
        <div style={{ animation: "up 0.35s ease forwards", opacity: 0 }}>
          <Glass style={{ padding: "28px", marginBottom: "14px" }}>
            <SectionLabel icon="◈" label="Campaign Summary" />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "12px",
                marginTop: "20px",
              }}
            >
              {[
                { l: "Name", v: wName },
                {
                  l: "Objective",
                  v: OBJECTIVES.find((o) => o.id === wObjective)?.label || "—",
                },
                { l: "Budget", v: wBudget || "Not set" },
                { l: "Start", v: wStartDate || "—" },
                { l: "End", v: wEndDate || "—" },
                { l: "Products", v: `${wSelectedProducts.length} selected` },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: "14px 16px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      color: "rgba(255,255,255,0.3)",
                      marginBottom: "5px",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {item.l}
                  </div>
                  <div
                    style={{
                      fontSize: "13.5px",
                      fontWeight: 600,
                      color: "#fff",
                    }}
                  >
                    {item.v}
                  </div>
                </div>
              ))}
            </div>
          </Glass>

          {/* Selected products */}
          <Glass style={{ padding: "24px", marginBottom: "14px" }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              Products in Campaign
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {selectedProductObjs.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>📦</span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#fff",
                      }}
                    >
                      {p.name}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "rgba(255,255,255,0.3)",
                      }}
                    >
                      {p.category || "General"} ·{" "}
                      {p.price ? `${p.currency || "₹"}${p.price}` : "No price"}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "5px" }}>
                    {(p.adTools || [])
                      .filter((t) => wTools.includes(t) && TOOL_CONFIG[t])
                      .map((t) => (
                        <span
                          key={t}
                          style={{
                            fontSize: "10px",
                            color: TOOL_CONFIG[t].accent,
                            background: TOOL_CONFIG[t].bg,
                            padding: "2px 8px",
                            borderRadius: "99px",
                            border: `1px solid ${TOOL_CONFIG[t].accent}25`,
                          }}
                        >
                          {TOOL_CONFIG[t].icon}
                        </span>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </Glass>

          {/* Tools */}
          <Glass style={{ padding: "24px", marginBottom: "14px" }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              Active Ad Tools
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              {wTools.map((t) => (
                <div
                  key={t}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 16px",
                    borderRadius: "12px",
                    background: TOOL_CONFIG[t].bg,
                    border: `1px solid ${TOOL_CONFIG[t].accent}35`,
                    fontSize: "13px",
                    fontWeight: 600,
                    color: TOOL_CONFIG[t].accent,
                  }}
                >
                  {TOOL_CONFIG[t].icon} {TOOL_CONFIG[t].label}
                </div>
              ))}
            </div>
          </Glass>
        </div>
      )}

      {/* ── Navigation ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "28px",
          animation: "up 0.4s ease forwards",
          animationDelay: "0.1s",
          opacity: 0,
        }}
      >
        <button
          onClick={() => (step > 0 ? setStep(step - 1) : onBack())}
          style={{
            padding: "13px 24px",
            borderRadius: "13px",
            cursor: "pointer",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.09)",
            color: "rgba(255,255,255,0.45)",
            fontSize: "14px",
          }}
        >
          {step === 0 ? "Cancel" : "← Back"}
        </button>

        {step < steps.length - 1 ? (
          <button
            onClick={() => canNext[step] && setStep(step + 1)}
            style={{
              padding: "13px 32px",
              borderRadius: "13px",
              cursor: canNext[step] ? "pointer" : "not-allowed",
              background: canNext[step]
                ? "linear-gradient(135deg, #A78BFA, #3B82F6)"
                : "rgba(255,255,255,0.06)",
              border: "none",
              color: canNext[step] ? "#fff" : "rgba(255,255,255,0.2)",
              fontSize: "14px",
              fontWeight: 700,
              fontFamily: "'Sora', sans-serif",
              boxShadow: canNext[step]
                ? "0 0 20px rgba(167,139,250,0.25)"
                : "none",
            }}
          >
            Continue →
          </button>
        ) : (
          <button
            onClick={handleSubmit(onSubmit)}
            style={{
              padding: "13px 32px",
              borderRadius: "13px",
              cursor: "pointer",
              background: saved
                ? "rgba(110,231,183,0.15)"
                : "linear-gradient(135deg, #6EE7B7, #3B82F6)",
              border: saved ? "1px solid rgba(110,231,183,0.3)" : "none",
              color: saved ? "#6EE7B7" : "#000",
              fontSize: "14px",
              fontWeight: 700,
              fontFamily: "'Sora', sans-serif",
              boxShadow: saved ? "none" : "0 0 24px rgba(110,231,183,0.3)",
              transition: "all 0.3s",
            }}
          >
            {saved ? "✓ Campaign Launched!" : "🚀 Launch Campaign"}
          </button>
        )}
      </div>
    </div>
  );
}

export function SectionLabel({ icon, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <span
        style={{
          fontSize: "11px",
          color: "#6EE7B7",
          background: "rgba(110,231,183,0.1)",
          border: "1px solid rgba(110,231,183,0.2)",
          width: "24px",
          height: "24px",
          borderRadius: "7px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </span>
      <span
        style={{
          fontSize: "14px",
          fontWeight: 700,
          color: "#fff",
          fontFamily: "'Sora', sans-serif",
        }}
      >
        {label}
      </span>
    </div>
  );
}

export function TopBar({ page }) {
  const labels = { product: "Add Product", campaign: "New Campaign" };
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(5,5,8,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0 32px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          height: "54px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
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
            ChameleonADS
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
        <div
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "rgba(255,255,255,0.4)",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "5px 14px",
            borderRadius: "99px",
          }}
        >
          {labels[page] || "Dashboard"}
        </div>
        <div
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #A78BFA, #6EE7B7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: 800,
            color: "#000",
          }}
        >
          N
        </div>
      </div>
    </header>
  );
}

export default function CampaignOnboarding() {
  const [page, setPage] = useState("campaign");
  const [savedProducts, setSavedProducts] = useState([]);
  const navigate = useNavigate();

  const handleSaveProduct = (product) => {
    setSavedProducts((prev) => [...prev, product]);
    setPage("campaign");
  };

  const handleSaveCampaign = () => {
    setPage("campaign");
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
        @keyframes orb2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-25px,-35px)} }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }
        select option { background: #111; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 99px; }
        button { outline: none; }
      `}</style>

      <Ambient />
      <TopBar page={page} />

      <div
        style={{
          position: "fixed",
          top: "66px",
          right: "24px",
          zIndex: 99,
          display: "flex",
          gap: "6px",
        }}
      >
        {["product", "campaign"].map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            style={{
              padding: "6px 14px",
              borderRadius: "99px",
              cursor: "pointer",
              fontSize: "11px",
              fontWeight: 600,
              background:
                page === p
                  ? "rgba(110,231,183,0.15)"
                  : "rgba(255,255,255,0.05)",
              border: `1px solid ${page === p ? "rgba(110,231,183,0.3)" : "rgba(255,255,255,0.1)"}`,
              color: page === p ? "#6EE7B7" : "rgba(255,255,255,0.4)",
            }}
          >
            {p === "product" ? "📦 Product" : "🚀 Campaign"}
          </button>
        ))}
      </div>

      {page === "product" && (
        <CreateProductPage
          onSave={handleSaveProduct}
          onBack={() => navigate("/")}
        />
      )}
      {page === "campaign" && (
        <CreateCampaignPage
          products={savedProducts}
          onSave={handleSaveCampaign}
          onBack={() => navigate("/")}
          onAddProduct={() => setPage("product")}
        />
      )}
    </div>
  );
}
