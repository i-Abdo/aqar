
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
import { Loader2, Droplet, Zap, Wifi, FileText, BedDouble, Bath, MapPin, DollarSign, ImageUp, Trash2, UtilityPole, Image as ImageIcon, XCircle, Phone, Ruler, Tag, Building, Map, RefreshCw, Check, Facebook, Instagram, PenSquare, Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import dynamic from 'next/dynamic';
import { propertyFormSchema, type Property, type TransactionType, type PropertyTypeEnum, type PropertyFormValues } from "@/types";
import { plans } from "@/config/plans";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation"; 
import { cn } from "@/lib/utils";
import { uploadVideoToArchive } from "@/actions/videoUploadActions";


const AiDescriptionAssistant = dynamic(() =>
  import('./AiDescriptionAssistant').then((mod) => mod.AiDescriptionAssistant),
  {
    loading: () => (
      <Card className="mt-6 bg-secondary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="animate-spin text-primary" />
            <span>مساعد الوصف بالذكاء الاصطناعي</span>
          </CardTitle>
          <CardDescription>
            جاري تحميل المساعد...
          </CardDescription>
        </CardHeader>
      </Card>
    ),
    ssr: false
  }
);


const WhatsAppIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="lucide lucide-whatsapp h-4 w-4 fill-current"><title>WhatsApp</title><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
);


const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

const MAX_VIDEO_SIZE_MB = 200;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/mov"];


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

interface PropertyFormProps {
  onSubmit: (
    data: PropertyFormValues,
    mainImageFile: File | null,
    additionalImageFiles: File[],
    videoFile: File | null, // Added
    mainImagePreviewFromState: string | null, 
    additionalImagePreviewsFromState: string[],
    videoUrlFromState?: string, // Added
  ) => Promise<void>;
  initialData?: Partial<Property>; 
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
  
  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [videoPreview, setVideoPreview] = React.useState<string | null>(null);

  const [maxAdditionalImages, setMaxAdditionalImages] = React.useState(0);
  const [aiAssistantAllowed, setAiAssistantAllowed] = React.useState(false);
  const [imageLimitPerProperty, setImageLimitPerProperty] = React.useState(1);
  const [videoAllowed, setVideoAllowed] = React.useState(false);


  const initialPriceFormat = React.useMemo(() => formatPriceForInputUIDisplay(initialData?.price), [initialData?.price]);
  const [manualPriceInput, setManualPriceInput] = React.useState<string>(initialPriceFormat.displayValue);
  const [selectedUnit, setSelectedUnit] = React.useState<PriceUnitKey>(initialPriceFormat.unitKey || "THOUSAND_DA");
  
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: initialData 
      ? { 
          ...initialData,
          googleMapsLink: initialData.googleMapsLink || "",
          price: initialData.price || undefined,
          transactionType: initialData.transactionType || undefined,
          propertyType: initialData.propertyType || undefined,
          otherPropertyType: initialData.otherPropertyType || "",
          videoUrl: initialData.videoUrl || "",
        } 
      : {
          title: "", price: undefined, transactionType: undefined, propertyType: undefined, otherPropertyType: "",
          rooms: undefined, bathrooms: undefined, length: undefined, width: undefined, area: undefined,
          wilaya: "", city: "", neighborhood: "", address: "", phoneNumber: "", whatsappNumber: "", facebookUrl: "", instagramUrl: "", description: "",
          filters: { water: false, electricity: false, internet: false, gas: false, contract: false },
          googleMapsLink: "",
          videoUrl: "",
        },
  });
  
  React.useEffect(() => {
    if (initialData) {
      const { displayValue, unitKey } = formatPriceForInputUIDisplay(initialData.price);
      setManualPriceInput(displayValue);
      setSelectedUnit(unitKey);
      form.reset({
        ...initialData,
        filters: initialData.filters || { water: false, electricity: false, internet: false, gas: false, contract: false },
        price: initialData.price || undefined, 
        transactionType: initialData.transactionType || undefined,
        propertyType: initialData.propertyType || undefined,
        otherPropertyType: initialData.otherPropertyType || "",
        googleMapsLink: initialData.googleMapsLink || "",
        whatsappNumber: initialData.whatsappNumber || "",
        facebookUrl: initialData.facebookUrl || "",
        instagramUrl: initialData.instagramUrl || "",
        videoUrl: initialData.videoUrl || "",
      });
       if (initialData.imageUrls && initialData.imageUrls.length > 0) {
        setMainImagePreview(initialData.imageUrls[0]);
        setAdditionalImagePreviews(initialData.imageUrls.slice(1));
      } else {
        setMainImagePreview(null);
        setAdditionalImagePreviews([]);
      }
      if (initialData.videoUrl) {
          setVideoPreview(initialData.videoUrl);
      }
    }
  }, [initialData, form]);

  React.useEffect(() => {
    if (user && user.planId) {
      const planDetails = plans.find(p => p.id === user.planId);
      if (planDetails) {
        setImageLimitPerProperty(planDetails.imageLimitPerProperty);
        setMaxAdditionalImages(planDetails.imageLimitPerProperty > 0 ? planDetails.imageLimitPerProperty -1 : 0);
        setAiAssistantAllowed(planDetails.aiAssistantAccess);
        const hasVideoFeature = planDetails.features.some(f => f.includes("فيديو"));
        setVideoAllowed(hasVideoFeature);
      }
    }
  }, [user]);

  const lengthValue = form.watch("length");
  const widthValue = form.watch("width");
  const watchedPropertyType = form.watch("propertyType");

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
  
  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        toast({ title: "خطأ", description: `نوع الفيديو غير مدعوم. الأنواع المسموح بها: ${ALLOWED_VIDEO_TYPES.join(", ")}`, variant: "destructive" });
        event.target.value = "";
        return;
      }
      if (file.size > MAX_VIDEO_SIZE_BYTES) {
        toast({ title: "خطأ", description: `حجم الفيديو يجب ألا يتجاوز ${MAX_VIDEO_SIZE_MB}MB.`, variant: "destructive" });
        event.target.value = "";
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      form.trigger();
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    const videoInput = document.getElementById('video') as HTMLInputElement | null;
    if (videoInput) videoInput.value = "";
    form.setValue("videoUrl", ""); // Clear URL from form data
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
    onSubmit(data, mainImageFile, additionalImageFiles, videoFile, mainImagePreview, additionalImagePreviews, videoPreview || undefined);
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

  const videoChanged = React.useMemo(() => {
      if (!isEditMode) return false;
      return !!videoFile;
  }, [isEditMode, videoFile]);

  const isSaveButtonDisabled = isLoading || !mainImagePreview || (isEditMode && !form.formState.isDirty && !imagesChanged && !videoChanged);


  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><PenSquare size={24}/>المعلومات الأساسية</CardTitle>
          <CardDescription>ابدأ بالمعلومات الرئيسية التي تجذب انتباه الباحثين.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Ruler size={24}/>التفاصيل والمواصفات</CardTitle>
          <CardDescription>قدم تفاصيل دقيقة حول مواصفات العقار ومساحته.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                 <div className="md:col-span-1">
                    <Label htmlFor="manualPriceInput" className="flex items-center gap-1"><DollarSign size={16}/>السعر *</Label>
                    <div className="flex gap-2">
                        <Input 
                            lang="en" 
                            id="manualPriceInput" 
                            type="text" 
                            value={manualPriceInput}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (/^\d*\.?\d*$/.test(val)) {
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
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MapPin size={24}/>الموقع</CardTitle>
          <CardDescription>حدد موقع العقار بدقة لمساعدة الباحثين في العثور عليه.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
            <div>
                <Label htmlFor="googleMapsLink" className="flex items-center gap-1"><Map size={16}/>رابط الموقع على الخريطة (اختياري)</Label>
                <Input
                    id="googleMapsLink"
                    {...form.register("googleMapsLink")}
                    placeholder="الصق الرابط هنا من خرائط جوجل"
                    dir="ltr"
                    className="text-left"
                />
                <p className="text-xs text-muted-foreground mt-1">
                    افتح خرائط جوجل، ابحث عن الموقع، انقر على "مشاركة" ثم "نسخ الرابط".
                </p>
                {form.formState.errors.googleMapsLink && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.googleMapsLink.message}</p>
                )}
            </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Phone size={24}/>معلومات التواصل</CardTitle>
          <CardDescription>هذه هي المعلومات التي سيستخدمها المشترون المحتملون للتواصل معك.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div>
                  <Label htmlFor="phoneNumber" className="flex items-center gap-1"><Phone size={16}/>رقم الهاتف *</Label>
                  <Input id="phoneNumber" type="tel" {...form.register("phoneNumber")} placeholder="06XXXXXXXX" />
                  {form.formState.errors.phoneNumber && <p className="text-sm text-destructive">{form.formState.errors.phoneNumber.message}</p>}
              </div>
              <div>
                <Label htmlFor="whatsappNumber" className="flex items-center gap-1"><WhatsAppIcon />واتساب (اختياري)</Label>
                <Input id="whatsappNumber" type="tel" {...form.register("whatsappNumber")} placeholder="06XXXXXXXX" />
                {form.formState.errors.whatsappNumber && <p className="text-sm text-destructive">{form.formState.errors.whatsappNumber.message}</p>}
              </div>
              <div>
                  <Label htmlFor="facebookUrl" className="flex items-center gap-1"><Facebook size={16}/>رابط فيسبوك (اختياري)</Label>
                  <Input id="facebookUrl" {...form.register("facebookUrl")} placeholder="https://facebook.com/your-profile" />
                  {form.formState.errors.facebookUrl && <p className="text-sm text-destructive">{form.formState.errors.facebookUrl.message}</p>}
              </div>
              <div>
                  <Label htmlFor="instagramUrl" className="flex items-center gap-1"><Instagram size={16}/>رابط انستقرام (اختياري)</Label>
                  <Input id="instagramUrl" {...form.register("instagramUrl")} placeholder="https://instagram.com/your-profile" />
                  {form.formState.errors.instagramUrl && <p className="text-sm text-destructive">{form.formState.errors.instagramUrl.message}</p>}
              </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ImageUp size={24}/>الوسائط</CardTitle>
          <CardDescription>الوسائط المرئية هي أفضل طريقة لعرض عقارك. ابدأ بالصور ثم أضف فيديو إذا أردت.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            <div>
                <Label className="text-lg font-semibold flex items-center gap-1 mb-2"><ImageIcon size={18}/>صورة العقار الرئيسية *</Label>
                {!mainImagePreview ? (
                    <label htmlFor="mainImage" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <ImageUp className="w-10 h-10 mb-2 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">انقر للتحميل</span> أو اسحب وأفلت الصورة هنا</p>
                            <p className="text-xs text-muted-foreground">JPG, PNG, WEBP (الحجم الأقصى: ${MAX_FILE_SIZE_MB}MB)</p>
                        </div>
                        <Input id="mainImage" type="file" onChange={handleMainImageChange} accept={ALLOWED_IMAGE_TYPES.join(",")} className="hidden" />
                    </label>
                ) : (
                    <div className="relative group w-full max-w-sm">
                        <Image src={mainImagePreview} alt="معاينة الصورة الرئيسية" width={400} height={300} className="rounded-md object-cover aspect-[4/3] border" data-ai-hint="property interior room" />
                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={removeMainImage} aria-label="إزالة الصورة الرئيسية">
                            <Trash2 size={16} />
                        </Button>
                    </div>
                )}
                 {!mainImagePreview && <p className="text-sm text-accent mt-2">يجب تحميل صورة رئيسية.</p>}
            </div>
            <div>
                <Label className="text-lg font-semibold flex items-center gap-1 mb-2"><ImageUp size={18}/>الصور التوضيحية الإضافية</Label>
                 <p className="text-sm text-muted-foreground mb-4">
                    {maxAdditionalImages > 0 ?
                        <span>{`يمكنك تحميل ما يصل إلى ${maxAdditionalImages} صور إضافية. (${additionalImagePreviews.length}/${maxAdditionalImages} محملة)`}</span> :
                        <span className="text-accent">لا تسمح خطتك الحالية بتحميل صور إضافية. <Link href="/pricing" className="underline text-primary">قم بترقية خطتك</Link> للاستفادة منها.</span>
                    }
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                  {additionalImagePreviews.map((preview, index) => (
                      <div key={preview + index} className="relative group">
                          <Image src={preview} alt={`معاينة الصورة الإضافية ${index + 1}`} width={200} height={150} className="rounded-md object-cover aspect-[4/3] border" data-ai-hint="property detail" />
                          <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeAdditionalImage(index)} aria-label="إزالة الصورة الإضافية">
                              <Trash2 size={16} />
                          </Button>
                      </div>
                  ))}
                </div>
                
                {additionalImagePreviews.length < maxAdditionalImages && (
                    <label htmlFor="additionalImages" className={cn(
                        "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                        "hover:bg-muted/50"
                    )}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <ImageUp className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground"><span className="font-semibold">إضافة المزيد من الصور</span></p>
                        </div>
                        <Input id="additionalImages" type="file" multiple onChange={handleAdditionalImagesChange} accept={ALLOWED_IMAGE_TYPES.join(",")} className="hidden" />
                    </label>
                )}
            </div>
             <div>
                <Label className="text-lg font-semibold flex items-center gap-1 mb-2"><Video size={18}/>فيديو العقار (اختياري)</Label>
                {!videoAllowed ? (
                    <p className="text-sm text-accent">
                        ميزة رفع الفيديو متوفرة في الخطط المدفوعة. <Link href="/pricing" className="underline text-primary">قم بترقية خطتك</Link> للاستفادة منها.
                    </p>
                ) : !videoPreview ? (
                    <label htmlFor="video" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Video className="w-10 h-10 mb-2 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">انقر لتحميل الفيديو</span></p>
                            <p className="text-xs text-muted-foreground">MP4, MOV, WEBM (الحجم الأقصى: ${MAX_VIDEO_SIZE_MB}MB)</p>
                        </div>
                        <Input id="video" type="file" onChange={handleVideoChange} accept={ALLOWED_VIDEO_TYPES.join(",")} className="hidden" />
                    </label>
                ) : (
                    <div className="relative group w-full max-w-sm">
                        <video src={videoPreview} controls className="rounded-md w-full aspect-video border bg-black"></video>
                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={removeVideo} aria-label="إزالة الفيديو">
                            <Trash2 size={16} />
                        </Button>
                    </div>
                )}
            </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">الميزات والوصف *</CardTitle>
          <CardDescription>أضف تفاصيل حول الخدمات المتوفرة ووصفًا جذابًا لعقارك.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">الميزات والخدمات المتوفرة</h3>
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
          <div>
            <h3 className="text-lg font-semibold mb-3">وصف العقار</h3>
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
        </CardContent>
      </Card>
          
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button 
          type="submit" 
          size="lg"
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
            size="lg"
            className="w-full sm:w-auto transition-smooth"
            onClick={() => router.back()} 
          >
            <XCircle size={18} className="ml-1 rtl:ml-0 rtl:mr-1"/>
            إلغاء
          </Button>
        )}
      </div>
      {!mainImagePreview && !isEditMode && <p className="text-sm text-accent mt-1">يجب تحميل صورة رئيسية لإتمام عملية النشر.</p>}
      {isEditMode && !mainImagePreview && <p className="text-sm text-accent mt-1">يجب أن يكون هناك صورة رئيسية. إذا قمت بإزالتها، الرجاء تحميل واحدة جديدة.</p>}
    </form>
  );
}
