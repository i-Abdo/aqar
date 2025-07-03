import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants, type VariantProps } from "@/components/ui/button";
import { CheckCircle, XCircle, BadgeCheck } from "lucide-react";
import type { Plan } from "@/types";
import { cn } from "@/lib/utils";

interface PlanCardProps {
  plan: Plan;
  isCurrentPlan?: boolean;
  isFeatured?: boolean;
  onSelectPlan: (planId: Plan["id"]) => void;
  isLoading?: boolean;
}

export function PlanCard({ plan, isCurrentPlan, isFeatured, onSelectPlan, isLoading }: PlanCardProps) {
  const renderPlanName = () => {
    if (plan.name === "VIP++") {
      return (
        <>
          VIP<span className="text-primary">++</span>
        </>
      );
    }
    return plan.name;
  };

  let buttonVariant: VariantProps<typeof buttonVariants>['variant'] = "outline_primary";
  let customClasses = "";

  if (isCurrentPlan) {
    buttonVariant = "outline_primary";
  } else if (isFeatured) {
    buttonVariant = "default";
  } else if (plan.id === 'vip_plus_plus') {
    // This is the custom style for VIP++
    buttonVariant = "default";
    customClasses = "bg-primary text-primary-foreground border-2 border-accent hover:bg-primary/90 hover:border-accent/80 shadow-lg shadow-accent/20";
  } else if (plan.id === 'free') {
    // This makes "ابدأ مجانًا" have outline style
     buttonVariant = "outline_primary";
  }


  return (
    <Card className={cn(
        "flex flex-col shadow-lg transition-all duration-300 relative", 
        isCurrentPlan ? "ring-2 ring-primary border-primary" : "hover:shadow-xl hover:-translate-y-2",
        isFeatured ? "bg-secondary/50 border-primary" : "bg-card"
    )}>
        {isFeatured && (
            <div className="absolute -top-3 right-4 bg-primary text-primary-foreground px-3 py-1 text-sm font-semibold rounded-full flex items-center gap-1 shadow-lg">
                <BadgeCheck size={16}/>
                الأكثر شيوعًا
            </div>
        )}
      <CardHeader className="items-center text-center pt-8">
        <CardTitle className="text-2xl font-headline">{renderPlanName()}</CardTitle>
        <CardDescription className="text-muted-foreground h-12">{plan.description || ""}</CardDescription>
        <div className="text-4xl font-bold text-accent min-h-[3.5rem] flex items-baseline gap-1">
          --
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-4 list-none p-0">
          {plan.features.map((feature, index) => {
            const hasCheck = feature.endsWith(" ✓") || feature.endsWith(" ✓✓");
            const hasCross = feature.endsWith(" ✕");
            
            const Icon = hasCheck ? CheckCircle : hasCross ? XCircle : CheckCircle;
            const iconColor = hasCheck ? "text-green-500" : hasCross ? "text-destructive/50" : "text-primary";
            const textColor = hasCross ? "text-muted-foreground" : "text-foreground";
            
            const textElement = feature.replace(/ (✓|✓✓|✕)$/, '').trim();

            return (
              <li key={index} className="flex items-start gap-3">
                <span className={cn("inline-flex items-center justify-center h-5 shrink-0", iconColor)}>
                    <Icon className="h-5 w-5" />
                </span>
                <span className={textColor}>{textElement}</span>
              </li>
            );
          })}
        </ul>
      </CardContent>
      <CardFooter className="p-6">
        <Button 
          className={cn("w-full transition-smooth hover:shadow-md text-base", customClasses)} 
          onClick={() => onSelectPlan(plan.id)}
          disabled={isCurrentPlan || isLoading}
          variant={buttonVariant}
          size="lg"
        >
          {isLoading ? "جاري..." : (isCurrentPlan ? "الخطة الحالية" : plan.cta)}
        </Button>
      </CardFooter>
    </Card>
  );
}
