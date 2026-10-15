# home

One site for all my small web tools. Built with SolidJS, Vite, and [Zest](https://www.npmjs.com/package/@tasteee/zest).

## Run

```sh
bun install
bun run dev
```

## Deploy

Every push to `main` or `master` builds and deploys to GitHub Pages.

One-time setup: **Settings → Pages → Source → GitHub Actions**.

## Add an app

1. Build it under `src/apps/<app-name>/`.
2. Add an entry to `appRegistry` in `src/apps/registry.ts`.
