/**
 * Crop image to square (center crop) and compress it.
 * Returns a base64 data URL.
 */
export function processImage(file: File, maxSize = 400, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Calculate square crop (center crop)
        const size = Math.min(img.width, img.height);
        const offsetX = (img.width - size) / 2;
        const offsetY = (img.height - size) / 2;

        // Scale down if larger than maxSize
        const scale = size > maxSize ? maxSize / size : 1;
        const outputSize = Math.floor(size * scale);

        canvas.width = outputSize;
        canvas.height = outputSize;

        // Draw the cropped and scaled image
        ctx.drawImage(
          img,
          offsetX, offsetY, size, size,  // source
          0, 0, outputSize, outputSize   // destination
        );

        // Convert to compressed JPEG
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Resize an image down to fit within maxDimension (preserving aspect ratio)
 * and compress it to a JPEG Blob. Used to shrink files BEFORE upload so
 * uploads are much faster.
 *
 * Returns a Blob (not base64) so it can be uploaded directly as a file.
 */
export function compressImageToBlob(file: File, maxDimension = 1600, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Only scale DOWN — never upscale small images
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to compress image'));
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
