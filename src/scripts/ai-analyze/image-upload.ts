import { state } from './state';

export function initImageUpload() {
  const uploadArea = document.getElementById('uploadArea');
  const imageInput = document.getElementById('imageInput');
  const imagePreviewContainer = document.getElementById('imagePreviewContainer');
  const imagePreview = document.getElementById('imagePreview');
  const removeImage = document.getElementById('removeImage');
  const analyzeBtn = document.getElementById('analyzeBtn');

  const pasteBtn = document.getElementById('pasteImageBtn');

  uploadArea?.addEventListener('click', () => imageInput?.click());

  uploadArea?.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });

  uploadArea?.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });

  uploadArea?.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  });

  imageInput?.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  });

  // Desktop: Cmd+V / Ctrl+V anywhere on the page
  document.addEventListener('paste', (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) handleImageUpload(file);
        break;
      }
    }
  });

  // Paste button: works on mobile (iOS 16.4+) and desktop via Clipboard API
  pasteBtn?.addEventListener('click', async (e) => {
    e.stopPropagation(); // prevent triggering uploadArea click → file picker

    if (!navigator.clipboard?.read) {
      alert('Paste is not supported in this browser. Try pressing Cmd+V (Mac) or Ctrl+V (Windows) while on this page.');
      return;
    }

    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find(t => t.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const file = new File([blob], 'pasted-image', { type: imageType });
          handleImageUpload(file);
          return;
        }
      }
      alert('No image found in clipboard. Copy an image first, then tap Paste Image.');
    } catch {
      alert('Could not read clipboard. If prompted, allow clipboard access and try again.');
    }
  });

  removeImage?.addEventListener('click', () => {
    if (imageInput) (imageInput as HTMLInputElement).value = '';
    if (imagePreview) (imagePreview as HTMLImageElement).src = '';
    if (uploadArea) uploadArea.style.display = 'flex';
    if (imagePreviewContainer) imagePreviewContainer.style.display = 'none';
    state.uploadedImageData = null;
    if (analyzeBtn) (analyzeBtn as HTMLButtonElement).disabled = true;
  });

  function handleImageUpload(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result) return;

      const result = e.target.result as string;

      // Load image to check/resize it
      const img = new Image();
      img.onload = () => {
        // Calculate current size (base64 to bytes approximation)
        const currentSize = result.length * 0.75;
        const maxSize = 4 * 1024 * 1024; // Target 4MB to stay well under 5MB API limit

        let finalResult = result;
        let wasResized = false;

        // Check if resizing needed (either size or dimensions)
        if (currentSize > maxSize || img.width > 2048 || img.height > 2048) {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            alert('Canvas not supported. Please try a different browser.');
            return;
          }

          // Calculate new dimensions (max 2048px on longest side)
          let width = img.width;
          let height = img.height;
          const maxDimension = 2048;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Try different quality levels to get under target size
          let quality = 0.9;
          let compressedResult = canvas.toDataURL('image/jpeg', quality);

          while (compressedResult.length * 0.75 > maxSize && quality > 0.3) {
            quality -= 0.1;
            compressedResult = canvas.toDataURL('image/jpeg', quality);
          }

          finalResult = compressedResult;
          wasResized = true;

          console.log(`Image automatically resized: ${img.width}x${img.height} → ${Math.round(width)}x${Math.round(height)} @ ${Math.round(quality * 100)}% quality`);
          console.log(`Size: ${(currentSize / 1024 / 1024).toFixed(2)}MB → ${(compressedResult.length * 0.75 / 1024 / 1024).toFixed(2)}MB`);
        }

        // Check final size
        const finalSize = finalResult.length * 0.75;
        if (finalSize > 5 * 1024 * 1024) {
          alert('Image is still too large after compression. Please use a smaller image or reduce its resolution.');
          return;
        }

        // Display and store the processed image
        if (imagePreview) (imagePreview as HTMLImageElement).src = finalResult;
        state.uploadedImageData = finalResult;
        if (uploadArea) uploadArea.style.display = 'none';
        if (imagePreviewContainer) imagePreviewContainer.style.display = 'block';
        if (analyzeBtn) (analyzeBtn as HTMLButtonElement).disabled = false;

        if (wasResized) {
          // Show brief notification
          const notification = document.createElement('div');
          notification.textContent = '\u2713 Image automatically optimized for analysis';
          notification.style.cssText = 'position:fixed;top:20px;right:20px;background:#7c3aed;color:white;padding:12px 20px;border-radius:8px;z-index:10000;font-family:var(--font-body);box-shadow:0 4px 12px rgba(0,0,0,0.15);';
          document.body.appendChild(notification);
          setTimeout(() => notification.remove(), 3000);
        }
      };

      img.onerror = () => {
        alert('Failed to load image. Please try a different file.');
      };

      img.src = result;
    };
    reader.readAsDataURL(file);
  }
}
