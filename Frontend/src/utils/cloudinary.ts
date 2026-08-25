/**
 * Cloudinary upload utility.
 *
 * Uploads images OR videos directly from the browser to Cloudinary
 * using an UNSIGNED upload preset, then returns the hosted URL.
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
 * Detect if a file is a video based on MIME type.
 */
export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/');
}

/**
 * Upload a file to Cloudinary. Returns the secure hosted URL.
 * - Images: auto-cropped to square (400x400) for avatars
 * - Videos: uploaded directly with no transformations
 */
export async function uploadToCloudinary(file: File, folder = 'profiles'): Promise<string> {
  if (!isCloudinaryConfigured) {
    throw new Error('Cloudinary is not configured');
  }

  const video = isVideoFile(file);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET!);
  formData.append('folder', folder);

  // Use the correct endpoint: image/upload or video/upload
  const endpoint = video ? 'video' : 'image';
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${endpoint}/upload`, {
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

  if (video) {
    // For videos, return the raw URL — no transformations
    return data.secure_url;
  }

  // For images, apply center-crop square transformation for avatars
  const { public_id, version } = data;
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_crop,g_face,h_800,w_800,c_fill,q_auto:good,f_auto,w_400,h_400/v${version}/${public_id}.jpg`;
}
