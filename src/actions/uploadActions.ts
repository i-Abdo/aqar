'use server';

import { v2 as cloudinary } from 'cloudinary';
import * as Sentry from "@sentry/nextjs";

interface UploadResult {
  success: boolean;
  urls?: string[];
  error?: string;
}

const configureCloudinary = () => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
        let missingVars = [];
        if (!cloudName) missingVars.push("CLOUDINARY_CLOUD_NAME");
        if (!apiKey) missingVars.push("CLOUDINARY_API_KEY");
        if (!apiSecret) missingVars.push("CLOUDINARY_API_SECRET");
        
        const errorMessage = `إعدادات Cloudinary ناقصة على الخادم. المتغيرات المفقودة: ${missingVars.join(', ')}`;
        console.error("ACTION_ERROR: " + errorMessage);
        Sentry.captureMessage(errorMessage, "error");
        
        throw new Error(errorMessage);
    }

    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
    });
};


// Function to convert a file buffer to a data URI, a reliable way to upload in serverless environments
const bufferToDataURI = (buffer: Buffer, mimeType: string) => {
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

export async function uploadImages(files: File[]): Promise<UploadResult> {
  try {
    configureCloudinary();

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
    Sentry.captureException(error);
    
    // Provide a generic but helpful error message to the user for security.
    const userFriendlyError = error.message.includes("Cloudinary") 
      ? "فشل رفع الصورة بسبب خطأ في إعدادات خدمة الصور. تم إبلاغ الفريق الفني." 
      : "فشل رفع الصورة. قد تكون هناك مشكلة في الاتصال بالخدمة.";
    
    return { success: false, error: userFriendlyError };
  }
}
