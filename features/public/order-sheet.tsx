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
import { submitProductOrderForm } from "@/actions/orders";
import { useTrackEvent } from "@/hooks/use-analytics";
import type { Product } from "@/types/database";

type Mode = "model" | "custom";
/** `box_quote` : libellés et champs orientés devis coffrets (section Box). */
type FormVariant = "default" | "box_quote";

export function OrderSheet({
  mode,
  product,
  trigger,
  formVariant = "default",
}: {
  mode: Mode;
  product: Product;
  trigger: React.ReactNode;
  formVariant?: FormVariant;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const track = useTrackEvent();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const order_type =
      mode === "custom"
        ? product.type === "box"
          ? ("box" as const)
          : ("custom_bag" as const)
        : product.type;
    fd.set("order_type", order_type);
    fd.set("product_id", product.id);
    startTransition(async () => {
      void track(mode === "model" ? "model_order_click" : "personalization_request_click", {
        productId: product.id,
      });
      const res = await submitProductOrderForm(fd);
      if (res.ok) {
        toast.success("Demande envoyée. Nous vous recontactons très vite.");
        setOpen(false);
        void track("form_submit", { form: "order_product" });
      } else {
        toast.error(res.error ?? "Erreur d’envoi");
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="h-auto max-h-[92vh] overflow-y-auto rounded-t-3xl">
        <SheetHeader>
          <SheetTitle>
            {mode === "custom"
              ? "Demande de personnalisation"
              : formVariant === "box_quote"
                ? "Demande de devis — box & coffrets"
                : "Commander ce modèle"}
          </SheetTitle>
          <p className="text-left text-sm text-[var(--muted-foreground)]">{product.name}</p>
          {mode === "model" && formVariant === "box_quote" ? (
            <p className="text-left text-sm text-[var(--muted-foreground)]">
              Emballages sur mesure pour vos marques et événements. Indiquez vos coordonnées et une quantité approximative
              : nous vous rappelons pour établir votre devis.
            </p>
          ) : mode === "model" ? (
            <p className="text-left text-sm text-[var(--muted-foreground)]">
              Laissez vos coordonnées et la quantité souhaitée : nous vous rappelons pour confirmer la commande de ce
              modèle.
            </p>
          ) : (
            <p className="text-left text-sm text-[var(--muted-foreground)]">
              Décrivez vos envies, ajoutez une date ou une photo d’inspiration : nous étudions votre projet sur mesure.
            </p>
          )}
        </SheetHeader>
        <form className="mt-6 space-y-4 pb-8" onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Nom complet</Label>
              <Input id="customer_name" name="customer_name" required placeholder="Prénom Nom" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" name="phone" required placeholder="+226 …" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email (optionnel)</Label>
              <Input id="email" name="email" type="email" placeholder="vous@email.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input id="city" name="city" placeholder="Ouagadougou" />
            </div>
          </div>
          <input type="hidden" name="country" value="Burkina Faso" />
          <div className="space-y-2">
            <Label htmlFor="quantity">
              {mode === "model" && formVariant === "box_quote"
                ? "Quantité estimée (coffrets)"
                : "Quantité"}
            </Label>
            <Input id="quantity" name="quantity" type="number" min={1} defaultValue={1} />
          </div>

          {mode === "model" && formVariant === "box_quote" ? (
            <div className="space-y-2">
              <Label htmlFor="details">Précisions sur votre besoin (optionnel)</Label>
              <Textarea
                id="details"
                name="details"
                placeholder="Type d’événement, délai, marquage logo, format souhaité…"
                rows={3}
              />
            </div>
          ) : null}

          {mode === "custom" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="preferred_date">Date souhaitée</Label>
                <Input id="preferred_date" name="preferred_date" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inspiration_image_file">Photo d’inspiration (optionnel)</Label>
                <Input
                  id="inspiration_image_file"
                  name="inspiration_image_file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="cursor-pointer text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--muted)] file:px-3 file:py-1.5 file:text-sm"
                />
                <p className="text-xs text-[var(--muted-foreground)]">
                  JPEG, PNG, WebP ou GIF — max 5 Mo.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customization_request">Personnalisation souhaitée</Label>
                <Textarea
                  id="customization_request"
                  name="customization_request"
                  placeholder="Forme, fermoir, broderie, initiales…"
                  rows={3}
                />
              </div>
            </>
          ) : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending
              ? "Envoi…"
              : mode === "model" && formVariant === "box_quote"
                ? "Envoyer ma demande de devis"
                : mode === "model"
                  ? "Envoyer ma demande de commande"
                  : "Envoyer ma demande de personnalisation"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
