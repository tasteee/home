import './trim-action.css'
import { Show } from 'solid-js'
import { Icon } from '../../../../components/icon/Icon'
import { formatClipLength } from '../../lib/formatTime'
import type { TrimSessionT } from '../../state/createTrimSession'

type TrimActionPropsT = {
	session: TrimSessionT
}

const HINT_NOTHING_SET = 'Scrub to where your clip begins, then tap Set start.'
const HINT_START_ONLY = 'Now find where it ends and tap Set end.'
const HINT_END_ONLY = 'Now find where it begins and tap Set start.'

// Until both marks exist, this space coaches the next step.
// Once they do, it becomes the Trim button.
export const TrimAction = (props: TrimActionPropsT) => {
	const clipLength = () => props.session.getClipLength()
	const hasRange = () => clipLength() !== null

	const hintText = () => {
		const hasStart = props.session.startTime() !== null
		const hasEnd = props.session.endTime() !== null
		if (hasStart) return HINT_START_ONLY
		if (hasEnd) return HINT_END_ONLY
		return HINT_NOTHING_SET
	}

	const trimLabel = () => {
		const currentClipLength = clipLength() ?? 0
		return `Trim ${formatClipLength(currentClipLength)} clip`
	}

	return (
		<div class='trim-action'>
			<Show when={hasRange()} fallback={<p class='trim-action-hint'>{hintText()}</p>}>
				<z-button
					class='trim-action-button'
					kind='solid'
					accent='dom'
					size='lg'
					is-full-width
					onClick={props.session.startTrim}
				>
					<Icon name='scissors' />
					{trimLabel()}
				</z-button>
			</Show>
		</div>
	)
}
