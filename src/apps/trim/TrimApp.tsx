import './trim-app.css'
import { Match, Switch } from 'solid-js'
import { TrimEditor } from './components/TrimEditor/TrimEditor'
import { TrimTopBar } from './components/TrimTopBar/TrimTopBar'
import { VideoPicker } from './components/VideoPicker/VideoPicker'
import { createTrimSession } from './state/createTrimSession'

export const TrimApp = () => {
	const session = createTrimSession()
	let fileInputElement: HTMLInputElement | undefined

	const isPicking = () => session.phase() === 'picking'
	const isEditing = () => !isPicking()

	const openPicker = () => {
		const hasFileInput = fileInputElement !== undefined
		if (!hasFileInput) return
		fileInputElement.click()
	}

	const handleFileChange = (event: Event) => {
		const inputElement = event.currentTarget as HTMLInputElement
		const pickedFile = inputElement.files?.item(0) ?? null
		// Clearing lets the same file be picked again later.
		inputElement.value = ''
		const hasPickedFile = pickedFile !== null
		if (!hasPickedFile) return
		session.pickFile(pickedFile)
	}

	return (
		<div class='trim-app'>
			<input
				ref={fileInputElement}
				class='trim-app-file-input'
				type='file'
				accept='video/*'
				onChange={handleFileChange}
			/>

			<TrimTopBar canChooseNewVideo={isEditing()} onChooseNewVideo={openPicker} />

			<Switch>
				<Match when={isPicking()}>
					<VideoPicker onChooseVideo={openPicker} />
				</Match>
				<Match when={isEditing()}>
					<TrimEditor session={session} />
				</Match>
			</Switch>
		</div>
	)
}
