import { HashRouter, Route } from '@solidjs/router'
import { appRegistry } from './apps/registry'
import { HomePage } from './pages/HomePage'

// Hash routing keeps deep links working on GitHub Pages,
// which has no server-side SPA fallback.
export const App = () => {
	const appRoutes = appRegistry.map((appEntry) => <Route path={appEntry.path} component={appEntry.component} />)

	return (
		<HashRouter>
			<Route path='/' component={HomePage} />
			{appRoutes}
			<Route path='*' component={HomePage} />
		</HashRouter>
	)
}
