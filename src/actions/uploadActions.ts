'use server';

import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
// This configuration happens once when the module is loaded.
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error("ACTION_ERROR: Cloudinary environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are not fully set. Image uploads will fail.");
} else {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true, // Ensures URLs are HTTPS
    });
    console.log("ACTION_INFO: Cloudinary SDK configured successfully.");
}


export async function uploadImages(files: File[]): Promise<string[]> {
  // Re-check config here in case module loaded but env vars were missing, then somehow set (less likely for server actions)
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary configuration is incomplete. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.");
  }

  if (!files || files.length === 0) {
    return [];
  }

  const uploadPromises = files.map(async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'aqari_properties', // Organize uploads into a specific folder
          quality: 'auto:good',      // Automatically balance quality and file size
          transformation: [          // Apply transformations
            { width: 1920, height: 1920, crop: 'limit' } // Resize if larger than 1920px
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary Upload Stream Error:', error);
            reject(new Error(`Failed to upload ${file.name}: ${error.message || 'Unknown Cloudinary error'}`));
          } else if (result) {
            resolve(result.secure_url);
          } else {
            // This case should ideally not happen if there's no error, but good to cover.
            reject(new Error(`Cloudinary upload failed for ${file.name} without a result object.`));
          }
        }
      );

      // Create a readable stream from the buffer and pipe it to Cloudinary's upload stream
      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null); // Signifies end of stream
      readableStream.pipe(uploadStream);
    });
  });

  try {
    // Wait for all uploads to complete
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading one or more images to Cloudinary:', error);
    // Rethrow a more generic error or handle specific cases
    if (error instanceof Error) {
        throw new Error(`Failed to upload images: ${error.message}`);
    }
    throw new Error('An unknown error occurred during image upload.');
  }
}
