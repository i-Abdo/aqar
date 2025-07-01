
'use server';

export interface LocationResolutionResult {
  success: boolean;
  finalUrl: string | null;
  coordinates: { lat: number; lng: number } | null;
  error: string | null;
}

export async function resolveGoogleMapsUrl(url: string): Promise<LocationResolutionResult> {
  if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return { success: false, finalUrl: null, coordinates: null, error: 'رابط غير صالح. يجب أن يبدأ بـ http:// أو https://' };
  }

  try {
    const response = await fetch(url, { redirect: 'follow' });
    
    const finalUrl = response.url;

    if (finalUrl && finalUrl.includes('google.com/maps')) {
        const coordRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
        const match = finalUrl.match(coordRegex);

        if (match && match[1] && match[2]) {
            const lat = parseFloat(match[1]);
            const lng = parseFloat(match[2]);
            return { success: true, finalUrl: finalUrl, coordinates: { lat, lng }, error: null };
        } else {
             // Link is valid but couldn't parse coordinates, still a success for the link itself
             return { success: true, finalUrl: finalUrl, coordinates: null, error: 'تم التحقق من الرابط بنجاح، ولكن تعذر استخلاص الإحداثيات.' };
        }
    } else {
         return { success: false, finalUrl: null, coordinates: null, error: 'الرابط لا يؤدي إلى خرائط جوجل صالحة.' };
    }

  } catch (error) {
    console.error("Error resolving Google Maps URL:", error);
    return { success: false, finalUrl: null, coordinates: null, error: 'فشل الوصول إلى الرابط. تحقق من اتصالك أو صحة الرابط.' };
  }
}
