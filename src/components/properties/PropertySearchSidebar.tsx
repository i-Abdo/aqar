
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Search, RotateCcw } from 'lucide-react';
import type { TransactionType, PropertyTypeEnum } from '@/types';

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

const ALL_TRANSACTION_TYPES_VALUE = "_all_transaction_types_";
const ALL_PROPERTY_TYPES_VALUE = "_all_property_types_";
const ALL_WILAYAS_VALUE = "_all_wilayas_";

const transactionTypeOptions: { value: TransactionType | typeof ALL_TRANSACTION_TYPES_VALUE; label: string }[] = [
  { value: ALL_TRANSACTION_TYPES_VALUE, label: "الكل (بيع/كراء)" },
  { value: 'sale', label: 'بيع' },
  { value: 'rent', label: 'كراء' },
];

const propertyTypeOptions: { value: PropertyTypeEnum | typeof ALL_PROPERTY_TYPES_VALUE; label: string }[] = [
  { value: ALL_PROPERTY_TYPES_VALUE, label: "الكل (أنواع العقارات)" },
  { value: 'apartment', label: 'شقة' },
  { value: 'house', label: 'بيت' },
  { value: 'villa', label: 'فيلا' },
  { value: 'land', label: 'أرض' },
  { value: 'office', label: 'مكتب' },
  { value: 'warehouse', label: 'مستودع (قاراج)' },
  { value: 'shop', label: 'حانوت' },
  { value: 'other', label: 'آخر' },
];


export interface SearchFilters {
  transactionType?: TransactionType | "";
  propertyType?: PropertyTypeEnum | "";
  wilaya?: string;
  city?: string;
}

interface PropertySearchSidebarProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

const initialFormState: SearchFilters = {
    transactionType: "",
    propertyType: "",
    wilaya: "", 
    city: "",
};


export function PropertySearchSidebar({ onSearch, initialFilters = {} }: PropertySearchSidebarProps) {
  const [filters, setFilters] = useState<SearchFilters>({
      ...initialFormState,
      ...initialFilters
    });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "wilaya") {
      setFilters(prev => ({ ...prev, [name]: value === ALL_WILAYAS_VALUE ? "" : value, city: "" })); // Reset city when wilaya changes
    } else if (name === "transactionType") {
      setFilters(prev => ({ ...prev, [name]: value === ALL_TRANSACTION_TYPES_VALUE ? "" : value as TransactionType | "" }));
    } else if (name === "propertyType") {
      setFilters(prev => ({ ...prev, [name]: value === ALL_PROPERTY_TYPES_VALUE ? "" : value as PropertyTypeEnum | "" }));
    }
    else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters(initialFormState);
    onSearch(initialFormState); 
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      <div>
        <Label htmlFor="transactionType">نوع المعاملة</Label>
        <Select 
          name="transactionType" 
          value={filters.transactionType || ALL_TRANSACTION_TYPES_VALUE} 
          onValueChange={(value) => handleSelectChange("transactionType", value)}
        >
          <SelectTrigger id="transactionType"><SelectValue placeholder="اختر نوع المعاملة" /></SelectTrigger>
          <SelectContent>
            {transactionTypeOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="propertyType">نوع العقار</Label>
        <Select 
          name="propertyType" 
          value={filters.propertyType || ALL_PROPERTY_TYPES_VALUE} 
          onValueChange={(value) => handleSelectChange("propertyType", value)}
        >
          <SelectTrigger id="propertyType"><SelectValue placeholder="اختر نوع العقار" /></SelectTrigger>
          <SelectContent>
            {propertyTypeOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
          </SelectContent>
        </Select>
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
          disabled={!filters.wilaya} // Disable if no wilaya is selected
        />
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
  );
}
