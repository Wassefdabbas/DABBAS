/**
 * THE category predicate — the single definition of "veil belongs to
 * category". Lives in its own module (no Mongo imports) so both the server
 * route (/collection/category/[slug]) and the client-side collection-grid
 * filter can share it without pulling the DB driver into the browser bundle.
 */
export function filterByCategory<T extends { categorySlug?: string | null }>(
  items: T[],
  categorySlug: string,
): T[] {
  return items.filter((v) => v.categorySlug === categorySlug);
}
