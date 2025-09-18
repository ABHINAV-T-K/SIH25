import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MapPin, Hospital, Shield, School, Building, Zap, Plane, Car, Home, TreePine } from "lucide-react";
import { toast } from "sonner";

interface QuickDestination {
  name: string;
  type: string;
  icon: React.ReactNode;
  searchQuery: string;
  priority: number;
  color: string;
}

interface QuickEvacuationDestinationsProps {
  onDestinationSelect: (lat: number, lng: number, name: string) => void;
  userLocation: [number, number] | null;
}

export default function QuickEvacuationDestinations({ 
  onDestinationSelect, 
  userLocation 
}: QuickEvacuationDestinationsProps) {
  const [isSearching, setIsSearching] = useState<string | null>(null);

  const quickDestinations: QuickDestination[] = [
    {
      name: "Nearest Hospital",
      type: "hospital",
      icon: <Hospital className="h-4 w-4" />,
      searchQuery: "hospital medical center clinic dispensary",
      priority: 1,
      color: "text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
    },
    {
      name: "Police Station",
      type: "police",
      icon: <Shield className="h-4 w-4" />,
      searchQuery: "police station police chowki thana",
      priority: 2,
      color: "text-blue-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
    },
    {
      name: "Fire Station",
      type: "fire_station",
      icon: <Zap className="h-4 w-4" />,
      searchQuery: "fire station fire brigade damkal",
      priority: 2,
      color: "text-orange-600 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700"
    },
    {
      name: "School/Shelter",
      type: "school",
      icon: <School className="h-4 w-4" />,
      searchQuery: "school college community center community hall",
      priority: 3,
      color: "text-green-600 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
    },
    {
      name: "Government Office",
      type: "government",
      icon: <Building className="h-4 w-4" />,
      searchQuery: "government office municipal corporation collectorate tehsil",
      priority: 3,
      color: "text-purple-600 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700"
    },
    {
      name: "Railway Station",
      type: "railway",
      icon: <Car className="h-4 w-4" />,
      searchQuery: "railway station train station metro station",
      priority: 4,
      color: "text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700"
    },
    {
      name: "Airport",
      type: "airport",
      icon: <Plane className="h-4 w-4" />,
      searchQuery: "airport airfield aerodrome",
      priority: 5,
      color: "text-cyan-600 hover:bg-cyan-50 hover:border-cyan-300 hover:text-cyan-700"
    },
    {
      name: "Safe Zone/Park",
      type: "park",
      icon: <TreePine className="h-4 w-4" />,
      searchQuery: "park garden open space playground",
      priority: 4,
      color: "text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700"
    }
  ];

  const searchNearbyDestination = async (destination: QuickDestination) => {
    if (!userLocation) {
      toast.error("Location not available. Please enable GPS.");
      return;
    }

    setIsSearching(destination.type);
    
    try {
      let places: any[] = [];
      
      // Strategy 1: Use Overpass API for most accurate results
      try {
        const overpassQuery = getOverpassQuery(destination.type, userLocation, 5000);
        const overpassResponse = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: overpassQuery,
          headers: {
            'Content-Type': 'text/plain'
          }
        });
        
        if (overpassResponse.ok) {
          const overpassData = await overpassResponse.json();
          places = overpassData.elements
            .filter((element: any) => element.lat && element.lon)
            .map((element: any) => ({
              lat: element.lat.toString(),
              lon: element.lon.toString(),
              display_name: element.tags?.name || element.tags?.amenity || `${destination.name}`,
              distance: calculateDistance(userLocation[0], userLocation[1], element.lat, element.lon)
            }))
            .sort((a: any, b: any) => a.distance - b.distance)
            .slice(0, 5);
        }
      } catch (overpassError) {
        console.log('Overpass API failed, trying Nominatim');
      }
      
      // Strategy 2: Nominatim with bounded search (if Overpass failed or no results)
      if (places.length === 0) {
        const boundedResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination.searchQuery)}&limit=20&countrycodes=in&bounded=1&viewbox=${userLocation[1] - 0.05},${userLocation[0] + 0.05},${userLocation[1] + 0.05},${userLocation[0] - 0.05}`
        );
        
        if (boundedResponse.ok) {
          const boundedData = await boundedResponse.json();
          places = boundedData
            .map((place: any) => ({
              ...place,
              distance: calculateDistance(
                userLocation[0], userLocation[1],
                parseFloat(place.lat), parseFloat(place.lon)
              )
            }))
            .filter((place: any) => place.distance <= 10)
            .sort((a: any, b: any) => a.distance - b.distance);
        }
      }
      
      // Strategy 3: Nominatim with proximity search (if still no results)
      if (places.length === 0) {
        const proximityResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination.searchQuery)}&limit=10&countrycodes=in&lat=${userLocation[0]}&lon=${userLocation[1]}&addressdetails=1`
        );
        
        if (proximityResponse.ok) {
          const proximityData = await proximityResponse.json();
          places = proximityData
            .map((place: any) => ({
              ...place,
              distance: calculateDistance(
                userLocation[0], userLocation[1],
                parseFloat(place.lat), parseFloat(place.lon)
              )
            }))
            .filter((place: any) => place.distance <= 25) // Expand to 25km for this fallback
            .sort((a: any, b: any) => a.distance - b.distance);
        }
      }
      
      // Strategy 4: Generic search without country restriction (last resort)
      if (places.length === 0) {
        const genericResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination.searchQuery + " near " + userLocation[0] + "," + userLocation[1])}&limit=5`
        );
        
        if (genericResponse.ok) {
          const genericData = await genericResponse.json();
          places = genericData
            .map((place: any) => ({
              ...place,
              distance: calculateDistance(
                userLocation[0], userLocation[1],
                parseFloat(place.lat), parseFloat(place.lon)
              )
            }))
            .sort((a: any, b: any) => a.distance - b.distance);
        }
      }
      
      if (places.length === 0) {
        toast.warning(`No ${destination.name.toLowerCase()} found nearby. Try searching manually or check your location.`);
        return;
      }

      // Select the closest destination
      const closestDestination = places[0];
      const lat = parseFloat(closestDestination.lat);
      const lng = parseFloat(closestDestination.lon);
      
      onDestinationSelect(lat, lng, closestDestination.display_name);
      
      const distanceText = closestDestination.distance < 1 
        ? `${(closestDestination.distance * 1000).toFixed(0)}m away`
        : `${closestDestination.distance.toFixed(1)}km away`;
        
      toast.success(`Found ${destination.name.toLowerCase()}: ${closestDestination.display_name} (${distanceText})`);
      
    } catch (error) {
      console.error('Search error:', error);
      toast.error(`Failed to find ${destination.name.toLowerCase()}. Please try manual search or check your internet connection.`);
    } finally {
      setIsSearching(null);
    }
  };

  const getOverpassQuery = (type: string, location: [number, number], radius: number): string => {
    const [lat, lon] = location;
    const bbox = `${lat - 0.05},${lon - 0.05},${lat + 0.05},${lon + 0.05}`;
    
    let amenityFilter = '';
    switch (type) {
      case 'hospital':
        amenityFilter = 'amenity~"^(hospital|clinic|doctors)$"';
        break;
      case 'police':
        amenityFilter = 'amenity="police"';
        break;
      case 'fire_station':
        amenityFilter = 'amenity="fire_station"';
        break;
      case 'school':
        amenityFilter = 'amenity~"^(school|community_centre|social_centre)$"';
        break;
      case 'government':
        amenityFilter = 'amenity~"^(townhall|public_building)$" or office="government"';
        break;
      case 'railway':
        amenityFilter = 'railway="station" or public_transport="station"';
        break;
      case 'airport':
        amenityFilter = 'aeroway="aerodrome" or amenity="airport"';
        break;
      case 'park':
        amenityFilter = 'leisure~"^(park|playground|recreation_ground)$"';
        break;
      default:
        amenityFilter = `amenity="${type}"`;
    }
    
    return `[out:json][timeout:25];
(
  node[${amenityFilter}](${bbox});
  way[${amenityFilter}](${bbox});
  relation[${amenityFilter}](${bbox});
);
out center;`;
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Quick Evacuation Destinations
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Click any destination to find the nearest one and calculate evacuation route
        </p>
      </CardHeader>
      <CardContent className="p-4">
        <TooltipProvider>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {quickDestinations.map((destination, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className={`h-auto p-3 flex flex-col items-center gap-2 transition-all duration-200 ${destination.color} hover:shadow-md hover:scale-105`}
                    onClick={() => searchNearbyDestination(destination)}
                    disabled={isSearching === destination.type || !userLocation}
                  >
                    {isSearching === destination.type ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    ) : (
                      destination.icon
                    )}
                    <span className="text-xs text-center font-medium leading-tight">
                      {destination.name}
                    </span>
                    {isSearching === destination.type && (
                      <span className="text-xs text-muted-foreground">Searching...</span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Find nearest {destination.name.toLowerCase()} and calculate evacuation route</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
        
        {!userLocation && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Location Required:</strong> Please enable GPS location to find nearby destinations.
            </p>
          </div>
        )}
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>How it works:</strong> We search for the closest destination using multiple data sources 
            and automatically calculate the best evacuation route for you.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
