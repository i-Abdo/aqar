"use client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

// A simple fallback UI to show while the component is waiting to mount on the client
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true only on the client-side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // When the component is on the client, sync the search term from the URL
  useEffect(() => {
    if (isClient) {
      setSearchTerm(searchParams.get("searchTerm") || "");
    }
  }, [searchParams, isClient]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedSearchTerm = searchTerm.trim();
    const params = new URLSearchParams(searchParams.toString());
    if (trimmedSearchTerm) {
      params.set("searchTerm", trimmedSearchTerm);
    } else {
      params.delete("searchTerm");
    }
    router.push(`/properties?${params.toString()}`);
  };

  // On the server, and during the initial client render before useEffect runs, show a static fallback.
  // This ensures the server and client render the exact same thing initially.
  if (!isClient) {
    return <SearchInputFallback />;
  }

  // Once the component is mounted on the client, render the actual search form.
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
