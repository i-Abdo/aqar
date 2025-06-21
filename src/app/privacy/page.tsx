
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "سياسة الخصوصية - عقاري",
  description: "اطلع على سياسة الخصوصية الخاصة بمنصة عقاري.",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-center text-primary">
            سياسة الخصوصية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-right leading-relaxed text-foreground/90">
          <section>
            <h2 className="text-2xl font-bold font-headline mb-3">1. مقدمة</h2>
            <p>
              نحن في "عقاري" نلتزم بحماية خصوصيتك. توضح سياسة الخصوصية هذه كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك الشخصية عند استخدامك لمنصتنا.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-headline mb-3">2. المعلومات التي نجمعها</h2>
            <p>
              نقوم بجمع المعلومات التي تقدمها مباشرة عند إنشاء حساب، مثل اسمك وبريدك الإلكتروني وكلمة المرور. كما نجمع المعلومات التي تقدمها عند نشر إعلان عقاري، بما في ذلك تفاصيل العقار وصوره ومعلومات الاتصال.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-headline mb-3">3. كيف نستخدم معلوماتك</h2>
            <p>
              نستخدم معلوماتك لتوفير وتحسين خدماتنا، وتخصيص تجربتك، والتواصل معك بخصوص حسابك أو خدماتنا، ولأغراض التسويق إذا وافقت على ذلك.
            </p>
          </section>

           <section>
            <h2 className="text-2xl font-bold font-headline mb-3">4. مشاركة المعلومات</h2>
            <p>
              نحن لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك مع مزودي الخدمات الذين يساعدوننا في تشغيل منصتنا (مثل خدمات الاستضافة)، أو إذا كان ذلك مطلوبًا بموجب القانون.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-headline mb-3">5. أمن البيانات</h2>
            <p>
             نتخذ تدابير أمنية معقولة لحماية معلوماتك الشخصية من الوصول أو الاستخدام أو الكشف غير المصرح به. ومع ذلك، لا توجد طريقة نقل عبر الإنترنت أو تخزين إلكتروني آمنة بنسبة 100%.
            </p>
          </section>
          
           <section>
            <h2 className="text-2xl font-bold font-headline mb-3">6. حقوقك</h2>
            <p>
              لديك الحق في الوصول إلى معلوماتك الشخصية وتصحيحها أو حذفها. يمكنك أيضًا إلغاء الاشتراك في رسائلنا التسويقية في أي وقت.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
