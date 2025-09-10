# Quickstart Guide: Spotify Playlist Explorer

**Date**: 2025-09-10  
**Purpose**: End-to-end validation of the Spotify Playlist Explorer functionality

## Prerequisites

1. **Spotify API Credentials**:
   - Register app at https://developer.spotify.com/dashboard
   - Obtain Client ID and Client Secret
   - Add to environment variables

2. **Development Environment**:
   - Node.js 18+ installed
   - pnpm package manager
   - Git for version control

3. **Environment Setup**:
   ```bash
   # Clone repository
   git clone [repository-url]
   cd spotify-api-playlist-explorer
   
   # Install dependencies
   pnpm install
   
   # Set environment variables
   cp .env.example .env.local
   # Edit .env.local with your Spotify credentials
   ```

## Quick Start Steps

### Step 1: Start Development Server
```bash
pnpm dev
```
**Expected**: Server starts on http://localhost:3000

### Step 2: Verify Genres API
**Action**: Navigate to http://localhost:3000/api/genres
**Expected**: JSON response with array of available genres
```json
{
  "genres": ["acoustic", "afrobeat", "alt-rock", "alternative", ...]
}
```

### Step 3: Test Basic Search Form
**Action**: Open http://localhost:3000 in browser
**Expected**: 
- Form with genre selection (multi-select)
- Minimum follower count input field
- Search button

### Step 4: Perform Search with Popular Genres
**Action**: Fill form with:
- Genres: Select "pop" and "rock" 
- Min Followers: Enter "10000"
- Click "Search Playlists"

**Expected**: 
- Loading state appears
- Results table displays with columns:
  - Playlist Name
  - Description  
  - Followers
  - Tracks
  - Owner
  - Spotify Link
- Up to 50 results shown
- Each result has >10,000 followers
- Results include pop or rock playlists

### Step 5: Verify Playlist Data
**Action**: Examine first few results in table
**Expected**: Each row contains:
- Valid playlist name (not empty)
- Follower count >= 10,000
- Owner display name and profile link
- Working Spotify URL (opens playlist in Spotify)

### Step 6: Test CSV Export
**Action**: Click "Export to CSV" button
**Expected**:
- CSV file downloads automatically
- Filename format: "spotify-playlists-[timestamp].csv"  
- CSV contains all displayed playlist data
- Headers match table columns

### Step 7: Test Edge Cases

#### Empty Results
**Action**: Search with very restrictive criteria:
- Genres: Select obscure genre like "grindcore"
- Min Followers: Enter "5000000"

**Expected**:
- "No playlists found" message displayed
- Empty table (header only)
- Export button disabled

#### Invalid Input Validation  
**Action**: Try invalid inputs:
- Leave genres empty
- Enter negative follower count
- Select more than 10 genres

**Expected**:
- Form validation prevents submission
- Clear error messages displayed
- Search button remains disabled until fixed

#### API Error Handling
**Action**: Temporarily break Spotify API credentials
**Expected**:
- User-friendly error message (not technical details)
- Option to retry search
- No application crash

### Step 8: Performance Verification
**Action**: Search with moderate criteria:
- Genres: "electronic", "dance"  
- Min Followers: 50000

**Expected**:
- Search completes in <2 seconds
- Results load smoothly without UI blocking
- CSV export generates quickly (<1 second)

## Success Criteria Checklist

### Functional Requirements
- [ ] FR-001: Genre selection works with multiple genres
- [ ] FR-002: Minimum follower filtering applied correctly  
- [ ] FR-003: Returns up to 50 matching playlists
- [ ] FR-004: Spotify URLs are valid and functional
- [ ] FR-005: Owner information displayed (username, display name, profile)
- [ ] FR-006: Spotify API authentication working
- [ ] FR-007: Handles <50 results gracefully
- [ ] FR-008: Web form interface functional
- [ ] FR-009: Genre validation against Spotify's available genres
- [ ] FR-010: Graceful handling of API errors and rate limits

### User Experience
- [ ] Form is intuitive and easy to use
- [ ] Results display clearly in organized table
- [ ] Loading states provide feedback
- [ ] Error messages are helpful and actionable
- [ ] CSV export works reliably
- [ ] Application responsive on desktop browsers

### Performance
- [ ] Initial page load <2 seconds
- [ ] Search responses <500ms for typical queries
- [ ] CSV export <1 second for 50 results
- [ ] No memory leaks during extended use

### Integration  
- [ ] Spotify API integration stable
- [ ] Genre validation uses live Spotify data
- [ ] All external URLs functional
- [ ] Error handling for API unavailability

## Troubleshooting

### Common Issues

1. **No genres loading**: Check Spotify API credentials in .env.local
2. **Search returns empty**: Verify API credentials and network connectivity  
3. **CSV export not working**: Check browser download settings
4. **Slow performance**: Check network connection and Spotify API rate limits

### Debug Commands
```bash
# Check environment variables
pnpm run env:check

# Run API tests  
pnpm test:api

# Check build for production
pnpm build
```

This quickstart guide validates all core functionality and serves as the acceptance test for the feature implementation.