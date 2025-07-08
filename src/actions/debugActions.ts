
'use server';

import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

interface CheckResult {
  success: boolean;
  message: string;
  details?: string;
}

export async function checkArchiveConnection(): Promise<CheckResult> {
  const accessKey = process.env.ARCHIVE_ORG_ACCESS_KEY;
  const secretKey = process.env.ARCHIVE_ORG_SECRET_KEY;

  if (!accessKey || !secretKey) {
    let missingVars = [];
    if (!accessKey) missingVars.push("ARCHIVE_ORG_ACCESS_KEY");
    if (!secretKey) missingVars.push("ARCHIVE_ORG_SECRET_KEY");
    return {
      success: false,
      message: `متغيرات بيئة ناقصة: ${missingVars.join(', ')}`,
    };
  }

  try {
    const s3Client = new S3Client({
      endpoint: 'https://s3.us.archive.org',
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      forcePathStyle: true,
    });

    // A simple command to test credentials and connectivity
    await s3Client.send(new ListBucketsCommand({}));

    return {
      success: true,
      message: "نجح الاتصال بخدمة الأرشفة والمصادقة.",
      details: "متغيرات البيئة موجودة، وتمكن الخادم من الاتصال بنجاح."
    };
  } catch (error: any) {
    console.error("Archive.org connection check failed:", error);
    return {
      success: false,
      message: "فشل الاتصال بخدمة الأرشفة أو المصادقة.",
      details: `رسالة الخطأ الأصلية من الخادم: ${error.name} - ${error.message}`,
    };
  }
}
