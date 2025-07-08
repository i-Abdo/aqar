
"use client";

import { cn } from "@/lib/utils";
import { Video } from "lucide-react";

interface VideoPlayerProps {
  url: string;
}

const getEmbedUrl = (url: string): string | null => {
  if (!url) return null;

  let videoId: string | null = null;
  let embedUrl: string | null = null;

  try {
    const urlObj = new URL(url);

    // YouTube
    if (urlObj.hostname.includes("youtube.com") || urlObj.hostname.includes("youtu.be")) {
      if (urlObj.hostname.includes("youtube.com")) {
        if (urlObj.pathname === "/watch") {
          videoId = urlObj.searchParams.get("v");
        } else if (urlObj.pathname.startsWith("/shorts/")) {
          videoId = urlObj.pathname.substring("/shorts/".length);
        } else if (urlObj.pathname.startsWith("/embed/")) {
          videoId = urlObj.pathname.substring("/embed/".length);
        }
      } else if (urlObj.hostname.includes("youtu.be")) {
        videoId = urlObj.pathname.substring(1);
      }
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId.split('?')[0]}`;
      }
    }
    // Facebook
    else if (urlObj.hostname.includes("facebook.com") || urlObj.hostname.includes("fb.watch")) {
      embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=560`;
    }
    // Simple check for other video files
    else if (/\.(mp4|webm|ogv)$/i.test(urlObj.pathname)) {
        return url; // Direct link for video files
    }

    return embedUrl;

  } catch (error) {
    console.error("Invalid URL for video embed:", error);
    return null;
  }
};

export const VideoPlayer = ({ url }: VideoPlayerProps) => {
  const embedUrl = getEmbedUrl(url);

  if (!embedUrl) {
    return (
      <div className="flex flex-col items-center justify-center p-4 border border-dashed rounded-md bg-muted">
         <Video className="h-8 w-8 text-muted-foreground mb-2" />
         <p className="text-sm text-muted-foreground text-center">لا يمكن تضمين هذا الفيديو. قد يكون الرابط خاصًا أو غير مدعوم.</p>
         <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary underline mt-2">
            فتح الفيديو في نافذة جديدة
         </a>
      </div>
    );
  }

  // Check if it's a direct video file link
   if (/\.(mp4|webm|ogv)$/i.test(embedUrl)) {
      return (
         <div className="relative aspect-video w-full">
            <video controls className="w-full h-full rounded-lg" src={embedUrl}>
                متصفحك لا يدعم عرض الفيديو.
            </video>
        </div>
      );
   }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
      <iframe
        src={embedUrl}
        title="Video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute top-0 left-0 h-full w-full"
      ></iframe>
    </div>
  );
};
