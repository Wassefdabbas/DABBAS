"use client";

import { useState, useTransition } from "react";
import { ImageInput } from "../_components/image-input";
import { VideoInput } from "../_components/video-input";
import { saveSiteContentAction } from "./actions";
import type {
  SiteContent,
  MediaImage,
  MediaVideo,
} from "@/lib/site-content";
import type { BrandImage as BrandImageData } from "@/lib/images";
import { cn } from "@/lib/cn";

type HeroMode = "image" | "video";

export function SiteForm({ initial }: { initial: SiteContent }) {
  const [content, setContent] = useState<SiteContent>(initial);
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Hero edit mode — defaults to "image" so the upload UI is visible
  // immediately when the page loads (no need to discover a tiny toggle).
  const [heroMode, setHeroMode] = useState<HeroMode>(
    initial.hero?.kind === "video" ? "video" : "image",
  );

  const set = <K extends keyof SiteContent>(k: K, v: SiteContent[K]) =>
    setContent((p) => ({ ...p, [k]: v }));

  const switchHeroMode = (next: HeroMode) => {
    if (next === heroMode) return;
    // If the user is switching mode and the current hero doesn't match the
    // new mode, clear it so the new input starts empty (otherwise we'd
    // hide the old data without removing it).
    if (content.hero && content.hero.kind !== next) {
      set("hero", null);
    }
    setHeroMode(next);
  };

  /* Image-slot helper */
  const onImageSlot =
    (k: "craft" | "heritage" | "aboutBreak") =>
    (image: BrandImageData) =>
      set(k, { kind: "image", image });
  const clearImageSlot = (k: "craft" | "heritage" | "aboutBreak") => () =>
    set(k, null);

  /* Submit */
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus(null);
    start(async () => {
      try {
        await saveSiteContentAction(content);
        setStatus("Saved.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed.");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-12">
      {/* ── Hero ───────────────────────────────────────────── */}
      <section>
        <h2 className="text-2xl text-ink">Hero</h2>
        <p className="mt-1 text-sm text-muted">
          Full-bleed media at the top of the homepage. Image or video. Video
          autoplays, loops, and is muted by default.
        </p>

        {/* Mode picker — big, obvious, defaults to "Image" */}
        <div className="mt-5 mb-5 flex gap-3">
          <button
            type="button"
            onClick={() => switchHeroMode("image")}
            className={cn(
              "small-caps flex-1 border px-5 py-3 transition-colors",
              heroMode === "image"
                ? "!border-ink !bg-ink !text-porcelain"
                : "!border-mist bg-porcelain !text-graphite hover:!border-ink hover:!text-ink",
            )}
          >
            Use image
          </button>
          <button
            type="button"
            onClick={() => switchHeroMode("video")}
            className={cn(
              "small-caps flex-1 border px-5 py-3 transition-colors",
              heroMode === "video"
                ? "!border-ink !bg-ink !text-porcelain"
                : "!border-mist bg-porcelain !text-graphite hover:!border-ink hover:!text-ink",
            )}
          >
            Use video
          </button>
        </div>

        {heroMode === "image" ? (
          <ImageInput
            value={content.hero?.kind === "image" ? content.hero.image : null}
            onChange={(image) => set("hero", { kind: "image", image })}
            onRemove={() => set("hero", null)}
          />
        ) : (
          <VideoInput
            value={
              content.hero?.kind === "video" ? (content.hero as MediaVideo) : null
            }
            onChange={(v) => set("hero", v)}
            onRemove={() => set("hero", null)}
          />
        )}
      </section>

      {/* ── Our Craft ──────────────────────────────────────── */}
      <ImageSlotSection
        title="Our Craft"
        blurb="The image behind the pinned 'Our Craft' scene on the homepage."
        value={content.craft}
        onChange={(img) => onImageSlot("craft")(img)}
        onRemove={clearImageSlot("craft")}
      />

      {/* ── Heritage ───────────────────────────────────────── */}
      <ImageSlotSection
        title="Heritage"
        blurb="The image in the split-layout Heritage section."
        value={content.heritage}
        onChange={(img) => onImageSlot("heritage")(img)}
        onRemove={clearImageSlot("heritage")}
      />

      {/* ── About break ────────────────────────────────────── */}
      <ImageSlotSection
        title="About — editorial break"
        blurb="The wide image between the hero and the story sections on /about."
        value={content.aboutBreak}
        onChange={(img) => onImageSlot("aboutBreak")(img)}
        onRemove={clearImageSlot("aboutBreak")}
      />

      {/* ── Contact ────────────────────────────────────────── */}
      <section>
        <h2 className="text-2xl text-ink">Contact</h2>
        <p className="mt-1 mb-5 text-sm text-muted">
          Email, WhatsApp, and Instagram — shown on the contact page and in
          the footer. Leave a field blank to fall back to the code default.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="small-caps mb-1 block !text-muted">Email</span>
            <input
              type="email"
              value={content.contact.email}
              onChange={(e) =>
                set("contact", { ...content.contact, email: e.target.value })
              }
              className="w-full border border-ink/15 bg-porcelain px-3 py-2 text-ink focus:border-gold focus:outline-none"
              placeholder="hello@dabbas-atelier.com"
            />
          </label>
          <label className="block">
            <span className="small-caps mb-1 block !text-muted">
              Instagram URL
            </span>
            <input
              type="url"
              value={content.contact.instagram}
              onChange={(e) =>
                set("contact", {
                  ...content.contact,
                  instagram: e.target.value,
                })
              }
              className="w-full border border-ink/15 bg-porcelain px-3 py-2 text-ink focus:border-gold focus:outline-none"
              placeholder="https://instagram.com/dabbas.atelier"
            />
          </label>
          <label className="block">
            <span className="small-caps mb-1 block !text-muted">
              WhatsApp number
            </span>
            <input
              type="text"
              value={content.contact.whatsappNumber}
              onChange={(e) =>
                set("contact", {
                  ...content.contact,
                  whatsappNumber: e.target.value.replace(/[^0-9]/g, ""),
                })
              }
              className="w-full border border-ink/15 bg-porcelain px-3 py-2 text-ink focus:border-gold focus:outline-none"
              placeholder="963900000000"
            />
            <span className="mt-1 block text-xs text-muted">
              Digits only, country code first (no plus). e.g. 963900000000.
            </span>
          </label>
          <label className="block">
            <span className="small-caps mb-1 block !text-muted">
              WhatsApp display
            </span>
            <input
              type="text"
              value={content.contact.whatsappDisplay}
              onChange={(e) =>
                set("contact", {
                  ...content.contact,
                  whatsappDisplay: e.target.value,
                })
              }
              className="w-full border border-ink/15 bg-porcelain px-3 py-2 text-ink focus:border-gold focus:outline-none"
              placeholder="+963 934 067 735"
            />
            <span className="mt-1 block text-xs text-muted">
              Human-readable. Shown on the contact page.
            </span>
          </label>
        </div>
      </section>

      {/* ── Save bar ───────────────────────────────────────── */}
      <div className="sticky bottom-0 -mx-6 border-t border-mist bg-porcelain px-6 py-5">
        {error && (
          <p role="alert" className="mb-3 text-sm text-gold-deep">
            {error}
          </p>
        )}
        {status && (
          <p className="mb-3 text-sm text-ink">{status}</p>
        )}
        <div className="flex items-center justify-end gap-6">
          <button
            type="submit"
            disabled={pending}
            className="small-caps inline-flex items-center gap-3 bg-ink px-6 py-3 !text-porcelain transition-colors hover:bg-gold-deep disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save site content"}
          </button>
        </div>
      </div>
    </form>
  );
}

function ImageSlotSection({
  title,
  blurb,
  value,
  onChange,
  onRemove,
}: {
  title: string;
  blurb: string;
  value: MediaImage | null;
  onChange: (img: BrandImageData) => void;
  onRemove: () => void;
}) {
  return (
    <section>
      <h2 className="text-2xl text-ink">{title}</h2>
      <p className="mt-1 mb-5 text-sm text-muted">{blurb}</p>
      <ImageInput
        value={value?.image ?? null}
        onChange={onChange}
        onRemove={value ? onRemove : undefined}
      />
    </section>
  );
}
