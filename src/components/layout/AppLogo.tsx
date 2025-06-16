import Link from 'next/link';
import { Building2 } from 'lucide-react'; // Example Icon

export function AppLogo() {
  return (
    <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse">
      <Building2 className="h-8 w-8 text-primary" />
      <span className="text-2xl font-bold font-headline text-primary">DarDz</span>
    </Link>
  );
}
