
'use server';

import puppeteer from 'puppeteer';

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

  let browser;
  try {
    // Launch the browser with arguments that are often necessary for server/container environments
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
      protocolTimeout: 40000, // Increase protocol timeout
    });

    const page = await browser.newPage();
    // Set a reasonable navigation timeout
    await page.setDefaultNavigationTimeout(30000); // 30 seconds

    // Navigate to the short URL
    await page.goto(url, { waitUntil: 'networkidle2' }); // Wait until network is idle

    const finalUrl = page.url();

    if (!finalUrl || !finalUrl.includes('google.com/maps')) {
      return { success: false, finalUrl: finalUrl, coordinates: null, error: 'الرابط لا يؤدي إلى خرائط جوجل صالحة.' };
    }

    let lat: number | null = null;
    let lng: number | null = null;

    // More robust regex patterns to find coordinates in various URL formats
    const regexPatterns = [
      /@(-?\d+\.\d+),(-?\d+\.\d+)/,    // Format: /@34.654203,3.231664
      /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // Format: !3d34.654203!4d3.231664
      /daddr=([\d.-]+),([\d.-]+)/, // Format: daddr=34.654,-3.231
      /ll=([\d.-]+),([\d.-]+)/, // Format: ll=34.654,-3.231
    ];

    for (const pattern of regexPatterns) {
      const match = finalUrl.match(pattern);
      if (match && match[1] && match[2]) {
        lat = parseFloat(match[1]);
        lng = parseFloat(match[2]);
        break; // Found a match, exit loop
      }
    }
    
    // Last resort check in the 'q' query parameter
    if (lat === null || lng === null) {
        try {
            const urlObject = new URL(finalUrl);
            const q = urlObject.searchParams.get('q');
            if (q) {
                const coordsMatch = q.match(/^(-?\d+\.\d+), ?(-?\d+\.\d+)/);
                if (coordsMatch && coordsMatch[1] && coordsMatch[2]) {
                    lat = parseFloat(coordsMatch[1]);
                    lng = parseFloat(coordsMatch[2]);
                }
            }
        } catch (e) { /* ignore URL parsing errors */ }
    }


    if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
      return { success: false, finalUrl: finalUrl, coordinates: null, error: 'الرابط صحيح ولكن تعذر استخلاص الإحداثيات منه تلقائيًا. حاول استخدام رابط آخر.' };
    }
    
    return { success: true, finalUrl: finalUrl, coordinates: { lat, lng }, error: null };

  } catch (error: any) {
    console.error("Error resolving Google Maps URL with Puppeteer:", error);
    let errorMessage = 'فشل الوصول إلى الرابط. تحقق من اتصالك بالإنترنت أو صحة الرابط.';
    if (error.name === 'TimeoutError' || error.message.includes('Navigation timeout')) {
        errorMessage = 'انتهت مهلة جلب الرابط. قد يكون الرابط بطيئًا أو غير متاح.';
    }
    return { success: false, finalUrl: null, coordinates: null, error: errorMessage };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
