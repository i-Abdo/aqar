
"use client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export function GlobalSearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("searchTerm") || "");

  useEffect(() => {
    // Update searchTerm if URL query param changes (e.g., from PropertySearchSidebar)
    setSearchTerm(searchParams.get("searchTerm") || "");
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedSearchTerm = searchTerm.trim();
    if (trimmedSearchTerm) {
      router.push(`/properties?searchTerm=${encodeURIComponent(trimmedSearchTerm)}`);
    } else {
      router.push("/properties"); // Go to general properties page if search is cleared
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <Input
        type="search"
        placeholder="ابحث عن منزل، شقة، أو أرض..."
        className="h-10 pr-10 pl-4 rounded-full border-border focus:border-primary transition-smooth text-sm peer"
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
