/**
 * Atelier contact details + URL builders for the two supported channels:
 *   - WhatsApp  (https://wa.me/<number>?text=...)
 *   - Email     (mailto:<address>?subject=...&body=...)
 *
 * Default ("fallback") values live here. Admin can override email,
 * WhatsApp number, and Instagram via `/admin/site` (those edits live in
 * SiteContent.contact). Use `resolveContact()` to merge the two.
 */
export const contactDefaults = {
  email: "dabbas.atelier@gmail.com",
  whatsapp: {
    number: "963933530813",
    display: "+963 933 530 813",
  },
  instagram: "https://instagram.com/dabbasart",
  address: {
    en: "Damascus, Syria — by appointment only",
    ar: "دمشق، سوريا — بموعد مسبق فقط",
  },
} as const;

/**
 * Hand any admin override object (or null/undefined) and get back the
 * effective contact object — admin values win when non-empty, defaults
 * fill the rest.
 */
export function resolveContact(
  override?: {
    email?: string;
    whatsappNumber?: string;
    whatsappDisplay?: string;
    instagram?: string;
  } | null,
) {
  return {
    email: override?.email || contactDefaults.email,
    whatsapp: {
      number: override?.whatsappNumber || contactDefaults.whatsapp.number,
      display: override?.whatsappDisplay || contactDefaults.whatsapp.display,
    },
    instagram: override?.instagram || contactDefaults.instagram,
    address: contactDefaults.address,
  };
}

/** Legacy export — points at defaults. Prefer `resolveContact()` in new code. */
export const contact = contactDefaults;

/** Build a wa.me URL with an optional pre-filled message. */
export function whatsappUrl(message?: string, number?: string): string {
  const n = number || contactDefaults.whatsapp.number;
  const base = `https://wa.me/${n}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

/** Build a mailto URL with optional subject + body. */
export function emailUrl(
  opts: { subject?: string; body?: string; email?: string } = {},
): string {
  const params = new URLSearchParams();
  if (opts.subject) params.set("subject", opts.subject);
  if (opts.body) params.set("body", opts.body);
  const qs = params.toString();
  const address = opts.email || contactDefaults.email;
  return `mailto:${address}${qs ? `?${qs}` : ""}`;
}
