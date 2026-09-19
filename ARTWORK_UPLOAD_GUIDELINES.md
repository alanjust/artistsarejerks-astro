# Preparing artwork images for Artists Are Jerks

This is a working draft for a short public how-to and for tooltips inside the artwork upload form.

## The short version

Photograph the entire artwork straight on, in even light, at the highest quality your phone or camera allows. Crop close to the artwork without cutting off an edge. Upload the original photograph; Artists Are Jerks will make the smaller web versions.

## Photographing the work

1. Place the artwork flat against a wall or on a stable vertical surface.
2. Use soft, even daylight or two lights placed at equal angles. Avoid direct sun, mixed-color light, glare, and strong shadows.
3. Position the camera at the center of the artwork. Keep the camera parallel to the artwork so rectangular work stays rectangular.
4. Fill most of the frame while leaving a small margin around every edge.
5. Check focus at full size. Texture should look intentional rather than blurry.
6. Compare the photograph with the artwork. Correct obvious color casts, but avoid filters that change the work.

For glossy or framed work, move the lights farther to the sides until reflections disappear. A tripod helps but is not required.

## File recommendations

- JPEG, PNG, HEIC, or WebP uploads should be accepted.
- A long edge of at least 2,000 pixels is preferred.
- Use the original-quality file rather than a screenshot or an image copied from social media.
- Use the sRGB color space when the camera or editing application offers that choice.
- Do not add a watermark, decorative border, text, or artificial background solely for Artists Are Jerks.
- Keep a separate archival master. The site copy is for display and discovery.

Transparent PNG should be optional for digital artwork that already has a meaningful transparent background. The site should not automatically turn white pixels transparent because white may belong to the artwork.

## How the site should display uploads

- Preserve the original image and its aspect ratio.
- Generate optimized AVIF or WebP display files and thumbnails without altering the original.
- Show the full artwork by default with `object-fit: contain` against a quiet neutral matte.
- Never crop the primary artwork image automatically.
- Offer an optional focal-point or thumbnail-crop editor for small discovery cards.
- Let the artist preview portrait, landscape, square, and phone layouts before publishing.
- Warn about very small files, blur, extreme perspective, and missing color profiles without blocking a draft upload.
- Store image width, height, orientation, file type, and any artist-selected focal point.

## Suggested upload-form guidance

Before selection:

> Start with a clear photograph of the entire artwork. A good phone photo is enough. You can replace it later.

After selection:

> Check the edges, focus, glare, and color. The complete artwork should be visible in the preview.

When the image is small:

> This image may look soft on larger screens. If you have it, upload a version at least 2,000 pixels on its longest side.

## One decision for later

Decide whether frames are part of the work. The upload form could ask, “Is the frame included in the artwork image?” This matters for accurate dimensions, buyer expectations, and consistent thumbnails.
