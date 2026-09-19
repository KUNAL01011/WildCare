import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../../../config/env.js"; // Assuming env validation contains S3_BUCKET_NAME

const s3Client = new S3Client({ region: env.AWS_REGION || "ap-south-1" });

export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds: number = 900
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET_NAME || "wildcare-evidence-dev",
    Key: key,
    ContentType: contentType,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}
