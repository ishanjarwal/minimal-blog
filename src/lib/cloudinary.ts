import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Protect essential assets (author avatar / seeded system assets) from accidental destruction
const PROTECTED_PUBLIC_IDS = new Set([
  "Dramatic_Studio_Portrait_of_a_Bearded_Man_bz7h1u",
  "AI-Focused_Product_Engineer_Banner_pnc70e",
]);

export async function uploadMediaStream(
  buffer: Buffer,
  folder = process.env.CLOUDINARY_FOLDER || "minimal-blog"
): Promise<{ secureUrl: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error: unknown, result?: UploadApiResponse) => {
        if (error || !result) {
          reject(error || new Error("Failed to upload image to Cloudinary"));
        } else {
          resolve({
            secureUrl: result.secure_url,
            publicId: result.public_id,
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Extracts the Cloudinary public_id from a Cloudinary delivery URL.
 * Handles transformations, version tags, subfolders, and extensions.
 */
export function extractCloudinaryPublicId(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  if (!url.includes("cloudinary.com")) return null;

  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;
    const uploadIndex = pathname.indexOf("/upload/");
    if (uploadIndex === -1) return null;

    const afterUpload = pathname.slice(uploadIndex + "/upload/".length);
    const segments = afterUpload.split("/");
    const cleanSegments: string[] = [];

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      // Skip version prefix (v123456789)
      if (/^v\d+$/.test(seg)) {
        cleanSegments.push(...segments.slice(i + 1));
        break;
      }
      // Skip transformations and signed URLs (e.g. s--...--, w_400,c_scale)
      if (
        seg.startsWith("s--") ||
        seg.includes(",") ||
        /^[a-z]_[a-z0-9_-]+$/.test(seg)
      ) {
        continue;
      }
      // Otherwise, we have reached the folder path
      cleanSegments.push(...segments.slice(i));
      break;
    }

    if (cleanSegments.length === 0) return null;

    const fullPathWithExt = cleanSegments.join("/");
    // Strip file extension (.png, .jpg, .webp, etc.)
    const dotIndex = fullPathWithExt.lastIndexOf(".");
    return dotIndex !== -1 ? fullPathWithExt.slice(0, dotIndex) : fullPathWithExt;
  } catch {
    return null;
  }
}

/**
 * Extracts all Cloudinary image URLs embedded in markdown or HTML content.
 */
export function extractCloudinaryUrlsFromContent(content?: string | null): string[] {
  if (!content) return [];
  const regex = /https?:\/\/res\.cloudinary\.com\/[^\s\)\]\"\'\`<>]+/gi;
  const matches = content.match(regex) || [];
  return Array.from(new Set(matches));
}

/**
 * Resolves all unique Cloudinary public IDs associated with a post (thumbnail + inline images).
 */
export function getPostCloudinaryPublicIds(post: {
  thumbnailUrl?: string | null;
  content?: string | null;
}): string[] {
  const candidateUrls: string[] = [];

  if (post.thumbnailUrl) {
    candidateUrls.push(post.thumbnailUrl);
  }

  if (post.content) {
    candidateUrls.push(...extractCloudinaryUrlsFromContent(post.content));
  }

  const ids = candidateUrls
    .map(extractCloudinaryPublicId)
    .filter((id): id is string => id !== null && !PROTECTED_PUBLIC_IDS.has(id));

  return Array.from(new Set(ids));
}

/**
 * Deletes a single asset from Cloudinary storage.
 */
export async function deleteCloudinaryMedia(
  publicId: string
): Promise<{ result: string }> {
  if (PROTECTED_PUBLIC_IDS.has(publicId)) {
    return { result: "protected" };
  }

  return new Promise((resolve) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        console.error(`Failed to destroy Cloudinary asset "${publicId}":`, error);
        resolve({ result: "error" });
      } else {
        resolve(result || { result: "ok" });
      }
    });
  });
}

/**
 * Deletes a list of assets from Cloudinary in parallel.
 */
export async function deleteCloudinaryMediaList(publicIds: string[]): Promise<void> {
  const targetIds = Array.from(
    new Set(publicIds.filter((id) => Boolean(id) && !PROTECTED_PUBLIC_IDS.has(id)))
  );

  if (targetIds.length === 0) return;

  await Promise.allSettled(targetIds.map((id) => deleteCloudinaryMedia(id)));
}

export { cloudinary };
