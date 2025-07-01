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

    let lat: number | null = null;
    let lng: number | null = null;

    // Try different patterns to extract coordinates
    const regexPatterns = [
      /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // Preferred: from data block
      /@(-?\d+\.\d+),(-?\d+\.\d+)/,    // Fallback: from URL path
    ];

    for (const pattern of regexPatterns) {
      const match = finalUrl.match(pattern);
      if (match && match[1] && match[2]) {
        lat = parseFloat(match[1]);
        lng = parseFloat(match[2]);
        break; // Found a match, exit loop
      }
    }

    // If still not found, check query parameters as a last resort
    if (lat === null || lng === null) {
      try {
        const urlParams = new URL(finalUrl).searchParams;
        const q = urlParams.get('q');
        const ll = urlParams.get('ll');
        const coordsStr = q || ll;
        if (coordsStr) {
          const coordsMatch = coordsStr.match(/^(-?\d+\.\d+),(-?\d+\.\d+)/);
          if (coordsMatch && coordsMatch[1] && coordsMatch[2]) {
            lat = parseFloat(coordsMatch[1]);
            lng = parseFloat(coordsMatch[2]);
          }
        }
      } catch (e) {
        // Ignore URL parsing errors, we'll fall through to the failure case
      }
    }

    if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
      return { success: false, finalUrl: finalUrl, coordinates: null, error: 'الرابط صحيح ولكن تعذر استخلاص الإحداثيات منه تلقائيًا. حاول استخدام رابط من موقع خرائط جوجل مباشرة.' };
    }
    
    return { success: true, finalUrl: finalUrl, coordinates: { lat, lng }, error: null };

  } catch (error) {
    console.error("Error resolving Google Maps URL:", error);
    return { success: false, finalUrl: null, coordinates: null, error: 'فشل الوصول إلى الرابط. تحقق من اتصالك بالإنترنت أو صحة الرابط.' };
  }
}
