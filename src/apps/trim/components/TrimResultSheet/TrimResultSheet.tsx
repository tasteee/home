import './trim-result-sheet.css'
import { Show } from 'solid-js'
import { formatClipLength, formatFileSize } from '../../lib/formatTime'
import type { TrimResultT, TrimSessionT } from '../../state/createTrimSession'

type TrimResultSheetPropsT = {
	session: TrimSessionT
}

const buildSummary = (result: TrimResultT | null): string => {
	const hasResult = result !== null
	if (!hasResult) return ''
	const clipLengthLabel = formatClipLength(result.clipLength)
	const fileSizeLabel = formatFileSize(result.file.size)
	return `${clipLengthLabel} · ${fileSizeLabel}`
}

export const TrimResultSheet = (props: TrimResultSheetPropsT) => {
	const isOpen = () => props.session.phase() === 'done'
	const result = () => props.session.result()
	const summary = () => buildSummary(result())
	const resultUrl = () => result()?.url
	const hasResultUrl = () => resultUrl() !== undefined

	const handleClose = () => {
		const isStillDone = props.session.phase() === 'done'
		if (!isStillDone) return
		props.session.returnToEditor()
	}

	return (
		<z-sheet side='bottom' heading='Your clip is ready' description={summary()} is-open={isOpen()} on:close={handleClose}>
			<div class='trim-result-sheet'>
				<Show when={hasResultUrl()}>
					<video class='trim-result-sheet-video' src={resultUrl()} autoplay muted loop playsinline />
				</Show>
			</div>

			<div slot='footer' class='trim-result-sheet-actions'>
				<z-button
					kind='solid'
					accent='dom'
					size='lg'
					is-full-width
					is-loading={props.session.isSaving()}
					onClick={props.session.saveResult}
				>
					Save video
				</z-button>

				<z-button kind='ghost' accent='neutral' size='lg' is-full-width onClick={props.session.returnToEditor}>
					Back to editor
				</z-button>
			</div>
		</z-sheet>
	)
}
