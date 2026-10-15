import to from 'await-to-js'

export type SaveOutcomeT = 'shared' | 'downloaded' | 'dismissed'

const downloadFile = (file: File) => {
	const fileUrl = URL.createObjectURL(file)
	const link = document.createElement('a')
	link.href = fileUrl
	link.download = file.name
	link.click()
	setTimeout(() => URL.revokeObjectURL(fileUrl), 1000)
}

const checkCanShareFile = (file: File): boolean => {
	const hasCanShare = typeof navigator.canShare === 'function'
	if (!hasCanShare) return false
	return navigator.canShare({ files: [file] })
}

// Browsers can't write to the photo library directly. The
// share sheet is the way in: iOS offers "Save Video" there,
// and Android offers Photos / Gallery.
export const saveVideo = async (file: File): Promise<SaveOutcomeT> => {
	const canShareFile = checkCanShareFile(file)

	if (!canShareFile) {
		downloadFile(file)
		return 'downloaded'
	}

	const shareOutcome = await to(navigator.share({ files: [file] }))
	const shareError = shareOutcome[0]
	const didShare = shareError === null
	if (didShare) return 'shared'
	const wasDismissed = shareError.name === 'AbortError'
	if (wasDismissed) return 'dismissed'
	downloadFile(file)
	return 'downloaded'
}
