import './home-page.css'
import { appRegistry } from '../apps/registry'

export const HomePage = () => {
	const appCount = appRegistry.length
	const hasNoApps = appCount === 0

	return (
		<main class='home-page'>
			<header class='home-page-header'>
				<z-eyebrow label='tasteee' />
				<z-display size='md'>home</z-display>
			</header>

			{hasNoApps && <HomeEmptyState />}
		</main>
	)
}

const HomeEmptyState = () => {
	return (
		<z-empty-state
			heading='No apps yet'
			description='Tools built for home will show up here.'
			is-bordered
		/>
	)
}
