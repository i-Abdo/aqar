
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
        src="https://res.cloudinary.com/dgz2rwp09/image/upload/f_auto,q_auto/v1751404879/aqari_properties/s732todiszp2m1nkkjif.png"
        alt="شعار عقاري"
        width={120}
        height={48}
        className="h-12 w-auto"
        priority 
      />
    </Link>
  );
}
    