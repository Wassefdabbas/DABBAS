/**
 * The real root layout lives in `[locale]/layout.tsx` (it renders <html> with
 * the correct `lang` and `dir`). Next requires every app/ tree to have a root
 * layout, so this is a pure pass-through that yields control to the locale
 * layout below.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
