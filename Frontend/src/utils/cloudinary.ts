/**
 * Cloudinary upload utility.
 *
 * Uploads images OR videos directly from the browser to Cloudinary
 * using an UNSIGNED upload preset, then returns the hosted URL.
 *
 * Images are compressed/resized client-side BEFORE uploading, which
 * makes uploads dramatically faster (a 10MB photo becomes ~200-400KB).
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

import { compressImageToBlob } from './imageProcessor';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

export const isCloudinaryConfigured = Boolean(CLOUD_NAME && UPLOAD_PRESET);

/**
 * Detect if a file is a video based on MIME type.
 */
export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/');
}

export interface CloudinaryUploadOptions {
  /** Longest side (px) images are resized to before upload. Default 1600. */
  maxDimension?: number;
  /** JPEG quality 0-1 for the compressed upload. Default 0.82. */
  quality?: number;
  /** Set false to upload the original file untouched (videos are never compressed). */
  compress?: boolean;
  /** Called with 0-100 as the upload progresses. */
  onProgress?: (percent: number) => void;
}

/**
 * Upload a file to Cloudinary. Returns the secure hosted URL.
 *
 * - Images: compressed client-side first, then served with a folder-aware
 *   transform (square crop for profiles, 4:3 landscape for event posters,
 *   aspect-preserving resize for gallery).
 * - Videos: uploaded directly with no compression or transformations.
 */
export async function uploadToCloudinary(
  file: File,
  folder = 'profiles',
  options: CloudinaryUploadOptions = {}
): Promise<string> {
  if (!isCloudinaryConfigured) {
    throw new Error('Cloudinary is not configured');
  }

  const video = isVideoFile(file);

  // Compress images client-side so the upload is much faster.
  let uploadFile: Blob | File = file;
  let filename = file.name;
  if (!video && options.compress !== false) {
    const maxDimension = options.maxDimension ?? 1600;
    const quality = options.quality ?? 0.82;
    const compressed = await compressImageToBlob(file, maxDimension, quality);
    // Only use the compressed version if it's actually smaller
    if (compressed.size < file.size) {
      uploadFile = compressed;
      filename = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    }
  }

  const formData = new FormData();
  formData.append('file', uploadFile, filename);
  formData.append('upload_preset', UPLOAD_PRESET!);
  formData.append('folder', folder);

  // Use the correct endpoint: image/upload or video/upload
  const endpoint = video ? 'video' : 'image';
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${endpoint}/upload`;

  // XHR (instead of fetch) so we can report upload progress
  const data = await new Promise<{ secure_url: string; public_id: string; version: number }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && options.onProgress) {
        options.onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error('Invalid response from Cloudinary'));
        }
      } else {
        try {
          const body = JSON.parse(xhr.responseText);
          reject(new Error(body?.error?.message || `Cloudinary upload failed (${xhr.status})`));
        } catch {
          reject(new Error(`Cloudinary upload failed (${xhr.status})`));
        }
      }
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.ontimeout = () => reject(new Error('Upload timed out'));
    xhr.send(formData);
  });

  if (video) {
    // For videos, return the raw URL — no transformations
    return data.secure_url;
  }

  // Folder-aware display transforms — keeps images the right size for where
  // they are shown, without distorting them.
  const { public_id, version } = data;
  const base = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

  if (folder === 'profiles') {
    // Square avatar crop
    return `${base}/c_crop,g_face,h_800,w_800,c_fill,q_auto:good,f_auto,w_400,h_400/v${version}/${public_id}.jpg`;
  }

  if (folder === 'events') {
    // Event poster: auto-crop to a consistent 4:3 landscape so the banner
    // on the Events page always fits perfectly without distortion
    return `${base}/c_fill,g_auto,w_1200,h_900,q_auto:good,f_auto/v${version}/${public_id}.jpg`;
  }

  // Gallery and everything else: resize to fit 1600px, keep original aspect
  return `${base}/q_auto:good,f_auto,w_1600/v${version}/${public_id}.jpg`;
}