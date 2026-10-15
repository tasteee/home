import './home-page.css'
import { For, Show } from 'solid-js'
import { appRegistry } from '../apps/registry'
import { AppCard } from '../components/app-card/AppCard'

export const HomePage = () => {
	const hasApps = appRegistry.length > 0

	return (
		<main class='home-page'>
			<header class='home-page-header'>
				<z-eyebrow label='tasteee' />
				<z-display size='md'>home</z-display>
			</header>

			<Show when={hasApps} fallback={<HomeEmptyState />}>
				<div class='home-page-apps'>
					<For each={appRegistry}>{(appEntry) => <AppCard app={appEntry} />}</For>
				</div>
			</Show>
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
