// Utility functions for handling Object Storage URLs

/**
 * Generate a Replit Object Storage URL for a PDF file
 * @param bucketName - The name of the Object Storage bucket
 * @param fileName - The name of the PDF file
 * @returns The complete Object Storage URL
 */
export function generateObjectStorageUrl(bucketName: string, fileName: string): string {
  // Encode the filename to handle special characters (like Japanese characters)
  const encodedFileName = encodeURIComponent(fileName);
  return `https://storage.replit.com/v1/${bucketName}/${encodedFileName}`;
}

/**
 * Generate Object Storage URL specifically for ReportPDFs bucket
 * @param fileName - The name of the PDF file
 * @returns The complete Object Storage URL for ReportPDFs bucket
 */
export function generateReportPdfUrl(fileName: string): string {
  return generateObjectStorageUrl('ReportPDFs', fileName);
}

/**
 * Extract filename from an Object Storage URL
 * @param url - The Object Storage URL
 * @returns The decoded filename
 */
export function extractFileNameFromUrl(url: string): string | null {
  const match = url.match(/\/v1\/[^\/]+\/(.+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Validate if a URL is a Replit Object Storage URL
 * @param url - The URL to validate
 * @returns True if it's a valid Object Storage URL
 */
export function isObjectStorageUrl(url: string): boolean {
  return url.startsWith('https://storage.replit.com/v1/');
}