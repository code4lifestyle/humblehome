export type ImageSize = '300x300' | '600x600' | '1024x576';

/**
 * Returns the resized variant of an uploaded image, e.g.
 *   imageVariant('assets/images/product-image-10.jpg', '300x300') → 'assets/images/product-image-10-300x300.jpg'
 * Only product images (300x300, 600x600) and blog post images (1024x576) have variants in /assets/images.
 * Already-sized paths are returned unchanged.
 */
export function imageVariant(path: string, size: ImageSize): string {
  if (!path || /-\d+x\d+\.[a-z]+$/i.test(path)) {
    return path;
  }
  return path.replace(/(\.[a-z]+)$/i, `-${size}$1`);
}
