import './transport-bar.css'
import { formatTime } from '../../lib/formatTime'
import type { TrimSessionT } from '../../state/createTrimSession'
import { PlayButton } from '../PlayButton/PlayButton'

type TransportBarPropsT = {
	session: TrimSessionT
}

export const TransportBar = (props: TransportBarPropsT) => {
	const currentTimeLabel = () => formatTime(props.session.currentTime())
	const durationLabel = () => formatTime(props.session.duration())

	return (
		<div class='transport-bar'>
			<span class='transport-bar-time'>{currentTimeLabel()}</span>
			<PlayButton isPlaying={props.session.isPlaying()} onToggle={props.session.togglePlay} />
			<span class='transport-bar-time isMuted isEnd'>{durationLabel()}</span>
		</div>
	)
}
