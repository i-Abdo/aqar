"use client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState, Suspense } from "react";

// The component that actually uses the hook
function SearchInputWithLogic() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("searchTerm") || "";
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  // Sync state with URL params when they change (e.g., back/forward navigation)
  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedSearchTerm = searchTerm.trim();
    // We create a new URLSearchParams object to avoid modifying the one from the hook directly.
    // This is safer and also allows us to build on existing params if needed.
    const params = new URLSearchParams(searchParams.toString());
    if (trimmedSearchTerm) {
      params.set("searchTerm", trimmedSearchTerm);
    } else {
      params.delete("searchTerm");
    }
    // We push to the properties page with the new search term, preserving other params.
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <Input
        type="search"
        placeholder="ابحث عن منزل، شقة، أو أرض..."
        className="h-10 pr-10 pl-4 rounded-full border-border focus:border-primary transition-smooth text-sm peer bg-background"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        aria-label="بحث عن عقارات"
      />
      <Search
        className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground peer-focus:text-primary transition-colors"
        aria-hidden="true"
      />
    </form>
  );
}

// A simple fallback UI to show while the component is suspended
const SearchInputFallback = () => (
    <div className="relative w-full">
        <Input
            type="search"
            placeholder="تحميل البحث..."
            className="h-10 pr-10 pl-4 rounded-full border-border bg-muted animate-pulse"
            disabled
            aria-label="بحث عن عقارات"
        />
        <Search
            className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
        />
    </div>
);


export function GlobalSearchInput() {
  return (
    <Suspense fallback={<SearchInputFallback />}>
      <SearchInputWithLogic />
    </Suspense>
  );
}
