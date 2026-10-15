import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

// GitHub Pages serves the site from /<repo>/.
// CI passes the real path in BASE_PATH; local dev uses root.
const basePath = process.env.BASE_PATH ?? '/'

export default defineConfig({
	base: basePath,
	plugins: [solid()],
})
