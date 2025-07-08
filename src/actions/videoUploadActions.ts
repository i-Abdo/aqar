
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

  if (!accessKey || !secretKey) {
    const errorMessage = "Archive.org credentials are not configured on the server.";
    console.error("ACTION_ERROR: " + errorMessage);
    Sentry.captureMessage(errorMessage, "error");
    return { success: false, error: "خدمة رفع الفيديو غير مهيأة حاليًا. يرجى الاتصال بالدعم الفني." };
  }

  if (!file) {
    return { success: true }; // No file, no problem
  }
  
  if (file.size > 200 * 1024 * 1024) { // 200MB limit for example
      return { success: false, error: "حجم الفيديو كبير جدًا (الحد الأقصى 200MB)." };
  }
  if (!['video/mp4', 'video/webm', 'video/quicktime', 'video/mov'].includes(file.type.toLowerCase())) {
      return { success: false, error: "نوع ملف الفيديو غير مدعوم. يرجى استخدام MP4, WebM, أو MOV." };
  }
  
  const identifier = `aqari-property-video-${uuidv4()}`;
  const fileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');

  try {
    const s3Client = new S3Client({
      // region: 'us-east-1', // REMOVED: This is the new fix. Forcing the SDK to not assume an AWS region.
      endpoint: 'https://s3.us.archive.org',
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
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
    // Enhanced error logging to capture the specific SDK error
    console.error(`🔴 Archive.org upload failed for identifier: ${identifier}`, error);
    Sentry.captureException(error, {
      extra: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        archiveIdentifier: identifier,
        // The error object from AWS SDK often has useful properties
        awsErrorName: error.name,
        awsErrorMessage: error.message,
        awsErrorStack: error.stack,
        errorCause: error.cause,
      },
    });
    
    // Provide a more specific error message if possible, otherwise keep it general
    let userFriendlyError = "فشل رفع الفيديو. قد تكون هناك مشكلة في الاتصال بخدمة الأرشفة.";
    if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
        userFriendlyError = "انتهت مهلة الاتصال بخدمة الأرشفة. قد يكون الملف كبيرًا جدًا أو الاتصال بطيئًا. يرجى المحاولة مرة أخرى."
    }

    return { success: false, error: userFriendlyError };
  }
}
