"use client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export function GlobalSearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Initialize state directly from searchParams. This is safe in a client component.
  const [searchTerm, setSearchTerm] = useState(searchParams.get("searchTerm") || "");

  // Effect to sync state if the user navigates with back/forward buttons
  useEffect(() => {
    setSearchTerm(searchParams.get("searchTerm") || "");
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedSearchTerm = searchTerm.trim();
    const params = new URLSearchParams(searchParams.toString());
    
    params.delete("searchTerm");

    if (trimmedSearchTerm) {
      params.set("searchTerm", trimmedSearchTerm);
    }
    
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
