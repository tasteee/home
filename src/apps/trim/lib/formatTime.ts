const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = 3600

const padTwo = (value: number): string => {
	return String(value).padStart(2, '0')
}

// Formats seconds as m:ss.t (or h:mm:ss.t past an hour).
export const formatTime = (totalSeconds: number): string => {
	const safeSeconds = Math.max(0, totalSeconds)
	const tenths = Math.floor((safeSeconds % 1) * 10)
	const wholeSeconds = Math.floor(safeSeconds)
	const hours = Math.floor(wholeSeconds / SECONDS_PER_HOUR)
	const minutes = Math.floor((wholeSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE)
	const seconds = wholeSeconds % SECONDS_PER_MINUTE
	const isOverAnHour = hours > 0
	if (isOverAnHour) return `${hours}:${padTwo(minutes)}:${padTwo(seconds)}.${tenths}`
	return `${minutes}:${padTwo(seconds)}.${tenths}`
}

// Formats a clip length for labels, like "12.3s" or "1:04.5".
export const formatClipLength = (totalSeconds: number): string => {
	const isUnderAMinute = totalSeconds < SECONDS_PER_MINUTE
	if (isUnderAMinute) return `${totalSeconds.toFixed(1)}s`
	return formatTime(totalSeconds)
}

const BYTES_PER_MEGABYTE = 1024 * 1024

export const formatFileSize = (byteCount: number): string => {
	const megabytes = byteCount / BYTES_PER_MEGABYTE
	const isUnderOneMegabyte = megabytes < 1
	if (isUnderOneMegabyte) return `${Math.max(1, Math.round(byteCount / 1024))} KB`
	return `${megabytes.toFixed(1)} MB`
}
