import Link from 'next/link';
import Image from 'next/image';

export function AppLogo() {
  return (
    <Link href="/" className="flex items-center">
      <Image 
        src="/logo-aqari.png" 
        alt="شعار عقاري" 
        width={1024} // Original width for aspect ratio calculation
        height={1024} // Original height for aspect ratio calculation
        className="h-10 w-auto" // CSS to control displayed size
      />
    </Link>
  );
}
