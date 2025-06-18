
import Link from 'next/link';
import Image from 'next/image';

export function AppLogo() {
  return (
    <Link href="/" className="flex items-center">
      <Image
        src="https://res.cloudinary.com/dgz2rwp09/image/upload/v1750257678/logo-aqari_yb470x.png"
        alt="شعار عقاري"
        width={1024} // Original width for aspect ratio calculation
        height={1024} // Original height for aspect ratio calculation
        className="h-12 w-auto" // Changed from h-10 to h-12
        priority // Good to add for LCP elements like logos
      />
    </Link>
  );
}
