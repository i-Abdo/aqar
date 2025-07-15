
"use client";

import { Badge } from "@/components/ui/badge";
import type { ServiceAdStatus, GeneralAdStatus } from "@/types";

interface StatusBadgeProps {
  status: ServiceAdStatus | GeneralAdStatus;
}

const statusMap: Record<ServiceAdStatus | GeneralAdStatus, { text: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    active: { text: "نشط", variant: "default" },
    pending: { text: "قيد المراجعة", variant: "secondary" },
    paused: { text: "متوقف مؤقتًا", variant: "secondary" },
    archived: { text: "مؤرشف", variant: "destructive" },
};


export function StatusBadge({ status }: StatusBadgeProps) {
  const display = statusMap[status] || { text: status, variant: "outline" };
  
  return (
    <Badge variant={display.variant}>{display.text}</Badge>
  );
}
