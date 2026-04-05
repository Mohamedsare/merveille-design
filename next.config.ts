import type { NextConfig } from "next";

function supabaseStoragePattern():
  | { protocol: "https"; hostname: string; pathname: string }
  | undefined {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return undefined;
  try {
    const { hostname } = new URL(raw);
    if (!hostname || !hostname.includes(".")) return undefined;
    return {
      protocol: "https",
      hostname,
      pathname: "/storage/v1/object/public/**",
    };
  } catch {
    return undefined;
  }
}

const remotePatterns: NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> = [
  { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
];

const supabase = supabaseStoragePattern();
if (supabase) {
  remotePatterns.push(supabase);
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
