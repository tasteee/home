import './trim-top-bar.css'
import { Show } from 'solid-js'
import { Icon } from '../../../../components/icon/Icon'

type TrimTopBarPropsT = {
	canChooseNewVideo: boolean
	onChooseNewVideo: () => void
}

export const TrimTopBar = (props: TrimTopBarPropsT) => {
	return (
		<header class='trim-top-bar'>
			<a class='trim-top-bar-back' href='#/' aria-label='Back to home'>
				<Icon name='arrow-left' />
			</a>

			<span class='trim-top-bar-title'>Trim</span>

			<div class='trim-top-bar-end'>
				<Show when={props.canChooseNewVideo}>
					<z-button kind='ghost' accent='neutral' size='sm' onClick={props.onChooseNewVideo}>
						New video
					</z-button>
				</Show>
			</div>
		</header>
	)
}
