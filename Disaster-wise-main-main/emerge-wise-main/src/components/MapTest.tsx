import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, AlertCircle } from 'lucide-react';

const MapTest = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Fallback to Delhi
          setUserLocation({ lat: 28.6139, lng: 77.2090 });
        }
      );
    } else {
      setUserLocation({ lat: 28.6139, lng: 77.2090 });
    }
  }, []);

  useEffect(() => {
    if (!userLocation || !mapRef.current) return;

    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE',
      version: 'weekly',
      libraries: ['places', 'geometry']
    });

    loader.load().then(() => {
      const map = new google.maps.Map(mapRef.current!, {
        center: userLocation,
        zoom: 12,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      });

      // Add user location marker
      new google.maps.Marker({
        position: userLocation,
        map: map,
        title: 'Your Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="#ffffff" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" fill="#ffffff"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(24, 24),
        }
      });

      // Add some sample evacuation points
      const evacuationPoints = [
        { lat: userLocation.lat + 0.01, lng: userLocation.lng + 0.01, name: 'Safe Zone A' },
        { lat: userLocation.lat - 0.01, lng: userLocation.lng + 0.01, name: 'Safe Zone B' },
        { lat: userLocation.lat + 0.01, lng: userLocation.lng - 0.01, name: 'Safe Zone C' },
      ];

      evacuationPoints.forEach(point => {
        new google.maps.Marker({
          position: point,
          map: map,
          title: point.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 1.16-.21 2.31-.48 3.38-.84.83-.28 1.62-.63 2.38-1.05.76-.42 1.47-.9 2.12-1.44C20.16 17 22 14.55 22 12V7L12 2z" fill="#22c55e" stroke="#ffffff" stroke-width="1"/>
                <path d="M9 12l2 2 4-4" stroke="#ffffff" stroke-width="2" fill="none"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(24, 24),
          }
        });
      });

      setMapLoaded(true);
    }).catch((error) => {
      console.error('Error loading Google Maps:', error);
      setError('Failed to load Google Maps. Please check your API key.');
    });
  }, [userLocation]);

  const testDirections = () => {
    if (!userLocation) return;

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();

    const destination = {
      lat: userLocation.lat + 0.01,
      lng: userLocation.lng + 0.01
    };

    directionsService.route({
      origin: userLocation,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING,
    }).then((result) => {
      directionsRenderer.setDirections(result);
      console.log('Directions calculated successfully:', result);
    }).catch((error) => {
      console.error('Directions error:', error);
      setError('Failed to calculate directions. Please check your API configuration.');
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Google Maps Integration Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            )}
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Status: {mapLoaded ? '✅ Map loaded successfully' : '⏳ Loading map...'}
              </p>
              {userLocation && (
                <p className="text-sm text-muted-foreground">
                  Location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </p>
              )}
            </div>

            <div ref={mapRef} className="h-64 w-full rounded-md border" />
            
            {mapLoaded && (
              <Button onClick={testDirections} className="w-full">
                Test Directions API
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapTest;
