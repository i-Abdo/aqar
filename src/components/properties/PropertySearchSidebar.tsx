
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Filter, Search, RotateCcw } from 'lucide-react';
import type { Property } from '@/types';

const wilayas = [
  { code: "01", name: "أدرار" }, { code: "02", name: "الشلف" }, { code: "03", name: "الأغواط" }, { code: "04", name: "أم البواقي" },
  { code: "05", name: "باتنة" }, { code: "06", name: "بجاية" }, { code: "07", name: "بسكرة" }, { code: "08", name: "بشار" },
  { code: "09", name: "البليدة" }, { code: "10", name: "البويرة" }, { code: "11", name: "تمنراست" }, { code: "12", name: "تبسة" },
  { code: "13", name: "تلمسان" }, { code: "14", name: "تيارت" }, { code: "15", name: "تيزي وزو" }, { code: "16", name: "الجزائر" },
  { code: "17", name: "الجلفة" }, { code: "18", name: "جيجل" }, { code: "19", name: "سطيف" }, { code: "20", name: "سعيدة" },
  { code: "21", name: "سكيكدة" }, { code: "22", name: "سيدي بلعباس" }, { code: "23", name: "عنابة" }, { code: "24", name: "قالمة" },
  { code: "25", name: "قسنطينة" }, { code: "26", name: "المدية" }, { code: "27", name: "مستغانم" }, { code: "28", name: "المسيلة" },
  { code: "29", name: "معسكر" }, { code: "30", name: "ورقلة" }, { code: "31", name: "وهران" }, { code: "32", name: "البيض" },
  { code: "33", name: "إليزي" }, { code: "34", name: "برج بوعريريج" }, { code: "35", name: "بومرداس" }, { code: "36", name: "الطارف" },
  { code: "37", name: "تندوف" }, { code: "38", name: "تيسمسيلت" }, { code: "39", name: "الوادي" }, { code: "40", name: "خنشلة" },
  { code: "41", name: "سوق أهراس" }, { code: "42", name: "تيبازة" }, { code: "43", name: "ميلة" }, { code: "44", name: "عين الدفلى" },
  { code: "45", name: "النعامة" }, { code: "46", name: "عين تموشنت" }, { code: "47", name: "غرداية" }, { code: "48", name: "غليزان" }
];


export interface SearchFilters {
  wilaya?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minRooms?: number;
  maxRooms?: number;
  features?: Partial<Property['filters']>;
  searchTerm?: string;
}

const MAX_PRICE = 100000000;
const MAX_ROOMS = 10;

const initialFormState: SearchFilters = {
    wilaya: "", 
    city: "",
    minPrice: undefined,
    maxPrice: undefined, // Will be set to MAX_PRICE by default if slider is at max initially
    minRooms: undefined,
    maxRooms: undefined, // Will be set to MAX_ROOMS by default
    features: {
      water: false,
      electricity: false,
      internet: false,
      gas: false,
      contract: false,
    },
    searchTerm: "",
};

const ALL_WILAYAS_VALUE = "_all_wilayas_";


export function PropertySearchSidebar({ onSearch, initialFilters = {} }: PropertySearchSidebarProps) {
  const [filters, setFilters] = useState<SearchFilters>({
      ...initialFormState,
      maxPrice: MAX_PRICE, // Default maxPrice to slider's max
      maxRooms: MAX_ROOMS, // Default maxRooms to slider's max
      ...initialFilters
    });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      setFilters(prev => ({ ...prev, [name]: value ? parseFloat(value) : undefined }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "wilaya" && value === ALL_WILAYAS_VALUE) {
      setFilters(prev => ({ ...prev, [name]: "" })); 
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (name: keyof Property['filters']) => {
    setFilters(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [name]: !prev.features?.[name],
      },
    }));
  };
  
  const handlePriceChange = (value: number[]) => {
    setFilters(prev => ({
        ...prev,
        minPrice: value[0] === 0 ? undefined : value[0],
        maxPrice: value[1], 
    }));
  };
  
  const handleRoomsChange = (value: number[]) => {
    setFilters(prev => ({
        ...prev,
        minRooms: value[0] === 0 ? undefined : value[0],
        maxRooms: value[1] 
    }));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Prepare filters for search, ensuring maxPrice/maxRooms are undefined if they are at slider max for "no limit"
    const searchFilters = {
        ...filters,
        maxPrice: filters.maxPrice === MAX_PRICE ? undefined : filters.maxPrice,
        maxRooms: filters.maxRooms === MAX_ROOMS ? undefined : filters.maxRooms,
    };
    onSearch(searchFilters);
  };

  const handleReset = () => {
    const resetState = {
        ...initialFormState,
        maxPrice: MAX_PRICE,
        maxRooms: MAX_ROOMS,
    };
    setFilters(resetState);
    onSearch(initialFormState); // Pass initialFormState which has undefined for actual filtering
  };

  const featureLabels: Record<keyof Property['filters'], string> = {
    water: "ماء",
    electricity: "كهرباء",
    internet: "إنترنت",
    gas: "غاز",
    contract: "عقد موثق",
  };

  return (
    <Card className="shadow-lg sticky top-20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-headline">
          <Filter size={24} />
          <span>تصفية البحث</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="searchTerm">بحث بالكلمة المفتاحية</Label>
            <Input
              id="searchTerm"
              name="searchTerm"
              value={filters.searchTerm || ""}
              onChange={handleChange}
              placeholder="مثال: شقة، فيلا، بالقرب من..."
            />
          </div>
        
          <div>
            <Label htmlFor="wilaya">الولاية</Label>
            <Select name="wilaya" value={filters.wilaya || ALL_WILAYAS_VALUE} onValueChange={(value) => handleSelectChange("wilaya", value)}>
              <SelectTrigger id="wilaya"><SelectValue placeholder="اختر الولاية" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_WILAYAS_VALUE}>الكل</SelectItem>
                {wilayas.map(w => <SelectItem key={w.code} value={w.name}>{w.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="city">المدينة/البلدية</Label>
            <Input
              id="city"
              name="city"
              value={filters.city || ""}
              onChange={handleChange}
              placeholder="مثال: الجزائر الوسطى"
            />
          </div>

          <div className="space-y-2">
            <Label>السعر (د.ج)</Label>
            <Slider
              dir="rtl"
              value={[filters.minPrice || 0, filters.maxPrice || MAX_PRICE]}
              min={0}
              max={MAX_PRICE}
              step={100000}
              onValueChange={handlePriceChange}
              className="my-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{filters.minPrice ? filters.minPrice.toLocaleString() + ' د.ج' : "الحد الأدنى"}</span>
              <span>
                {filters.maxPrice === MAX_PRICE 
                  ? `${MAX_PRICE.toLocaleString()} د.ج+` 
                  : (filters.maxPrice ? filters.maxPrice.toLocaleString() + ' د.ج' : `${MAX_PRICE.toLocaleString()} د.ج+`)}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>عدد الغرف</Label>
            <Slider
              dir="rtl"
              value={[filters.minRooms || 0, filters.maxRooms || MAX_ROOMS]}
              min={0}
              max={MAX_ROOMS}
              step={1}
              onValueChange={handleRoomsChange}
               className="my-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{filters.minRooms || "الحد الأدنى"}</span>
              <span>
                {filters.maxRooms === MAX_ROOMS
                  ? `${MAX_ROOMS}+`
                  : (filters.maxRooms || `${MAX_ROOMS}+`)}
              </span>
            </div>
          </div>

          <div>
            <Label>الميزات</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {(Object.keys(featureLabels) as Array<keyof Property['filters']>).map((key) => (
                <div key={key} className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Checkbox
                    id={`feature-${key}`}
                    checked={!!filters.features?.[key]}
                    onCheckedChange={() => handleCheckboxChange(key)}
                  />
                  <Label htmlFor={`feature-${key}`} className="font-normal cursor-pointer">{featureLabels[key]}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button type="submit" className="flex-1 transition-smooth">
              <Search size={18} className="ml-2 rtl:mr-2 rtl:ml-0" />
              تطبيق الفلاتر
            </Button>
            <Button type="button" variant="outline" onClick={handleReset} className="flex-1 transition-smooth">
               <RotateCcw size={18} className="ml-2 rtl:mr-2 rtl:ml-0" />
              إعادة تعيين
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
