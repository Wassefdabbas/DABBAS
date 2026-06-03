import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip Next internals, API, static files, and the /admin section
  // (admin is non-localized — single internal surface).
  matcher: ["/((?!api|_next|_vercel|admin|.*\\..*).*)"],
};
