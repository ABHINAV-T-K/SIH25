import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Navigation, Download } from "lucide-react";

interface OfflineRoute {
  id: string;
  name: string;
  from_location: string;
  to_location: string;
  current_status: 'open' | 'congested' | 'closed';
  distance_km: number;
  estimated_time_minutes: number;
  state?: string;
  ai_optimized?: boolean;
  cached_at?: string;
}

interface OfflineRouteCardProps {
  route: OfflineRoute;
  userLocation?: { lat: number; lng: number };
  onShowRoute?: (route: OfflineRoute) => void;
}

const OfflineRouteCard: React.FC<OfflineRouteCardProps> = ({ 
  route, 
  userLocation, 
  onShowRoute 
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open": return "bg-green-500 text-white";
      case "congested": return "bg-orange-500 text-white";
      case "closed": return "bg-red-500 text-white";
      default: return "bg-gray-400 text-white";
    }
  };

  const formatCacheDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const openInMaps = () => {
    const origin = userLocation 
      ? `${userLocation.lat},${userLocation.lng}` 
      : encodeURIComponent(route.from_location);
    const destination = encodeURIComponent(route.to_location);
    
    // Try to open in native maps app first, fallback to web
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <Card className="border-l-4 border-primary">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {route.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {route.from_location} → {route.to_location}
              {route.state && ` (${route.state})`}
            </p>
            
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm flex items-center gap-1">
                <Navigation className="h-3 w-3" />
                {route.distance_km} km
              </span>
              <span className="text-sm flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {route.estimated_time_minutes} min
              </span>
            </div>

            {route.cached_at && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Download className="h-3 w-3" />
                Cached: {formatCacheDate(route.cached_at)}
              </p>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <Badge className={getStatusColor(route.current_status)}>
                {route.current_status.toUpperCase()}
              </Badge>
              {route.ai_optimized && (
                <Badge className="bg-blue-500 text-white">AI Optimized</Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              {onShowRoute && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onShowRoute(route)}
                >
                  Show Route
                </Button>
              )}
              
              <Button 
                size="sm" 
                onClick={openInMaps}
                disabled={route.current_status === 'closed'}
              >
                Open Maps
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfflineRouteCard;
