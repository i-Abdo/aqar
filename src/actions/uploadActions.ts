
'use server';

import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

interface UploadResult {
  success: boolean;
  urls?: string[];
  error?: string;
}

export async function uploadImages(files: File[]): Promise<UploadResult> {
  // 1. Centralized check for environment variables.
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    const errorMessage = "إعدادات Cloudinary غير كاملة على الخادم. يرجى التأكد من إضافة متغيرات البيئة CLOUDINARY.";
    console.error(`ACTION_ERROR: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }

  // 2. Configure Cloudinary inside the action, only when it's called.
  try {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    });
  } catch (configError) {
      console.error("Cloudinary config error:", configError);
      return { success: false, error: "فشل في تهيئة خدمة رفع الصور." };
  }

  if (!files || files.length === 0) {
    return { success: true, urls: [] };
  }

  // 3. Map each file to an upload promise.
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
            // This is the key change to provide a user-friendly and actionable error.
            // It's now case-insensitive and more robust.
            if (error.message && error.message.toLowerCase().includes("invalid json response")) {
                const userFriendlyError = "حدث خطأ في المصادقة مع خدمة الصور. يرجى التحقق من صحة إعدادات (CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME) في Vercel.";
                reject(new Error(userFriendlyError));
            } else {
                reject(new Error(`فشل رفع الصورة: ${error.message || 'خطأ غير معروف'}`));
            }
          } else if (result) {
            resolve(result.secure_url);
          } else {
            reject(new Error(`فشل رفع ${file.name} من Cloudinary بدون نتيجة.`));
          }
        }
      );

      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  });

  // 4. Await all promises and handle potential errors.
  try {
    const urls = await Promise.all(uploadPromises);
    return { success: true, urls };
  } catch (error: any) {
    console.error('Error uploading one or more images to Cloudinary:', error);
    // This will now return the clear, user-friendly error message from the promise rejection.
    return { success: false, error: error.message || 'An unknown error occurred during image upload.' };
  }
}
