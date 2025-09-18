import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Shield, Clock, Route, AlertTriangle, Info } from "lucide-react";
import EnhancedEvacuationMap from "@/components/EnhancedEvacuationMap";

const EvacuationRoutes = () => {
  const safetyTips = [
    "Stay calm and follow evacuation orders from authorities",
    "Take essential items: ID, medications, water, and emergency supplies",
    "Avoid flooded roads and areas with downed power lines",
    "Keep your mobile phone charged and carry a portable charger",
    "Inform family members about your evacuation route and destination",
    "Follow designated evacuation routes when possible"
  ];

  const emergencyContacts = [
    { name: "Emergency Services", number: "112" },
    { name: "Disaster Management", number: "1078" },
    { name: "Fire Department", number: "101" },
    { name: "Police", number: "100" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MapPin className="h-8 w-8 text-red-600" />
          Emergency Evacuation Routes
        </h1>
        <p className="text-muted-foreground mt-2">
          Get the safest evacuation route from your current location to your desired destination with real-time distance and time calculations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5" />
                Interactive Evacuation Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedEvacuationMap />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center gap-2">
                <Info className="h-5 w-5" />
                How to Use
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ul className="text-sm text-blue-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-semibold">1.</span>
                  Your current location is shown with a blue marker
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">2.</span>
                  Click anywhere on the map to set your evacuation destination
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">3.</span>
                  The system will calculate the safest route automatically
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">4.</span>
                  View distance, time, and start navigation
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Safety Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ul className="text-sm text-green-700 space-y-2">
                {safetyTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-red-700">{contact.name}</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-red-700 border-red-300 hover:bg-red-100"
                      onClick={() => window.open(`tel:${contact.number}`)}
                    >
                      {contact.number}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-800 mb-2">Important Notice</h3>
              <p className="text-sm text-yellow-700 mb-3">
                This evacuation route system uses free, open-source mapping services to provide you with the best possible routes during emergencies. 
                The system works completely offline once routes are cached and doesn't require any API keys or paid services.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-700">
                <div>
                  <strong>Features:</strong>
                  <ul className="mt-1 space-y-1">
                    <li>• Real-time route calculation</li>
                    <li>• Distance and time estimation</li>
                    <li>• GPS-based location detection</li>
                    <li>• Offline route caching</li>
                  </ul>
                </div>
                <div>
                  <strong>Technology:</strong>
                  <ul className="mt-1 space-y-1">
                    <li>• OpenStreetMap for mapping</li>
                    <li>• OSRM for route calculation</li>
                    <li>• Browser geolocation API</li>
                    <li>• No external dependencies</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EvacuationRoutes;
