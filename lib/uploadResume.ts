import cloudinary from "@/lib/cloudinary";
import { UploadApiResponse } from "cloudinary";

export async function uploadResumeToCloudinary(
  buffer: Buffer
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "interview-ai/resumes",
        format: "pdf",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result!);
      }
    );

    stream.end(buffer);
  });
}