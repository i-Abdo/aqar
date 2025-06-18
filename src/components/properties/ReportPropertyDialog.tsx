
"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { ReportReason } from "@/types";
import { submitReport } from "@/actions/reportActions";
import { useAuth } from "@/hooks/use-auth";

const REPORT_COOLDOWN_MS = 2 * 60000; // 2 minutes

const reportFormSchema = z.object({
  reason: z.nativeEnum(ReportReason, { errorMap: () => ({ message: "سبب الإبلاغ مطلوب." }) }),
  comments: z.string().min(10, { message: "التعليق يجب أن يكون 10 أحرف على الأقل." }).max(1000, { message: "التعليق يجب ألا يتجاوز 1000 حرف." }),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

interface ReportPropertyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  propertyTitle: string;
}

export function ReportPropertyDialog({ isOpen, onOpenChange, propertyId, propertyTitle }: ReportPropertyDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [lastReportTime, setLastReportTime] = React.useState(0);

  React.useEffect(() => {
    if (user && propertyId) {
      const storedTime = localStorage.getItem(`lastReportTime_${user.uid}_${propertyId}`);
      if (storedTime) {
        setLastReportTime(parseInt(storedTime, 10));
      }
    }
  }, [user, propertyId, isOpen]);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      reason: undefined,
      comments: "",
    },
  });

  const canSubmitReport = () => {
    return Date.now() - lastReportTime > REPORT_COOLDOWN_MS;
  };

  const onSubmit = async (data: ReportFormValues) => {
    setIsSubmitting(true);
    if (!user) {
      toast({ title: "خطأ", description: "يجب تسجيل الدخول لتقديم بلاغ.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    if (!canSubmitReport()) {
      const timeLeft = Math.ceil((REPORT_COOLDOWN_MS - (Date.now() - lastReportTime)) / 1000);
      toast({ title: "محاولة متكررة", description: `لقد قمت بالإبلاغ عن هذا العقار مؤخرًا. يرجى الانتظار ${timeLeft} ثانية.`, variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await submitReport({
        propertyId,
        propertyTitle,
        reason: data.reason,
        comments: data.comments,
        reporterUserId: user.uid,
        reporterEmail: user.email || null,
      });

      if (result.success) {
        toast({ title: "تم الإرسال", description: result.message });
        const currentTime = Date.now();
        setLastReportTime(currentTime);
        if (user && propertyId) {
            localStorage.setItem(`lastReportTime_${user.uid}_${propertyId}`, currentTime.toString());
        }
        form.reset();
        onOpenChange(false);
      } else {
        toast({ title: "خطأ", description: result.message, variant: "destructive" });
      }
    } catch (error) {
      console.error("Error submitting report from dialog:", error);
      toast({ title: "خطأ فادح", description: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  React.useEffect(() => {
    if (!isOpen) {
      form.reset({ reason: undefined, comments: "" });
    }
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>الإبلاغ عن عقار: {propertyTitle}</DialogTitle>
          <DialogDescription>
            الرجاء تحديد سبب الإبلاغ وتقديم تفاصيل إضافية إذا لزم الأمر.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="reason">سبب الإبلاغ *</Label>
            <Controller
              name="reason"
              control={form.control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <SelectTrigger id="reason">
                    <SelectValue placeholder="اختر سببًا..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ReportReason).map((reasonValue) => (
                      <SelectItem key={reasonValue} value={reasonValue}>
                        {reasonValue}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.reason && <p className="text-sm text-destructive mt-1">{form.formState.errors.reason.message}</p>}
          </div>
          <div>
            <Label htmlFor="comments">تعليقات إضافية (10 أحرف على الأقل) *</Label>
            <Textarea
              id="comments"
              {...form.register("comments")}
              placeholder="أدخل تفاصيل إضافية حول سبب إبلاغك..."
              rows={4}
            />
            {form.formState.errors.comments && <p className="text-sm text-destructive mt-1">{form.formState.errors.comments.message}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting || !canSubmitReport()}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "جاري الإرسال..." : "إرسال البلاغ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

