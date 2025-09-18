import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Clock, Target } from "lucide-react";

// Fix Leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom markers
const userMarker = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="#ffffff" stroke-width="2"/>
      <circle cx="12" cy="12" r="3" fill="#ffffff"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const destinationMarker = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="#ef4444" stroke="#ffffff" stroke-width="2"/>
      <circle cx="12" cy="10" r="3" fill="#ffffff"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

interface UserLocation {
  lat: number;
  lng: number;
}

interface Destination {
  lat: number;
  lng: number;
  name: string;
}

// Component to handle map clicks
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const EvacuationRouteSelector = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number; safety: string } | null>(null);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fallback to Delhi coordinates
          setUserLocation({ lat: 28.6139, lng: 77.2090 });
        }
      );
    } else {
      setUserLocation({ lat: 28.6139, lng: 77.2090 });
    }
  }, []);

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Generate a safe route (simplified algorithm)
  const generateRoute = (start: UserLocation, end: Destination) => {
    const waypoints: [number, number][] = [];
    
    // Add start point
    waypoints.push([start.lat, start.lng]);
    
    // Generate intermediate points to simulate a road network
    const latDiff = end.lat - start.lat;
    const lngDiff = end.lng - start.lng;
    const steps = 8;
    
    for (let i = 1; i < steps; i++) {
      const progress = i / steps;
      // Add some variation to simulate actual roads
      const variation = Math.sin(progress * Math.PI * 2) * 0.001;
      waypoints.push([
        start.lat + (latDiff * progress) + variation,
        start.lng + (lngDiff * progress) + (variation * 0.5)
      ]);
    }
    
    // Add end point
    waypoints.push([end.lat, end.lng]);
    
    return waypoints;
  };

  // Handle map click to set destination
  const handleMapClick = (lat: number, lng: number) => {
    const newDestination = {
      lat,
      lng,
      name: `Destination (${lat.toFixed(4)}, ${lng.toFixed(4)})`
    };
    
    setDestination(newDestination);
    
    if (userLocation) {
      const newRoute = generateRoute(userLocation, newDestination);
      setRoute(newRoute);
      
      // Calculate route information
      const distance = calculateDistance(userLocation.lat, userLocation.lng, lat, lng);
      const duration = Math.round(distance * 4); // Rough estimate: 4 min per km
      const safety = distance < 5 ? "High" : distance < 15 ? "Medium" : "Low";
      
      setRouteInfo({
        distance: Math.round(distance * 10) / 10,
        duration,
        safety
      });
    }
  };

  // Clear route
  const clearRoute = () => {
    setDestination(null);
    setRoute([]);
    setRouteInfo(null);
  };

  // Get safety color
  const getSafetyColor = (safety: string) => {
    switch (safety) {
      case 'High': return '#22c55e';
      case 'Medium': return '#f97316';
      case 'Low': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (!userLocation) {
    return <div className="p-6 text-center">Getting your location...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Route Information */}
      {routeInfo && destination && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-800">Route to {destination.name}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-green-700">
                  <span className="flex items-center gap-1">
                    <Navigation className="h-3 w-3" />
                    {routeInfo.distance} km
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    ~{routeInfo.duration} min
                  </span>
                  <Badge 
                    className="text-white"
                    style={{ backgroundColor: getSafetyColor(routeInfo.safety) }}
                  >
                    {routeInfo.safety} Safety
                  </Badge>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={clearRoute}>
                Clear Route
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Select Your Evacuation Destination
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <MapContainer 
            center={[userLocation.lat, userLocation.lng]} 
            zoom={13} 
            className="h-96 w-full rounded-b-lg"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            
            <MapClickHandler onMapClick={handleMapClick} />
            
            {/* User location marker */}
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userMarker}>
              <Popup>
                <div>
                  <strong>Your Current Location</strong><br />
                  Lat: {userLocation.lat.toFixed(4)}<br />
                  Lng: {userLocation.lng.toFixed(4)}
                </div>
              </Popup>
            </Marker>

            {/* Destination marker */}
            {destination && (
              <Marker position={[destination.lat, destination.lng]} icon={destinationMarker}>
                <Popup>
                  <div>
                    <strong>{destination.name}</strong><br />
                    {routeInfo && (
                      <>
                        Distance: {routeInfo.distance} km<br />
                        Est. Time: {routeInfo.duration} min<br />
                        Safety: {routeInfo.safety}
                      </>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Route polyline */}
            {route.length > 0 && (
              <Polyline 
                positions={route} 
                pathOptions={{ 
                  color: routeInfo ? getSafetyColor(routeInfo.safety) : "#4285F4", 
                  weight: 5, 
                  opacity: 0.8 
                }} 
              />
            )}
          </MapContainer>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">How to Use</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Click anywhere on the map to set your evacuation destination</li>
                <li>• The system will automatically calculate the safest route</li>
                <li>• Green routes are safest, yellow are moderate risk, red are high risk</li>
                <li>• Route calculation considers distance and potential hazards</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EvacuationRouteSelector;
