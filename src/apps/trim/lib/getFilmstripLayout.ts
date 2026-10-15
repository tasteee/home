// Must match the tile width in filmstrip.css (--spacing-12).
export const FILMSTRIP_TILE_WIDTH_PX = 48

const MIN_TILE_COUNT = 8
const MAX_TILE_COUNT = 60

export type FilmstripLayoutT = {
	tileCount: number
	tileSeconds: number
	pixelsPerSecond: number
	trackWidth: number
	tileTimes: number[]
}

// Roughly one tile per second, kept between 8 and 60 tiles
// so short clips are still scrubbable and long ones stay light.
export const getFilmstripLayout = (duration: number): FilmstripLayoutT => {
	const roundedSeconds = Math.round(duration)
	const tileCount = Math.min(MAX_TILE_COUNT, Math.max(MIN_TILE_COUNT, roundedSeconds))
	const tileSeconds = duration / tileCount
	const pixelsPerSecond = FILMSTRIP_TILE_WIDTH_PX / tileSeconds
	const trackWidth = tileCount * FILMSTRIP_TILE_WIDTH_PX
	const tileIndexes = Array.from({ length: tileCount }, (_, tileIndex) => tileIndex)
	const tileTimes = tileIndexes.map((tileIndex) => (tileIndex + 0.5) * tileSeconds)

	return { tileCount, tileSeconds, pixelsPerSecond, trackWidth, tileTimes }
}
