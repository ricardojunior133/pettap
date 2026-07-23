# Route Access Policy

## Public during Coming Soon

`/`, `/contact`, `/privacy`, `/terms`, `/robots.txt`, `/sitemap.xml` and `/opengraph-image` are explicitly allowed by `proxy.ts`.

## Private during Coming Soon

All other routes redirect to `/` in production, including `/dashboard`, `/activate`, `/register`, `/login`, `/studio`, `/pet/*`, `/checkout/*`, `/scan`, `/help`, `/preview`, `/shipping` and `/returns`.

## Development-only access

The private route architecture is available locally while `PETTAP_COMING_SOON_MODE` is not active in production. This is for engineering validation only; it is not a public preview mechanism.

## Future activation condition

Private routes may be opened only after authentication, server-side authorization, database repositories, tag validation, privacy controls and a dedicated launch review are complete.
