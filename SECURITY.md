# Security Policy

## Supported Version

This repository currently supports the latest version on the main branch.

## Reporting Security Issues

Please do not open a public issue for sensitive security reports. Use a private disclosure channel owned by the repository maintainer.

## Security Model

This is a static client-side dashboard. It does not store user accounts, passwords, payment data, private documents, or server-side credentials.

Important boundaries:

- Vite `VITE_*` variables are public once bundled.
- NASA API keys used in this app are public browser keys, not private server secrets.
- Third-party API responses are treated as untrusted and rendered through React-controlled UI paths.
- Browser storage is used only for satellite telemetry cache.

## Deployment Checklist

- Keep `.env.local` and all private `.env.*` files out of Git.
- Use repository or hosting-provider environment variables for `VITE_NASA_API_KEY`.
- Run `npm run build` before publishing.
- Review dependency audit output before release.
- Prefer Vercel or Netlify for clean SPA route rewrites, or configure GitHub Pages carefully for nested routes.
