
"use client";

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, increment, limit, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { GeneralAd } from '@/types';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

const POPUP_SESSION_KEY = 'adPopupShown';

export default function AdPopup() {
  const [ad, setAd] = useState<GeneralAd | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth(); // To avoid showing ads to advertisers/admins

  useEffect(() => {
    const fetchAndShowAd = async () => {
      // Don't show ads to advertisers or admins
      if (user?.roles?.includes('advertiser') || user?.isAdmin) {
        return;
      }

      // Check if an ad has already been shown in this session
      const hasBeenShown = sessionStorage.getItem(POPUP_SESSION_KEY);
      if (hasBeenShown) {
        return;
      }

      try {
        const adsQuery = query(
          collection(db, 'general_ads'),
          where('status', '==', 'active'),
          orderBy('createdAt', 'desc') // Or some other logic for randomness
        );
        const adsSnapshot = await getDocs(adsQuery);
        
        if (!adsSnapshot.empty) {
          const allAds: GeneralAd[] = adsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GeneralAd));
          
          // Select one random ad
          const randomAd = allAds[Math.floor(Math.random() * allAds.length)];
          setAd(randomAd);

          // Increment view count
          const adRef = doc(db, 'general_ads', randomAd.id);
          await updateDoc(adRef, { views: increment(1) });
          
          // Show the ad after a short delay
          setTimeout(() => {
            setIsOpen(true);
            sessionStorage.setItem(POPUP_SESSION_KEY, 'true');
          }, 3000); // 3-second delay
        }
      } catch (error) {
        console.error("Failed to fetch general ad:", error);
      }
    };

    fetchAndShowAd();
  }, [user]);

  const handleCtaClick = async () => {
    if (!ad) return;
    try {
      const adRef = doc(db, 'general_ads', ad.id);
      await updateDoc(adRef, { clicks: increment(1) });
    } catch (error) {
      console.error("Failed to increment ad click count:", error);
    }
    setIsOpen(false);
    // The link will handle the navigation
  };
  
  const handleClose = () => {
    setIsOpen(false);
  }

  if (!ad) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md p-0 border-none gap-0" onInteractOutside={(e) => e.preventDefault()}>
        <div className="relative aspect-video">
           <Image
              src={ad.imageUrl}
              alt={ad.title}
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-t-lg"
              data-ai-hint="advertisement marketing"
            />
             <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2 z-10 rounded-full h-8 w-8 bg-black/40 hover:bg-black/60 text-white"
                onClick={handleClose}
                aria-label="إغلاق الإعلان"
            >
                <X className="h-5 w-5" />
            </Button>
        </div>
        <div className="p-6 text-center">
            <h3 className="text-xl font-bold font-headline mb-2">{ad.title}</h3>
            <p className="text-muted-foreground mb-4">{ad.text}</p>
            <Button asChild size="lg" className="w-full" onClick={handleCtaClick}>
                <Link href={ad.buttonUrl} target="_blank" rel="noopener noreferrer">
                    {ad.buttonText}
                </Link>
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
