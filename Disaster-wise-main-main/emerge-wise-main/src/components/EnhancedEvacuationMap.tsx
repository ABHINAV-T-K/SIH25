import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation, MapPin, Clock, Route, AlertTriangle, Search } from "lucide-react";
import { toast } from "sonner";
import DestinationSearch from "./DestinationSearch";
import QuickEvacuationDestinations from "./QuickEvacuationDestinations";
import "leaflet/dist/leaflet.css";

// Fix Leaflet markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const destinationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface RouteInfo {
  distance: number;
  duration: number;
  coordinates: [number, number][];
  routeType?: string;
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => onMapClick(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

export default function EnhancedEvacuationMap() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [destinationName, setDestinationName] = useState<string>("");
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [alternativeRoutes, setAlternativeRoutes] = useState<RouteInfo[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(coords);
          setLocationError(null);
          toast.success("Location found successfully!");
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Fallback to Delhi coordinates
          setUserLocation([28.6139, 77.2090]);
          setLocationError("Using default location (Delhi). Please enable location services for accurate results.");
          toast.warning("Using default location. Enable GPS for better accuracy.");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      setUserLocation([28.6139, 77.2090]);
      setLocationError("Geolocation not supported. Using default location.");
      toast.error("Geolocation not supported by your browser.");
    }
  };

  const calculateRoute = async (start: [number, number], end: [number, number]) => {
    setIsLoading(true);
    try {
      // Calculate multiple route options for better evacuation planning
      const routeTypes = ['driving', 'walking'];
      const routes: RouteInfo[] = [];

      for (const routeType of routeTypes) {
        try {
          const response = await fetch(
            `https://router.project-osrm.org/route/v1/${routeType}/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson&steps=true&alternatives=true`
          );
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.routes && data.routes.length > 0) {
              data.routes.forEach((route: any, index: number) => {
                const coordinates = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
                
                routes.push({
                  distance: route.distance / 1000,
                  duration: route.duration / 60,
                  coordinates,
                  routeType: `${routeType}${index > 0 ? ` (Alt ${index})` : ''}`
                });
              });
            }
          }
        } catch (error) {
          console.error(`Error calculating ${routeType} route:`, error);
        }
      }

      if (routes.length > 0) {
        // Sort routes by duration (fastest first)
        routes.sort((a, b) => a.duration - b.duration);
        setRouteInfo(routes[0]);
        setAlternativeRoutes(routes);
        setSelectedRouteIndex(0);
        toast.success(`Found ${routes.length} route option(s)!`);
      } else {
        throw new Error('No routes found');
      }
    } catch (error) {
      console.error('Route calculation error:', error);
      // Fallback to straight line
      const straightLineDistance = calculateStraightLineDistance(start, end);
      const fallbackRoute = {
        distance: straightLineDistance,
        duration: (straightLineDistance / 50) * 60,
        coordinates: [start, end],
        routeType: 'Direct Line (Emergency)'
      };
      setRouteInfo(fallbackRoute);
      setAlternativeRoutes([fallbackRoute]);
      setSelectedRouteIndex(0);
      toast.warning("Using direct route. Detailed routing unavailable.");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStraightLineDistance = (start: [number, number], end: [number, number]): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (end[0] - start[0]) * Math.PI / 180;
    const dLon = (end[1] - start[1]) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(start[0] * Math.PI / 180) * Math.cos(end[0] * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleMapClick = (lat: number, lng: number) => {
    const newDestination: [number, number] = [lat, lng];
    setDestination(newDestination);
    setDestinationName(`Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    
    if (userLocation) {
      calculateRoute(userLocation, newDestination);
    }
  };

  const handleLocationSelect = (lat: number, lng: number, name: string) => {
    const newDestination: [number, number] = [lat, lng];
    setDestination(newDestination);
    setDestinationName(name);
    setShowSearch(false);
    
    if (userLocation) {
      calculateRoute(userLocation, newDestination);
    }

    // Center map on selected location
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 15);
    }
  };

  const clearRoute = () => {
    setDestination(null);
    setDestinationName("");
    setRouteInfo(null);
    setAlternativeRoutes([]);
    setSelectedRouteIndex(0);
  };

  const selectRoute = (index: number) => {
    if (alternativeRoutes[index]) {
      setRouteInfo(alternativeRoutes[index]);
      setSelectedRouteIndex(index);
      toast.success(`Selected ${alternativeRoutes[index].routeType} route`);
    }
  };

  const startNavigation = () => {
    if (destination && userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation[0]},${userLocation[1]}/${destination[0]},${destination[1]}`;
      window.open(url, '_blank');
      toast.success("Opening navigation in Google Maps...");
    }
  };

  if (!userLocation) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your location...</p>
          <Button onClick={getCurrentLocation} className="mt-4">
            Retry Location
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {locationError && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <p className="text-yellow-800 text-sm">{locationError}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Evacuation Destinations */}
      <QuickEvacuationDestinations 
        onDestinationSelect={handleLocationSelect}
        userLocation={userLocation}
      />

      {/* Search Controls */}
      <div className="flex gap-2 mb-4">
        <Button 
          onClick={() => setShowSearch(!showSearch)}
          variant={showSearch ? "default" : "outline"}
          className="flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          Search Destination
        </Button>
        <Button onClick={getCurrentLocation} variant="outline">
          <MapPin className="h-4 w-4 mr-2" />
          Update Location
        </Button>
        {destination && (
          <Button onClick={clearRoute} variant="outline">
            Clear Route
          </Button>
        )}
      </div>

      {/* Destination Search */}
      {showSearch && (
        <Card>
          <CardContent className="p-4">
            <DestinationSearch onLocationSelect={handleLocationSelect} />
          </CardContent>
        </Card>
      )}

      {/* Current Destination Info */}
      {destination && destinationName && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-700">Selected Destination:</p>
                <p className="font-semibold text-blue-800">{destinationName}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <MapContainer 
          center={userLocation} 
          zoom={13} 
          style={{ height: "500px", width: "100%" }}
          ref={mapRef}
        >
          <TileLayer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapClickHandler onMapClick={handleMapClick} />
          
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <strong>Your Current Location</strong>
                <br />
                <small>Lat: {userLocation[0].toFixed(6)}</small>
                <br />
                <small>Lng: {userLocation[1].toFixed(6)}</small>
              </div>
            </Popup>
          </Marker>
          
          {destination && (
            <Marker position={destination} icon={destinationIcon}>
              <Popup>
                <div className="text-center">
                  <strong>Evacuation Destination</strong>
                  {destinationName && (
                    <>
                      <br />
                      <span className="text-sm">{destinationName}</span>
                    </>
                  )}
                  <br />
                  <small>Lat: {destination[0].toFixed(6)}</small>
                  <br />
                  <small>Lng: {destination[1].toFixed(6)}</small>
                </div>
              </Popup>
            </Marker>
          )}
          
          {routeInfo && routeInfo.coordinates.length > 0 && (
            <Polyline 
              positions={routeInfo.coordinates} 
              pathOptions={{ 
                color: selectedRouteIndex === 0 ? "#ef4444" : "#3b82f6", 
                weight: 5, 
                opacity: 0.8,
                dashArray: routeInfo.routeType?.includes('walking') ? "10, 10" : undefined
              }} 
            />
          )}

          {/* Show alternative routes in lighter colors */}
          {alternativeRoutes.map((route, index) => 
            index !== selectedRouteIndex && (
              <Polyline 
                key={index}
                positions={route.coordinates} 
                pathOptions={{ 
                  color: "#94a3b8", 
                  weight: 3, 
                  opacity: 0.5,
                  dashArray: route.routeType?.includes('walking') ? "5, 5" : undefined
                }} 
              />
            )
          )}
        </MapContainer>

        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center rounded-lg">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Calculating route...</p>
            </div>
          </div>
        )}
      </div>

      {routeInfo && (
        <div className="space-y-4">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Route className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-green-700">Distance</p>
                    <p className="font-semibold text-green-800">
                      {routeInfo.distance.toFixed(2)} km
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-green-700">Estimated Time</p>
                    <p className="font-semibold text-green-800">
                      {Math.round(routeInfo.duration)} min
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-green-700">Route Type</p>
                    <p className="font-semibold text-green-800">
                      {routeInfo.routeType || 'Driving'}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={startNavigation} className="flex-1">
                    <Navigation className="h-4 w-4 mr-2" />
                    Navigate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alternative Routes */}
          {alternativeRoutes.length > 1 && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">Alternative Routes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {alternativeRoutes.map((route, index) => (
                    <Button
                      key={index}
                      variant={index === selectedRouteIndex ? "default" : "outline"}
                      size="sm"
                      onClick={() => selectRoute(index)}
                      className="text-left justify-start"
                    >
                      <div>
                        <div className="font-medium">{route.routeType}</div>
                        <div className="text-xs opacity-75">
                          {route.distance.toFixed(1)} km • {Math.round(route.duration)} min
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
