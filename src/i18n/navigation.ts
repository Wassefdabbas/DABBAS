import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware Link/useRouter/usePathname.
 * Always import from here instead of next/link in app code, so locale
 * prefixing happens automatically.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
