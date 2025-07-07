
'use server';

interface DebugInfo {
    cloudNameExists: boolean;
    apiKeyExists: boolean;
    apiSecretExists: boolean;
    envNode: string;
}

/**
 * Checks for the existence of Cloudinary environment variables on the server.
 * This is a safe way to debug deployment issues without exposing secret keys.
 * @returns An object indicating whether each required variable was found.
 */
export async function getCloudinaryConfigStatus(): Promise<DebugInfo> {
    return {
        cloudNameExists: !!process.env.CLOUDINARY_CLOUD_NAME,
        apiKeyExists: !!process.env.CLOUDINARY_API_KEY,
        apiSecretExists: !!process.env.CLOUDINARY_API_SECRET,
        envNode: process.env.NODE_ENV,
    };
}
