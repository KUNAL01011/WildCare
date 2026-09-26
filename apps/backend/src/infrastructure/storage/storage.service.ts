import { v2 as cloudinary } from "cloudinary";
import { env } from "@/config/env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export async function saveFile(
  buffer: Buffer,
  mimeType: string
): Promise<{ storageKey: string; url: string; fileSize: number }> {
  const result = await new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "wildcare/reports",
        resource_type: "image",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });

  return {
    storageKey: result.public_id,
    url: result.secure_url,
    fileSize: result.bytes,
  };
}

export async function deleteFile(storageKey: string): Promise<void> {
  await cloudinary.uploader.destroy(storageKey, { resource_type: "image" });
}

export async function deleteFiles(storageKeys: string[]): Promise<void> {
  if (storageKeys.length === 0) return;
  await cloudinary.api.delete_resources(storageKeys, { resource_type: "image" });
}
