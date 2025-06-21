
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "الشروط والأحكام - عقاري",
  description: "اطلع على الشروط والأحكام الخاصة باستخدام منصة عقاري.",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-center text-primary">
            الشروط والأحكام
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-right leading-relaxed text-foreground/90">
          <section>
            <h2 className="text-2xl font-bold font-headline mb-3">1. مقدمة</h2>
            <p>
              أهلاً بك في "عقاري". باستخدامك لموقعنا الإلكتروني وخدماتنا، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، فلا يجوز لك استخدام خدماتنا.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-headline mb-3">2. استخدام الخدمات</h2>
            <p>
              يجب أن تكون في السن القانوني لإبرام العقود لاستخدام خدماتنا. أنت مسؤول عن دقة المعلومات التي تقدمها، بما في ذلك معلومات العقارات وبيانات الاتصال.
            </p>
            <p>
              يُحظر استخدام المنصة لأي أغراض غير قانونية أو احتيالية. يتضمن ذلك نشر معلومات مضللة، أو صور غير لائقة، أو انتهاك حقوق الملكية الفكرية.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-headline mb-3">3. مسؤولية المستخدم</h2>
            <p>
              أنت المسؤول الوحيد عن محتوى الإعلانات التي تنشرها. يجب أن تكون جميع المعلومات المقدمة صحيحة ودقيقة ومحدثة. "عقاري" لا يتحقق من صحة جميع الإعلانات ولا يضمنها.
            </p>
            <p>
              يجب عليك الحفاظ على سرية معلومات حسابك وكلمة المرور. أنت مسؤول عن جميع الأنشطة التي تحدث تحت حسابك.
            </p>
          </section>

           <section>
            <h2 className="text-2xl font-bold font-headline mb-3">4. إخلاء المسؤولية</h2>
            <p>
              تُقدم الخدمات "كما هي" دون أي ضمانات من أي نوع. لا نضمن أن تكون الخدمة دون انقطاع أو خالية من الأخطاء. "عقاري" ليست طرفًا في أي معاملات بين البائعين والمشترين أو المؤجرين والمستأجرين، ولسنا مسؤولين عن أي نزاعات قد تنشأ.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-headline mb-3">5. تعديل الشروط</h2>
            <p>
              نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. سيتم نشر أي تغييرات على هذه الصفحة. يعتبر استمرارك في استخدام الموقع بعد أي تعديلات بمثابة موافقة منك على الشروط الجديدة.
            </p>
          </section>
          
           <section>
            <h2 className="text-2xl font-bold font-headline mb-3">6. الاتصال بنا</h2>
            <p>
              إذا كان لديك أي أسئلة حول هذه الشروط، يرجى الاتصال بنا عبر صفحة الاتصال المتاحة على الموقع.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
