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

## Apps

- **Trim** (`#/trim`): pick a video, scrub the filmstrip, set a start and end, trim, and save it to your phone through the share sheet. Trimming runs in the browser with [Mediabunny](https://mediabunny.dev) (WebCodecs). Nothing is uploaded.

## Add an app

1. Build it under `src/apps/<app-name>/`.
2. Add an entry to `appRegistry` in `src/apps/registry.ts`.
