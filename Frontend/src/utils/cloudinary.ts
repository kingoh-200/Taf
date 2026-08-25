/**
 * Cloudinary upload utility.
 *
 * Uploads an image directly from the browser to Cloudinary using an
 * UNSIGNED upload preset, then returns the hosted URL.
 *
 * Setup (one-time):
 * 1. Create a free account at https://cloudinary.com
 * 2. Dashboard → Settings → Upload → Add upload preset
 *    - Signing mode: Unsigned
 *    - Folder: e.g. "teens-aloud"
 * 3. Add these env vars (locally in Frontend/.env, and in Vercel):
 *    VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
 *    VITE_CLOUDINARY_UPLOAD_PRESET=your-preset-name
 *
 * If the env vars are missing, callers should fall back to base64 storage.
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

export const isCloudinaryConfigured = Boolean(CLOUD_NAME && UPLOAD_PRESET);

/**
 * Upload a file to Cloudinary. Returns the secure hosted URL.
 * The image is auto-cropped to a square (400x400) by Cloudinary
 * transformations applied to the returned URL.
 */
export async function uploadToCloudinary(file: File, folder = 'profiles'): Promise<string> {
  if (!isCloudinaryConfigured) {
    throw new Error('Cloudinary is not configured');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET!);
  formData.append('folder', folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message || `Cloudinary upload failed (${res.status})`);
  }

  const data = (await res.json()) as {
    secure_url: string;
    public_id: string;
    version: number;
  };

  // Build a URL that center-crops to a square 400x400 (great for avatars).
  // The raw secure_url is also available for full-size display.
  const { public_id, version } = data;
  const squareUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_crop,g_face,h_800,w_800,c_fill,q_auto:good,f_auto,w_400,h_400/v${version}/${public_id}.jpg`;

  return squareUrl;
}
