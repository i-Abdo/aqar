import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import type { Plan } from "@/types";
import { cn } from "@/lib/utils";

interface PlanCardProps {
  plan: Plan;
  isCurrentPlan?: boolean;
  onSelectPlan: (planId: Plan["id"]) => void; // Callback for plan selection
  isLoading?: boolean;
}

export function PlanCard({ plan, isCurrentPlan, onSelectPlan, isLoading }: PlanCardProps) {
  return (
    <Card className={cn("flex flex-col shadow-lg transition-all duration-300 hover:shadow-xl", isCurrentPlan && "ring-2 ring-primary border-primary")}>
      <CardHeader className="items-center text-center">
        <CardTitle className="text-2xl font-headline">{plan.name}</CardTitle>
        <CardDescription className="text-4xl font-bold text-primary">
          {plan.priceMonthly > 0 ? `${plan.priceMonthly} د.ج` : "مجاني"}
          {plan.priceMonthly > 0 && <span className="text-sm font-normal text-muted-foreground">/شهر</span>}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 ml-2 rtl:ml-0 rtl:mr-2" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full transition-smooth hover:shadow-md" 
          onClick={() => onSelectPlan(plan.id)}
          disabled={isCurrentPlan || isLoading}
          variant={isCurrentPlan ? "outline_primary" : "default"}
        >
          {isLoading ? "جاري المعالجة..." : (isCurrentPlan ? "الخطة الحالية" : plan.cta)}
        </Button>
      </CardFooter>
    </Card>
  );
}
