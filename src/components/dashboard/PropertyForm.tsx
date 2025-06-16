"use client";

import * dewasa from "react";
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
import { Loader2, Droplet, Zap, Wifi, FileText, BedDouble, Bath, MapPin, DollarSign, ImageUp, Trash2 } from "lucide-react";
import Image from "next/image";
import type { Property } from "@/types"; // Assuming Property type includes all fields

// Mock Algerian Wilayas - in a real app, this would come from a DB or a more comprehensive list
const wilayas = [
  { code: "01", name: "أدرار" }, { code: "09", name: "البليدة" }, { code: "16", name: "الجزائر" }, { code: "31", name: "وهران" },
  // Add more wilayas as needed
];

const propertyFormSchema = z.object({
  title: z.string().min(5, "العنوان يجب أن لا يقل عن 5 أحرف."),
  price: z.coerce.number().positive("السعر يجب أن يكون رقمًا موجبًا."),
  rooms: z.coerce.number().int().min(1, "عدد الغرف يجب أن يكون 1 على الأقل."),
  bathrooms: z.coerce.number().int().min(1, "عدد الحمامات يجب أن يكون 1 على الأقل."),
  wilaya: z.string().min(1, "الولاية مطلوبة."),
  city: z.string().min(2, "المدينة مطلوبة."),
  neighborhood: z.string().optional(),
  address: z.string().optional(),
  description: z.string().min(20, "الوصف يجب أن لا يقل عن 20 حرفًا."),
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
  onSubmit: (data: PropertyFormValues, imageFiles: File[]) => Promise<void>;
  initialData?: Partial<Property>; // For editing
  isLoading?: boolean;
}

export function PropertyForm({ onSubmit, initialData, isLoading }: PropertyFormProps) {
  const { toast } = useToast();
  const [imagePreviews, setImagePreviews] = dewasa.useState<string[]>(initialData?.imageUrls || []);
  const [imageFiles, setImageFiles] = dewasa.useState<File[]>([]);
  const [mainImageDataUri, setMainImageDataUri] = dewasa.useState<string | undefined>(initialData?.imageUrls?.[0]); // For AI assistant

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      price: initialData?.price || 0,
      rooms: initialData?.rooms || 1,
      bathrooms: initialData?.bathrooms || 1,
      wilaya: initialData?.wilaya || "",
      city: initialData?.city || "",
      neighborhood: initialData?.neighborhood || "",
      address: initialData?.address || "",
      description: initialData?.description || "",
      filters: initialData?.filters || { water: false, electricity: false, internet: false, gas: false, contract: false },
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      // TODO: Add check for plan's image limit
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews].slice(0, 10)); // Example limit of 10 images
      setImageFiles(prev => [...prev, ...filesArray].slice(0, 10));

      // Set first image for AI assistant
      if (filesArray.length > 0 && !mainImageDataUri) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setMainImageDataUri(reader.result as string);
        };
        reader.readAsDataURL(filesArray[0]);
      }
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    if (index === 0 && imagePreviews.length > 1) { // if main image removed, set next one
        const reader = new FileReader();
        reader.onloadend = () => { setMainImageDataUri(reader.result as string); };
        reader.readAsDataURL(imageFiles[1]); // imageFiles would not have been updated yet. This is tricky logic.
    } else if (index === 0 && imagePreviews.length <=1) {
        setMainImageDataUri(undefined);
    }
  };
  
  const handleFormSubmit = (data: PropertyFormValues) => {
    // Here you would handle image uploads to Cloudinary, get URLs, then submit all data.
    // For now, we'll pass imageFiles directly.
    onSubmit(data, imageFiles);
  };
  
  const currentDescription = form.watch("description");
  const onDescriptionChange = (newDescription: string) => {
    form.setValue("description", newDescription);
  };


  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">
          {initialData ? "تعديل العقار" : "إضافة عقار جديد"}
        </CardTitle>
        <CardDescription>
          املأ التفاصيل أدناه لنشر عقارك. الحقول المميزة بـ * إلزامية.
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
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price" className="flex items-center gap-1"><DollarSign size={16}/>السعر (د.ج) *</Label>
                <Input id="price" type="number" {...form.register("price")} placeholder="2000000" />
                {form.formState.errors.price && <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>}
              </div>
              <div>
                <Label htmlFor="rooms" className="flex items-center gap-1"><BedDouble size={16}/>عدد الغرف *</Label>
                <Input id="rooms" type="number" {...form.register("rooms")} placeholder="3" />
                {form.formState.errors.rooms && <p className="text-sm text-destructive">{form.formState.errors.rooms.message}</p>}
              </div>
              <div>
                <Label htmlFor="bathrooms" className="flex items-center gap-1"><Bath size={16}/>عدد الحمامات *</Label>
                <Input id="bathrooms" type="number" {...form.register("bathrooms")} placeholder="2" />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                const Icon = key === 'water' ? Droplet : key === 'electricity' ? Zap : key === 'internet' ? Wifi : key === 'gas' ? Zap : FileText;
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
          <div className="space-y-4">
            <h3 className="text-lg font-semibold font-headline border-b pb-2 flex items-center gap-1"><ImageUp size={18}/>صور العقار</h3>
            <Input id="images" type="file" multiple onChange={handleImageChange} accept="image/*" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <Image src={preview} alt={`معاينة الصورة ${index + 1}`} width={200} height={150} className="rounded-md object-cover aspect-[4/3]" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
            {/* TODO: Add note about image limits based on plan */}
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
            
            <AiDescriptionAssistant 
              currentDescription={currentDescription}
              onDescriptionChange={onDescriptionChange}
              imageDataUri={mainImageDataUri}
            />
          </div>
          
          <Button type="submit" className="w-full md:w-auto transition-smooth hover:shadow-md" disabled={isLoading}>
            {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            {initialData ? "حفظ التعديلات" : "نشر العقار"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
