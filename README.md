# Ali Samuel — Portfolio

Next.js 15 (App Router) · React 19 · TypeScript · Three.js

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
```

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. On vercel.com → **Add New → Project** → import the repository.
3. Keep the defaults (Framework: Next.js) and press **Deploy**.

Without GitHub: `npx vercel` from this folder deploys it directly.

## Edit content

Everything lives in **`content/site.ts`**: name, contact details, skills, services,
process, projects and the AI Lab demo. The assistant ("Ask Samuel") answers only
from that file, so updating it updates the site and the assistant together.

- **Projects** — add or edit entries in `projects`. Screenshots of each `url` load
  automatically. To use your own, put images in `public/images/` and add
  `images: ['/images/name-1.png', '/images/name-2.png', '/images/name-3.png']`.
- **Photo** — replace `public/samuel.webp`.
- **Social links** — fill in `socials`.
- **Availability badge** — set `available` to `true` or `false`.

## Structure

```
app/            layout (fonts, metadata), page, global styles
components/     one file per section, plus the modal and assistant
content/site.ts all site content
lib/assistant.ts assistant tools, intent routing and project-brief flow
public/         photo and static assets
```

The assistant runs in the browser and calls read-only "tools" over `content/site.ts`.
To use a real AI model later, add an API route that exposes the same `TOOLS` to the model;
the chat UI only renders `Reply` objects and doesn't need to change.
