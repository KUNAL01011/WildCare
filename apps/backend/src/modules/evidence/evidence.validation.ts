import { z } from "zod";
import { EvidenceType } from "../../generated/prisma/client.js";

export const getUploadUrlSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  contentType: z
    .string()
    .regex(/^(image|video)\//, "Content type must be an image or video"),
  size: z
    .number()
    .positive()
    .max(50 * 1024 * 1024, "Max file size is 50MB"),
});

export const completeUploadSchema = z.object({
  evidenceId: z.string().uuid(),
  type: z.nativeEnum(EvidenceType),
  s3Key: z.string().min(1, "S3 key is required"),
  contentType: z.string().min(1, "Content type is required"),
});

export type GetUploadUrlInput = z.infer<typeof getUploadUrlSchema>;
export type CompleteUploadInput = z.infer<typeof completeUploadSchema>;
