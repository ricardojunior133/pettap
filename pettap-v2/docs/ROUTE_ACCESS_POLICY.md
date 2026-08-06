# Route Access Policy

## Coming Soon production mode

With `PETTAP_COMING_SOON_MODE` enabled in production, `proxy.ts` allows these public routes:

- `/`
- `/contact`
- `/privacy`
- `/terms`
- `/shipping`
- `/returns`
- `/robots.txt`
- `/sitemap.xml`
- `/opengraph-image`

Unknown routes are allowed to reach `app/not-found.tsx`, so visitors receive a real 404 instead of silently returning to Home.

## Private routes

Known private application prefixes redirect to `/` while Coming Soon mode is active: `/admin`, `/dashboard`, `/activate`, `/auth`, `/checkout`, `/help`, `/login`, `/pet`, `/pets`, `/preview`, `/register`, `/scan` and `/studio`.

The proxy is a launch gate, not the only security boundary. Server Actions and services continue to authenticate and authorize every private mutation.

## Restoring the full public application

Set `PETTAP_COMING_SOON_MODE=false` only after platform launch review. The dashboard still requires a session and auth pages continue to redirect signed-in users appropriately.
