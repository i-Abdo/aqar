
'use server';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as Sentry from "@sentry/nextjs";

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadVideoToArchive(file: File): Promise<UploadResult> {
  const accessKey = process.env.ARCHIVE_ORG_ACCESS_KEY;
  const secretKey = process.env.ARCHIVE_ORG_SECRET_KEY;

  if (!file) {
    return { success: true };
  }
  
  if (file.size > 200 * 1024 * 1024) { // 200MB limit
      return { success: false, error: "حجم الفيديو كبير جدًا (الحد الأقصى 200MB)." };
  }
  if (!['video/mp4', 'video/webm', 'video/quicktime', 'video/mov'].includes(file.type.toLowerCase())) {
      return { success: false, error: "نوع ملف الفيديو غير مدعوم. يرجى استخدام MP4, WebM, أو MOV." };
  }
  
  const identifier = `aqari-property-video-${uuidv4()}`;
  const fileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');

  try {
    const s3Client = new S3Client({
      endpoint: 'https://s3.us.archive.org',
      region: 'us-east-1', // Placeholder region to satisfy the SDK
      credentials: {
        accessKeyId: accessKey!,
        secretAccessKey: secretKey!,
      },
      forcePathStyle: true,
    });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: identifier,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read',
      Metadata: {
          'x-archive-meta-collection': 'opensource_media',
          'x-archive-meta-mediatype': 'movies',
          'x-archive-meta-title': `Property Video for Aqari Project: ${fileName}`,
      }
    });

    await s3Client.send(command);

    const videoUrl = `https://archive.org/download/${identifier}/${fileName}`;

    return { success: true, url: videoUrl };
  } catch (error: any) {
    console.error(`🔴 Archive.org upload failed with RAW SDK error:`, error);
    Sentry.captureException(error, {
      extra: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        archiveIdentifier: identifier,
        sdkErrorName: error.name,
        sdkErrorMessage: error.message,
      },
    });
    
    // Return the RAW, UNMODIFIED error message from the SDK.
    return { success: false, error: error.message };
  }
}
