import { HashRouter, Route } from '@solidjs/router'
import { HomePage } from './pages/HomePage'

// Hash routing keeps deep links working on GitHub Pages,
// which has no server-side SPA fallback.
export const App = () => {
	return (
		<HashRouter>
			<Route path='/' component={HomePage} />
		</HashRouter>
	)
}
