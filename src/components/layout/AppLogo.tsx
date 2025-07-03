
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AppLogoProps {
  onClick?: () => void;
}

export function AppLogo({ onClick }: AppLogoProps) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className="flex items-center p-2 -m-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Image
        src="https://res.cloudinary.com/dgz2rwp09/image/upload/v1750759328/74751946173_upgo4n.png"
        alt="شعار عقاري"
        width={1024} // Original width for aspect ratio calculation
        height={1024} // Original height for aspect ratio calculation
        className="h-12 w-auto"
        priority // Good to add for LCP elements like logos
      />
    </Link>
  );
}
    
