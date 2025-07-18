
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { submitUserIssue } from "@/actions/userIssueActions";

const CONTACT_ADMIN_COOLDOWN_MS = 5 * 60000; // 5 minutes

const contactAdminSchema = z.object({
  message: z.string().min(20, { message: "الرسالة يجب أن تكون 20 حرفًا على الأقل." }).max(2000, { message: "الرسالة يجب ألا تتجاوز 2000 حرف." }),
});

type ContactAdminFormValues = z.infer<typeof contactAdminSchema>;

interface ContactAdminDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail: string;
  propertyId?: string;
  propertyTitle?: string;
}

export function ContactAdminDialog({ 
    isOpen, 
    onOpenChange, 
    userId, 
    userEmail, 
    propertyId, 
    propertyTitle 
}: ContactAdminDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = React.useState(0);

  React.useEffect(() => {
    if (userId) {
      const storedTime = localStorage.getItem(`lastContactAdminTime_${userId}`);
      if (storedTime) {
        setLastSubmissionTime(parseInt(storedTime, 10));
      }
    }
  }, [userId, isOpen]);

  const form = useForm<ContactAdminFormValues>({
    resolver: zodResolver(contactAdminSchema),
    defaultValues: {
      message: "",
    },
  });

  const canSubmit = () => {
    return Date.now() - lastSubmissionTime > CONTACT_ADMIN_COOLDOWN_MS;
  };

  const onSubmit = async (data: ContactAdminFormValues) => {
    setIsSubmitting(true);
    
    if (!canSubmit()) {
      const timeLeft = Math.ceil((CONTACT_ADMIN_COOLDOWN_MS - (Date.now() - lastSubmissionTime)) / 60000);
      toast({ title: "محاولة متكررة", description: `لقد قمت بإرسال رسالة للإدارة مؤخرًا. يرجى الانتظار ${timeLeft} دقائق.`, variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await submitUserIssue({
        userId,
        userEmail,
        message: data.message,
        ...(propertyId && { propertyId }),
        ...(propertyTitle && { propertyTitle }),
      });

      if (result.success) {
        toast({ title: "تم الإرسال بنجاح", description: result.message });
        const currentTime = Date.now();
        setLastSubmissionTime(currentTime);
        localStorage.setItem(`lastContactAdminTime_${userId}`, currentTime.toString());
        form.reset();
        onOpenChange(false);
      } else {
        toast({ title: "خطأ في الإرسال", description: result.message, variant: "destructive" });
      }
    } catch (error) {
      console.error("Error submitting contact admin form:", error);
      toast({ title: "خطأ فادح", description: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  React.useEffect(() => {
    if (!isOpen) {
      form.reset({ message: "" });
    }
  }, [isOpen, form]);

  const dialogTitleText = propertyTitle 
    ? `الإبلاغ عن مشكلة بخصوص العقار: ${propertyTitle}` 
    : "الاتصال بالإدارة";
  
  const dialogDescriptionText = propertyTitle
    ? "صف المشكلة التي تواجهها بخصوص هذا العقار. سيتم مراجعة رسالتك."
    : "صف مشكلتك أو سبب اتصالك بالإدارة. سيتم مراجعة رسالتك في أقرب وقت.";


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dialogTitleText}</DialogTitle>
          <DialogDescription>
            {dialogDescriptionText}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="message" className="sr-only">رسالتك</Label>
            <Textarea
              id="message"
              {...form.register("message")}
              placeholder="اكتب رسالتك هنا..."
              rows={6}
              className="text-base"
            />
            {form.formState.errors.message && <p className="text-sm text-destructive mt-1">{form.formState.errors.message.message}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting || !canSubmit()}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "جاري الإرسال..." : "إرسال الرسالة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
