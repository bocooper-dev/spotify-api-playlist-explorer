<template>
	<div class="space-y-4">
		<!-- Results Summary -->
		<div
			v-if="playlists.length > 0"
			class="flex justify-between items-center"
		>
			<div class="text-sm text-gray-600 dark:text-gray-400">
				Showing {{ playlists.length }} of {{ totalFound }} playlists
			</div>
			<div class="text-sm text-gray-500">
				Search completed at {{ formatTimestamp(timestamp) }}
			</div>
		</div>

		<!-- Results Table -->
		<div
			v-if="playlists.length > 0"
			class="overflow-x-auto"
			data-testid="results-table"
		>
			<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
				<thead class="bg-gray-50 dark:bg-gray-800">
					<tr>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
						>
							Playlist Name
						</th>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
						>
							Description
						</th>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
						>
							Followers
						</th>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
						>
							Tracks
						</th>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
						>
							Owner
						</th>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
						>
							Spotify Link
						</th>
					</tr>
				</thead>
				<tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
					<tr
						v-for="playlist in playlists"
						:key="playlist.id"
						class="hover:bg-gray-50 dark:hover:bg-gray-800"
						data-testid="playlist-row"
					>
						<!-- Playlist Name -->
						<td class="px-6 py-4 whitespace-nowrap">
							<div class="flex items-center">
								<div
									v-if="playlist.imageUrl"
									class="flex-shrink-0 h-12 w-12"
								>
									<img
										:src="playlist.imageUrl"
										:alt="`${playlist.name} cover`"
										class="h-12 w-12 rounded-lg object-cover"
									>
								</div>
								<div :class="playlist.imageUrl ? 'ml-4' : ''">
									<div
										class="text-sm font-medium text-gray-900 dark:text-white"
										data-testid="playlist-name"
									>
										{{ playlist.name }}
									</div>
									<div
										v-if="playlist.genres.length > 0"
										class="flex flex-wrap gap-1 mt-1"
									>
										<UBadge
											v-for="genre in playlist.genres.slice(0, 3)"
											:key="genre"
											color="gray"
											variant="soft"
											size="xs"
										>
											{{ genre }}
										</UBadge>
									</div>
								</div>
							</div>
						</td>

						<!-- Description -->
						<td class="px-6 py-4">
							<div class="text-sm text-gray-900 dark:text-white max-w-xs truncate">
								{{ playlist.description || 'No description' }}
							</div>
						</td>

						<!-- Followers -->
						<td class="px-6 py-4 whitespace-nowrap">
							<div
								class="text-sm font-medium text-gray-900 dark:text-white"
								data-testid="playlist-followers"
							>
								{{ formatNumber(playlist.followerCount) }}
							</div>
						</td>

						<!-- Tracks -->
						<td class="px-6 py-4 whitespace-nowrap">
							<div class="text-sm text-gray-900 dark:text-white">
								{{ formatNumber(playlist.trackCount) }}
							</div>
						</td>

						<!-- Owner -->
						<td class="px-6 py-4 whitespace-nowrap">
							<div class="flex items-center">
								<div
									v-if="playlist.owner.imageUrl"
									class="flex-shrink-0 h-8 w-8"
								>
									<img
										:src="playlist.owner.imageUrl"
										:alt="`${playlist.owner.displayName} avatar`"
										class="h-8 w-8 rounded-full object-cover"
									>
								</div>
								<div :class="playlist.owner.imageUrl ? 'ml-3' : ''">
									<a
										:href="playlist.owner.profileUrl"
										target="_blank"
										rel="noopener noreferrer"
										class="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
										data-testid="playlist-owner"
									>
										{{ playlist.owner.displayName }}
									</a>
								</div>
							</div>
						</td>

						<!-- Spotify Link -->
						<td class="px-6 py-4 whitespace-nowrap">
							<a
								:href="playlist.url"
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200"
								data-testid="spotify-link"
							>
								<UIcon
									name="i-simple-icons-spotify"
									class="w-3 h-3 mr-1"
								/>
								Open in Spotify
							</a>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<!-- No Results -->
		<div
			v-else-if="!isLoading"
			class="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg"
			data-testid="no-results"
		>
			<UIcon
				name="i-heroicons-musical-note"
				class="mx-auto h-16 w-16 text-gray-400 mb-4"
			/>
			<h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
				No playlists found
			</h3>
			<p class="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
				Try adjusting your search criteria. Consider selecting different genres or lowering the minimum follower count.
			</p>
		</div>

		<!-- Loading State -->
		<div
			v-if="isLoading"
			class="text-center py-12"
			data-testid="loading-state"
		>
			<UIcon
				name="i-heroicons-arrow-path"
				class="mx-auto h-8 w-8 text-gray-400 animate-spin mb-4"
			/>
			<p class="text-gray-500 dark:text-gray-400">
				Searching for playlists...
			</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { Playlist } from '../../types/playlist'

interface Props {
	playlists?: Playlist[]
	totalFound?: number
	timestamp?: string
	isLoading?: boolean
}

withDefaults(defineProps<Props>(), {
	playlists: () => [],
	totalFound: 0,
	isLoading: false
})

// Format large numbers with commas
function formatNumber(num: number): string {
	return new Intl.NumberFormat().format(num)
}

// Format timestamp for display
function formatTimestamp(timestamp?: string): string {
	if (!timestamp) return ''

	try {
		const date = new Date(timestamp)
		return date.toLocaleString()
	} catch {
		return timestamp
	}
}
</script>
