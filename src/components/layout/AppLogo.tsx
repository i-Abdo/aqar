
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
        src="https://res.cloudinary.com/dgz2rwp09/image/upload/f_auto,q_auto/v1751599256/c5278e5396324266aff8c48d47f2026c_debzqz.png"
        alt="شعار عقاري"
        width={48} 
        height={48}
        className="h-12 w-12"
        priority 
      />
    </Link>
  );
}
    
