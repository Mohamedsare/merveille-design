This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Déploiement sur Vercel

1. Importer le dossier **`mdesign`** comme racine du projet (Root Directory = `mdesign` si le repo contient aussi `cahier.md`, etc.).
2. **Node** : 20.x ou 22.x (voir `engines` dans `package.json`).
3. **Variables d’environnement** (Settings → Environment Variables), au minimum pour la prod :

| Variable | Obligatoire | Rôle |
|----------|-------------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Recommandé | Données + auth admin |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Recommandé | Client Supabase |
| `NEXT_PUBLIC_SITE_URL` | Optionnel | URL canonique (Open Graph). Sinon Vercel injecte `VERCEL_URL` au build. |

Variables optionnelles : `NEXT_PUBLIC_POSTHOG_*`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `DEEPSEEK_API_KEY`.

4. Build : `npm run build` (défaut Vercel). Pas de `vercel.json` requis pour une app Next standard.

5. **Supabase** : autoriser l’URL de déploiement dans Auth → URL Configuration (redirects / site URL si besoin).

Copier le modèle depuis [`.env.example`](./.env.example) pour le local ; **ne jamais** committer `.env.local` ni de vraies clés dans `.env.example`.
