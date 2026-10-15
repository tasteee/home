import './filmstrip.css'
import { For, Show, createEffect, onMount } from 'solid-js'
import type { JSX } from 'solid-js'
import type { FilmstripLayoutT } from '../../lib/getFilmstripLayout'
import type { TrimSessionT } from '../../state/createTrimSession'

type FilmstripPropsT = {
	session: TrimSessionT
}

// The strip scrolls under a fixed center playhead, like
// CapCut. Scrolling or tapping it scrubs the video.
export const Filmstrip = (props: FilmstripPropsT) => {
	return (
		<Show when={props.session.filmstripLayout()} keyed fallback={<FilmstripPlaceholder />}>
			{(layout) => <FilmstripScroller session={props.session} layout={layout} />}
		</Show>
	)
}

const FilmstripPlaceholder = () => {
	return (
		<div class='filmstrip isLoading'>
			<div class='filmstrip-placeholder' />
		</div>
	)
}

type FilmstripScrollerPropsT = {
	session: TrimSessionT
	layout: FilmstripLayoutT
}

// Below this many pixels, a scroll position counts as the
// one we set ourselves rather than a person scrolling.
const PROGRAMMATIC_SCROLL_TOLERANCE_PX = 1

const FilmstripScroller = (props: FilmstripScrollerPropsT) => {
	let scrollerElement: HTMLDivElement | undefined
	let trackElement: HTMLDivElement | undefined
	let programmaticScrollLeft: number | null = null

	const getScrollLeftForTime = (time: number): number => {
		return time * props.layout.pixelsPerSecond
	}

	const setScrollLeftQuietly = (scrollLeft: number) => {
		const hasScroller = scrollerElement !== undefined
		if (!hasScroller) return
		programmaticScrollLeft = scrollLeft
		scrollerElement.scrollLeft = scrollLeft
	}

	onMount(() => {
		const startingScrollLeft = getScrollLeftForTime(props.session.currentTime())
		setScrollLeftQuietly(startingScrollLeft)
	})

	// While playing, the strip follows the video. While
	// paused, the strip leads and the video follows it.
	createEffect(() => {
		const isPlaying = props.session.isPlaying()
		const currentTime = props.session.currentTime()
		if (!isPlaying) return
		setScrollLeftQuietly(getScrollLeftForTime(currentTime))
	})

	const checkIsProgrammaticScroll = (scrollLeft: number): boolean => {
		const expectedScrollLeft = programmaticScrollLeft
		programmaticScrollLeft = null
		const hasExpectedScrollLeft = expectedScrollLeft !== null
		if (!hasExpectedScrollLeft) return false
		const scrollDifference = Math.abs(scrollLeft - expectedScrollLeft)
		return scrollDifference < PROGRAMMATIC_SCROLL_TOLERANCE_PX
	}

	const handleScroll = () => {
		const hasScroller = scrollerElement !== undefined
		if (!hasScroller) return
		const scrollLeft = scrollerElement.scrollLeft
		const isProgrammaticScroll = checkIsProgrammaticScroll(scrollLeft)
		if (isProgrammaticScroll) return
		const isPlaying = props.session.isPlaying()
		if (isPlaying) return
		const scrubbedTime = scrollLeft / props.layout.pixelsPerSecond
		props.session.seekTo(scrubbedTime)
	}

	// Touching the strip takes over from playback.
	const handleScrubStart = () => {
		props.session.pause()
	}

	const handleTrackClick = (event: MouseEvent) => {
		const isReady = scrollerElement !== undefined && trackElement !== undefined
		if (!isReady) return
		const trackBounds = trackElement.getBoundingClientRect()
		const tapOffset = event.clientX - trackBounds.left
		const tappedTime = tapOffset / props.layout.pixelsPerSecond
		const targetScrollLeft = getScrollLeftForTime(tappedTime)
		props.session.pause()
		scrollerElement.scrollTo({ left: targetScrollLeft, behavior: 'smooth' })
	}

	const startOffset = () => {
		const startTime = props.session.startTime()
		const hasStart = startTime !== null
		if (!hasStart) return null
		return getScrollLeftForTime(startTime)
	}

	const endOffset = () => {
		const endTime = props.session.endTime()
		const hasEnd = endTime !== null
		if (!hasEnd) return null
		return getScrollLeftForTime(endTime)
	}

	const getThumbnailUrl = (tileIndex: number): string | null => {
		const thumbnailUrl = props.session.thumbnailUrls()[tileIndex]
		return thumbnailUrl ?? null
	}

	const hasStart = () => startOffset() !== null
	const hasEnd = () => endOffset() !== null
	const hasRange = () => hasStart() && hasEnd()

	const trackStyle = (): JSX.CSSProperties => {
		const trackWidth = `${props.layout.trackWidth}px`
		const startPosition = `${startOffset() ?? 0}px`
		const endPosition = `${endOffset() ?? props.layout.trackWidth}px`

		return {
			'--filmstrip-track-width': trackWidth,
			'--filmstrip-start': startPosition,
			'--filmstrip-end': endPosition,
		}
	}

	return (
		<div class='filmstrip'>
			<div
				ref={scrollerElement}
				class='filmstrip-scroller'
				onScroll={handleScroll}
				onPointerDown={handleScrubStart}
				onWheel={handleScrubStart}
			>
				<div class='filmstrip-spacer' />

				<div ref={trackElement} class='filmstrip-track' style={trackStyle()} onClick={handleTrackClick}>
					<div class='filmstrip-tiles'>
						<For each={props.layout.tileTimes}>
							{(tileTime, tileIndex) => <FilmstripTile thumbnailUrl={getThumbnailUrl(tileIndex())} />}
						</For>
					</div>

					<Show when={hasStart()}>
						<div class='filmstrip-shade isBefore' />
						<div class='filmstrip-marker isStart' />
					</Show>

					<Show when={hasEnd()}>
						<div class='filmstrip-shade isAfter' />
						<div class='filmstrip-marker isEnd' />
					</Show>

					<Show when={hasRange()}>
						<div class='filmstrip-window' />
					</Show>
				</div>

				<div class='filmstrip-spacer' />
			</div>

			<div class='filmstrip-playhead' />
		</div>
	)
}

type FilmstripTilePropsT = {
	thumbnailUrl: string | null
}

const FilmstripTile = (props: FilmstripTilePropsT) => {
	const hasThumbnail = () => props.thumbnailUrl !== null

	return (
		<div class='filmstrip-tile'>
			<Show when={hasThumbnail()}>
				<img class='filmstrip-tile-image' src={props.thumbnailUrl ?? undefined} alt='' draggable={false} />
			</Show>
		</div>
	)
}
