"use client";

import { Download } from "lucide-react";
import { exportOrdersCsv } from "@/actions/admin-orders";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ExportOrdersButton() {
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      className="gap-2"
      onClick={async () => {
        const r = await exportOrdersCsv();
        if ("error" in r) {
          toast.error(r.error);
          return;
        }
        const blob = new Blob([r.csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `commandes-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Export prêt");
      }}
    >
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  );
}
