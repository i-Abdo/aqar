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
import { DollarSign, KeyRound, ShieldCheck, Home } from "lucide-react";

export default function TipsPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-4xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <Home className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-4xl font-headline text-primary">
            دليلك الشامل في عالم العقارات
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            نصائح من الخبراء لمساعدتك في كل خطوة، سواء كنت تبيع، تشتري، أو تؤجر.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 px-4 md:px-8">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                <div className="flex items-center gap-3">
                  <DollarSign className="text-green-500" />
                  <span>نصائح للبائعين</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 text-base leading-relaxed text-foreground/90 pr-4 border-r-2 border-primary">
                <div>
                  <h4 className="font-bold">1. التسعير الصحيح هو مفتاح النجاح:</h4>
                  <p className="text-muted-foreground">
                    ابحث عن أسعار العقارات المماثلة في منطقتك. سعر أعلى من اللازم سيُبعد المشترين، وسعر أقل سيضيع عليك الأرباح. استشر خبيرًا إذا لزم الأمر.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold">2. الصور الاحترافية تصنع الفارق:</h4>
                  <p className="text-muted-foreground">
                    الصور هي أول ما يراه المشتري. استثمر في صور عالية الجودة تُظهر أفضل زوايا وميزات عقارك. الإضاءة الجيدة والنظافة أمران أساسيان.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold">3. جهّز عقارك للعرض (Home Staging):</h4>
                  <p className="text-muted-foreground">
                    قم بإصلاح أي أعطال بسيطة، وأزل الأغراض الشخصية، ونظّف المكان بعمق. عقار نظيف ومرتب يترك انطباعًا إيجابيًا ويسهل على المشترين تخيل أنفسهم يعيشون فيه.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                <div className="flex items-center gap-3">
                  <KeyRound className="text-accent" />
                  <span>نصائح للمشترين</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 text-base leading-relaxed text-foreground/90 pr-4 border-r-2 border-primary">
                <div>
                  <h4 className="font-bold">1. حدد ميزانيتك بدقة:</h4>
                  <p className="text-muted-foreground">
                    قبل البدء بالبحث، اعرف المبلغ الذي يمكنك تحمله. لا تنسَ حساب التكاليف الإضافية مثل رسوم التسجيل، الضرائب، وأي إصلاحات محتملة.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold">2. الموقع، الموقع، الموقع:</h4>
                  <p className="text-muted-foreground">
                    فكر في المستقبل. هل المنطقة قريبة من عملك، المدارس، والمرافق العامة؟ هل هي منطقة آمنة وذات قيمة استثمارية متزايدة؟ قم بزيارة المنطقة في أوقات مختلفة من اليوم.
                  </p>
                </div>
                 <div>
                  <h4 className="font-bold">3. لا تتجاهل الفحص الفني للعقار:</h4>
                  <p className="text-muted-foreground">
                    استعن بخبير لفحص العقار والكشف عن أي مشاكل خفية في الأساسات، السباكة، أو الكهرباء. هذا قد يوفر عليك آلاف الدنانير في المستقبل.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-blue-500" />
                  <span>نصائح قانونية وعامة</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 text-base leading-relaxed text-foreground/90 pr-4 border-r-2 border-primary">
                <div>
                  <h4 className="font-bold">1. اقرأ العقد جيدًا:</h4>
                  <p className="text-muted-foreground">
                    لا توقّع على أي شيء لا تفهمه تمامًا. استشر محاميًا أو موثقًا لمراجعة عقد البيع أو الإيجار والتأكد من حماية حقوقك.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold">2. وثّق كل شيء كتابيًا:</h4>
                  <p className="text-muted-foreground">
                    أي اتفاقات أو وعود شفهية يجب أن يتم توثيقها في العقد. هذا يشمل أي إصلاحات وافق البائع على القيام بها أو أي أثاث متضمن في الصفقة.
                  </p>
                </div>
                 <div>
                  <h4 className="font-bold">3. كن مستعدًا للتفاوض:</h4>
                  <p className="text-muted-foreground">
                    نادرًا ما يكون السعر المعروض نهائيًا. كن مستعدًا لتقديم عرض والتفاوض بشكل احترافي للوصول إلى سعر يرضي الطرفين.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
