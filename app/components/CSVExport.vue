<template>
	<UButton
		:loading="isExporting"
		:disabled="disabled || isExporting || playlists.length === 0"
		color="green"
		variant="outline"
		data-testid="export-button"
		@click="handleExport"
	>
		<template #leading>
			<UIcon name="i-heroicons-arrow-down-tray" />
		</template>
		{{ isExporting ? 'Exporting...' : 'Export to CSV' }}
	</UButton>
</template>

<script setup lang="ts">
import type { Playlist } from '../../types/playlist'

interface Props {
	playlists?: Playlist[]
	searchCriteria?: {
		genres: string[]
		minFollowerCount: number
	}
	disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	playlists: () => [],
	disabled: false
})

const isExporting = ref(false)

// Handle CSV export
async function handleExport() {
	if (props.playlists.length === 0 || isExporting.value) return

	isExporting.value = true

	try {
		const csvContent = generateCSV(props.playlists)
		const filename = generateFilename()

		// Create and trigger download
		await downloadCSV(csvContent, filename)
	} catch (error) {
		console.error('CSV export failed:', error)
		// Could emit error event here for parent to handle
	} finally {
		isExporting.value = false
	}
}

// Generate CSV content from playlists
function generateCSV(playlists: Playlist[]): string {
	const headers = [
		'Playlist Name',
		'Description',
		'Followers',
		'Tracks',
		'Owner',
		'Spotify URL',
		'Genres',
		'Public'
	]

	const rows = playlists.map(playlist => [
		escapeCSVField(playlist.name),
		escapeCSVField(playlist.description || ''),
		playlist.followerCount.toString(),
		playlist.trackCount.toString(),
		escapeCSVField(playlist.owner.displayName),
		playlist.url,
		escapeCSVField(playlist.genres.join(', ')),
		playlist.isPublic ? 'Yes' : 'No'
	])

	const csvLines = [
		headers.join(','),
		...rows.map(row => row.join(','))
	]

	return csvLines.join('\n')
}

// Escape CSV fields that contain commas, quotes, or newlines
function escapeCSVField(field: string): string {
	if (field.includes(',') || field.includes('"') || field.includes('\n')) {
		// Escape quotes by doubling them and wrap the field in quotes
		return `"${field.replace(/"/g, '""')}"`
	}
	return field
}

// Generate filename with timestamp
function generateFilename(): string {
	const now = new Date()
	const timestamp = now.toISOString().split('T')[0] // YYYY-MM-DD format
	const timepart = now.toTimeString().split(' ')[0]?.replace(/:/g, '-') || 'unknown-time' // HH-MM-SS format

	return `spotify-playlists-${timestamp}-${timepart}.csv`
}

// Create and trigger CSV download
async function downloadCSV(content: string, filename: string): Promise<void> {
	try {
		// Create blob with CSV content
		const blob = new Blob([ content ], { type: 'text/csv;charset=utf-8;' })

		// Check if file size is within limits (1MB as per constraints)
		if (blob.size > 1024 * 1024) {
			console.warn('CSV file size exceeds 1MB limit:', blob.size)
		}

		// Create download URL
		const url = URL.createObjectURL(blob)

		// Create temporary link element and trigger download
		const link = document.createElement('a')
		link.href = url
		link.download = filename
		link.style.display = 'none'

		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)

		// Clean up object URL
		URL.revokeObjectURL(url)
	} catch (error) {
		console.error('Failed to download CSV:', error)
		throw new Error('Failed to download CSV file')
	}
}

// Computed property for export statistics
const exportStats = computed(() => {
	if (props.playlists.length === 0) {
		return null
	}

	const totalFollowers = props.playlists.reduce((sum, playlist) => sum + playlist.followerCount, 0)
	const totalTracks = props.playlists.reduce((sum, playlist) => sum + playlist.trackCount, 0)

	return {
		playlistCount: props.playlists.length,
		totalFollowers,
		totalTracks,
		avgFollowers: Math.round(totalFollowers / props.playlists.length),
		avgTracks: Math.round(totalTracks / props.playlists.length)
	}
})

// Expose stats for parent component if needed
defineExpose({
	exportStats: readonly(exportStats),
	isExporting: readonly(isExporting)
})
</script>
