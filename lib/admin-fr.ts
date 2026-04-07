import type { OrderType } from "@/types/database";

const ORDER_TYPE_FR: Record<OrderType, string> = {
  bag: "Sac",
  box: "Box",
  custom_bag: "Sac personnalisé",
  training: "Formation",
};

const ORDER_STATUS_FR: Record<string, string> = {
  new: "Nouveau",
  pending: "En attente",
  confirmed: "Confirmé",
  in_production: "En production",
  ready: "Prêt",
  delivered: "Livré",
  cancelled: "Annulé",
  training_received: "Réservation reçue",
  training_pending: "Réservation en attente",
  training_validated: "Réservation validée",
  training_scheduled: "Formation planifiée",
  training_completed: "Formation terminée",
  training_cancelled: "Formation annulée",
};

const ENHANCEMENT_STATUS_FR: Record<string, string> = {
  none: "Non traité",
  pending: "En attente",
  processing: "Traitement",
  enhanced: "Amélioré",
  approved: "Approuvé",
  rejected: "Rejeté",
  error: "Erreur",
};

export function orderTypeLabelFr(orderType: string): string {
  return ORDER_TYPE_FR[orderType as OrderType] ?? orderType;
}

export function orderStatusLabelFr(status: string): string {
  return ORDER_STATUS_FR[status] ?? status;
}

export function enhancementStatusLabelFr(status: string): string {
  return ENHANCEMENT_STATUS_FR[status] ?? status;
}
