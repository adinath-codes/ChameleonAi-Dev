import { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { Glass, SectionLabel, Input, Textarea } from "./Campaign";
import { addProd, uploadToStorage } from "../../utils/firebaseFNS";

function ChipSelect({
  label,
  options,
  value,
  onChange,
  multi = false,
  accent = "#6EE7B7",
}) {
  const toggle = (opt) => {
    if (multi) {
      const cur = value || [];
      onChange(
        cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt],
      );
    } else {
      onChange(value === opt ? "" : opt);
    }
  };
  const isSelected = (opt) =>
    multi ? (value || []).includes(opt) : value === opt;
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
          marginBottom: "10px",
        }}
      >
        {label}
      </label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {options.map((opt) => (
          <button
            key={opt}
            onClick={(e) => {
              e.preventDefault();
              toggle(opt);
            }}
            style={{
              padding: "7px 14px",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "12.5px",
              fontWeight: isSelected(opt) ? 600 : 400,
              background: isSelected(opt)
                ? `${accent}18`
                : "rgba(255,255,255,0.04)",
              border: `1px solid ${isSelected(opt) ? `${accent}45` : "rgba(255,255,255,0.09)"}`,
              color: isSelected(opt) ? accent : "rgba(255,255,255,0.45)",
              transition: "all 0.18s",
              boxShadow: isSelected(opt) ? `0 0 10px ${accent}20` : "none",
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

const CATEGORIES = [
  "Beverage",
  "Apparel",
  "Tech",
  "Food",
  "Beauty",
  "Fitness",
  "Home",
  "App / SaaS",
  "Accessories",
  "Other",
];
const AD_GOALS = [
  "Brand Awareness",
  "Drive Sales",
  "App Downloads",
  "Community Growth",
  "Product Launch",
  "Re-engagement",
];
const AD_TOOLS = [
  {
    id: "music",
    icon: "🎵",
    label: "Music Ad",
    desc: "Spotify tone-matched",
    accent: "#6EE7B7",
  },
  {
    id: "video",
    icon: "🎬",
    label: "Video Ad",
    desc: "In-scene placement",
    accent: "#F59E0B",
  },
  {
    id: "twitter",
    icon: "𝕏",
    label: "Twitter Agent",
    desc: "Trend-native posts",
    accent: "#A78BFA",
  },
];
const AUDIENCES = [
  "Gen Z (16–24)",
  "Millennials (25–40)",
  "Gen X (41–56)",
  "Boomers (57+)",
  "Parents",
  "Professionals",
  "Students",
  "Athletes",
];

export default function CreateProductPage({ onSave, onBack }) {
  const [saved, setSaved] = useState(false);

  // Dictionary to map local blob URLs to actual File objects
  const [pendingFiles, setPendingFiles] = useState({});

  const primaryFileInputRef = useRef(null);
  const promoFileInputRef = useRef(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isValid },
  } = useForm({
    defaultValues: {
      name: "",
      tagline: "",
      category: "",
      price: "",
      currency: "₹",
      description: "",
      keyFeatures: "",
      usp: "",
      audiences: [],
      adGoal: "",
      adTools: [],
      imageUrl: "", // Primary Image
      promoImages: [], // Array of extra images
      launchDate: "",
    },
    mode: "onChange",
  });

  const wAdTools = watch("adTools") || [];
  const wPromoImages = watch("promoImages") || [];
  const wPrimaryImage = watch("imageUrl");

  // Handle local file selection for the Primary Image
  const handlePrimaryUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      // Save file to dictionary mapped to its URL
      setPendingFiles((prev) => ({ ...prev, [localUrl]: file }));
      setValue("imageUrl", localUrl, { shouldValidate: true });
    }
    e.target.value = null; // Reset input
  };

  // Handle multi-select local file selection for Promo Images
  const handlePromoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newEntries = {};
    const newImageUrls = files.map((file) => {
      const url = URL.createObjectURL(file);
      newEntries[url] = file; // Map url to file
      return url;
    });

    // Update dictionary and form state
    setPendingFiles((prev) => ({ ...prev, ...newEntries }));
    setValue("promoImages", [...wPromoImages, ...newImageUrls], {
      shouldValidate: true,
    });

    e.target.value = null; // Reset input
  };

  const onSubmit = async (data) => {
    setSaved(true);

    try {
      let finalPrimaryUrl = data.imageUrl;

      // 1. Upload Primary Image if it's a local file
      if (
        finalPrimaryUrl.startsWith("blob:") &&
        pendingFiles[finalPrimaryUrl]
      ) {
        finalPrimaryUrl = await uploadToStorage(pendingFiles[finalPrimaryUrl]);
      }

      // 2. Upload Promo Images if they are local files
      const cleanPromoUrls = data.promoImages.filter(
        (url) => url.trim() !== "",
      );

      const promoUploadPromises = cleanPromoUrls.map(async (imgUrl) => {
        if (imgUrl.startsWith("blob:") && pendingFiles[imgUrl]) {
          return await uploadToStorage(pendingFiles[imgUrl]);
        }
        return imgUrl; // It's already a regular web URL, so return it
      });

      const finalPromoUrls = await Promise.all(promoUploadPromises);

      // 3. Construct Final Payload
      const finalPayload = {
        ...data,
        imageUrl: finalPrimaryUrl,
        promoImages: finalPromoUrls,
        id: Date.now(),
      };

      // 4. Save to Firestore ONE TIME
      await addProd(finalPayload);

      setTimeout(() => {
        onSave(finalPayload);
      }, 900);
    } catch (error) {
      console.error("Failed to save product:", error);
      setSaved(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "860px",
        margin: "0 auto",
        padding: "32px 32px 120px",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* Hidden File Inputs */}
      <input
        type="file"
        accept="image/*"
        ref={primaryFileInputRef}
        onChange={handlePrimaryUpload}
        style={{ display: "none" }}
      />
      <input
        type="file"
        accept="image/*"
        multiple
        ref={promoFileInputRef}
        onChange={handlePromoUpload}
        style={{ display: "none" }}
      />

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
            color: "#6EE7B7",
            marginBottom: "8px",
          }}
        >
          PRODUCTS
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
          Add a Product
        </h1>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)" }}>
          This info trains the AI to generate accurate, on-brand ads for this
          product.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* ── SECTION: Basic Info ── */}
        <Glass
          style={{
            padding: "28px",
            animation: "up 0.45s ease forwards",
            animationDelay: "0.05s",
            opacity: 0,
          }}
        >
          <SectionLabel icon="◈" label="Basic Information" />
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
                rules={{ required: true }}
                render={({ field }) => (
                  <Input
                    label="Product Name *"
                    placeholder="e.g. Cold Brew Original Can"
                    {...field}
                  />
                )}
              />
            </div>
            <Controller
              name="tagline"
              control={control}
              render={({ field }) => (
                <Input
                  label="Tagline"
                  placeholder="One punchy sentence about this product"
                  {...field}
                />
              )}
            />
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
                Price *
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.09)",
                        borderRadius: "12px",
                        padding: "12px 12px",
                        color: "#fff",
                        fontSize: "14px",
                        outline: "none",
                        fontFamily: "'DM Sans', sans-serif",
                        cursor: "pointer",
                      }}
                    >
                      {["₹", "$", "€", "£", "¥"].map((c) => (
                        <option
                          key={c}
                          value={c}
                          style={{ background: "#111" }}
                        >
                          {c}
                        </option>
                      ))}
                    </select>
                  )}
                />
                <Controller
                  name="price"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      type="number"
                      placeholder="499"
                      {...field}
                      style={{
                        flex: 1,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.09)",
                        borderRadius: "12px",
                        padding: "12px 16px",
                        color: "#fff",
                        fontSize: "14px",
                        outline: "none",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    />
                  )}
                />
              </div>
            </div>
          </div>
          <div style={{ marginTop: "18px" }}>
            <Controller
              name="category"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <ChipSelect
                  label="Category *"
                  options={CATEGORIES}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          <div style={{ marginTop: "18px" }}>
            <Controller
              name="launchDate"
              control={control}
              render={({ field }) => (
                <Input label="Launch / Available Date" type="date" {...field} />
              )}
            />
          </div>
        </Glass>

        {/* ── SECTION: Description ── */}
        <Glass
          style={{
            padding: "28px",
            animation: "up 0.45s ease forwards",
            animationDelay: "0.1s",
            opacity: 0,
          }}
        >
          <SectionLabel icon="✦" label="Product Story" />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              marginTop: "20px",
            }}
          >
            <Controller
              name="description"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Textarea
                  label="Description *"
                  placeholder="What is this product? What does it do? Who is it for?"
                  rows={3}
                  hint="The AI uses this to understand what it's advertising."
                  {...field}
                />
              )}
            />
            <Controller
              name="keyFeatures"
              control={control}
              render={({ field }) => (
                <Textarea
                  label="Key Features"
                  placeholder="List 3–5 features, one per line or comma-separated"
                  rows={3}
                  {...field}
                />
              )}
            />
            <Controller
              name="usp"
              control={control}
              render={({ field }) => (
                <Textarea
                  label="Unique Selling Point (USP)"
                  placeholder="What makes this product different from competitors?"
                  rows={2}
                  hint="This becomes the core hook of every ad."
                  {...field}
                />
              )}
            />
          </div>
        </Glass>

        {/* ── SECTION: Media ── */}
        <Glass
          style={{
            padding: "28px",
            animation: "up 0.45s ease forwards",
            animationDelay: "0.15s",
            opacity: 0,
          }}
        >
          <SectionLabel icon="◎" label="Media & Assets" />

          {/* Primary Image Sub-section */}
          <div style={{ marginTop: "24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginBottom: "12px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: "4px",
                  }}
                >
                  Primary Product Image *
                </label>
                <div
                  style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}
                >
                  This acts as the main icon and thumbnail across your
                  campaigns.
                </div>
              </div>
            </div>

            <div
              onClick={() => primaryFileInputRef.current?.click()}
              style={{
                border: "1.5px dashed rgba(255,255,255,0.12)",
                borderRadius: "14px",
                padding: wPrimaryImage ? "8px" : "32px 24px",
                textAlign: "center",
                cursor: "pointer",
                background: "rgba(255,255,255,0.02)",
                transition: "all 0.2s",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(110,231,183,0.35)";
                e.currentTarget.style.background = "rgba(110,231,183,0.03)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                e.currentTarget.style.background = "rgba(255,255,255,0.02)";
              }}
            >
              {wPrimaryImage ? (
                <div
                  style={{
                    height: "180px",
                    width: "100%",
                    borderRadius: "8px",
                    backgroundImage: `url(${wPrimaryImage})`,
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                />
              ) : (
                <>
                  <div style={{ fontSize: "28px", marginBottom: "10px" }}>
                    🖼️
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.45)",
                      marginBottom: "4px",
                    }}
                  >
                    Browse local files
                  </div>
                  <div
                    style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)" }}
                  >
                    PNG, JPG, WEBP — max 10MB.
                  </div>
                </>
              )}
            </div>

            <div style={{ marginTop: "14px" }}>
              <Controller
                name="imageUrl"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Input
                    label="Or paste image URL *"
                    placeholder="https://..."
                    {...field}
                  />
                )}
              />
            </div>
          </div>

          <div
            style={{
              width: "100%",
              height: "1px",
              background: "rgba(255,255,255,0.06)",
              margin: "28px 0",
            }}
          />

          {/* Promo Images Sub-section */}
          <div>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: "4px",
                }}
              >
                Promo Images (Optional)
              </label>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                Add extra lifestyle, context, or variant images. The AI uses
                these for video inpainting and dynamic social media posts.
              </div>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {wPromoImages.map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-end",
                  }}
                >
                  {img && (
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "10px",
                        flexShrink: 0,
                        backgroundColor: "rgba(255,255,255,0.05)",
                        backgroundImage: `url(${img})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <Input
                      label={`Image ${idx + 1}`}
                      placeholder="https://..."
                      value={img}
                      onChange={(val) => {
                        const newArr = [...wPromoImages];
                        newArr[idx] = val;
                        setValue("promoImages", newArr, {
                          shouldValidate: true,
                        });
                      }}
                    />
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setValue(
                        "promoImages",
                        wPromoImages.filter((_, i) => i !== idx),
                        { shouldValidate: true },
                      );
                    }}
                    style={{
                      height: "45px",
                      width: "45px",
                      borderRadius: "12px",
                      background: "rgba(245,158,11,0.08)",
                      border: "1px solid rgba(245,158,11,0.2)",
                      color: "#F59E0B",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s",
                      fontSize: "16px",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(245,158,11,0.15)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(245,158,11,0.08)")
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: wPromoImages.length > 0 ? "16px" : "0",
              }}
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  promoFileInputRef.current?.click();
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#fff",
                  background:
                    "linear-gradient(135deg, rgba(167,139,250,0.8), rgba(59,130,246,0.8))",
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 18px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-2px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                📁 Browse Local Files
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  setValue("promoImages", [...wPromoImages, ""], {
                    shouldValidate: true,
                  });
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#A78BFA",
                  background: "rgba(167,139,250,0.1)",
                  border: "1px dashed rgba(167,139,250,0.3)",
                  borderRadius: "10px",
                  padding: "10px 16px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(167,139,250,0.15)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(167,139,250,0.1)")
                }
              >
                + Add Image URL
              </button>
            </div>
          </div>
        </Glass>

        {/* ── SECTION: Ad Config ── */}
        <Glass
          style={{
            padding: "28px",
            animation: "up 0.45s ease forwards",
            animationDelay: "0.2s",
            opacity: 0,
          }}
        >
          <SectionLabel icon="⟡" label="Ad Configuration" />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "22px",
              marginTop: "20px",
            }}
          >
            <Controller
              name="audiences"
              control={control}
              render={({ field }) => (
                <ChipSelect
                  label="Target Audience"
                  options={AUDIENCES}
                  value={field.value}
                  onChange={field.onChange}
                  multi
                />
              )}
            />
            <Controller
              name="adGoal"
              control={control}
              render={({ field }) => (
                <ChipSelect
                  label="Primary Ad Goal"
                  options={AD_GOALS}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: "#6EE7B7",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                }}
              >
                Compatible Ad Tools
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: "12px",
                }}
              >
                {AD_TOOLS.map((tool) => {
                  const active = wAdTools.includes(tool.id);
                  return (
                    <button
                      key={tool.id}
                      onClick={(e) => {
                        e.preventDefault();
                        setValue(
                          "adTools",
                          active
                            ? wAdTools.filter((x) => x !== tool.id)
                            : [...wAdTools, tool.id],
                          { shouldValidate: true },
                        );
                      }}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "6px",
                        padding: "16px",
                        borderRadius: "14px",
                        cursor: "pointer",
                        background: active
                          ? `${tool.accent}12`
                          : "rgba(255,255,255,0.03)",
                        border: `1px solid ${active ? `${tool.accent}40` : "rgba(255,255,255,0.08)"}`,
                        transition: "all 0.2s",
                        boxShadow: active
                          ? `0 0 16px ${tool.accent}18`
                          : "none",
                      }}
                    >
                      <span style={{ fontSize: "22px" }}>{tool.icon}</span>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          color: active
                            ? tool.accent
                            : "rgba(255,255,255,0.45)",
                        }}
                      >
                        {tool.label}
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          color: "rgba(255,255,255,0.25)",
                        }}
                      >
                        {tool.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Glass>

        {/* ── Save Button ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            animation: "up 0.4s ease forwards",
            animationDelay: "0.25s",
            opacity: 0,
          }}
        >
          <button
            onClick={onBack}
            style={{
              padding: "13px 24px",
              borderRadius: "13px",
              cursor: "pointer",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.09)",
              color: "rgba(255,255,255,0.45)",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || saved}
            style={{
              padding: "13px 32px",
              borderRadius: "13px",
              cursor: isValid && !saved ? "pointer" : "not-allowed",
              background:
                isValid && !saved
                  ? "linear-gradient(135deg, #6EE7B7, #3B82F6)"
                  : saved
                    ? "rgba(110,231,183,0.2)"
                    : "rgba(255,255,255,0.06)",
              border: saved ? "1px solid rgba(110,231,183,0.3)" : "none",
              color:
                isValid && !saved
                  ? "#000"
                  : saved
                    ? "#6EE7B7"
                    : "rgba(255,255,255,0.2)",
              fontSize: "14px",
              fontWeight: 700,
              fontFamily: "'Sora', sans-serif",
              boxShadow:
                isValid && !saved ? "0 0 20px rgba(110,231,183,0.25)" : "none",
              transition: "all 0.3s",
            }}
          >
            {saved ? "✓ Product Saved!" : "Save Product →"}
          </button>
        </div>
      </div>
    </div>
  );
}
