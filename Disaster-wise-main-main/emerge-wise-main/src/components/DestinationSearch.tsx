import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
}

interface DestinationSearchProps {
  onLocationSelect: (lat: number, lng: number, name: string) => void;
}

export default function DestinationSearch({ onLocationSelect }: DestinationSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchLocation = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a location to search");
      return;
    }

    setIsSearching(true);
    try {
      // Using Nominatim (OpenStreetMap's free geocoding service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=in`
      );
      
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data: SearchResult[] = await response.json();
      
      if (data.length === 0) {
        toast.warning("No locations found. Try a different search term.");
        setSearchResults([]);
      } else {
        setSearchResults(data);
        toast.success(`Found ${data.length} location(s)`);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error("Search failed. Please try again.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSelect = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    onLocationSelect(lat, lng, result.display_name);
    setSearchResults([]);
    setSearchQuery("");
    toast.success("Destination selected!");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchLocation();
    }
  };

  const commonDestinations = [
    { name: "Hospital", query: "hospital near me" },
    { name: "Police Station", query: "police station near me" },
    { name: "Fire Station", query: "fire station near me" },
    { name: "School", query: "school near me" },
    { name: "Community Center", query: "community center near me" },
    { name: "Railway Station", query: "railway station near me" }
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search for evacuation destination (e.g., hospital, school, safe zone)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button onClick={searchLocation} disabled={isSearching}>
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Quick destination buttons */}
      <div className="flex flex-wrap gap-2">
        {commonDestinations.map((dest, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery(dest.query);
            }}
            className="text-xs"
          >
            {dest.name}
          </Button>
        ))}
      </div>

      {/* Search results */}
      {searchResults.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Search Results
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {searchResults.map((result, index) => (
                <div
                  key={result.place_id || index}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleLocationSelect(result)}
                >
                  <p className="font-medium text-sm">{result.display_name}</p>
                  <p className="text-xs text-gray-500">
                    Lat: {parseFloat(result.lat).toFixed(4)}, 
                    Lng: {parseFloat(result.lon).toFixed(4)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
