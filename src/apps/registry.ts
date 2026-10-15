import type { Component } from 'solid-js'

export type AppEntryT = {
	id: string
	name: string
	description: string
	path: string
	component: Component
}

// Every tool that lives in home registers here.
// The home page and the router both read this list.
export const appRegistry: AppEntryT[] = []
