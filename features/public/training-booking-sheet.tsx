"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { submitTrainingBooking } from "@/actions/orders";
import { useTrackEvent } from "@/hooks/use-analytics";
import type { Training } from "@/types/database";

export function TrainingBookingSheet({
  training,
  trigger,
}: {
  training: Training;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const track = useTrackEvent();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = {
      customer_name: fd.get("customer_name"),
      phone: fd.get("phone"),
      email: fd.get("email") || "",
      city: fd.get("city") || "",
      country: fd.get("country") || "Burkina Faso",
      order_type: "training" as const,
      training_id: training.id,
      details: fd.get("details"),
      customization_request: fd.get("customization_request") || "",
    };
    startTransition(async () => {
      void track("training_booking_click", { trainingId: training.id });
      const res = await submitTrainingBooking(raw);
      if (res.ok) {
        toast.success("Demande de formation enregistrée. Nous vous rappelons sous 48h.");
        setOpen(false);
        void track("form_submit", { form: "training" });
      } else {
        toast.error(res.error ?? "Erreur");
      }
    });
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) void track("training_view", { trainingId: training.id });
      }}
    >
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="h-auto max-h-[92vh] overflow-y-auto rounded-t-3xl">
        <SheetHeader>
          <SheetTitle>Réserver : {training.title}</SheetTitle>
          <p className="text-left text-sm text-[var(--muted-foreground)]">
            Présentiel · {training.duration ?? "Durée sur devis"} · {training.level ?? "Tous niveaux"}
          </p>
        </SheetHeader>
        <form className="mt-6 space-y-4 pb-8" onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="t_name">Nom</Label>
              <Input id="t_name" name="customer_name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t_phone">Téléphone</Label>
              <Input id="t_phone" name="phone" required />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="t_email">Email</Label>
              <Input id="t_email" name="email" type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t_city">Ville</Label>
              <Input id="t_city" name="city" />
            </div>
          </div>
          <input type="hidden" name="country" value="Burkina Faso" />
          <div className="space-y-2">
            <Label htmlFor="t_avail">Disponibilités</Label>
            <Textarea
              id="t_avail"
              name="customization_request"
              placeholder="Semaines préférées, jours de la semaine…"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="t_details">Message *</Label>
            <Textarea
              id="t_details"
              name="details"
              required
              placeholder="Votre niveau, vos objectifs, questions…"
              rows={4}
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Envoi…" : "Envoyer la demande"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
