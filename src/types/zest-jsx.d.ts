import 'solid-js'

type ZestElementAttributesT = {
	class?: string
	children?: unknown
	[attributeName: string]: unknown
}

// Add each z-* tag here as home starts using it.
type ZestIntrinsicElementsT = {
	'z-display': ZestElementAttributesT
	'z-empty-state': ZestElementAttributesT
	'z-eyebrow': ZestElementAttributesT
}

// TS only merges new tags into an existing interface.
// This empty shell is the one unavoidable `interface`.
declare module 'solid-js' {
	namespace JSX {
		interface IntrinsicElements extends ZestIntrinsicElementsT {}
	}
}
