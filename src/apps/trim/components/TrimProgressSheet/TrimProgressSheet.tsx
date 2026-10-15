import './trim-progress-sheet.css'
import type { TrimSessionT } from '../../state/createTrimSession'

type TrimProgressSheetPropsT = {
	session: TrimSessionT
}

export const TrimProgressSheet = (props: TrimProgressSheetPropsT) => {
	const isOpen = () => props.session.phase() === 'trimming'
	const percent = () => Math.round(props.session.trimProgress() * 100)
	const percentLabel = () => `${percent()}%`

	// Escape closes native dialogs. Treat that as cancel so the
	// sheet and the work never disagree.
	const handleClose = () => {
		const isStillTrimming = props.session.phase() === 'trimming'
		if (!isStillTrimming) return
		props.session.cancelTrim()
	}

	return (
		<z-sheet side='bottom' heading='Trimming' has-close='false' is-static is-open={isOpen()} on:close={handleClose}>
			<div class='trim-progress-sheet'>
				<z-progress value={percent()} max={100} accent='dom' />

				<div class='trim-progress-sheet-row'>
					<span class='trim-progress-sheet-note'>Keep this screen open.</span>
					<span class='trim-progress-sheet-percent'>{percentLabel()}</span>
				</div>
			</div>

			<z-button
				slot='footer'
				kind='ghost'
				accent='neutral'
				size='lg'
				is-full-width
				onClick={props.session.cancelTrim}
			>
				Cancel
			</z-button>
		</z-sheet>
	)
}
