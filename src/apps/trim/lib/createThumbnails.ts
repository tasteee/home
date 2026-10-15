import { ALL_FORMATS, BlobSource, CanvasSink, Input } from 'mediabunny'

// Rendered at 2x the tile size so thumbnails stay sharp.
const THUMBNAIL_WIDTH_PX = 96
const THUMBNAIL_HEIGHT_PX = 112
const THUMBNAIL_JPEG_QUALITY = 0.72

export type ThumbnailRequestT = {
	file: File
	tileTimes: number[]
	onThumbnail: (tileIndex: number, thumbnailUrl: string) => void
}

export type ThumbnailJobT = {
	cancel: () => void
}

type ThumbnailJobStateT = {
	isCancelled: boolean
}

type AnyCanvasT = HTMLCanvasElement | OffscreenCanvas

const getCanvasBlob = async (canvas: AnyCanvasT): Promise<Blob | null> => {
	const hasOffscreenCanvas = typeof OffscreenCanvas !== 'undefined'
	const isOffscreenCanvas = hasOffscreenCanvas && canvas instanceof OffscreenCanvas
	const blobOptions = { type: 'image/jpeg', quality: THUMBNAIL_JPEG_QUALITY }
	if (isOffscreenCanvas) return canvas.convertToBlob(blobOptions)
	const htmlCanvas = canvas as HTMLCanvasElement

	return new Promise((resolve) => {
		htmlCanvas.toBlob(resolve, blobOptions.type, blobOptions.quality)
	})
}

const renderThumbnails = async (request: ThumbnailRequestT, jobState: ThumbnailJobStateT) => {
	const source = new BlobSource(request.file)
	const input = new Input({ source, formats: ALL_FORMATS })
	const videoTrack = await input.getPrimaryVideoTrack()
	const hasVideoTrack = videoTrack !== null
	if (!hasVideoTrack) return input.dispose()
	const canDecode = await videoTrack.canDecode()
	if (!canDecode) return input.dispose()

	const sink = new CanvasSink(videoTrack, {
		width: THUMBNAIL_WIDTH_PX,
		height: THUMBNAIL_HEIGHT_PX,
		fit: 'cover',
	})

	let tileIndex = 0

	for await (const wrappedCanvas of sink.canvasesAtTimestamps(request.tileTimes)) {
		if (jobState.isCancelled) break
		const currentTileIndex = tileIndex
		tileIndex += 1
		const hasFrame = wrappedCanvas !== null
		if (!hasFrame) continue
		const thumbnailBlob = await getCanvasBlob(wrappedCanvas.canvas)
		const hasBlob = thumbnailBlob !== null
		if (!hasBlob) continue
		if (jobState.isCancelled) break
		const thumbnailUrl = URL.createObjectURL(thumbnailBlob)
		request.onThumbnail(currentTileIndex, thumbnailUrl)
	}

	input.dispose()
}

// Thumbnails are a nice-to-have. If decoding fails, tiles
// stay as quiet placeholders and the editor keeps working.
export const createThumbnails = (request: ThumbnailRequestT): ThumbnailJobT => {
	const jobState: ThumbnailJobStateT = { isCancelled: false }

	const cancel = () => {
		jobState.isCancelled = true
	}

	renderThumbnails(request, jobState).catch((thumbnailError: unknown) => {
		console.warn('Trim: thumbnails unavailable', thumbnailError)
	})

	return { cancel }
}
