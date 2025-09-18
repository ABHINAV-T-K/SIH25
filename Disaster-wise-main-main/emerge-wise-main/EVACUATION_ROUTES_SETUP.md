# Enhanced Evacuation Routes Setup Guide

## Overview
The enhanced Evacuation Routes page now includes:
- **Real-time user location detection**
- **Interactive Google Maps integration**
- **Route status visualization (Open/Congested/Closed)**
- **Offline functionality with cached routes**
- **Turn-by-turn directions**
- **Route optimization based on traffic conditions**

## Setup Instructions

### 1. Google Maps API Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Directions API
   - Places API
   - Geolocation API

4. Create an API key:
   - Go to "Credentials" → "Create Credentials" → "API Key"
   - Restrict the API key to your domain for security
   - Copy the API key

5. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Google Maps API key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

### 2. Install Dependencies

```bash
npm install @googlemaps/js-api-loader
```

### 3. Browser Permissions

The application requires the following browser permissions:
- **Location Access**: For getting user's current position
- **Storage Access**: For offline route caching

Users will be prompted to grant these permissions when they first visit the page.

### 4. Features Overview

#### Real-time Location
- Automatically detects user's current location
- Shows user position on the map with a blue marker
- Calculates routes from user's location to safety zones

#### Interactive Map
- Google Maps integration with satellite and street view
- Real-time traffic data
- Interactive markers for evacuation points
- Color-coded routes based on status:
  - 🟢 **Green**: Open routes (recommended)
  - 🟠 **Orange**: Congested routes (use if necessary)
  - 🔴 **Red**: Closed routes (avoid completely)

#### Route Status System
- **Open Routes**: Clear passage, fastest evacuation
- **Congested Routes**: Heavy traffic, slower but passable
- **Closed Routes**: Blocked roads, completely impassable

#### Offline Functionality
- Routes are automatically cached for offline use
- Works without internet connection
- Cached routes include:
  - Route coordinates
  - Status information
  - Distance and time estimates
  - Last updated timestamp

#### Smart Route Selection
- AI-optimized routes avoid congested areas
- Real-time traffic integration
- Alternative route suggestions
- Emergency route prioritization

### 5. Usage Instructions

#### For Users:
1. **Allow Location Access**: Grant permission when prompted
2. **View Current Location**: Your position appears as a blue dot
3. **Select Route Status**: Use the filter to show specific route types
4. **Get Directions**: Click "Get Directions" for turn-by-turn navigation
5. **Save for Offline**: Click "Save Offline" to cache routes
6. **Emergency Use**: In offline mode, use cached routes for basic navigation

#### For Administrators:
1. **Update Route Status**: Modify route status in the database
2. **Add New Routes**: Create new evacuation routes
3. **Monitor Usage**: Track which routes are most used
4. **Manage Offline Data**: Clear old cached data periodically

### 6. Technical Implementation

#### Components Structure:
```
src/
├── pages/EvacuationRoutes.tsx          # Main evacuation routes page
├── components/OfflineRouteCard.tsx     # Offline route display
├── hooks/useGeolocation.ts             # Location services hook
├── lib/offlineMap.ts                   # Offline functionality
└── public/sw.js                        # Service worker for caching
```

#### Key Technologies:
- **Google Maps JavaScript API**: Interactive maps and directions
- **Geolocation API**: User location detection
- **IndexedDB**: Offline data storage
- **Service Worker**: Background caching and offline support
- **React Hooks**: State management and side effects

### 7. Security Considerations

- API keys are restricted to specific domains
- Location data is not stored permanently
- Offline data is stored locally only
- HTTPS required for geolocation services

### 8. Performance Optimization

- Map tiles are cached for offline use
- Route data is compressed before storage
- Lazy loading of map components
- Debounced search and filter operations

### 9. Troubleshooting

#### Common Issues:

**Location not detected:**
- Ensure HTTPS is enabled
- Check browser location permissions
- Verify GPS is enabled on device

**Maps not loading:**
- Verify Google Maps API key is correct
- Check API key restrictions
- Ensure required APIs are enabled

**Offline mode not working:**
- Check if service worker is registered
- Verify browser supports IndexedDB
- Clear browser cache and try again

**Routes not updating:**
- Check internet connection
- Verify API quotas are not exceeded
- Refresh the page to reload data

### 10. Future Enhancements

- **Voice Navigation**: Audio turn-by-turn directions
- **Multi-language Support**: Localized route instructions
- **Emergency Contacts**: Quick access to emergency services
- **Weather Integration**: Route recommendations based on weather
- **Crowd-sourced Updates**: User-reported route conditions
- **AR Navigation**: Augmented reality route overlay

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.
