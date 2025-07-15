
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, User, KeyRound, Building, Search, Settings } from "lucide-react";

const faqSections = [
    {
        icon: User,
        category: "أسئلة عامة",
        iconColor: "text-primary",
        questions: [
            {
                q: "ما هي منصة عقاري؟",
                a: "عقاري هي منصة رقمية متكاملة تهدف إلى تسهيل عمليات بيع، شراء، وإيجار العقارات في الجزائر. نحن نربط بين أصحاب العقارات والباحثين عنها في بيئة آمنة وسهلة الاستخدام."
            },
            {
                q: "هل استخدام المنصة مجاني؟",
                a: "نعم، يمكنك تصفح العقارات وإنشاء حساب مجانًا. لدينا أيضًا خطط اشتراك مدفوعة (VIP و VIP++) توفر ميزات إضافية مثل نشر عدد أكبر من العقارات، صور أكثر، وأدوات متقدمة. يمكنك الاطلاع على صفحة الأسعار لمعرفة المزيد."
            },
            {
                q: "كيف يمكنني التواصل مع الدعم الفني؟",
                a: "يمكنك التواصل معنا عبر صفحة 'تواصل معنا' المتاحة في القائمة الرئيسية للموقع. فريقنا جاهز للإجابة على جميع استفساراتك ومساعدتك."
            }
        ]
    },
    {
        icon: Building,
        category: "لأصحاب العقارات (البائعين والمؤجرين)",
        iconColor: "text-green-600",
        questions: [
            {
                q: "كيف أقوم بإضافة عقار جديد؟",
                a: "بعد تسجيل الدخول، انتقل إلى 'لوحة التحكم' الخاصة بك، ثم اضغط على 'إضافة عقار'. سيأخذك النظام خطوة بخطوة لإدخال جميع تفاصيل العقار، بما في ذلك الصور، السعر، والمواصفات."
            },
            {
                q: "ما هي النصائح لجعل إعلاني جذابًا؟",
                a: "للحصول على أفضل النتائج، ننصحك بالآتي: 1) التقط صورًا عالية الجودة وواضحة للعقار. 2) اكتب عنوانًا ووصفًا تفصيليًا ودقيقًا. 3) حدد سعرًا تنافسيًا بناءً على أسعار السوق. 4) استخدم ميزة 'مساعد الوصف' الذكي إذا كانت متاحة في خطتك."
            },
            {
                q: "ماذا يعني أن عقاري 'قيد المراجعة'؟",
                a: "إذا كان حسابك جديدًا أو مصنفًا كـ'غير موثوق'، فإن إعلاناتك قد تخضع لمراجعة سريعة من قبل فريقنا قبل نشرها. هذا إجراء أمني لضمان جودة ومصداقية الإعلانات على المنصة. سيتم نشر الإعلان بمجرد الموافقة عليه."
            }
        ]
    },
    {
        icon: KeyRound,
        category: "للباحثين عن عقار (المشترين والمستأجرين)",
        iconColor: "text-accent",
        questions: [
            {
                q: "كيف أبحث عن عقار معين؟",
                a: "استخدم شريط البحث والفلاتر المتاحة في صفحة 'العقارات'. يمكنك التصفية حسب نوع المعاملة (بيع/كراء)، نوع العقار، الولاية، والمدينة للعثور على ما يناسبك بدقة."
            },
            {
                q: "هل المعلومات على الموقع موثوقة؟",
                a: "نحن نبذل قصارى جهدنا لضمان مصداقية الإعلانات عبر نظام تصنيف المستخدمين والمراجعة الدورية. ومع ذلك، ننصح دائمًا بزيارة العقار على أرض الواقع والتحقق من جميع التفاصيل والمستندات قبل إتمام أي صفقة."
            },
            {
                q: "كيف أحفظ عقارًا أعجبني؟",
                a: "بجانب كل عقار، ستجد أيقونة على شكل قلب. اضغط عليها لإضافة العقار إلى 'المفضلة' الخاصة بك. يمكنك الوصول إلى قائمتك المحفوظة في أي وقت من الشريط العلوي."
            }
        ]
    }
];

export default function FaqPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <HelpCircle className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-4xl font-headline text-primary">
            المساعدة والأسئلة الشائعة
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            كل ما تحتاج لمعرفته حول استخدام منصتنا.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-12 px-4 md:px-8">
            {faqSections.map((section) => (
                <section key={section.category}>
                    <h2 className="text-2xl font-bold font-headline mb-4 text-center flex items-center justify-center gap-2">
                        <section.icon className={section.iconColor}/>
                        <span>{section.category}</span>
                    </h2>
                     <Accordion type="single" collapsible className="w-full">
                        {section.questions.map((item, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                 <AccordionTrigger className="text-lg text-right font-semibold hover:no-underline text-foreground">
                                    {item.q}
                                </AccordionTrigger>
                                <AccordionContent className="text-base leading-relaxed text-muted-foreground pr-4 border-r-2 border-primary">
                                    {item.a}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                     </Accordion>
                </section>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
