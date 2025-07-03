import { S3Client, GetObjectCommand, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Replit Object Storage configuration
const BUCKET_ID = "replit-objstore-a6e33adf-1d44-4b44-b510-fd863c17033b";
const REPLIT_OBJECT_STORAGE_ENDPOINT = "https://storage.replit.com";

// Initialize S3 client for Replit Object Storage
const s3Client = new S3Client({
  endpoint: REPLIT_OBJECT_STORAGE_ENDPOINT,
  region: "us-east-1", // Replit uses us-east-1
  credentials: {
    accessKeyId: process.env.REPLIT_OBJECT_STORAGE_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.REPLIT_OBJECT_STORAGE_SECRET_ACCESS_KEY || "",
  },
});

/**
 * Generate a presigned URL for downloading a file from Object Storage
 * @param objectKey - The key/path of the object in storage (e.g., "reports/btc-q1-2024.pdf")
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns Promise<string> - Presigned download URL
 */
export async function generateDownloadUrl(
  objectKey: string, 
  expiresIn: number = 3600
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_ID,
      Key: objectKey,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error("Error generating download URL:", error);
    throw new Error(`Failed to generate download URL for ${objectKey}`);
  }
}

/**
 * Upload a file to Object Storage
 * @param objectKey - The key/path where to store the file
 * @param fileBuffer - The file content as Buffer
 * @param contentType - MIME type of the file
 * @returns Promise<string> - The object key of the uploaded file
 */
export async function uploadFile(
  objectKey: string,
  fileBuffer: Buffer,
  contentType: string = "application/pdf"
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_ID,
      Key: objectKey,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await s3Client.send(command);
    return objectKey;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error(`Failed to upload file to ${objectKey}`);
  }
}

/**
 * Check if a file exists in Object Storage
 * @param objectKey - The key/path of the object to check
 * @returns Promise<boolean> - True if file exists, false otherwise
 */
export async function fileExists(objectKey: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_ID,
      Key: objectKey,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get file metadata from Object Storage
 * @param objectKey - The key/path of the object
 * @returns Promise<object> - File metadata including size, last modified, etc.
 */
export async function getFileMetadata(objectKey: string) {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_ID,
      Key: objectKey,
    });

    const response = await s3Client.send(command);
    return {
      size: response.ContentLength,
      lastModified: response.LastModified,
      contentType: response.ContentType,
      etag: response.ETag,
    };
  } catch (error) {
    console.error("Error getting file metadata:", error);
    throw new Error(`Failed to get metadata for ${objectKey}`);
  }
}

/**
 * Download file content from Object Storage
 * @param objectKey - The key/path of the object to download
 * @returns Promise<Buffer> - File content as Buffer
 */
export async function downloadFile(objectKey: string): Promise<Buffer> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_ID,
      Key: objectKey,
    });

    const response = await s3Client.send(command);
    
    if (!response.Body) {
      throw new Error("No file content received");
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    const reader = response.Body.transformToWebStream().getReader();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }

    return Buffer.concat(chunks);
  } catch (error) {
    console.error("Error downloading file:", error);
    throw new Error(`Failed to download file: ${objectKey}`);
  }
}