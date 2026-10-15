import type { TrimSessionT } from '../../state/createTrimSession'

type TrimFailureSheetPropsT = {
	session: TrimSessionT
}

export const TrimFailureSheet = (props: TrimFailureSheetPropsT) => {
	const isOpen = () => props.session.phase() === 'failed'

	const handleClose = () => {
		const isStillFailed = props.session.phase() === 'failed'
		if (!isStillFailed) return
		props.session.returnToEditor()
	}

	return (
		<z-sheet
			side='bottom'
			heading="Couldn't trim this video"
			description={props.session.failureMessage()}
			is-open={isOpen()}
			on:close={handleClose}
		>
			<z-button
				slot='footer'
				kind='solid'
				accent='neutral'
				size='lg'
				is-full-width
				onClick={props.session.returnToEditor}
			>
				Back to editor
			</z-button>
		</z-sheet>
	)
}
