'use server';

export async function resolveGoogleMapsUrl(url: string): Promise<{ success: boolean; finalUrl: string | null; error: string | null; }> {
  if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return { success: false, finalUrl: null, error: 'رابط غير صالح. يجب أن يبدأ بـ http:// أو https://' };
  }

  try {
    // Fetch follows redirects by default. The `response.url` will be the final URL.
    const response = await fetch(url, { redirect: 'follow' });
    
    // This handles cases where the short URL might lead to a page that's not `ok` but still has a valid maps URL.
    const finalUrl = response.url;

    if (finalUrl && finalUrl.includes('google.com/maps')) {
         return { success: true, finalUrl: finalUrl, error: null };
    } else {
         return { success: false, finalUrl: null, error: 'الرابط لا يؤدي إلى خرائط جوجل صالحة.' };
    }

  } catch (error) {
    console.error("Error resolving Google Maps URL:", error);
    // This catches network errors, DNS issues, etc.
    return { success: false, finalUrl: null, error: 'فشل الوصول إلى الرابط. تحقق من اتصالك أو صحة الرابط.' };
  }
}
