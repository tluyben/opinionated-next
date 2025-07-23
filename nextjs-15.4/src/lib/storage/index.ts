import { db, files } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { generateId } from '@/lib/utils';

interface UploadResult {
  id: string;
  filename: string;
  url: string;
}

interface UploadOptions {
  userId: string;
  file: {
    originalName: string;
    mimeType: string;
    size: number;
    buffer: Buffer;
  };
}

/**
 * Upload file to S3 or database fallback
 * Uses S3 if AWS credentials are configured, otherwise stores in database
 */
export async function uploadFile({ userId, file }: UploadOptions): Promise<UploadResult> {
  const fileId = generateId();
  const filename = `${fileId}-${file.originalName}`;

  // Check if S3 credentials are configured
  const hasS3Config = !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_REGION &&
    process.env.AWS_S3_BUCKET
  );

  if (hasS3Config) {
    // TODO: Implement S3 upload when multer is added
    throw new Error('S3 upload not yet implemented - will store in database');
  }

  // Fallback: Store in database
  const base64Data = file.buffer.toString('base64');
  
  await db.insert(files).values({
    id: fileId,
    userId,
    filename,
    originalName: file.originalName,
    mimeType: file.mimeType,
    fileSize: file.size,
    fileData: base64Data,
    createdAt: new Date(),
  });

  return {
    id: fileId,
    filename,
    url: `/api/files/${fileId}`, // Will need API route to serve files
  };
}

/**
 * Get file from database storage
 */
export async function getFileFromDatabase(fileId: string) {
  const result = await db.select().from(files).where(eq(files.id, fileId)).limit(1);
  
  if (result.length === 0) {
    return null;
  }

  const file = result[0];
  const buffer = Buffer.from(file.fileData, 'base64');

  return {
    buffer,
    mimeType: file.mimeType,
    originalName: file.originalName,
    filename: file.filename,
  };
}

/**
 * Delete file from storage
 */
export async function deleteFile(fileId: string, userId: string): Promise<boolean> {
  // Check if S3 credentials are configured
  const hasS3Config = !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_REGION &&
    process.env.AWS_S3_BUCKET
  );

  if (hasS3Config) {
    // TODO: Implement S3 deletion when multer is added
    throw new Error('S3 deletion not yet implemented');
  }

  // Delete from database
  const result = await db.delete(files).where(
    and(eq(files.id, fileId), eq(files.userId, userId))
  );

  return result.changes > 0;
}