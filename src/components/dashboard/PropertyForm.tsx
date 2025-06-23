
"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AiDescriptionAssistant } from "./AiDescriptionAssistant";
import { Loader2, Droplet, Zap, Wifi, FileText, BedDouble, Bath, MapPin, DollarSign, ImageUp, Trash2, UtilityPole, Image as ImageIcon, XCircle, Phone, Ruler, Tag, Building, Map } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Property, TransactionType, PropertyTypeEnum } from "@/types";
import { plans } from "@/config/plans";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation"; 

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];


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

const algerianPhoneNumberRegex = /^0[567]\d{8}$/;

const transactionTypes: { value: TransactionType; label: string }[] = [
  { value: 'sale', label: 'بيع' },
  { value: 'rent', label: 'كراء' },
];

const propertyTypes: { value: PropertyTypeEnum; label: string }[] = [
  { value: 'apartment', label: 'شقة' },
  { value: 'house', label: 'بيت' },
  { value: 'villa', label: 'فيلا' },
  { value: 'land', label: 'أرض' },
  { value: 'office', label: 'مكتب' },
  { value: 'warehouse', label: 'مستودع (قاراج)' },
  { value: 'shop', label: 'حانوت' },
  { value: 'other', label: 'آخر' },
];

const propertyFormSchema = z.object({
  title: z.string().min(5, "العنوان يجب أن لا يقل عن 5 أحرف.").max(150, "العنوان طويل جدًا (الحد الأقصى 150 حرفًا)."),
  transactionType: z.enum(['sale', 'rent'], { required_error: "نوع المعاملة مطلوب." }),
  propertyType: z.enum(['land', 'villa', 'house', 'apartment', 'office', 'warehouse', 'shop', 'other'], { required_error: "نوع العقار مطلوب." }),
  otherPropertyType: z.string().max(50, "نوع العقار الآخر طويل جدًا.").optional(),
  price: z.coerce.number({invalid_type_error: "السعر يجب أن يكون رقمًا."}).positive("السعر يجب أن يكون رقمًا موجبًا.").min(1, "السعر لا يمكن أن يكون صفرًا.").max(1_000_000_000_000, "السعر كبير جدًا."), // 1 Trillion DA limit
  rooms: z.coerce.number().int().min(0, "عدد الغرف لا يمكن أن يكون سالبًا.").max(100, "عدد الغرف كبير جدًا."), // Allow 0 for land
  bathrooms: z.coerce.number().int().min(0, "عدد الحمامات لا يمكن أن يكون سالبًا.").max(50, "عدد الحمامات كبير جدًا."), // Allow 0 for land
  length: z.coerce.number().positive("الطول يجب أن يكون رقمًا موجبًا.").min(0.1, "الطول يجب أن يكون أكبر من صفر.").max(10000, "الطول كبير جدًا."),
  width: z.coerce.number().positive("العرض يجب أن يكون رقمًا موجبًا.").min(0.1, "العرض يجب أن يكون أكبر من صفر.").max(10000, "العرض كبير جدًا."),
  area: z.coerce.number().positive("المساحة يجب أن تكون رقمًا موجبًا.").max(1000000, "المساحة كبيرة جدًا."), // Max 1 million m^2
  wilaya: z.string().min(1, "الولاية مطلوبة."),
  city: z.string().min(2, "المدينة مطلوبة.").max(100, "اسم المدينة طويل جدًا."),
  neighborhood: z.string().max(100, "اسم الحي طويل جدًا.").optional(),
  address: z.string().max(250, "العنوان التفصيلي طويل جدًا.").optional(),
  phoneNumber: z.string()
    .min(1, "رقم الهاتف مطلوب.")
    .regex(algerianPhoneNumberRegex, {
        message: "رقم الهاتف غير صالح. يجب أن يبدأ بـ 05، 06، أو 07 ويتبعه 8 أرقام.",
    }),
  description: z.string().min(20, "الوصف يجب أن لا يقل عن 20 حرفًا.").max(1000, "الوصف يجب أن لا يتجاوز 1000 حرفًا."), // Increased max length
  filters: z.object({
    water: z.boolean().default(false),
    electricity: z.boolean().default(false),
    internet: z.boolean().default(false),
    gas: z.boolean().default(false),
    contract: z.boolean().default(false),
  }),
  googleMapsLocation: z.object({
      lat: z.coerce.number().min(-90).max(90),
      lng: z.coerce.number().min(-180).max(180),
  }).optional()
}).superRefine((data, ctx) => {
  if (data.propertyType === 'other' && (!data.otherPropertyType || data.otherPropertyType.trim().length < 2)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "الرجاء تحديد نوع العقار الآخر (حرفين على الأقل).",
      path: ["otherPropertyType"],
    });
  }
  if (data.propertyType !== 'other' && data.otherPropertyType) {
    data.otherPropertyType = undefined;
  }
  if (data.propertyType === 'land' && (data.rooms > 0 || data.bathrooms > 0)) {
    if(data.rooms > 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "الأرض لا تحتوي على غرف.", path: ["rooms"]});
    if(data.bathrooms > 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "الأرض لا تحتوي على حمامات.", path: ["bathrooms"]});
  }
});

export type PropertyFormValues = z.infer<typeof propertyFormSchema>;

interface PropertyFormProps {
  onSubmit: (
    data: PropertyFormValues,
    mainImageFile: File | null,
    additionalImageFiles: File[],
    mainImagePreviewFromState: string | null, 
    additionalImagePreviewsFromState: string[] 
  ) => Promise<void>;
  initialData?: Property | null; 
  isLoading?: boolean;
  isEditMode?: boolean;
}

type PriceUnitKey = 'THOUSAND_DA' | 'MILLION_DA' | 'BILLION_DA';

const unitMultipliers: Record<PriceUnitKey, number> = {
  THOUSAND_DA: 1000,
  MILLION_DA: 1_000_000,
  BILLION_DA: 1_000_000_000,
};

const unitLabels: Record<PriceUnitKey, string> = {
  THOUSAND_DA: "ألف د.ج",
  MILLION_DA: "مليون د.ج",
  BILLION_DA: "مليار د.ج",
};

const formatPriceForInputUIDisplay = (price: number | undefined): { displayValue: string; unitKey: PriceUnitKey } => {
  if (price === undefined || price === null || isNaN(price) || price <= 0) {
    return { displayValue: "", unitKey: "THOUSAND_DA" }; 
  }

  const unitsPriority: PriceUnitKey[] = ["BILLION_DA", "MILLION_DA", "THOUSAND_DA"];

  for (const unit of unitsPriority) {
    if (price >= unitMultipliers[unit] && (price % unitMultipliers[unit] === 0 || price / unitMultipliers[unit] >= 1)) {
      const val = price / unitMultipliers[unit];
       if (Number.isInteger(val) || val.toString().split('.')[1]?.length <= 2) {
          return { displayValue: Number(val.toFixed(2)).toString(), unitKey: unit };
       }
    }
  }
  const valInThousand = price / unitMultipliers.THOUSAND_DA;
  return { displayValue: Number(valInThousand.toFixed(2)).toString(), unitKey: "THOUSAND_DA" };
};


export function PropertyForm({ onSubmit, initialData, isLoading, isEditMode = false }: PropertyFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter(); 

  const [mainImageFile, setMainImageFile] = React.useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = React.useState<string | null>(null);

  const [additionalImageFiles, setAdditionalImageFiles] = React.useState<File[]>([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = React.useState<string[]>([]);

  const [maxAdditionalImages, setMaxAdditionalImages] = React.useState(0);
  const [aiAssistantAllowed, setAiAssistantAllowed] = React.useState(false);
  const [imageLimitPerProperty, setImageLimitPerProperty] = React.useState(1);

  const initialPriceFormat = React.useMemo(() => formatPriceForInputUIDisplay(initialData?.price), [initialData?.price]);
  const [manualPriceInput, setManualPriceInput] = React.useState<string>(initialPriceFormat.displayValue);
  const [selectedUnit, setSelectedUnit] = React.useState<PriceUnitKey>(initialPriceFormat.unitKey || "THOUSAND_DA");
  
  const [locationInput, setLocationInput] = React.useState('');


  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: initialData 
      ? { 
          ...initialData, 
          price: initialData.price || undefined,
          transactionType: initialData.transactionType || undefined,
          propertyType: initialData.propertyType || undefined,
          otherPropertyType: initialData.otherPropertyType || "",
          googleMapsLocation: initialData.googleMapsLocation || undefined,
        } 
      : {
          title: "", price: undefined, transactionType: undefined, propertyType: undefined, otherPropertyType: "",
          rooms: undefined, bathrooms: undefined, length: undefined, width: undefined, area: undefined,
          wilaya: "", city: "", neighborhood: "", address: "", phoneNumber: "", description: "",
          filters: { water: false, electricity: false, internet: false, gas: false, contract: false },
          googleMapsLocation: undefined,
        },
  });
  
  const { formState: { isDirty: isFormFieldsDirty } } = form;

  React.useEffect(() => {
    if (initialData) {
      const { displayValue, unitKey } = formatPriceForInputUIDisplay(initialData.price);
      setManualPriceInput(displayValue);
      setSelectedUnit(unitKey);
      if (initialData.googleMapsLocation?.lat && initialData.googleMapsLocation?.lng) {
        setLocationInput(`${initialData.googleMapsLocation.lat}, ${initialData.googleMapsLocation.lng}`);
      } else {
        setLocationInput('');
      }
      form.reset({
        ...initialData,
        filters: initialData.filters || { water: false, electricity: false, internet: false, gas: false, contract: false },
        price: initialData.price || undefined, 
        transactionType: initialData.transactionType || undefined,
        propertyType: initialData.propertyType || undefined,
        otherPropertyType: initialData.otherPropertyType || "",
        googleMapsLocation: initialData.googleMapsLocation || undefined,
      });
       if (initialData.imageUrls && initialData.imageUrls.length > 0) {
        setMainImagePreview(initialData.imageUrls[0]);
        setAdditionalImagePreviews(initialData.imageUrls.slice(1));
      } else {
        setMainImagePreview(null);
        setAdditionalImagePreviews([]);
      }
    } else if (!isEditMode) {
        const defaultFormat = formatPriceForInputUIDisplay(undefined);
        setManualPriceInput(defaultFormat.displayValue);
        setSelectedUnit(defaultFormat.unitKey);
        setLocationInput('');
        form.reset({
            title: "", price: undefined, transactionType: undefined, propertyType: undefined, otherPropertyType: "",
            rooms: undefined, bathrooms: undefined, length: undefined, width: undefined, area: undefined,
            wilaya: "", city: "", neighborhood: "", address: "", phoneNumber: "", description: "",
            filters: { water: false, electricity: false, internet: false, gas: false, contract: false },
            googleMapsLocation: undefined,
        });
        setMainImagePreview(null);
        setAdditionalImagePreviews([]);
    }
  }, [initialData, form, isEditMode]);

  React.useEffect(() => {
    if (user && user.planId) {
      const planDetails = plans.find(p => p.id === user.planId);
      if (planDetails) {
        setImageLimitPerProperty(planDetails.imageLimitPerProperty);
        setMaxAdditionalImages(planDetails.imageLimitPerProperty > 0 ? planDetails.imageLimitPerProperty -1 : 0);
        setAiAssistantAllowed(planDetails.aiAssistantAccess);
      }
    }
  }, [user]);

  const lengthValue = form.watch("length");
  const widthValue = form.watch("width");
  const watchedPropertyType = form.watch("propertyType");
  const watchedLocation = form.watch("googleMapsLocation");
  
   React.useEffect(() => {
    const parseAndSetLocation = (input: string) => {
      if (!input.trim()) {
        form.setValue("googleMapsLocation", undefined, { shouldValidate: true, shouldDirty: true });
        return;
      }

      // Regex for lat,lng format e.g., "36.77, 3.05"
      let match = input.match(/^(-?\d{1,3}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)$/);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          form.setValue("googleMapsLocation", { lat, lng }, { shouldValidate: true, shouldDirty: true });
          return;
        }
      }

      // Regex for Google Maps URL format e.g., ".../@36.77,3.05,15z..."
      match = input.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          form.setValue("googleMapsLocation", { lat, lng }, { shouldValidate: true, shouldDirty: true });
          return;
        }
      }
      
      // If no valid format is found, clear the location
      form.setValue("googleMapsLocation", undefined, { shouldValidate: true, shouldDirty: true });
    };

    parseAndSetLocation(locationInput);
  }, [locationInput, form]);


  React.useEffect(() => {
    const lengthNum = parseFloat(String(lengthValue));
    const widthNum = parseFloat(String(widthValue));

    if (!isNaN(lengthNum) && lengthNum > 0 && !isNaN(widthNum) && widthNum > 0) {
      const calculatedArea = lengthNum * widthNum;
      form.setValue("area", parseFloat(calculatedArea.toFixed(2)), { shouldValidate: true, shouldDirty: true });
    } else if (form.getValues("area") !== undefined && (isNaN(lengthNum) || isNaN(widthNum))) { 
      form.setValue("area", undefined as any, { shouldValidate: true, shouldDirty: true }); 
    }
  }, [lengthValue, widthValue, form]);

  React.useEffect(() => {
    const numericInput = parseFloat(manualPriceInput);
    if (!isNaN(numericInput) && numericInput > 0) {
      form.setValue('price', numericInput * (unitMultipliers[selectedUnit] || 1000), { shouldValidate: true, shouldDirty: true });
    } else if (manualPriceInput === "" && form.getValues("price") !== undefined) {
        form.setValue('price', undefined as any, { shouldValidate: true, shouldDirty: true });
    } else if (isNaN(numericInput) && manualPriceInput !== "" && form.getValues("price") !== undefined) {
        form.setValue('price', undefined as any, { shouldValidate: true, shouldDirty: true });
    }
  }, [manualPriceInput, selectedUnit, form]);


  const handleMainImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast({ title: "خطأ", description: `نوع الملف غير مدعوم. الأنواع المسموح بها: ${ALLOWED_IMAGE_TYPES.join(", ")}`, variant: "destructive" });
        event.target.value = ""; // Reset file input
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) { 
        toast({ title: "خطأ", description: `حجم الصورة الرئيسية يجب أن لا يتجاوز ${MAX_FILE_SIZE_MB}MB.`, variant: "destructive" });
        event.target.value = ""; // Reset file input
        return;
      }
      setMainImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.trigger(); 
    }
  };

  const removeMainImage = () => {
    setMainImageFile(null);
    setMainImagePreview(null);
     const mainImageInput = document.getElementById('mainImage') as HTMLInputElement | null;
    if (mainImageInput) mainImageInput.value = "";
    form.trigger(); 
  };

  const handleAdditionalImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      const currentTotalAdditional = additionalImagePreviews.length; 
      const remainingSlots = maxAdditionalImages - currentTotalAdditional;
      
      if (remainingSlots <= 0 && filesArray.length > 0) {
         toast({
          title: "تنبيه",
          description: `لقد وصلت للحد الأقصى للصور الإضافية (${maxAdditionalImages}).`,
          variant: "default",
        });
        event.target.value = ""; // Reset file input
        return;
      }

      const filesToUploadTemp: File[] = [];
      const previewsToUploadTemp: string[] = [];
      let filesSkipped = 0;

      for (const file of filesArray) {
        if (previewsToUploadTemp.length < remainingSlots) { 
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                toast({ title: "خطأ", description: `نوع الملف ${file.name} غير مدعوم.`, variant: "destructive" });
                filesSkipped++;
                continue;
            }
            if (file.size > MAX_FILE_SIZE_BYTES) { 
                toast({ title: "خطأ", description: `حجم الملف ${file.name} يتجاوز ${MAX_FILE_SIZE_MB}MB.`, variant: "destructive" });
                filesSkipped++;
                continue;
            }
            filesToUploadTemp.push(file);
            previewsToUploadTemp.push(URL.createObjectURL(file));
        } else {
            filesSkipped++; // Count files skipped due to reaching max limit
        }
      }
      
      if (filesSkipped > 0) {
         toast({
          title: "تنبيه",
          description: `تم تخطي ${filesSkipped} ملفات بسبب تجاوز الحد الأقصى للصور أو نوع/حجم الملفات غير صالح. تم تحميل ${filesToUploadTemp.length} ملفات صالحة.`,
          variant: "default",
        });
      }

      setAdditionalImageFiles(prev => [...prev, ...filesToUploadTemp]);
      setAdditionalImagePreviews(prev => [...prev, ...previewsToUploadTemp]);
      event.target.value = ""; // Reset file input after processing
      form.trigger();
    }
  };

  const removeAdditionalImage = (indexToRemove: number) => {
    const targetPreview = additionalImagePreviews[indexToRemove];
    if (targetPreview.startsWith('blob:')) {
      const blobPreviews = additionalImagePreviews.filter(p => p.startsWith('blob:'));
      let fileIndexToRemove = -1;
      let currentBlobIndex = 0;
      for(let i=0; i<additionalImagePreviews.length; i++) {
        if(additionalImagePreviews[i].startsWith('blob:')) {
          if(i === indexToRemove) {
            fileIndexToRemove = currentBlobIndex;
            break;
          }
          currentBlobIndex++;
        }
      }
      if(fileIndexToRemove !== -1) {
        setAdditionalImageFiles(prevFiles => prevFiles.filter((_, i) => i !== fileIndexToRemove));
      }
    }
    setAdditionalImagePreviews(prevPreviews => prevPreviews.filter((_, i) => i !== indexToRemove));
    form.trigger();
  };
  
  const handleFormSubmit = (data: PropertyFormValues) => {
     const totalImages = (mainImagePreview ? 1 : 0) + additionalImagePreviews.length;

     if (totalImages > imageLimitPerProperty) {
        toast({
            title: "تجاوز حد الصور",
            description: `خطتك (${plans.find(p => p.id === user?.planId)?.name || 'غير محددة'}) تسمح بـ ${imageLimitPerProperty} صور كحد أقصى. لديك حاليًا ${totalImages} صور.`,
            variant: "destructive"
        });
        return;
     }
    onSubmit(data, mainImageFile, additionalImageFiles, mainImagePreview, additionalImagePreviews);
  };
  
  const currentDescription = form.watch("description");
  const onDescriptionChange = (newDescription: string) => {
    form.setValue("description", newDescription, { shouldDirty: true });
  };
  
  const imagesChanged = React.useMemo(() => {
    if (!isEditMode) return false;

    if (mainImageFile || additionalImageFiles.length > 0) {
      return true;
    }

    const initialUrls = initialData?.imageUrls || [];
    const currentUrls = [mainImagePreview, ...additionalImagePreviews].filter(Boolean) as string[];

    if (initialUrls.length !== currentUrls.length) {
      return true;
    }

    return !initialUrls.every((url, index) => url === currentUrls[index]);
  }, [isEditMode, mainImageFile, additionalImageFiles, mainImagePreview, additionalImagePreviews, initialData]);

  const isAnythingDirty = isFormFieldsDirty || imagesChanged;

  const isSaveButtonDisabled = isLoading || !mainImagePreview || (isEditMode && !isAnythingDirty);


  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">
          {isEditMode ? "تعديل العقار" : "إضافة عقار جديد"}
        </CardTitle>
        <CardDescription>
          املأ التفاصيل أدناه ل{isEditMode ? "تعديل" : "نشر"} عقارك. الحقول المميزة بـ * إلزامية.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
          
          <div className="space-y-3">
            <h3 className="text-lg font-semibold font-headline border-b pb-1">المعلومات الأساسية</h3>
            <div>
              <Label htmlFor="title">عنوان الإعلان *</Label>
              <Input id="title" {...form.register("title")} placeholder="مثال: شقة فاخرة مطلة على البحر" />
              {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="transactionType" className="flex items-center gap-1"><Tag size={16}/>نوع المعاملة *</Label>
                <Controller
                  name="transactionType"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""} >
                      <SelectTrigger><SelectValue placeholder="اختر نوع المعاملة" /></SelectTrigger>
                      <SelectContent>
                        {transactionTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.transactionType && <p className="text-sm text-destructive">{form.formState.errors.transactionType.message}</p>}
              </div>
              <div>
                <Label htmlFor="propertyType" className="flex items-center gap-1"><Building size={16}/>نوع العقار *</Label>
                 <Controller
                  name="propertyType"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""} >
                      <SelectTrigger><SelectValue placeholder="اختر نوع العقار" /></SelectTrigger>
                      <SelectContent>
                        {propertyTypes.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.propertyType && <p className="text-sm text-destructive">{form.formState.errors.propertyType.message}</p>}
              </div>
            </div>
            
            {watchedPropertyType === 'other' && (
              <div>
                <Label htmlFor="otherPropertyType">نوع العقار (آخر) *</Label>
                <Input id="otherPropertyType" {...form.register("otherPropertyType")} placeholder="اكتب النوع الآخر هنا..." />
                {form.formState.errors.otherPropertyType && <p className="text-sm text-destructive">{form.formState.errors.otherPropertyType.message}</p>}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                 <div>
                    <Label htmlFor="manualPriceInput" className="flex items-center gap-1"><DollarSign size={16}/>السعر *</Label>
                    <div className="flex gap-2">
                        <Input 
                            lang="en" 
                            id="manualPriceInput" 
                            type="text" 
                            value={manualPriceInput}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (/^\d*\.?\d*$/.test(val)) { // Allow numbers and one decimal point
                                    setManualPriceInput(val);
                                }
                            }}
                            placeholder="--" 
                            className="input-latin-numerals" 
                        />
                        <Select value={selectedUnit} onValueChange={(value) => setSelectedUnit(value as PriceUnitKey)}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="الوحدة" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(unitLabels).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {form.formState.errors.price && <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>}
                </div>
                <div>
                    <Label htmlFor="phoneNumber" className="flex items-center gap-1"><Phone size={16}/>رقم الهاتف *</Label>
                    <Input id="phoneNumber" type="tel" {...form.register("phoneNumber")} placeholder="06XXXXXXXX" />
                    {form.formState.errors.phoneNumber && <p className="text-sm text-destructive">{form.formState.errors.phoneNumber.message}</p>}
                </div>
            </div>


            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rooms" className="flex items-center gap-1"><BedDouble size={16}/>عدد الغرف *</Label>
                <Input lang="en" id="rooms" type="number" {...form.register("rooms")} placeholder="--" className="input-latin-numerals" />
                {form.formState.errors.rooms && <p className="text-sm text-destructive">{form.formState.errors.rooms.message}</p>}
              </div>
              <div>
                <Label htmlFor="bathrooms" className="flex items-center gap-1"><Bath size={16}/>عدد الحمامات *</Label>
                <Input lang="en" id="bathrooms" type="number" {...form.register("bathrooms")} placeholder="--" className="input-latin-numerals" />
                {form.formState.errors.bathrooms && <p className="text-sm text-destructive">{form.formState.errors.bathrooms.message}</p>}
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="length" className="flex items-center gap-1"><Ruler size={16}/>الطول (متر) *</Label>
                <Input lang="en" id="length" type="number" step="0.01" {...form.register("length")} placeholder="--" className="input-latin-numerals" />
                {form.formState.errors.length && <p className="text-sm text-destructive">{form.formState.errors.length.message}</p>}
              </div>
              <div>
                <Label htmlFor="width" className="flex items-center gap-1"><Ruler size={16}/>العرض (متر) *</Label>
                <Input lang="en" id="width" type="number" step="0.01" {...form.register("width")} placeholder="--" className="input-latin-numerals" />
                {form.formState.errors.width && <p className="text-sm text-destructive">{form.formState.errors.width.message}</p>}
              </div>
              <div>
                <Label htmlFor="area" className="flex items-center gap-1"><Ruler size={16}/>المساحة (م²)</Label>
                <Input lang="en" id="area" type="number" step="0.01" {...form.register("area")} className="input-latin-numerals bg-muted/50" readOnly placeholder="سيتم حسابها تلقائيًا" />
                {form.formState.errors.area && <p className="text-sm text-destructive">{form.formState.errors.area.message}</p>}
              </div>
            </div>
          </div>

          
          <div className="space-y-3">
            <h3 className="text-lg font-semibold font-headline border-b pb-1 flex items-center gap-1"><MapPin size={18}/>الموقع</h3>
             <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="wilaya">الولاية *</Label>
                  <Controller
                    name="wilaya"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={(value) => field.onChange(value)} value={field.value || ""} >
                        <SelectTrigger><SelectValue placeholder="اختر الولاية" /></SelectTrigger>
                        <SelectContent>
                          {wilayas.map(w => <SelectItem key={w.code} value={w.name}>{w.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.wilaya && <p className="text-sm text-destructive">{form.formState.errors.wilaya.message}</p>}
                </div>
                <div>
                  <Label htmlFor="city">المدينة/البلدية *</Label>
                  <Input id="city" {...form.register("city")} placeholder="مثال: الجزائر الوسطى" />
                  {form.formState.errors.city && <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>}
                </div>
             </div>
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="neighborhood">الحي (اختياري)</Label>
                  <Input id="neighborhood" {...form.register("neighborhood")} placeholder="مثال: حي النصر" />
                </div>
                 <div>
                  <Label htmlFor="address">العنوان التفصيلي (اختياري)</Label>
                  <Input id="address" {...form.register("address")} placeholder="مثال: شارع الحرية، رقم 15" />
                </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold font-headline border-b pb-1 flex items-center gap-1"><Map size={18}/>الموقع على الخريطة (اختياري)</h3>
            <div>
                <Label htmlFor="locationInput">رابط أو إحداثيات الموقع</Label>
                 <Input 
                    id="locationInput" 
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder="الصق رابط خرائط جوجل أو الإحداثيات هنا"
                    dir="ltr" 
                    className="text-left"
                />
                <p className="text-xs text-muted-foreground mt-1">مثال: 36.77, 3.05 أو رابط خرائط جوجل الكامل.</p>
                {form.formState.errors.googleMapsLocation && (
                     <p className="text-sm text-destructive mt-1">الرجاء إدخال إحداثيات أو رابط صحيح.</p>
                )}
            </div>
            
             <Button type="button" variant="outline_secondary" asChild className="transition-smooth hover:shadow-md">
                <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">
                    <MapPin size={16} className="ml-2 rtl:mr-2 rtl:ml-0"/>
                    جلب الإحداثيات من خرائط جوجل
                </a>
            </Button>
            {watchedLocation?.lat && watchedLocation?.lng && (
                <div className="mt-4 aspect-video w-full rounded-md overflow-hidden border">
                    <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        src={`https://maps.google.com/maps?q=${watchedLocation.lat},${watchedLocation.lng}&hl=ar&z=15&output=embed`}
                    ></iframe>
                </div>
            )}
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-semibold font-headline border-b pb-1">الميزات والخدمات</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {(Object.keys(form.getValues().filters || {}) as Array<keyof PropertyFormValues['filters']>).map((key) => {
                const Icon = key === 'water' ? Droplet : key === 'electricity' ? Zap : key === 'internet' ? Wifi : key === 'gas' ? UtilityPole : FileText;
                const label = key === 'water' ? 'ماء' : key === 'electricity' ? 'كهرباء' : key === 'internet' ? 'إنترنت' : key === 'gas' ? 'غاز' : 'عقد موثق';
                return (
                  <div key={key} className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Controller
                        name={`filters.${key}`}
                        control={form.control}
                        render={({ field }) => (
                             <Checkbox id={`filters.${key}`} checked={field.value} onCheckedChange={field.onChange} />
                        )}
                    />
                    <Label htmlFor={`filters.${key}`} className="flex items-center gap-1 cursor-pointer">
                      <Icon size={16} className="text-primary" /> {label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>

          
          <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold font-headline border-b pb-2 mb-2 flex items-center gap-1"><ImageIcon size={18}/>صورة العقار الرئيسية *</h3>
                <Input id="mainImage" type="file" onChange={handleMainImageChange} accept={ALLOWED_IMAGE_TYPES.join(",")} />
                <p className="text-xs text-muted-foreground mt-1">الأنواع المسموح بها: JPG, PNG, WEBP. الحجم الأقصى: ${MAX_FILE_SIZE_MB}MB.</p>
                {mainImagePreview && (
                    <div className="mt-4 relative group w-48">
                    <Image src={mainImagePreview} alt="معاينة الصورة الرئيسية" width={200} height={150} className="rounded-md object-cover aspect-[4/3]" data-ai-hint="property interior room" />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={removeMainImage}
                        aria-label="إزالة الصورة الرئيسية"
                    >
                        <Trash2 size={16} />
                    </Button>
                    </div>
                )}
                 {!mainImagePreview && <p className="text-sm text-accent mt-1">يجب تحميل صورة رئيسية.</p>}
            </div>
            <div>
                <h3 className="text-lg font-semibold font-headline border-b pb-2 mb-2 flex items-center gap-1"><ImageUp size={18}/>الصور التوضيحية الإضافية</h3>
                <Input 
                    id="additionalImages" 
                    type="file" 
                    multiple 
                    onChange={handleAdditionalImagesChange} 
                    accept={ALLOWED_IMAGE_TYPES.join(",")}
                    disabled={additionalImagePreviews.length >= maxAdditionalImages || maxAdditionalImages === 0} 
                />
                <p className="text-xs text-muted-foreground mt-1">الأنواع المسموح بها: JPG, PNG, WEBP. الحجم الأقصى لكل صورة: ${MAX_FILE_SIZE_MB}MB.</p>
                <p className="text-sm mt-1">
                    {maxAdditionalImages > 0 ?
                        <span className="text-muted-foreground">{`يمكنك تحميل ما يصل إلى ${maxAdditionalImages} صور إضافية. (${additionalImagePreviews.length}/${maxAdditionalImages} محملة)`}</span> :
                        <span className="text-accent">لا تسمح خطتك الحالية بتحميل صور إضافية.</span>
                    }
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {additionalImagePreviews.map((preview, index) => {
                    return (
                        <div key={preview + index} className="relative group">
                            <Image src={preview} alt={`معاينة الصورة الإضافية ${index + 1}`} width={200} height={150} className="rounded-md object-cover aspect-[4/3]" data-ai-hint="property room detail" />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeAdditionalImage(index)}
                                aria-label="إزالة الصورة الإضافية"
                            >
                                <Trash2 size={16} />
                            </Button>
                        </div>
                    );
                 })}
                </div>
            </div>
          </div>


          
          <div className="space-y-3">
            <h3 className="text-lg font-semibold font-headline border-b pb-1">وصف العقار *</h3>
            <Controller
                name="description"
                control={form.control}
                render={({ field }) => (
                    <Textarea id="description" {...field} rows={6} placeholder="اكتب وصفًا تفصيليًا وجذابًا للعقار..." />
                )}
            />
            {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
            
            {aiAssistantAllowed ? (
                 <AiDescriptionAssistant 
                    currentDescription={currentDescription}
                    onDescriptionChange={onDescriptionChange}
                    imageDataUri={mainImagePreview || undefined}
                 />
            ) : (
                <Card className="mt-6 bg-secondary/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                        <Loader2 className="text-muted-foreground" /> 
                        <span>مساعد الوصف بالذكاء الاصطناعي</span>
                        </CardTitle>
                         <CardDescription className="text-accent">
                            هذه الميزة متوفرة في الخطط المدفوعة. <Link href="/pricing" className="underline text-primary">قم بترقية خطتك</Link> للاستفادة منها.
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="submit" 
              variant={isSaveButtonDisabled ? "secondary" : "default"}
              className="w-full sm:w-auto transition-smooth hover:shadow-md" 
              disabled={isSaveButtonDisabled}
            >
              {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "حفظ التعديلات" : "نشر العقار"}
            </Button>
            {isEditMode && (
              <Button 
                type="button" 
                variant="destructive_outline" 
                className="w-full sm:w-auto transition-smooth"
                onClick={() => router.back()} 
              >
                <XCircle size={16} className="ml-1 rtl:ml-0 rtl:mr-1"/>
                إلغاء
              </Button>
            )}
          </div>
          {!mainImagePreview && !isEditMode && <p className="text-sm text-accent mt-1">يجب تحميل صورة رئيسية.</p>}
          {isEditMode && !mainImagePreview && <p className="text-sm text-accent mt-1">يجب أن يكون هناك صورة رئيسية. إذا قمت بإزالتها، الرجاء تحميل واحدة جديدة.</p>}
        </form>
      </CardContent>
    </Card>
  );
}
