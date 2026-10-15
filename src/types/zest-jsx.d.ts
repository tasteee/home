import 'solid-js'

type ZestElementAttributesT = {
	class?: string
	children?: unknown
	[attributeName: string]: unknown
}

// Module augmentation requires `interface` here.
// Add each z-* tag as home starts using it.
declare module 'solid-js' {
	namespace JSX {
		interface IntrinsicElements {
			'z-display': ZestElementAttributesT
			'z-empty-state': ZestElementAttributesT
			'z-eyebrow': ZestElementAttributesT
		}
	}
}
