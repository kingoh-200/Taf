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
