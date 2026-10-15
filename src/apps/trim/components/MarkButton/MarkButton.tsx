import './mark-button.css'
import { formatTime } from '../../lib/formatTime'

type MarkButtonPropsT = {
	label: string
	markTime: number | null
	onMark: () => void
}

// Tapping always marks the current playhead position.
// The second line shows what's marked so far.
export const MarkButton = (props: MarkButtonPropsT) => {
	const isSet = () => props.markTime !== null

	const valueLabel = () => {
		const markTime = props.markTime
		const hasMarkTime = markTime !== null
		if (!hasMarkTime) return 'Not set'
		return formatTime(markTime)
	}

	const buttonClass = () => (isSet() ? 'mark-button isSet' : 'mark-button')

	return (
		<button class={buttonClass()} type='button' onClick={props.onMark}>
			<span class='mark-button-label'>
				<span class='mark-button-dot' />
				{props.label}
			</span>
			<span class='mark-button-value'>{valueLabel()}</span>
		</button>
	)
}
