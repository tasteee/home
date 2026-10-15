import to from 'await-to-js'
import { createSignal } from 'solid-js'
import { createThumbnails } from '../lib/createThumbnails'
import type { ThumbnailJobT } from '../lib/createThumbnails'
import { getFilmstripLayout } from '../lib/getFilmstripLayout'
import type { FilmstripLayoutT } from '../lib/getFilmstripLayout'
import { saveVideo } from '../lib/saveVideo'
import { checkIsCancelledError, checkIsFriendlyError, createTrimJob } from '../lib/trimVideo'
import type { TrimJobT } from '../lib/trimVideo'

export type TrimPhaseT = 'picking' | 'editing' | 'trimming' | 'done' | 'failed'

export type TrimResultT = {
	file: File
	url: string
	clipLength: number
}

type SeekStateT = {
	isSeeking: boolean
	pendingTime: number | null
}

// Below this, a playhead at the very end restarts from 0.
const END_OF_VIDEO_TOLERANCE_SECONDS = 0.05

const GENERIC_FAILURE_MESSAGE = 'Something went wrong while trimming. Try a shorter clip or a different video.'

export const createTrimSession = () => {
	const [phase, setPhase] = createSignal<TrimPhaseT>('picking')
	const [sourceFile, setSourceFile] = createSignal<File | null>(null)
	const [sourceUrl, setSourceUrl] = createSignal<string | null>(null)
	const [duration, setDuration] = createSignal(0)
	const [currentTime, setCurrentTime] = createSignal(0)
	const [isPlaying, setIsPlaying] = createSignal(false)
	const [startTime, setStartTime] = createSignal<number | null>(null)
	const [endTime, setEndTime] = createSignal<number | null>(null)
	const [filmstripLayout, setFilmstripLayout] = createSignal<FilmstripLayoutT | null>(null)
	const [thumbnailUrls, setThumbnailUrls] = createSignal<(string | null)[]>([])
	const [trimProgress, setTrimProgress] = createSignal(0)
	const [result, setResult] = createSignal<TrimResultT | null>(null)
	const [failureMessage, setFailureMessage] = createSignal('')
	const [isSaving, setIsSaving] = createSignal(false)

	let videoElement: HTMLVideoElement | null = null
	let playbackFrameId = 0
	let thumbnailJob: ThumbnailJobT | null = null
	let trimJob: TrimJobT | null = null
	const seekState: SeekStateT = { isSeeking: false, pendingTime: null }

	// ---- Cleanup helpers ----

	const revokeThumbnails = () => {
		const currentThumbnailJob = thumbnailJob
		const hasThumbnailJob = currentThumbnailJob !== null
		if (hasThumbnailJob) currentThumbnailJob.cancel()
		thumbnailJob = null

		for (const thumbnailUrl of thumbnailUrls()) {
			const hasUrl = thumbnailUrl !== null
			if (hasUrl) URL.revokeObjectURL(thumbnailUrl)
		}

		setThumbnailUrls([])
	}

	const revokeResult = () => {
		const currentResult = result()
		const hasResult = currentResult !== null
		if (hasResult) URL.revokeObjectURL(currentResult.url)
		setResult(null)
	}

	const revokeSource = () => {
		const currentSourceUrl = sourceUrl()
		const hasSourceUrl = currentSourceUrl !== null
		if (hasSourceUrl) URL.revokeObjectURL(currentSourceUrl)
		setSourceUrl(null)
		setSourceFile(null)
	}

	const resetEditor = () => {
		cancelAnimationFrame(playbackFrameId)
		setIsPlaying(false)
		setDuration(0)
		setCurrentTime(0)
		setStartTime(null)
		setEndTime(null)
		setFilmstripLayout(null)
		seekState.isSeeking = false
		seekState.pendingTime = null
	}

	// ---- Picking ----

	const pickFile = (file: File) => {
		revokeThumbnails()
		revokeResult()
		revokeSource()
		resetEditor()
		const fileUrl = URL.createObjectURL(file)
		setSourceFile(file)
		setSourceUrl(fileUrl)
		setPhase('editing')
	}

	const startOver = () => {
		revokeThumbnails()
		revokeResult()
		revokeSource()
		resetEditor()
		setPhase('picking')
	}

	// ---- Thumbnails ----

	const handleThumbnail = (tileIndex: number, thumbnailUrl: string) => {
		const nextUrls = [...thumbnailUrls()]
		nextUrls[tileIndex] = thumbnailUrl
		setThumbnailUrls(nextUrls)
	}

	const startThumbnails = (file: File, layout: FilmstripLayoutT) => {
		const emptyUrls = layout.tileTimes.map(() => null)
		setThumbnailUrls(emptyUrls)

		thumbnailJob = createThumbnails({
			file,
			tileTimes: layout.tileTimes,
			onThumbnail: handleThumbnail,
		})
	}

	// ---- Video element ----

	const handleLoadedMetadata = () => {
		const element = videoElement
		const file = sourceFile()
		const isReady = element !== null && file !== null
		if (!isReady) return
		const hasFiniteDuration = Number.isFinite(element.duration) && element.duration > 0
		if (!hasFiniteDuration) return
		const layout = getFilmstripLayout(element.duration)
		setDuration(element.duration)
		setFilmstripLayout(layout)
		startThumbnails(file, layout)
	}

	const trackPlayback = () => {
		const element = videoElement
		const hasElement = element !== null
		if (!hasElement) return
		setCurrentTime(element.currentTime)
		playbackFrameId = requestAnimationFrame(trackPlayback)
	}

	const handlePlay = () => {
		setIsPlaying(true)
		cancelAnimationFrame(playbackFrameId)
		playbackFrameId = requestAnimationFrame(trackPlayback)
	}

	const handlePause = () => {
		setIsPlaying(false)
		cancelAnimationFrame(playbackFrameId)
		const element = videoElement
		const hasElement = element !== null
		if (hasElement) setCurrentTime(element.currentTime)
	}

	const handleSeeked = () => {
		seekState.isSeeking = false
		const pendingTime = seekState.pendingTime
		const hasPendingTime = pendingTime !== null
		if (!hasPendingTime) return
		seekState.pendingTime = null
		seekTo(pendingTime)
	}

	const attachVideo = (element: HTMLVideoElement) => {
		videoElement = element
		element.addEventListener('loadedmetadata', handleLoadedMetadata)
		element.addEventListener('play', handlePlay)
		element.addEventListener('pause', handlePause)
		element.addEventListener('ended', handlePause)
		element.addEventListener('seeked', handleSeeked)
	}

	const detachVideo = (element: HTMLVideoElement) => {
		cancelAnimationFrame(playbackFrameId)
		element.removeEventListener('loadedmetadata', handleLoadedMetadata)
		element.removeEventListener('play', handlePlay)
		element.removeEventListener('pause', handlePause)
		element.removeEventListener('ended', handlePause)
		element.removeEventListener('seeked', handleSeeked)
		const isCurrentElement = videoElement === element
		if (isCurrentElement) videoElement = null
	}

	// ---- Playback ----

	const clampTime = (time: number): number => {
		return Math.min(duration(), Math.max(0, time))
	}

	// Seeks are coalesced: while one is in flight, only the
	// latest requested time is kept. Scrubbing stays smooth
	// on phones where each seek is slow.
	const seekTo = (time: number) => {
		const clampedTime = clampTime(time)
		setCurrentTime(clampedTime)
		const element = videoElement
		const hasElement = element !== null
		if (!hasElement) return

		if (seekState.isSeeking) {
			seekState.pendingTime = clampedTime
			return
		}

		seekState.isSeeking = true
		element.currentTime = clampedTime
	}

	const play = () => {
		const element = videoElement
		const hasElement = element !== null
		if (!hasElement) return
		const isAtEnd = element.currentTime >= duration() - END_OF_VIDEO_TOLERANCE_SECONDS
		if (isAtEnd) seekTo(0)
		element.play().catch((playError: unknown) => console.warn('Trim: playback blocked', playError))
	}

	const pause = () => {
		const element = videoElement
		const hasElement = element !== null
		if (!hasElement) return
		element.pause()
	}

	const togglePlay = () => {
		if (isPlaying()) return pause()
		play()
	}

	// ---- Marks ----

	// Setting a start at or after the end clears the end
	// (and the reverse), so the range is always valid.
	const markStart = () => {
		const markTime = currentTime()
		const currentEnd = endTime()
		const isPastEnd = currentEnd !== null && markTime >= currentEnd
		if (isPastEnd) setEndTime(null)
		setStartTime(markTime)
	}

	const markEnd = () => {
		const markTime = currentTime()
		const currentStart = startTime()
		const isBeforeStart = currentStart !== null && markTime <= currentStart
		if (isBeforeStart) setStartTime(null)
		setEndTime(markTime)
	}

	const getClipLength = (): number | null => {
		const currentStart = startTime()
		const currentEnd = endTime()
		const hasRange = currentStart !== null && currentEnd !== null
		if (!hasRange) return null
		return currentEnd - currentStart
	}

	// ---- Trimming ----

	const getFailureMessage = (trimError: Error): string => {
		const isFriendly = checkIsFriendlyError(trimError)
		if (isFriendly) return trimError.message
		return GENERIC_FAILURE_MESSAGE
	}

	const startTrim = async () => {
		const file = sourceFile()
		const currentStart = startTime()
		const currentEnd = endTime()
		const canTrim = file !== null && currentStart !== null && currentEnd !== null
		if (!canTrim) return
		pause()
		revokeResult()
		setTrimProgress(0)
		setPhase('trimming')

		const job = createTrimJob({
			file,
			startTime: currentStart,
			endTime: currentEnd,
			onProgress: setTrimProgress,
		})

		trimJob = job
		const trimOutcome = await to(job.result)
		trimJob = null
		const trimError = trimOutcome[0]
		const didFail = trimError !== null

		if (didFail) {
			const wasCancelled = checkIsCancelledError(trimError)
			if (wasCancelled) return setPhase('editing')
			console.error('Trim: failed', trimError)
			setFailureMessage(getFailureMessage(trimError))
			setPhase('failed')
			return
		}

		const trimmedFile = trimOutcome[1] as File
		const resultUrl = URL.createObjectURL(trimmedFile)
		const clipLength = currentEnd - currentStart
		setResult({ file: trimmedFile, url: resultUrl, clipLength })
		setPhase('done')
	}

	const cancelTrim = async () => {
		const job = trimJob
		const hasJob = job !== null
		if (!hasJob) return
		await job.cancel()
	}

	const returnToEditor = () => {
		revokeResult()
		setPhase('editing')
	}

	// ---- Saving ----

	const saveResult = async () => {
		const currentResult = result()
		const hasResult = currentResult !== null
		if (!hasResult) return
		setIsSaving(true)
		await saveVideo(currentResult.file)
		setIsSaving(false)
	}

	return {
		phase,
		sourceFile,
		sourceUrl,
		duration,
		currentTime,
		isPlaying,
		startTime,
		endTime,
		filmstripLayout,
		thumbnailUrls,
		trimProgress,
		result,
		failureMessage,
		isSaving,
		pickFile,
		startOver,
		attachVideo,
		detachVideo,
		seekTo,
		play,
		pause,
		togglePlay,
		markStart,
		markEnd,
		getClipLength,
		startTrim,
		cancelTrim,
		returnToEditor,
		saveResult,
	}
}

export type TrimSessionT = ReturnType<typeof createTrimSession>
