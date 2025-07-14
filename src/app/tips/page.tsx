
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
import { DollarSign, KeyRound, ShieldCheck, Home, BookOpen, Building, FileText } from "lucide-react";

const tips = [
    {
        icon: DollarSign,
        title: "نصائح للبائعين",
        iconColor: "text-green-500",
        content: [
            {
                subtitle: "1. التسعير الصحيح هو مفتاح النجاح:",
                text: "ابحث عن أسعار العقارات المماثلة في منطقتك. سعر أعلى من اللازم سيُبعد المشترين، وسعر أقل سيضيع عليك الأرباح. استشر خبيرًا إذا لزم الأمر."
            },
            {
                subtitle: "2. الصور الاحترافية تصنع الفارق:",
                text: "الصور هي أول ما يراه المشتري. استثمر في صور عالية الجودة تُظهر أفضل زوايا وميزات عقارك. الإضاءة الجيدة والنظافة أمران أساسيان."
            },
            {
                subtitle: "3. جهّز عقارك للعرض (Home Staging):",
                text: "قم بإصلاح أي أعطال بسيطة، وأزل الأغراض الشخصية، ونظّف المكان بعمق. عقار نظيف ومرتب يترك انطباعًا إيجابيًا ويسهل على المشترين تخيل أنفسهم يعيشون فيه."
            }
        ]
    },
    {
        icon: KeyRound,
        title: "نصائح للمشترين",
        iconColor: "text-accent",
        content: [
            {
                subtitle: "1. حدد ميزانيتك بدقة:",
                text: "قبل البدء بالبحث، اعرف المبلغ الذي يمكنك تحمله. لا تنسَ حساب التكاليف الإضافية مثل رسوم التسجيل، الضرائب، وأي إصلاحات محتملة."
            },
            {
                subtitle: "2. الموقع، الموقع، الموقع:",
                text: "فكر في المستقبل. هل المنطقة قريبة من عملك، المدارس، والمرافق العامة؟ هل هي منطقة آمنة وذات قيمة استثمارية متزايدة؟ قم بزيارة المنطقة في أوقات مختلفة من اليوم."
            },
            {
                subtitle: "3. لا تتجاهل الفحص الفني للعقار:",
                text: "استعن بخبير لفحص العقار والكشف عن أي مشاكل خفية في الأساسات، السباكة، أو الكهرباء. هذا قد يوفر عليك آلاف الدنانير في المستقبل."
            }
        ]
    },
    {
        icon: ShieldCheck,
        title: "نصائح قانونية وعامة",
        iconColor: "text-blue-500",
        content: [
             {
                subtitle: "1. اقرأ العقد جيدًا:",
                text: "لا توقّع على أي شيء لا تفهمه تمامًا. استشر محاميًا أو موثقًا لمراجعة عقد البيع أو الإيجار والتأكد من حماية حقوقك."
            },
            {
                subtitle: "2. وثّق كل شيء كتابيًا:",
                text: "أي اتفاقات أو وعود شفهية يجب أن يتم توثيقها في العقد. هذا يشمل أي إصلاحات وافق البائع على القيام بها أو أي أثاث متضمن في الصفقة."
            },
            {
                subtitle: "3. كن مستعدًا للتفاوض:",
                text: "نادرًا ما يكون السعر المعروض نهائيًا. كن مستعدًا لتقديم عرض والتفاوض بشكل احترافي للوصول إلى سعر يرضي الطرفين."
            }
        ]
    }
];

const glossaryTerms = [
    {
        icon: FileText,
        title: "ما هو الدفتر العقاري؟",
        iconColor: "text-green-600",
        content: "الدفتر العقاري هو وثيقة رسمية تصدرها إدارة مسح الأراضي، وتعتبر بمثابة بطاقة هوية للعقار. يثبت ملكيتك للعقار بشكل نهائي وقاطع ولا يمكن الطعن فيه. هو أقوى سند للملكية."
    },
    {
        icon: Building,
        title: "ما معنى عقد الملكية؟",
        iconColor: "text-indigo-600",
        content: "عقد الملكية هو وثيقة رسمية يحررها الموثق، وتثبت انتقال ملكية العقار من البائع إلى المشتري. يتم تسجيله وإشهاره في المحافظة العقارية، ويُعد أساسًا للحصول على الدفتر العقاري لاحقًا."
    },
     {
        icon: FileText,
        title: "ما هو العقد العرفي؟",
        iconColor: "text-orange-600",
        content: "هو عقد يتم بين طرفين (البائع والمشتري) دون توثيقه رسميًا عند الموثق. على الرغم من أنه شائع، إلا أنه لا يضمن حقوق المشتري بشكل كامل ولا يمكن تسجيل العقار به مباشرة. غالبًا ما يتطلب حكمًا قضائيًا لإثبات صحته."
    }
];

export default function TipsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <Home className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-4xl font-headline text-primary">
            دليلك الشامل في عالم العقارات
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            نصائح من الخبراء ومصطلحات هامة لمساعدتك في كل خطوة.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-12 px-4 md:px-8">
            {/* Tips Section */}
            <section>
                 <h2 className="text-2xl font-bold font-headline mb-4 text-center">نصائح الخبراء</h2>
                 <Accordion type="single" collapsible className="w-full">
                    {tips.map((tipSection) => (
                        <AccordionItem key={tipSection.title} value={tipSection.title}>
                             <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                                <div className="flex items-center gap-3">
                                <tipSection.icon className={tipSection.iconColor} />
                                <span>{tipSection.title}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 text-base leading-relaxed text-foreground/90 pr-4 border-r-2 border-primary">
                                {tipSection.content.map(item => (
                                     <div key={item.subtitle}>
                                        <h4 className="font-bold">{item.subtitle}</h4>
                                        <p className="text-muted-foreground">{item.text}</p>
                                    </div>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                 </Accordion>
            </section>
            
            {/* Glossary Section */}
            <section>
                <h2 className="text-2xl font-bold font-headline mb-4 text-center flex items-center justify-center gap-2">
                    <BookOpen className="text-primary"/>
                    قاموس المصطلحات العقارية
                </h2>
                <Accordion type="single" collapsible className="w-full">
                    {glossaryTerms.map(term => (
                         <AccordionItem key={term.title} value={term.title}>
                             <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                                <div className="flex items-center gap-3">
                                    <term.icon className={term.iconColor} />
                                    <span>{term.title}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-base leading-relaxed text-foreground/90 pr-4 border-r-2 border-primary">
                                <p className="text-muted-foreground">{term.content}</p>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </section>
        </CardContent>
      </Card>
    </div>
  );
}
