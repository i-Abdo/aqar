"use client";

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Property, SerializableProperty } from "@/types";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { PropertySearchSidebar, SearchFilters } from "@/components/properties/PropertySearchSidebar";
import { Loader2, SearchIcon, RotateCcw, Filter, Sparkles } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { cn } from '@/lib/utils';
import { PropertyCardSkeleton } from '@/components/properties/PropertyCardSkeleton';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { findProperties, FindPropertiesInput } from '@/ai/flows/find-properties-flow';
import { Input } from '@/components/ui/input';


const PROPERTIES_PER_PAGE = 9;

// Helper to convert SerializableProperty back to Property with Date objects
const deserializeProperties = (props: SerializableProperty[]): Property[] => {
  return props.map(p => ({
    ...p,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
  }));
};

export default function PropertiesPage() {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<SearchFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [smartSearchQuery, setSmartSearchQuery] = useState("");

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      let q = query(collection(db, "properties"), where("status", "==", "active"), orderBy("createdAt", "desc"));
      
      const querySnapshot = await getDocs(q);
      const propsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt),
        updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate() : new Date(doc.data().updatedAt),
      } as Property));
      setAllProperties(propsData);
      applyFilters(propsData, searchCriteria); 
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const applyFilters = useCallback((propertiesToFilter: Property[], filters: SearchFilters) => {
    let result = [...propertiesToFilter];

    if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        result = result.filter(p => 
            p.title.toLowerCase().includes(term) || 
            p.description.toLowerCase().includes(term) ||
            p.city.toLowerCase().includes(term) ||
            p.wilaya.toLowerCase().includes(term) ||
            (p.neighborhood && p.neighborhood.toLowerCase().includes(term)) ||
            (p.otherPropertyType && p.otherPropertyType.toLowerCase().includes(term))
        );
    }
    if (filters.transactionType && filters.transactionType !== "") {
      result = result.filter(p => p.transactionType === filters.transactionType);
    }
    if (filters.propertyType && filters.propertyType !== "") {
      result = result.filter(p => p.propertyType === filters.propertyType);
    }
    if (filters.wilaya) {
      result = result.filter(p => p.wilaya === filters.wilaya);
    }
    if (filters.city) {
      result = result.filter(p => p.city.toLowerCase().includes(filters.city!.toLowerCase()));
    }
    
    setFilteredProperties(result);
    setCurrentPage(1);
  }, []);


  useEffect(() => {
    fetchProperties();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isLoading) {
        applyFilters(allProperties, searchCriteria);
    }
  }, [searchCriteria, allProperties, isLoading, applyFilters]);


  const handleSearch = (filters: SearchFilters) => {
    setSearchCriteria(filters);
    setIsSheetOpen(false); // Close sheet on search/reset
  };

  const handleSmartSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smartSearchQuery.trim()) return;

    setIsAiLoading(true);
    setFilteredProperties([]); // Clear previous results
    try {
      const input: FindPropertiesInput = { query: smartSearchQuery };
      const result = await findProperties(input);
      const deserializedResult = deserializeProperties(result);
      setFilteredProperties(deserializedResult);
      // We are replacing the filter criteria, so we don't merge
      setSearchCriteria({}); // Reset manual filters
    } catch (error) {
      console.error("Error with smart search:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const totalPages = Math.ceil(filteredProperties.length / PROPERTIES_PER_PAGE);
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * PROPERTIES_PER_PAGE,
    currentPage * PROPERTIES_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  const getPaginationItems = () => {
    const items = [];
    const maxPagesToShow = 5; 
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink href="#" isActive={i === currentPage} onClick={(e) => { e.preventDefault(); handlePageChange(i); }}>
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink href="#" isActive={1 === currentPage} onClick={(e) => { e.preventDefault(); handlePageChange(1); }}>
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (currentPage > halfPagesToShow + 2) {
        items.push(<PaginationEllipsis key="start-ellipsis" />);
      }

      let startPage = Math.max(2, currentPage - halfPagesToShow);
      let endPage = Math.min(totalPages - 1, currentPage + halfPagesToShow);
      
      if (currentPage <= halfPagesToShow + 1) {
        endPage = Math.min(totalPages - 1, maxPagesToShow - 2); 
      }
      if (currentPage >= totalPages - halfPagesToShow) {
        startPage = Math.max(2, totalPages - maxPagesToShow + 2); 
      }


      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink href="#" isActive={i === currentPage} onClick={(e) => { e.preventDefault(); handlePageChange(i); }}>
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (currentPage < totalPages - halfPagesToShow - 1) {
        items.push(<PaginationEllipsis key="end-ellipsis" />);
      }
      
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink href="#" isActive={totalPages === currentPage} onClick={(e) => { e.preventDefault(); handlePageChange(totalPages); }}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    return items;
  };


  return (
    <div className="container mx-auto py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-headline text-primary">تصفح العقارات</h1>
        <p className="text-lg text-muted-foreground mt-2">جد العقار الذي يناسب احتياجاتك من بين مئات العروض.</p>
      </header>

      {/* AI Smart Search Bar */}
      <Card className="mb-8 shadow-lg bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-primary" />
            <span>البحث الذكي</span>
          </CardTitle>
          <CardDescription>
            جرب البحث باللغة الطبيعية. مثال: "شقة للكراء في وهران بها 3 غرف"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSmartSearch} className="flex flex-col sm:flex-row gap-2">
            <Input
              value={smartSearchQuery}
              onChange={(e) => setSmartSearchQuery(e.target.value)}
              placeholder="اكتب طلبك هنا..."
              className="flex-grow text-base"
              disabled={isAiLoading}
            />
            <Button type="submit" disabled={isAiLoading || !smartSearchQuery.trim()}>
              {isAiLoading ? <Loader2 className="animate-spin" /> : <SearchIcon />}
              <span className="ml-2">بحث ذكي</span>
            </Button>
          </form>
        </CardContent>
      </Card>


      {/* Mobile-only Filter Button */}
      <div className="mb-6 md:hidden">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline_primary" className="w-full">
              <Filter className="ml-2 rtl:mr-2 rtl:ml-0 h-5 w-5" />
              تصفية البحث اليدوي
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0 flex flex-col">
            <SheetHeader className="p-6 pb-2 border-b shrink-0">
                <SheetTitle className="flex items-center gap-2 text-xl font-headline">
                    <Filter size={22} />
                    <span>تصفية البحث</span>
                </SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto">
                <PropertySearchSidebar onSearch={handleSearch} initialFilters={searchCriteria} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop-only Sidebar */}
        <aside className="hidden md:block md:w-1/3 lg:w-1/4 sticky top-20 self-start">
           <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-headline">
                        <Filter size={24} />
                        <span>تصفية البحث</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <PropertySearchSidebar onSearch={handleSearch} initialFilters={searchCriteria} />
                </CardContent>
            </Card>
        </aside>

        <main className="w-full md:w-2/3 lg:w-3/4">
          {isLoading || isAiLoading ? (
             <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <PropertyCardSkeleton key={index} />
              ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 bg-card shadow-md rounded-lg min-h-[300px]">
              <SearchIcon size={64} className="text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">لا توجد عقارات تطابق بحثك</h2>
              <p className="text-muted-foreground mb-6">حاول تعديل فلاتر البحث أو توسيع نطاق بحثك.</p>
              <Button variant="outline_primary" onClick={() => handleSearch({})}>
                <RotateCcw size={18} className="ml-2 rtl:mr-2 rtl:ml-0" />
                إعادة تعيين جميع الفلاتر
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedProperties.map(prop => (
                  <PropertyCard key={prop.id} property={prop} />
                ))}
              </div>
              {totalPages > 1 && (
                <Pagination className="mt-12">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); if(currentPage > 1) handlePageChange(currentPage - 1);}} 
                        className={cn(currentPage === 1 ? "pointer-events-none opacity-50" : "")}
                      />
                    </PaginationItem>
                    {getPaginationItems()}
                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); if(currentPage < totalPages) handlePageChange(currentPage + 1);}}
                        className={cn(currentPage === totalPages ? "pointer-events-none opacity-50" : "")}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
