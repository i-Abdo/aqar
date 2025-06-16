import { AppLogo } from "@/components/layout/AppLogo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-8 right-8 rtl:right-auto rtl:left-8">
        <AppLogo />
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
