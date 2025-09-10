<template>
  <div>
    <!-- Header -->
    <UPageHero
      title="Spotify Playlist Explorer"
      description="Discover popular Spotify playlists by music genre and follower count. Find new music and connect with playlist creators."
    />

    <!-- Main Content -->
    <UPageSection class="py-8">
      <div class="grid lg:grid-cols-12 gap-8">
        <!-- Search Form -->
        <div class="lg:col-span-4">
          <SearchForm
            ref="searchForm"
            @search="handleSearch"
          />
        </div>

        <!-- Results -->
        <div class="lg:col-span-8">
          <div v-if="searchResults || isLoading" class="space-y-6">
            <!-- Export Button -->
            <div v-if="searchResults?.playlists.length" class="flex justify-between items-center">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                Search Results
              </h2>
              <CSVExport
                :playlists="searchResults.playlists"
                :search-criteria="searchResults.searchCriteria"
              />
            </div>

            <!-- Results Table -->
            <PlaylistTable
              :playlists="searchResults?.playlists || []"
              :total-found="searchResults?.totalFound || 0"
              :timestamp="searchResults?.timestamp"
              :is-loading="isLoading"
            />
          </div>

          <!-- Welcome Message -->
          <div v-else class="text-center py-16">
            <UIcon name="i-heroicons-musical-note" class="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to Spotify Playlist Explorer
            </h2>
            <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Use the search form on the left to discover popular Spotify playlists. 
              Select your favorite genres and set a minimum follower count to find 
              high-quality, well-curated music collections.
            </p>
            <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <UIcon name="i-heroicons-magnifying-glass" class="h-8 w-8 text-blue-500 mb-2" />
                <h3 class="font-semibold text-gray-900 dark:text-white mb-1">Smart Search</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Search across multiple genres simultaneously
                </p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <UIcon name="i-heroicons-users" class="h-8 w-8 text-green-500 mb-2" />
                <h3 class="font-semibold text-gray-900 dark:text-white mb-1">Popular Playlists</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Filter by follower count to find trending playlists
                </p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <UIcon name="i-heroicons-arrow-down-tray" class="h-8 w-8 text-purple-500 mb-2" />
                <h3 class="font-semibold text-gray-900 dark:text-white mb-1">Export Results</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Download your search results as a CSV file
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UPageSection>
  </div>
</template>

<script setup lang="ts">
import type { SearchRequest, SearchResponse } from '~/types/search'

// Page metadata
useHead({
  title: 'Spotify Playlist Explorer',
  meta: [
    { 
      name: 'description', 
      content: 'Discover popular Spotify playlists by music genre and follower count. Find new music and connect with playlist creators.' 
    }
  ]
})

// Component refs
const searchForm = ref()

// State
const isLoading = ref(false)
const searchResults = ref<SearchResponse | null>(null)

// Handle search form submission
async function handleSearch(searchRequest: SearchRequest) {
  isLoading.value = true
  searchResults.value = null
  
  // Clear any previous errors in the form
  searchForm.value?.clearError()

  try {
    const response = await $fetch('/api/search/playlists', {
      method: 'POST',
      body: searchRequest
    })

    if ('playlists' in response) {
      // Success response
      searchResults.value = response
    } else {
      // Error response
      const errorMessage = response.message || 'An unexpected error occurred'
      searchForm.value?.setError(errorMessage)
    }
    
  } catch (error) {
    console.error('Search failed:', error)
    
    let errorMessage = 'Unable to search playlists. Please try again later.'
    
    // Handle specific error types
    if (error && typeof error === 'object' && 'data' in error) {
      const errorData = error.data as any
      if (errorData?.message) {
        errorMessage = errorData.message
      }
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    
    searchForm.value?.setError(errorMessage)
    
  } finally {
    isLoading.value = false
    searchForm.value?.setLoading(false)
  }
}
</script>
