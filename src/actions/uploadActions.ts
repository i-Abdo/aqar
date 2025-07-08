
'use server';

import { v2 as cloudinary } from 'cloudinary';
import * as Sentry from "@sentry/nextjs";

interface UploadResult {
  success: boolean;
  urls?: string[];
  error?: string;
}

// Function to convert a file buffer to a data URI, a reliable way to upload in serverless environments
const bufferToDataURI = (buffer: Buffer, mimeType: string) => {
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

export async function uploadImages(files: File[]): Promise<UploadResult> {
  try {
    // Configure Cloudinary inside the action. This ensures it's always configured correctly on the server.
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
      const dataUri = bufferToDataURI(buffer, file.type);
      
      const result = await cloudinary.uploader.upload(dataUri, {
          resource_type: 'image',
          folder: 'aqari_properties',
          quality: 'auto:good',
          transformation: [{ width: 1920, height: 1920, crop: 'limit' }]
      });
      return result.secure_url;
    });

    const urls = await Promise.all(uploadPromises);
    return { success: true, urls };

  } catch (error: any) {
    console.error('Error in uploadImages action:', error);
    Sentry.captureException(error, {
      extra: {
        cloudNameExists: !!process.env.CLOUDINARY_CLOUD_NAME,
        apiKeyExists: !!process.env.CLOUDINARY_API_KEY,
        // Note: We don't log the secret for security reasons.
        errorMessage: error.message
      }
    });
    
    // Provide a generic but helpful error message to the user for security.
    const userFriendlyError = "فشل رفع الصورة. قد تكون هناك مشكلة في الاتصال بخدمة الصور أو أن إعدادات المصادقة غير صحيحة. تم إبلاغ الفريق الفني.";
    
    return { success: false, error: userFriendlyError };
  }
}
