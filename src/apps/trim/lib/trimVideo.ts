import to from 'await-to-js'
import {
	ALL_FORMATS,
	BlobSource,
	BufferTarget,
	Conversion,
	Input,
	Mp4OutputFormat,
	Output,
	canEncodeAudio,
} from 'mediabunny'

export type TrimRequestT = {
	file: File
	startTime: number
	endTime: number
	onProgress: (progress: number) => void
}

export type TrimJobT = {
	result: Promise<File>
	cancel: () => Promise<void>
}

type TrimJobStateT = {
	conversion: Conversion | null
	wasCancelled: boolean
}

const TRIM_CANCELLED_ERROR_NAME = 'TrimCancelledError'

const createCancelledError = (): Error => {
	const cancelledError = new Error('Trim was cancelled.')
	cancelledError.name = TRIM_CANCELLED_ERROR_NAME
	return cancelledError
}

export const checkIsCancelledError = (trimError: Error): boolean => {
	return trimError.name === TRIM_CANCELLED_ERROR_NAME
}

// Errors with this name carry a message safe to show people.
const TRIM_FRIENDLY_ERROR_NAME = 'TrimFriendlyError'

const createFriendlyError = (message: string): Error => {
	const friendlyError = new Error(message)
	friendlyError.name = TRIM_FRIENDLY_ERROR_NAME
	return friendlyError
}

export const checkIsFriendlyError = (trimError: Error): boolean => {
	return trimError.name === TRIM_FRIENDLY_ERROR_NAME
}

const buildOutputName = (sourceName: string): string => {
	const extensionIndex = sourceName.lastIndexOf('.')
	const hasExtension = extensionIndex > 0
	const baseName = hasExtension ? sourceName.slice(0, extensionIndex) : sourceName
	return `${baseName}-trim.mp4`
}

// Some phones can decode AAC but not encode it. The WASM
// encoder only loads on those devices.
const ensureAacEncoder = async () => {
	const canEncodeAacNatively = await canEncodeAudio('aac')
	if (canEncodeAacNatively) return
	const aacEncoderModule = await import('@mediabunny/aac-encoder')
	aacEncoderModule.registerAacEncoder()
}

const getInvalidReason = (conversion: Conversion): string => {
	const hasDiscardedVideo = conversion.discardedTracks.some((discarded) => discarded.track.type === 'video')
	if (hasDiscardedVideo) return "This phone can't re-encode this video's format."
	return "This video couldn't be prepared for trimming."
}

const runTrim = async (request: TrimRequestT, jobState: TrimJobStateT): Promise<File> => {
	await ensureAacEncoder()
	const source = new BlobSource(request.file)
	const input = new Input({ source, formats: ALL_FORMATS })
	const target = new BufferTarget()
	const format = new Mp4OutputFormat({ fastStart: 'in-memory' })
	const output = new Output({ format, target })

	const conversion = await Conversion.init({
		input,
		output,
		trim: { start: request.startTime, end: request.endTime },
		showWarnings: false,
	})

	jobState.conversion = conversion
	if (jobState.wasCancelled) throw createCancelledError()

	if (!conversion.isValid) {
		const invalidReason = getInvalidReason(conversion)
		input.dispose()
		throw createFriendlyError(invalidReason)
	}

	conversion.onProgress = request.onProgress
	const executeOutcome = await to(conversion.execute())
	const executeError = executeOutcome[0]
	input.dispose()
	if (jobState.wasCancelled) throw createCancelledError()
	const didExecuteFail = executeError !== null
	if (didExecuteFail) throw executeError

	const outputBuffer = target.buffer
	const hasOutput = outputBuffer !== null
	if (!hasOutput) throw createFriendlyError('Trimming finished without a file.')
	const outputName = buildOutputName(request.file.name)
	return new File([outputBuffer], outputName, { type: 'video/mp4' })
}

export const createTrimJob = (request: TrimRequestT): TrimJobT => {
	const jobState: TrimJobStateT = { conversion: null, wasCancelled: false }

	const cancel = async () => {
		jobState.wasCancelled = true
		const conversion = jobState.conversion
		const hasConversion = conversion !== null
		if (!hasConversion) return
		await conversion.cancel()
	}

	const result = runTrim(request, jobState)
	return { result, cancel }
}
