
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
import { Loader2, Droplet, Zap, Wifi, FileText, BedDouble, Bath, MapPin, DollarSign, ImageUp, Trash2, UtilityPole, Image as ImageIcon, XCircle, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Property } from "@/types";
import { plans } from "@/config/plans";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation"; 

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

const propertyFormSchema = z.object({
  title: z.string().min(5, "العنوان يجب أن لا يقل عن 5 أحرف."),
  price: z.coerce.number().positive("السعر يجب أن يكون رقمًا موجبًا."),
  rooms: z.coerce.number().int().min(1, "عدد الغرف يجب أن يكون 1 على الأقل."),
  bathrooms: z.coerce.number().int().min(1, "عدد الحمامات يجب أن يكون 1 على الأقل."),
  wilaya: z.string().min(1, "الولاية مطلوبة."),
  city: z.string().min(2, "المدينة مطلوبة."),
  neighborhood: z.string().optional(),
  address: z.string().optional(),
  phoneNumber: z.string()
    .min(1, "رقم الهاتف مطلوب.")
    .regex(algerianPhoneNumberRegex, {
        message: "رقم الهاتف غير صالح. يجب أن يبدأ بـ 05، 06، أو 07 ويتبعه 8 أرقام.",
    }),
  description: z.string().min(20, "الوصف يجب أن لا يقل عن 20 حرفًا.").max(500, "الوصف يجب أن لا يتجاوز 500 حرفًا."),
  filters: z.object({
    water: z.boolean().default(false),
    electricity: z.boolean().default(false),
    internet: z.boolean().default(false),
    gas: z.boolean().default(false),
    contract: z.boolean().default(false),
  }),
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


  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: "",
      price: 0,
      rooms: 1,
      bathrooms: 1,
      wilaya: "",
      city: "",
      neighborhood: "",
      address: "",
      phoneNumber: "",
      description: "",
      filters: { water: false, electricity: false, internet: false, gas: false, contract: false },
    },
  });
  
  React.useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || "",
        price: initialData.price || 0,
        rooms: initialData.rooms || 1,
        bathrooms: initialData.bathrooms || 1,
        wilaya: initialData.wilaya || "",
        city: initialData.city || "",
        neighborhood: initialData.neighborhood || "",
        address: initialData.address || "",
        phoneNumber: initialData.phoneNumber || "",
        description: initialData.description || "",
        filters: initialData.filters || { water: false, electricity: false, internet: false, gas: false, contract: false },
      });
      if (initialData.imageUrls && initialData.imageUrls.length > 0) {
        setMainImagePreview(initialData.imageUrls[0]);
        setAdditionalImagePreviews(initialData.imageUrls.slice(1));
      } else {
        setMainImagePreview(null);
        setAdditionalImagePreviews([]);
      }
    } else if (!isEditMode) { 
        form.reset({
            title: "",
            price: 0,
            rooms: 1,
            bathrooms: 1,
            wilaya: "",
            city: "",
            neighborhood: "",
            address: "",
            phoneNumber: "",
            description: "",
            filters: { water: false, electricity: false, internet: false, gas: false, contract: false },
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
        if (!initialData?.filters && form.getValues('filters') === undefined) { 
             form.reset({ ...form.getValues(), filters: { water: false, electricity: false, internet: false, gas: false, contract: false }});
        }
      }
    }
  }, [user, form, initialData]);


  const handleMainImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) { 
        toast({ title: "خطأ", description: "حجم الصورة الرئيسية يجب أن لا يتجاوز 5MB.", variant: "destructive" });
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
        return;
      }

      const filesToUploadTemp: File[] = [];
      const previewsToUploadTemp: string[] = [];

      for (const file of filesArray) {
        if (previewsToUploadTemp.length < remainingSlots) { 
            if (file.size > 5 * 1024 * 1024) { 
                toast({ title: "خطأ", description: `حجم الملف ${file.name} يتجاوز 5MB.`, variant: "destructive" });
                continue;
            }
            filesToUploadTemp.push(file);
            previewsToUploadTemp.push(URL.createObjectURL(file));
        } else {
            break; 
        }
      }
      
      if (filesToUploadTemp.length < filesArray.length) {
         toast({
          title: "تنبيه",
          description: `تم تحميل ${filesToUploadTemp.length} ملفات فقط بسبب تجاوز الحد الأقصى للصور أو حجم الملفات.`,
          variant: "default",
        });
      }

      setAdditionalImageFiles(prev => [...prev, ...filesToUploadTemp]);
      setAdditionalImagePreviews(prev => [...prev, ...previewsToUploadTemp]);
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

  const isSaveButtonDisabled = isLoading || !mainImagePreview || (isEditMode && !form.formState.isDirty && !mainImageFile && additionalImageFiles.length === 0);


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
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold font-headline border-b pb-2">المعلومات الأساسية</h3>
            <div>
              <Label htmlFor="title">عنوان الإعلان *</Label>
              <Input id="title" {...form.register("title")} placeholder="مثال: شقة فاخرة مطلة على البحر" />
              {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" className="flex items-center gap-1"><DollarSign size={16}/>السعر (د.ج) *</Label>
                <Input lang="en" id="price" type="number" {...form.register("price")} placeholder="2000000" className="input-latin-numerals" />
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
                <Input lang="en" id="rooms" type="number" {...form.register("rooms")} placeholder="3" className="input-latin-numerals" />
                {form.formState.errors.rooms && <p className="text-sm text-destructive">{form.formState.errors.rooms.message}</p>}
              </div>
              <div>
                <Label htmlFor="bathrooms" className="flex items-center gap-1"><Bath size={16}/>عدد الحمامات *</Label>
                <Input lang="en" id="bathrooms" type="number" {...form.register("bathrooms")} placeholder="2" className="input-latin-numerals" />
                {form.formState.errors.bathrooms && <p className="text-sm text-destructive">{form.formState.errors.bathrooms.message}</p>}
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold font-headline border-b pb-2 flex items-center gap-1"><MapPin size={18}/>الموقع</h3>
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
          
          {/* Filters/Features Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold font-headline border-b pb-2">الميزات والخدمات</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {(Object.keys(form.getValues().filters) as Array<keyof PropertyFormValues['filters']>).map((key) => {
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

          {/* Image Upload Section */}
          <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold font-headline border-b pb-2 mb-2 flex items-center gap-1"><ImageIcon size={18}/>صورة العقار الرئيسية *</h3>
                <Input id="mainImage" type="file" onChange={handleMainImageChange} accept="image/*" />
                {mainImagePreview && (
                    <div className="mt-4 relative group w-48">
                    <Image src={mainImagePreview} alt="معاينة الصورة الرئيسية" width={200} height={150} className="rounded-md object-cover aspect-[4/3]" data-ai-hint="property interior room" />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={removeMainImage}
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
                    accept="image/*" 
                    disabled={additionalImagePreviews.length >= maxAdditionalImages || maxAdditionalImages === 0} 
                />
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
                            >
                                <Trash2 size={16} />
                            </Button>
                        </div>
                    );
                 })}
                </div>
            </div>
          </div>


          {/* Description Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold font-headline border-b pb-2">وصف العقار *</h3>
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
                onClick={() => router.push("/dashboard/properties")}
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

