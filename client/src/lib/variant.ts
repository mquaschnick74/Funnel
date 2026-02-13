/**
 * Checks if the current page is the "desert" therapy desert variant.
 * Driven by the URL parameter `?variant=desert`.
 */
export function isDesertVariant(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.get('variant') === 'desert';
}
