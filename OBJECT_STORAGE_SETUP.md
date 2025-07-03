# Object Storage Integration Setup Guide

## Overview
Successfully implemented Object Storage integration for analytical reports in the Crypto Vanguard application. The system now uses Replit Object Storage instead of direct file URLs.

## Database Changes
- **Column renamed**: `file_url` → `object_storage_key`
- **Purpose**: Store the object key/path in the bucket instead of direct URLs
- **Format**: Keys like `reports/btc-q1-2024.pdf`, `reports/defi-protocols-analysis.pdf`

## File Structure Added
- `server/objectStorage.ts` - Object Storage utility functions
- Added dependencies: `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`

## Bucket Configuration
- **Bucket ID**: `replit-objstore-a6e33adf-1d44-4b44-b510-fd863c17033b`
- **Endpoint**: `https://storage.replit.com`
- **Region**: `us-east-1`

## Required Environment Variables
You need to set these secrets in your Replit environment:
```
REPLIT_OBJECT_STORAGE_ACCESS_KEY_ID=your_access_key
REPLIT_OBJECT_STORAGE_SECRET_ACCESS_KEY=your_secret_key
```

## API Endpoints Updated

### 1. Purchase & Download (Protected)
- **Endpoint**: `POST /api/reports/:id/purchase`
- **Function**: Generates presigned URL after successful payment
- **Authentication**: Required
- **Returns**: `{ success: true, purchase, downloadUrl }`

### 2. Free Sample Download
- **Endpoint**: `GET /api/reports/:id/download-sample`
- **Function**: Generates presigned URL for free sample reports
- **Authentication**: Not required
- **Returns**: `{ success: true, downloadUrl, title }`

## Object Storage Functions

### `generateDownloadUrl(objectKey, expiresIn)`
- Generates presigned download URLs
- Default expiration: 1 hour (3600 seconds)
- Returns secure, temporary download link

### `uploadFile(objectKey, fileBuffer, contentType)`
- Upload new PDF files to storage
- Default content type: `application/pdf`
- Returns the object key

### `fileExists(objectKey)`
- Check if file exists in storage
- Returns boolean

### `getFileMetadata(objectKey)`
- Get file information (size, last modified, etc.)
- Returns metadata object

## How to Add New PDF Reports

### Step 1: Upload to Object Storage
1. Use the `uploadFile()` function or upload directly via Replit's Object Storage interface
2. Recommended naming convention: `reports/report-name.pdf`

### Step 2: Add to Database
```sql
INSERT INTO analytical_reports (title, description, price, object_storage_key, is_free_sample) 
VALUES (
  'Your Report Title',
  'Report description',
  '2980',
  'reports/your-report-name.pdf',
  false
);
```

### Step 3: Verify Access
Test download endpoints to ensure the file is accessible.

## Current Sample Files in Database
1. `reports/btc-q1-2024.pdf` (Free sample)
2. `reports/defi-protocols-analysis.pdf` (Paid)
3. `reports/layer2-investment-guide.pdf` (Paid)

## Security Features
- **Presigned URLs**: Temporary access (1-hour expiration)
- **Authentication**: Purchase verification before download
- **Access Control**: Free samples vs paid content separation
- **Secure Storage**: Files not publicly accessible without proper authentication

## Frontend Integration
The existing frontend will automatically work with the new system since the API response format remains the same (`downloadUrl` field).

## Error Handling
- File not found in Object Storage
- Invalid object keys
- Authentication failures
- Payment verification errors

All errors return appropriate HTTP status codes and descriptive messages.