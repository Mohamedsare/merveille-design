import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const contentType = "image/png";
export const size = { width: 180, height: 180 };

export default async function AppleIcon() {
  const buffer = await readFile(join(process.cwd(), "public", "logo.png"));
  return new Response(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
