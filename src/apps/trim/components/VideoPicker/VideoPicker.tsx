import './video-picker.css'
import { Icon } from '../../../../components/icon/Icon'

type VideoPickerPropsT = {
	onChooseVideo: () => void
}

export const VideoPicker = (props: VideoPickerPropsT) => {
	return (
		<section class='video-picker'>
			<z-empty-state
				heading='Trim a video'
				description='Pick a clip, mark where it starts and ends, and save it back to your phone.'
			>
				<Icon slot='icon' name='scissors' isLarge />
				<z-button kind='solid' accent='dom' size='lg' onClick={props.onChooseVideo}>
					Choose video
				</z-button>
			</z-empty-state>
		</section>
	)
}
