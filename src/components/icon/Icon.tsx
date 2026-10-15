import './icon.css'
import arrowLeftIcon from '@phosphor-icons/core/bold/arrow-left-bold.svg?raw'
import checkIcon from '@phosphor-icons/core/bold/check-bold.svg?raw'
import filmStripIcon from '@phosphor-icons/core/bold/film-strip-bold.svg?raw'
import scissorsIcon from '@phosphor-icons/core/bold/scissors-bold.svg?raw'
import warningIcon from '@phosphor-icons/core/bold/warning-circle-bold.svg?raw'
import pauseIcon from '@phosphor-icons/core/fill/pause-fill.svg?raw'
import playIcon from '@phosphor-icons/core/fill/play-fill.svg?raw'

const iconMarkupByName = {
	'arrow-left': arrowLeftIcon,
	check: checkIcon,
	'film-strip': filmStripIcon,
	pause: pauseIcon,
	play: playIcon,
	scissors: scissorsIcon,
	warning: warningIcon,
}

export type IconNameT = keyof typeof iconMarkupByName

type IconPropsT = {
	name: IconNameT
	slot?: string
	isLarge?: boolean
}

// Icons inherit color and size from their parent's text.
export const Icon = (props: IconPropsT) => {
	const iconMarkup = () => iconMarkupByName[props.name]
	const iconClass = () => (props.isLarge ? 'icon isLarge' : 'icon')

	return <span class={iconClass()} slot={props.slot} aria-hidden='true' innerHTML={iconMarkup()} />
}
