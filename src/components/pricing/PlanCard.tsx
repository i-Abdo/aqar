
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import type { Plan } from "@/types";
import { cn } from "@/lib/utils";

interface PlanCardProps {
  plan: Plan;
  isCurrentPlan?: boolean;
  onSelectPlan: (planId: Plan["id"]) => void;
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
        <ul className="space-y-2 list-none p-0">
          {plan.features.map((feature, index) => {
            let iconElement = null;
            let textElement = feature;
            let iconColorClass = "";

            if (feature.endsWith(" ✓")) {
              iconElement = <CheckCircle className="h-5 w-5" />;
              textElement = feature.slice(0, -2).trim();
              iconColorClass = "text-green-500";
            } else if (feature.endsWith(" ✕")) {
              iconElement = <XCircle className="h-5 w-5" />;
              textElement = feature.slice(0, -2).trim();
              iconColorClass = "text-destructive";
            }

            return (
              <li key={index} className="flex items-start min-h-10"> {/* Ensures consistent height and top alignment */}
                <span className={cn(
                  "inline-flex items-center justify-center w-6 h-5 ml-2 shrink-0", // Adjusted height to h-5 for better alignment with text line
                  iconColorClass
                )}>
                  {iconElement}
                </span>
                <span>{textElement}</span>
              </li>
            );
          })}
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
