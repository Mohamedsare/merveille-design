export type CategoryType = "bag" | "box" | "training";
export type ProductType = "bag" | "box";
export type PricingMode = "fixed" | "quote" | "starting_from";
export type OrderType = "bag" | "box" | "custom_bag" | "training";
export type OrderStatus =
  | "new"
  | "pending"
  | "confirmed"
  | "in_production"
  | "ready"
  | "delivered"
  | "cancelled"
  | "training_received"
  | "training_pending"
  | "training_validated"
  | "training_scheduled"
  | "training_completed"
  | "training_cancelled";

export type EnhancementStatus =
  | "none"
  | "pending"
  | "processing"
  | "enhanced"
  | "approved"
  | "rejected"
  | "error";

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: CategoryType;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  type: ProductType;
  short_description: string | null;
  description: string | null;
  base_price: number | null;
  pricing_mode: PricingMode;
  is_customizable: boolean;
  is_model_only: boolean;
  is_featured: boolean;
  is_published: boolean;
  cover_image_url: string | null;
  tags: string[] | null;
  display_order: number;
  stock: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  original_image_url: string | null;
  enhanced_image_url: string | null;
  enhancement_status: EnhancementStatus;
  sort_order: number;
  created_at: string;
}

export interface Training {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number | null;
  pricing_mode: PricingMode;
  duration: string | null;
  level: string | null;
  mode: string | null;
  is_published: boolean;
  cover_image_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: string;
  site_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  whatsapp_number: string | null;
  contact_email: string | null;
  social_links: Record<string, string> | null;
  theme_config: Record<string, unknown> | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_name: string;
  phone: string;
  email: string | null;
  city: string | null;
  country: string | null;
  order_type: OrderType;
  product_id: string | null;
  training_id: string | null;
  quantity: number;
  budget: string | null;
  customization_request: string | null;
  details: string | null;
  fabric_color_notes: string | null;
  inspiration_image_url: string | null;
  preferred_date: string | null;
  status: string;
  admin_notes: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface VisitorEvent {
  id: string;
  session_id: string | null;
  event_name: string;
  page_path: string | null;
  device_type: string | null;
  browser: string | null;
  country: string | null;
  city: string | null;
  referrer: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
