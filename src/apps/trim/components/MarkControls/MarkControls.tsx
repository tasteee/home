import './mark-controls.css'
import type { TrimSessionT } from '../../state/createTrimSession'
import { MarkButton } from '../MarkButton/MarkButton'

type MarkControlsPropsT = {
	session: TrimSessionT
}

export const MarkControls = (props: MarkControlsPropsT) => {
	return (
		<div class='mark-controls'>
			<MarkButton label='Set start' markTime={props.session.startTime()} onMark={props.session.markStart} />
			<MarkButton label='Set end' markTime={props.session.endTime()} onMark={props.session.markEnd} />
		</div>
	)
}
