"use client";

import { useRef, useState, useTransition } from "react";
import { BrandImage } from "@/components/brand-image";
import {
  parseDriveId,
  looksLikeUrl,
  type BrandImage as BrandImageData,
} from "@/lib/images";
import { resolveImageUrlAction } from "../_actions/resolve-image";
import { cn } from "@/lib/cn";

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME ?? "";
const API_KEY = process.env.CLOUDINARY_API_KEY ?? "";

/* ─────────────────────────────────────────────────────────────── */

export function ImageInput({
  value,
  onChange,
  onAddMany,
  onRemove,
  label,
}: {
  value: BrandImageData | null;
  onChange: (next: BrandImageData) => void;
  /**
   * When set, the file picker allows MULTIPLE files; every uploaded image is
   * reported here (in selection order). Falls back to `onChange` per file when
   * omitted.
   */
  onAddMany?: (images: BrandImageData[]) => void;
  onRemove?: () => void;
  label?: string;
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Signed direct-upload path: cloud name + API key must be set. The API
  // secret stays server-only and signs each upload via the route below.
  const cloudinaryReady = Boolean(CLOUD && API_KEY);
  const multiple = Boolean(onAddMany);

  /** Upload one file to Cloudinary (signed) → BrandImage, or throw. */
  const uploadOne = async (file: File): Promise<BrandImageData> => {
    const timestamp = Math.round(Date.now() / 1000);
    const signRes = await fetch("/api/admin/cloudinary-sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paramsToSign: { timestamp } }),
    });
    const { signature } = (await signRes.json()) as { signature?: string };
    if (!signature) throw new Error("Could not sign the upload.");

    const form = new FormData();
    form.append("file", file);
    form.append("api_key", API_KEY);
    form.append("timestamp", String(timestamp));
    form.append("signature", signature);

    const upRes = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`,
      { method: "POST", body: form },
    );
    const up = (await upRes.json()) as {
      public_id?: string;
      error?: { message?: string };
    };
    if (!up.public_id) throw new Error(up.error?.message ?? "Upload failed.");

    return {
      src: { kind: "cloudinary", publicId: up.public_id },
      alt: "",
    };
  };

  /**
   * Handle one or more picked files: open the device picker → sign each on our
   * server → POST straight to Cloudinary, preserving selection order.
   */
  const handleFiles = async (files: File[]) => {
    setError(null);
    setUploading(true);
    try {
      const uploaded = await Promise.all(files.map(uploadOne));
      if (onAddMany) {
        onAddMany(uploaded);
      } else if (uploaded[0]) {
        onChange({ ...uploaded[0], alt: value?.alt ?? "", aspect: value?.aspect });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  /**
   * One smart "paste a link" handler — auto-detects Google Drive / Pinterest /
   * direct image URL.
   */
  const handleLink = () => {
    setError(null);
    const trimmed = input.trim();
    if (!trimmed) return;

    const driveId = parseDriveId(trimmed);
    if (driveId) {
      onChange({
        src: { kind: "drive", id: driveId },
        alt: value?.alt ?? "",
        aspect: value?.aspect,
      });
      setInput("");
      return;
    }

    if (!looksLikeUrl(trimmed)) {
      setError("Paste a Google Drive link, a Pinterest pin, or a direct image URL.");
      return;
    }

    start(async () => {
      const r = await resolveImageUrlAction(trimmed);
      if (!r.ok) {
        setError(r.reason);
        return;
      }
      onChange({
        src: { kind: "url", url: r.url },
        alt: value?.alt ?? "",
        aspect: value?.aspect,
      });
      setInput("");
    });
  };

  if (value) {
    return (
      <div className="rounded-lg border border-mist bg-pearl p-4">
        {label && <p className="mb-3 text-sm font-medium text-ink">{label}</p>}
        <FilledState value={value} onChange={onChange} onRemove={onRemove} />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-mist bg-pearl p-4">
      {label && <p className="mb-3 text-sm font-medium text-ink">{label}</p>}

      <div className="flex flex-col gap-4">
        {/* Primary: upload a file straight from the device */}
        {cloudinaryReady ? (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple={multiple}
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                if (files.length) handleFiles(files);
              }}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className={cn(
                "flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors",
                uploading
                  ? "border-mist text-muted"
                  : "border-ink/20 text-ink hover:border-gold hover:bg-porcelain",
              )}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
                <path d="M12 16V4M7 9l5-5 5 5M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
              </svg>
              <span className="text-sm font-medium">
                {uploading
                  ? "Uploading…"
                  : multiple
                    ? "Choose files to upload"
                    : "Choose a file to upload"}
              </span>
              <span className="text-xs text-muted">
                {multiple
                  ? "Select several at once — uploads straight to Cloudinary"
                  : "Opens your device — uploads straight to Cloudinary"}
              </span>
            </button>
          </>
        ) : (
          <p className="rounded-md border border-mist bg-porcelain p-3 text-xs text-muted">
            File upload is off (Cloudinary not configured). You can still paste a
            link below.
          </p>
        )}

        {/* Secondary: paste any link */}
        <div>
          <p className="mb-1.5 text-xs text-muted">
            {cloudinaryReady ? "Or paste a link" : "Paste a link"} — Google
            Drive, Pinterest, or a direct image URL
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleLink();
                }
              }}
              className="min-w-0 flex-1 rounded-md border border-ink/15 bg-porcelain px-3 py-2.5 text-sm text-ink transition-colors placeholder:text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40"
            />
            <button
              type="button"
              onClick={handleLink}
              disabled={pending || !input.trim()}
              className="shrink-0 rounded-md border border-ink/15 px-4 py-2.5 text-sm text-ink transition-colors hover:border-gold hover:text-gold-deep disabled:opacity-50"
            >
              {pending ? "Adding…" : "Add"}
            </button>
          </div>
        </div>

        {error && <p className="text-xs text-gold-deep">{error}</p>}
      </div>
    </div>
  );
}

/* ─── Filled state ────────────────────────────────────────────── */

function FilledState({
  value,
  onChange,
  onRemove,
}: {
  value: BrandImageData;
  onChange: (next: BrandImageData) => void;
  onRemove?: () => void;
}) {
  const sourceLabel =
    value.src.kind === "drive"
      ? "Google Drive"
      : value.src.kind === "cloudinary"
        ? "Uploaded"
        : "Link";

  return (
    <div className="grid grid-cols-[96px_1fr] gap-4">
      <div className="aspect-[4/5] overflow-hidden rounded-md bg-mist">
        <BrandImage image={value} sizes="96px" />
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <span className="inline-flex w-fit items-center rounded-full bg-mist px-2.5 py-0.5 text-xs text-graphite">
          {sourceLabel}
        </span>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">
            Alt text (describes the image)
          </span>
          <input
            type="text"
            value={value.alt}
            onChange={(e) => onChange({ ...value, alt: e.target.value })}
            placeholder="e.g. Bride in a cathedral-length veil"
            className="w-full rounded-md border border-ink/15 bg-porcelain px-3 py-2 text-sm text-ink transition-colors placeholder:text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40"
          />
        </label>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="mt-1 self-start text-sm text-gold-deep transition-colors hover:text-ink"
          >
            Remove image
          </button>
        )}
      </div>
    </div>
  );
}
