import { z } from "zod";

export const orderProductSchema = z.object({
  customer_name: z.string().min(2, "Nom requis"),
  phone: z.string().min(8, "Téléphone requis"),
  email: z.string().email().optional().or(z.literal("")),
  city: z.string().optional(),
  country: z.string().default("Burkina Faso"),
  order_type: z.enum(["bag", "box", "custom_bag"]),
  product_id: z.string().uuid().optional().nullable(),
  quantity: z.coerce.number().int().min(1).default(1),
  budget: z.string().optional(),
  customization_request: z.string().optional(),
  details: z.string().min(10, "Décrivez votre besoin (10 caractères min)"),
  fabric_color_notes: z.string().optional(),
  inspiration_image_url: z.string().url().optional().or(z.literal("")),
  preferred_date: z.string().optional(),
});

export const orderTrainingSchema = z.object({
  customer_name: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal("")),
  city: z.string().optional(),
  country: z.string().default("Burkina Faso"),
  order_type: z.literal("training"),
  training_id: z.string().uuid().optional().nullable(),
  details: z.string().min(10, "Précisez votre niveau et vos disponibilités"),
  customization_request: z.string().optional(),
});

export const contactQuickSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  message: z.string().min(10),
});

export const visitorEventSchema = z.object({
  event_name: z.string(),
  page_path: z.string().optional(),
  session_id: z.string().optional(),
  device_type: z.string().optional(),
  browser: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const productAdminSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  category_id: z.string().uuid().optional().nullable(),
  type: z.enum(["bag", "box"]),
  short_description: z.string().optional(),
  description: z.string().optional(),
  base_price: z.coerce.number().optional().nullable(),
  pricing_mode: z.enum(["fixed", "quote", "starting_from"]),
  is_customizable: z.boolean(),
  is_model_only: z.boolean(),
  is_featured: z.boolean(),
  is_published: z.boolean(),
  cover_image_url: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).optional(),
  display_order: z.coerce.number().int().default(0),
  stock: z.coerce.number().int().optional().nullable(),
});

export const trainingAdminSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  short_description: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().optional().nullable(),
  pricing_mode: z.enum(["fixed", "quote", "starting_from"]),
  duration: z.string().optional(),
  level: z.string().optional(),
  mode: z.string().optional(),
  is_published: z.boolean(),
  cover_image_url: z.string().url().optional().or(z.literal("")),
  display_order: z.coerce.number().int().default(0),
});
