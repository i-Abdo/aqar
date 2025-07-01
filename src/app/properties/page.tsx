"use client";

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Property } from "@/types";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { PropertySearchSidebar, SearchFilters } from "@/components/properties/PropertySearchSidebar";
import { Loader2, SearchIcon, RotateCcw } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { cn } from '@/lib/utils';

const PROPERTIES_PER_PAGE = 9;

export default function PropertiesPage() {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchCriteria, setSearchCriteria] = useState<SearchFilters>({});
  const [currentPage, setCurrentPage] = useState(1);

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


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-headline text-primary">تصفح العقارات</h1>
        <p className="text-lg text-muted-foreground mt-2">جد العقار الذي يناسب احتياجاتك من بين مئات العروض.</p>
      </header>
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-1/3 xl:w-1/4">
          <PropertySearchSidebar onSearch={handleSearch} initialFilters={searchCriteria} />
        </aside>
        <main className="lg:w-2/3 xl:w-3/4">
          {filteredProperties.length === 0 ? (
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                        className={cn(currentPage === 1 ? "pointer-events-none opacity-50" : "", "transition-smooth")}
                      />
                    </PaginationItem>
                    {getPaginationItems()}
                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); if(currentPage < totalPages) handlePageChange(currentPage + 1);}}
                        className={cn(currentPage === totalPages ? "pointer-events-none opacity-50" : "", "transition-smooth")}
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
