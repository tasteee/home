import './play-button.css'
import { Icon } from '../../../../components/icon/Icon'

type PlayButtonPropsT = {
	isPlaying: boolean
	onToggle: () => void
}

export const PlayButton = (props: PlayButtonPropsT) => {
	const iconName = () => (props.isPlaying ? 'pause' : 'play')
	const buttonLabel = () => (props.isPlaying ? 'Pause' : 'Play')

	return (
		<button class='play-button' type='button' aria-label={buttonLabel()} onClick={props.onToggle}>
			<Icon name={iconName()} />
		</button>
	)
}
