import { supabase } from '@core/services/supabase.client';

const BUCKET = 'product-images';

/** Uploads every `data:` image to Supabase Storage and returns the list with public URLs in their place. */
export async function uploadNewImages(images: readonly string[]): Promise<string[]> {
  const client = supabase();
  if (!client) {
    throw new Error('Supabase is not configured.');
  }
  return Promise.all(
    images.map(async (src) => {
      if (!src.startsWith('data:')) {
        return src;
      }
      const blob = await (await fetch(src)).blob();
      const path = `products/${crypto.randomUUID()}.jpg`;
      const { error } = await client.storage
        .from(BUCKET)
        .upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' });
      if (error) {
        throw new Error(`Photo upload failed: ${error.message}`);
      }
      return client.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    }),
  );
}

/** Deletes photos that live in the product-images bucket (bundled /assets images are left alone). */
export async function deleteStoredImages(images: readonly string[]): Promise<void> {
  const client = supabase();
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const paths = images.filter((src) => src.includes(marker)).map((src) => src.split(marker)[1]);
  if (client && paths.length) {
    await client.storage.from(BUCKET).remove(paths);
  }
}
