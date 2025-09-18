import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEvacuationRoutes } from "@/hooks/useEvacuationRoutes";

export default function EvacuationMap() {
  const { routes, loading, error } = useEvacuationRoutes();

  if (loading) return <p>Loading evacuation routes...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <MapContainer
      center={[20.5937, 78.9629]} // Center of India
      zoom={5}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {routes.map((route) => {
        const path = route.route_points || [];
        return (
          <div key={route.id}>
            {path.length > 1 && (
              <Polyline positions={path.map((p) => [p.lat, p.lng])} color="blue" />
            )}
            {path.map((point, idx) => (
              <Marker key={idx} position={[point.lat, point.lng]}>
                <Popup>
                  <b>{route.name}</b> <br />
                  From: {route.from_location} <br />
                  To: {route.to_location} <br />
                  Distance: {route.distance_km} km <br />
                  Time: {route.estimated_time_minutes} mins <br />
                  Status: {route.current_status}
                </Popup>
              </Marker>
            ))}
          </div>
        );
      })}
    </MapContainer>
  );
}
