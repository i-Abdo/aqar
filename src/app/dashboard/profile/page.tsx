
"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, UserCircle, Edit3, Image as ImageIcon, Trash2 } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateProfile } from "firebase/auth";
import { auth as firebaseAuth } from "@/lib/firebase/client";
import { uploadImages as uploadImagesToServerAction } from "@/actions/uploadActions";
import { plans } from "@/config/plans";

const profileFormSchema = z.object({
  displayName: z
    .string()
    .min(2, { message: "الاسم يجب أن يكون حرفين على الأقل." })
    .max(50, { message: "الاسم طويل جدًا (الحد الأقصى 50 حرفًا)." })
    .optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [newProfileImageFile, setNewProfileImageFile] = React.useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = React.useState<string | null>(null);
  const [currentPlanName, setCurrentPlanName] = React.useState("...");

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: "",
    },
  });

  React.useEffect(() => {
    if (user) {
      form.reset({ displayName: user.displayName || "" });
      setProfileImagePreview(user.photoURL || null);

      const planDetails = plans.find(p => p.id === (user.planId || 'free'));
      setCurrentPlanName(planDetails?.name || "غير محدد");
    }
  }, [user, form]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 2 * 1024 * 1024) { // 2MB limit for profile picture
        toast({ title: "خطأ", description: "حجم الصورة يجب أن لا يتجاوز 2MB.", variant: "destructive" });
        return;
      }
      setNewProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.trigger('displayName'); // Trigger validation if needed, or just to mark form as dirty
    }
  };

  const removeProfileImage = () => {
    setNewProfileImageFile(null);
    // If user had an existing photoURL, removing means setting it to null
    // If it was just a preview of a new file, just clear the preview.
    // For simplicity, if they remove, we intend to set photoURL to null on save.
    setProfileImagePreview(null); 
    form.trigger('displayName');
  }

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user || !firebaseAuth.currentUser) {
      toast({ title: "خطأ", description: "المستخدم غير مسجل الدخول.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    let newPhotoURL: string | null = user.photoURL; // Default to existing

    try {
      if (newProfileImageFile) {
        const uploadedUrls = await uploadImagesToServerAction([newProfileImageFile]);
        if (uploadedUrls && uploadedUrls.length > 0) {
          newPhotoURL = uploadedUrls[0];
        } else {
          throw new Error("فشل رفع الصورة الشخصية.");
        }
      } else if (profileImagePreview === null && user.photoURL !== null) {
        // Image was explicitly removed
        newPhotoURL = null;
      }

      await updateProfile(firebaseAuth.currentUser, {
        displayName: data.displayName || user.displayName || "", // Ensure displayName is not undefined
        photoURL: newPhotoURL,
      });

      toast({ title: "تم تحديث الملف الشخصي بنجاح!" });
      setNewProfileImageFile(null); // Reset file input state
      // The useAuth hook should automatically pick up the changes from onAuthStateChanged
      // and update the user object, causing a re-render with new data.
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "خطأ في تحديث الملف الشخصي",
        description: error.message || "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-20rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">جاري تحميل بيانات الملف الشخصي...</p>
      </div>
    );
  }

  if (!user) {
    // This case should ideally be handled by the layout, but as a fallback:
    return <p className="text-center text-muted-foreground">الرجاء تسجيل الدخول لعرض ملفك الشخصي.</p>;
  }
  
  const userInitials = user.displayName ? user.displayName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : "U");

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold font-headline text-center">ملفي الشخصي</h1>
      
      <Card className="shadow-xl">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader className="text-center">
            <div className="relative mx-auto w-32 h-32 mb-4 group">
              <Avatar className="w-32 h-32 text-4xl border-4 border-primary/50 shadow-md">
                <AvatarImage src={profileImagePreview || user.photoURL || ""} alt={user.displayName || "User Avatar"} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <Label 
                htmlFor="profileImageInput" 
                className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity"
              >
                <Edit3 size={32} />
              </Label>
              <Input 
                id="profileImageInput" 
                type="file" 
                className="hidden" 
                accept="image/png, image/jpeg, image/jpg" 
                onChange={handleImageChange} 
              />
            </div>
            {profileImagePreview && (
                 <Button type="button" variant="ghost" size="sm" onClick={removeProfileImage} className="mx-auto text-destructive hover:text-destructive/80">
                    <Trash2 size={16} className="ml-1 rtl:mr-1 rtl:ml-0"/> إزالة الصورة
                </Button>
            )}
            <CardTitle className="mt-2">{user.displayName || "المستخدم"}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="flex items-center gap-1">
                <UserCircle size={18} /> اسم العرض
              </Label>
              <Input
                id="displayName"
                {...form.register("displayName")}
                placeholder="أدخل اسم العرض الخاص بك"
              />
              {form.formState.errors.displayName && (
                <p className="text-sm text-destructive">{form.formState.errors.displayName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>البريد الإلكتروني (غير قابل للتعديل)</Label>
              <Input value={user.email || ""} readOnly disabled className="bg-muted/50"/>
            </div>

            <div className="space-y-2">
              <Label>الخطة الحالية</Label>
              <Input value={currentPlanName} readOnly disabled className="bg-muted/50" />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full transition-smooth hover:shadow-md" 
              disabled={isSubmitting || !form.formState.isDirty && !newProfileImageFile && !(profileImagePreview === null && user.photoURL !== null) }
            >
              {isSubmitting ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              ) : (
                <Edit3 size={18} className="ml-2 rtl:ml-0 rtl:mr-2"/>
              )}
              {isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

    