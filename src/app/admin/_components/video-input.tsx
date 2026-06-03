"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { ImageInput } from "./image-input";
import {
  parseDriveId,
  type BrandImage as BrandImageData,
} from "@/lib/images";
import type { MediaVideo } from "@/lib/site-content";
import { cn } from "@/lib/cn";

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME ?? "";
const API_KEY = process.env.CLOUDINARY_API_KEY ?? "";

// `window.cloudinary` is typed ambiently in src/types/cloudinary.d.ts.
type CloudinaryWidget = CloudinaryWidgetInstance;

export function VideoInput({
  value,
  onChange,
  onRemove,
}: {
  value: MediaVideo | null;
  onChange: (next: MediaVideo) => void;
  onRemove?: () => void;
}) {
  const [driveUrl, setDriveUrl] = useState("");
  const [driveError, setDriveError] = useState<string | null>(null);
  const [widget, setWidget] = useState<CloudinaryWidget | null>(null);
  const cloudinaryReady = Boolean(CLOUD && API_KEY);

  useEffect(() => {
    if (!cloudinaryReady) return;
    if (widget) return;
    const tryCreate = () => {
      if (typeof window === "undefined" || !window.cloudinary) return false;
      const w = window.cloudinary.createUploadWidget(
        {
          cloudName: CLOUD,
          apiKey: API_KEY,
          resourceType: "video",
          sources: ["local", "url"],
          multiple: false,
          showAdvancedOptions: false,
          uploadSignature: async (
            callback: (sig: string) => void,
            paramsToSign: Record<string, string | number>,
          ) => {
            try {
              const r = await fetch("/api/admin/cloudinary-sign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paramsToSign }),
              });
              const j = (await r.json()) as { signature?: string };
              if (j.signature) callback(j.signature);
            } catch {
              /* widget shows its own error */
            }
          },
        },
        (err, result) => {
          if (err) return;
          if (result.event === "success" && result.info?.public_id) {
            onChange({
              kind: "video",
              source: { provider: "cloudinary", id: result.info.public_id },
              poster: value?.poster ?? null,
              alt: value?.alt ?? "",
            });
          }
        },
      );
      setWidget(w);
      return true;
    };
    if (!tryCreate()) {
      const id = setInterval(() => {
        if (tryCreate()) clearInterval(id);
      }, 200);
      return () => clearInterval(id);
    }
  }, [cloudinaryReady, widget, onChange, value?.poster, value?.alt]);

  const handleDriveAdd = () => {
    setDriveError(null);
    const id = parseDriveId(driveUrl);
    if (!id) {
      setDriveError("Doesn't look like a Drive URL.");
      return;
    }
    onChange({
      kind: "video",
      source: { provider: "drive", id },
      poster: value?.poster ?? null,
      alt: value?.alt ?? "",
    });
    setDriveUrl("");
  };

  return (
    <div className="border border-mist bg-pearl p-4">
      {cloudinaryReady && (
        <Script
          src="https://upload-widget.cloudinary.com/global/all.js"
          strategy="afterInteractive"
        />
      )}

      {value ? (
        <div className="flex flex-col gap-4">
          <div className="text-xs text-muted">
            <span className="small-caps">{value.source.provider}</span> video:{" "}
            <code className="break-all text-ink">{value.source.id}</code>
          </div>
          <label className="block">
            <span className="small-caps mb-1 block !text-muted">
              Alt / accessible description
            </span>
            <input
              type="text"
              value={value.alt ?? ""}
              onChange={(e) => onChange({ ...value, alt: e.target.value })}
              className="w-full border-b border-ink/20 bg-transparent py-2 text-sm text-ink focus:border-gold focus:outline-none"
            />
          </label>

          <div>
            <p className="small-caps mb-2 !text-ink">Poster image (optional)</p>
            <p className="mb-3 text-xs text-muted">
              Shown while the video loads. Strongly recommended — videos start
              transparent without it.
            </p>
            <ImageInput
              value={value.poster ?? null}
              onChange={(img: BrandImageData) =>
                onChange({ ...value, poster: img })
              }
              onRemove={
                value.poster
                  ? () => onChange({ ...value, poster: null })
                  : undefined
              }
            />
          </div>

          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="small-caps self-start !text-gold-deep transition-colors hover:!text-ink"
            >
              Remove video
            </button>
          )}

          {value.source.provider === "drive" && (
            <p className="text-xs text-muted">
              Heads-up: Drive serves videos over <code>uc?export=download</code>.
              Works for files under ~100&nbsp;MB. For larger hero videos use
              Cloudinary.
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Paste Drive share URL"
              value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
              className="flex-1 border-b border-ink/20 bg-transparent py-2 text-sm text-ink focus:border-gold focus:outline-none"
            />
            <button
              type="button"
              onClick={handleDriveAdd}
              className="small-caps !text-ink transition-colors hover:!text-gold-deep"
            >
              Add
            </button>
          </div>
          {driveError && (
            <p className="text-xs text-gold-deep">{driveError}</p>
          )}

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-mist" />
            <span className="small-caps !text-muted">or</span>
            <span className="h-px flex-1 bg-mist" />
          </div>

          <button
            type="button"
            disabled={!cloudinaryReady || !widget}
            onClick={() => widget?.open()}
            className={cn(
              "small-caps inline-flex items-center justify-center gap-3 py-2 transition-colors",
              cloudinaryReady && widget
                ? "!text-ink hover:!text-gold-deep"
                : "!text-muted",
            )}
            title={
              cloudinaryReady
                ? undefined
                : "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.local"
            }
          >
            {cloudinaryReady
              ? widget
                ? "Upload video to Cloudinary"
                : "Loading Cloudinary…"
              : "Cloudinary not configured"}
          </button>
        </div>
      )}
    </div>
  );
}
