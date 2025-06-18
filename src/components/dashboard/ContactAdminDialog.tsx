
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

const contactAdminSchema = z.object({
  message: z.string().min(20, { message: "الرسالة يجب أن تكون 20 حرفًا على الأقل." }).max(2000, { message: "الرسالة يجب ألا تتجاوز 2000 حرف." }),
});

type ContactAdminFormValues = z.infer<typeof contactAdminSchema>;

interface ContactAdminDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail: string;
}

export function ContactAdminDialog({ isOpen, onOpenChange, userId, userEmail }: ContactAdminDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<ContactAdminFormValues>({
    resolver: zodResolver(contactAdminSchema),
    defaultValues: {
      message: "",
    },
  });

  const onSubmit = async (data: ContactAdminFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await submitUserIssue({
        userId,
        userEmail,
        message: data.message,
      });

      if (result.success) {
        toast({ title: "تم الإرسال بنجاح", description: result.message });
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>الاتصال بالإدارة</DialogTitle>
          <DialogDescription>
            صف مشكلتك أو سبب اتصالك بالإدارة. سيتم مراجعة رسالتك في أقرب وقت.
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "جاري الإرسال..." : "إرسال الرسالة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
