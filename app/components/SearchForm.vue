<template>
	<div class="space-y-6 bg-white dark:bg-secondary/10 backdrop-blur-sm rounded-lg p-6 shadow-lg">
		<div>
			<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
				Search Spotify Playlists
			</h2>
		</div>

		<form
			class="space-y-4"
			@submit.prevent="handleSearch"
		>
			<!-- Genre Selection -->
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Music Genres <span class="text-red-500">
						*
					</span>
					<span class="text-xs text-gray-500">
						(Select 1-10 genres)
					</span>
				</label>
				<USelectMenu
					v-model="selectedGenres"
					:items="availableGenres"
					multiple
					placeholder="Select genres..."
					data-testid="genre-select"
					:loading="genresLoading"
					:disabled="genresLoading"
					:ui="{ content: 'max-h-90' }"
					class="w-full"
				>
					<template #label>
						<span
							v-if="selectedGenres.length === 0"
							class="text-gray-500"
						>
							Select genres...
						</span>
						<div
							v-else
							class="flex flex-wrap gap-1"
						>
							<UBadge
								v-for="genre in selectedGenres.slice(0, 3)"
								:key="genre"
								color="primary"
								variant="soft"
								size="xs"
								data-testid="selected-genre"
							>
								{{ genre }}
							</UBadge>
							<UBadge
								v-if="selectedGenres.length > 3"
								color="gray"
								variant="soft"
								size="xs"
							>
								+{{ selectedGenres.length - 3 }} more
							</UBadge>
						</div>
					</template>
				</USelectMenu>
				<div
					v-if="genreError"
					class="mt-1 text-sm text-red-600"
				>
					{{ genreError }}
				</div>
				<div
					v-if="selectedGenres.length > 10"
					class="mt-1 text-sm text-red-600"
				>
					Maximum of 10 genres allowed
				</div>
			</div>

			<!-- Minimum Follower Count -->
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Minimum Followers <span class="text-red-500">
						*
					</span>
				</label>
				<UInput
					v-model="minFollowerCount"
					type="number"
					placeholder="e.g. 1000"
					min="0"
					step="1"
					data-testid="min-followers-input"
					:disabled="isLoading"
				/>
				<div
					v-if="followerError"
					class="mt-1 text-sm text-red-600"
				>
					{{ followerError }}
				</div>
			</div>

			<!-- Search Button -->
			<div class="pt-4">
				<UButton
					type="submit"
					:loading="isLoading"
					:label="isLoading ? 'Searching...' : 'Search Playlists'"
					icon="i-lucide-rocket"
					:disabled="!isFormValid || isLoading"
					:variant="isFormValid ? 'solid' : 'outline'"
					size="lg"
					data-testid="search-button"
					class="w-full"
					:ui="{ base: 'justify-center' }"
				/>
			</div>
		</form>

		<!-- Error Message -->
		<div
			v-if="error"
			class="p-4 rounded-lg bg-red-50 border border-red-200"
			data-testid="error-message"
		>
			<div class="flex">
				<UIcon
					name="i-heroicons-exclamation-triangle"
					class="h-5 w-5 text-red-400"
				/>
				<div class="ml-3">
					<h3 class="text-sm font-medium text-red-800">
						Unable to search playlists
					</h3>
					<div class="mt-2 text-sm text-red-700">
						{{ error }}
					</div>
					<div class="mt-4">
						<UButton
							color="red"
							variant="outline"
							size="sm"
							data-testid="retry-button"
							@click="handleSearch"
						>
							Try Again
						</UButton>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { SearchRequest } from '../../types/search'

const emit = defineEmits<{
	search: [criteria: SearchRequest]
}>()

// Form state
const selectedGenres = ref<string[]>([])
const minFollowerCount = ref<number>(1000)
const availableGenres = ref<string[]>([])
const genresLoading = ref(false)
const isLoading = ref(false)
const error = ref<string>('')
const genreError = ref<string>('')
const followerError = ref<string>('')

// Load available genres on mount
onMounted(async () => {
	await loadGenres()
})

// Load genres from API
async function loadGenres() {
	genresLoading.value = true
	genreError.value = ''

	try {
		const response = await $fetch('/api/genres')
		console.log('Fetched genres:', response)

		if ('genres' in response) {
			availableGenres.value = response.genres
		} else {
			throw new Error(response.message || 'Failed to load genres')
		}
	} catch (err) {
		console.error('Failed to load genres:', err)
		genreError.value = 'Failed to load available genres. Please refresh the page.'
	} finally {
		genresLoading.value = false
	}
}

// Form validation
const isFormValid = computed(() => {
	return (
		selectedGenres.value.length > 0
		&& selectedGenres.value.length <= 10
		&& minFollowerCount.value >= 0
		&& !genresLoading.value
	)
})

// Watchers for real-time validation
watch(selectedGenres, newGenres => {
	if (newGenres.length === 0) {
		genreError.value = 'Please select at least one genre'
	} else if (newGenres.length > 10) {
		genreError.value = 'Maximum of 10 genres allowed'
	} else {
		genreError.value = ''
	}
})

watch(minFollowerCount, newCount => {
	if (newCount < 0) {
		followerError.value = 'Follower count must be greater than or equal to 0'
	} else {
		followerError.value = ''
	}
})

// Handle form submission
async function handleSearch() {
	if (!isFormValid.value) return

	isLoading.value = true
	error.value = ''

	try {
		const searchRequest: SearchRequest = {
			genres: selectedGenres.value,
			minFollowerCount: minFollowerCount.value,
			limit: 50
		}

		emit('search', searchRequest)
	} catch (err) {
		console.error('Search error:', err)
		error.value = 'An error occurred while searching. Please try again.'
	} finally {
		isLoading.value = false
	}
}

// Expose loading state for parent component
defineExpose({
	isLoading: readonly(isLoading),
	setLoading: (loading: boolean) => {
		isLoading.value = loading
	},
	setError: (errorMessage: string) => {
		error.value = errorMessage
	},
	clearError: () => {
		error.value = ''
	}
})
</script>
