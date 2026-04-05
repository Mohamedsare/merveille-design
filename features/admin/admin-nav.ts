import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  GraduationCap,
  ImageIcon,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
};

export const ADMIN_NAV: AdminNavItem[] = [
  {
    href: "/admin/dashboard",
    label: "Vue d’ensemble",
    icon: LayoutDashboard,
    description: "Indicateurs & tendances",
  },
  {
    href: "/admin/dashboard/orders",
    label: "Commandes",
    icon: ShoppingBag,
    description: "Suivi des demandes",
  },
  {
    href: "/admin/dashboard/products",
    label: "Produits & box",
    icon: Package,
    description: "Catalogue vitrine",
  },
  {
    href: "/admin/dashboard/trainings",
    label: "Formations",
    icon: GraduationCap,
    description: "Ateliers & réservations",
  },
  {
    href: "/admin/dashboard/media",
    label: "Médias",
    icon: ImageIcon,
    description: "Images & retouches",
  },
  {
    href: "/admin/dashboard/analytics",
    label: "Analytics",
    icon: BarChart3,
    description: "Comportement visiteurs",
  },
  {
    href: "/admin/dashboard/settings",
    label: "Paramètres",
    icon: Settings,
    description: "Site & SEO",
  },
];
