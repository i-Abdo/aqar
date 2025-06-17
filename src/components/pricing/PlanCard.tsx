
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

  return (
    <Card className={cn("flex flex-col shadow-lg transition-all duration-300 hover:shadow-xl", isCurrentPlan && "ring-2 ring-primary border-primary")}>
      <CardHeader className="items-center text-center">
        <CardTitle className="text-2xl font-headline">{renderPlanName()}</CardTitle>
        <CardDescription className="text-3xl font-bold text-accent min-h-[2.5rem]"> {/* Added min-h for consistency */}
          {plan.priceMonthly > 0 ? (
            <>
              {`${plan.priceMonthly.toLocaleString()} د.ج`}
              <span className="text-lg font-normal text-muted-foreground">/شهر</span>
            </>
          ) : (
            null // Render nothing if the price is 0 or less
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-2 list-none p-0">
          {plan.features.map((feature, index) => {
            let iconElement = null;
            let textElement = feature;
            let iconColorClass = "";
            let specificIconContainerClass = "w-6"; // Default for single icons

            if (feature.endsWith(" ✓✓")) {
              iconElement = (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </>
              );
              textElement = feature.slice(0, -3).trim(); // Remove " ✓✓"
              specificIconContainerClass = "w-auto"; // Container adapts to content
            } else if (feature.endsWith(" ✓")) {
              iconElement = <CheckCircle className="h-5 w-5" />;
              textElement = feature.slice(0, -2).trim();
              iconColorClass = "text-green-500";
            } else if (feature.endsWith(" ✕")) {
              iconElement = <XCircle className="h-5 w-5" />;
              textElement = feature.slice(0, -2).trim();
              iconColorClass = "text-destructive";
            }

            return (
              <li key={index} className="flex items-start min-h-10">
                <span className={cn(
                  "inline-flex items-center justify-center h-5 ml-2 shrink-0", // ml-2 for space between icon(s) and text (RTL)
                  specificIconContainerClass, 
                  !feature.endsWith(" ✓✓") ? iconColorClass : "" 
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

