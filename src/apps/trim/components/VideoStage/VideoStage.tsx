import './video-stage.css'
import { onCleanup, onMount } from 'solid-js'
import type { TrimSessionT } from '../../state/createTrimSession'

type VideoStagePropsT = {
	session: TrimSessionT
}

// The #t fragment makes iOS paint the first frame
// instead of a blank box before playback starts.
const FIRST_FRAME_FRAGMENT = '#t=0.001'

export const VideoStage = (props: VideoStagePropsT) => {
	let videoElement: HTMLVideoElement | undefined

	const videoSource = () => {
		const sourceUrl = props.session.sourceUrl()
		const hasSourceUrl = sourceUrl !== null
		if (!hasSourceUrl) return undefined
		return `${sourceUrl}${FIRST_FRAME_FRAGMENT}`
	}

	onMount(() => {
		const hasVideoElement = videoElement !== undefined
		if (!hasVideoElement) return
		const mountedVideo = videoElement
		props.session.attachVideo(mountedVideo)
		onCleanup(() => props.session.detachVideo(mountedVideo))
	})

	return (
		<div class='video-stage' onClick={props.session.togglePlay}>
			<video ref={videoElement} class='video-stage-video' src={videoSource()} playsinline preload='metadata' />
		</div>
	)
}
