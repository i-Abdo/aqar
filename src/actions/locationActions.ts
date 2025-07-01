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

    if (!finalUrl || !finalUrl.includes('google.com/maps')) {
      return { success: false, finalUrl: finalUrl, coordinates: null, error: 'الرابط لا يؤدي إلى خرائط جوجل صالحة.' };
    }

    const coordRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = finalUrl.match(coordRegex);

    if (!match || !match[1] || !match[2]) {
      return { success: false, finalUrl: finalUrl, coordinates: null, error: 'الرابط صحيح ولكن تعذر استخلاص الإحداثيات منه تلقائيًا. حاول استخدام رابط من موقع خرائط جوجل مباشرة.' };
    }
    
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);

    if (isNaN(lat) || isNaN(lng)) {
      return { success: false, finalUrl: finalUrl, coordinates: null, error: 'فشل تحليل الإحداثيات من الرابط.' };
    }

    return { success: true, finalUrl: finalUrl, coordinates: { lat, lng }, error: null };

  } catch (error) {
    console.error("Error resolving Google Maps URL:", error);
    return { success: false, finalUrl: null, coordinates: null, error: 'فشل الوصول إلى الرابط. تحقق من اتصالك بالإنترنت أو صحة الرابط.' };
  }
}
