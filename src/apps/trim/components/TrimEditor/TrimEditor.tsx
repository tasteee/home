import './trim-editor.css'
import type { TrimSessionT } from '../../state/createTrimSession'
import { Filmstrip } from '../Filmstrip/Filmstrip'
import { MarkControls } from '../MarkControls/MarkControls'
import { TransportBar } from '../TransportBar/TransportBar'
import { TrimAction } from '../TrimAction/TrimAction'
import { TrimFailureSheet } from '../TrimFailureSheet/TrimFailureSheet'
import { TrimProgressSheet } from '../TrimProgressSheet/TrimProgressSheet'
import { TrimResultSheet } from '../TrimResultSheet/TrimResultSheet'
import { VideoStage } from '../VideoStage/VideoStage'

type TrimEditorPropsT = {
	session: TrimSessionT
}

export const TrimEditor = (props: TrimEditorPropsT) => {
	return (
		<div class='trim-editor'>
			<VideoStage session={props.session} />

			<section class='trim-editor-controls'>
				<TransportBar session={props.session} />
				<Filmstrip session={props.session} />
				<MarkControls session={props.session} />
				<TrimAction session={props.session} />
			</section>

			<TrimProgressSheet session={props.session} />
			<TrimResultSheet session={props.session} />
			<TrimFailureSheet session={props.session} />
		</div>
	)
}
