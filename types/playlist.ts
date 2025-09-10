/**
 * Playlist types based on data-model.md entities
 */

export interface PlaylistOwner {
  /** Spotify user ID */
  id: string
  /** Spotify username/handle */
  username: string
  /** User's display name */
  displayName: string
  /** Spotify profile URL */
  profileUrl: string
  /** Profile picture URL */
  imageUrl?: string
}

export interface Playlist {
  /** Spotify playlist ID (primary key) */
  id: string
  /** Playlist display name */
  name: string
  /** Optional playlist description */
  description?: string
  /** Spotify web URL for the playlist */
  url: string
  /** Number of users following this playlist */
  followerCount: number
  /** Number of tracks in the playlist */
  trackCount: number
  /** Playlist cover image URL */
  imageUrl?: string
  /** Playlist creator information */
  owner: PlaylistOwner
  /** Inferred/associated music genres */
  genres: string[]
  /** Whether playlist is publicly accessible */
  isPublic: boolean
}

/**
 * Validation helpers
 */
export function validatePlaylist(playlist: any): playlist is Playlist {
  return (
    typeof playlist === 'object' &&
    typeof playlist.id === 'string' &&
    playlist.id.length > 0 &&
    typeof playlist.name === 'string' &&
    playlist.name.length > 0 &&
    playlist.name.length <= 255 &&
    typeof playlist.url === 'string' &&
    playlist.url.includes('spotify.com') &&
    typeof playlist.followerCount === 'number' &&
    playlist.followerCount >= 0 &&
    typeof playlist.trackCount === 'number' &&
    playlist.trackCount >= 0 &&
    validatePlaylistOwner(playlist.owner) &&
    Array.isArray(playlist.genres) &&
    typeof playlist.isPublic === 'boolean'
  )
}

export function validatePlaylistOwner(owner: any): owner is PlaylistOwner {
  return (
    typeof owner === 'object' &&
    typeof owner.id === 'string' &&
    owner.id.length > 0 &&
    typeof owner.username === 'string' &&
    owner.username.length > 0 &&
    /^[a-zA-Z0-9_-]+$/.test(owner.username) &&
    typeof owner.displayName === 'string' &&
    owner.displayName.length > 0 &&
    owner.displayName.length <= 255 &&
    typeof owner.profileUrl === 'string' &&
    owner.profileUrl.includes('spotify.com/user')
  )
}