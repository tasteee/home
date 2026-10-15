import { lazy } from 'solid-js'
import type { Component } from 'solid-js'
import type { IconNameT } from '../components/icon/Icon'

export type AppEntryT = {
	id: string
	name: string
	description: string
	path: string
	icon: IconNameT
	component: Component
}

// Each app loads on demand, so home stays light no matter
// how many tools it collects.
const loadTrimApp = async () => {
	const trimModule = await import('./trim/TrimApp')
	return { default: trimModule.TrimApp }
}

// Every tool that lives in home registers here.
// The home page and the router both read this list.
export const appRegistry: AppEntryT[] = [
	{
		id: 'trim',
		name: 'Trim',
		description: 'Cut a clip out of any video and save it back to your phone.',
		path: '/trim',
		icon: 'scissors',
		component: lazy(loadTrimApp),
	},
]
