
'use server';

import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import * as Sentry from "@sentry/nextjs";

interface UploadResult {
  success: boolean;
  urls?: string[];
  error?: string;
}

export async function uploadImages(files: File[]): Promise<UploadResult> {
  try {
    // Configure Cloudinary inside the action. This will throw an error if vars are missing.
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    });

    if (!files || files.length === 0) {
      return { success: true, urls: [] };
    }

    const uploadPromises = files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      return new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: 'aqari_properties',
            quality: 'auto:good',
            transformation: [
              { width: 1920, height: 1920, crop: 'limit' }
            ]
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary Upload Stream Error:', error);
              // Capture the structured error from Cloudinary
              Sentry.captureException(error, { 
                extra: { 
                  file_name: file.name, 
                  error_message: error.message 
                }
              });
              // Provide a more generic but still helpful error to the user
              const userFriendlyError = `فشل رفع الصورة "${file.name}". قد تكون هناك مشكلة في الاتصال بخدمة الصور أو أن إعدادات المصادقة غير صحيحة. يرجى المحاولة مرة أخرى.`;
              reject(new Error(userFriendlyError));
            } else if (result) {
              resolve(result.secure_url);
            } else {
              const noResultError = new Error(`فشل رفع ${file.name} من Cloudinary بدون نتيجة.`);
              Sentry.captureException(noResultError);
              reject(noResultError);
            }
          }
        );

        const readableStream = new Readable();
        readableStream.push(buffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
      });
    });

    const urls = await Promise.all(uploadPromises);
    return { success: true, urls };

  } catch (error: any) {
    // This will catch errors from cloudinary.config() if env vars are missing
    // or any other synchronous error before the promises.
    console.error('Error in uploadImages action:', error);
    Sentry.captureException(error);
    
    let errorMessage = 'حدث خطأ غير متوقع أثناء عملية رفع الصور.';
    if (error.message && error.message.includes('Missing required parameter - cloud_name')) {
      errorMessage = 'فشل تهيئة خدمة رفع الصور. تأكد من صحة إعدادات Cloudinary على الخادم.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  }
}
