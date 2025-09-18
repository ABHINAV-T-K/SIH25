import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => onMapClick(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

export default function SimpleEvacuationMap() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<[number, number][]>([]);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => setUserLocation([28.6139, 77.2090]) // Delhi fallback
    );
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    setDestination([lat, lng]);
    if (userLocation) {
      // Simple straight-line route
      setRoute([userLocation, [lat, lng]]);
    }
  };

  if (!userLocation) return <div>Loading map...</div>;

  return (
    <MapContainer center={userLocation} zoom={12} style={{ height: "400px", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapClickHandler onMapClick={handleMapClick} />
      
      <Marker position={userLocation}>
        <Popup>Your Location</Popup>
      </Marker>
      
      {destination && (
        <Marker position={destination}>
          <Popup>Selected Destination</Popup>
        </Marker>
      )}
      
      {route.length > 0 && (
        <Polyline positions={route} pathOptions={{ color: "blue", weight: 4 }} />
      )}
    </MapContainer>
  );
}
