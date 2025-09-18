import React from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useEvacuationRoutes } from "@/hooks/useEvacuationRoutes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const defaultIcon = L.icon({
  iconUrl: "/favicon.ico",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

export default function EvacuationRoutesMap() {
  const { routes, loading } = useEvacuationRoutes();

  if (loading) return <div>Loading routes...</div>;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open": return "bg-green-500 text-white";
      case "congested": return "bg-orange-500 text-white";
      case "closed": return "bg-red-500 text-white";
      default: return "bg-gray-400 text-white";
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16 }}>
      {/* Map */}
      <div>
        <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "70vh", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {routes.map((r) => {
            const coords = r.route_points?.coordinates || [];
            const latlngs = coords.map((c) => [c[1], c[0]]);
            return (
              <React.Fragment key={r.id}>
                {latlngs.length > 0 && (
                  <Polyline
                    positions={latlngs as [number, number][]}
                    pathOptions={{
                      color:
                        r.current_status === "open"
                          ? "green"
                          : r.current_status === "congested"
                          ? "orange"
                          : "red",
                    }}
                  />
                )}
                {latlngs[0] && (
                  <Marker position={latlngs[0] as [number, number]} icon={defaultIcon}>
                    <Popup>
                      <strong>{r.name}</strong>
                      <br />
                      From: {r.from_location}
                    </Popup>
                  </Marker>
                )}
                {latlngs[latlngs.length - 1] && (
                  <Marker position={latlngs[latlngs.length - 1] as [number, number]} icon={defaultIcon}>
                    <Popup>To: {r.to_location}</Popup>
                  </Marker>
                )}
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>

      {/* Sidebar List */}
      <aside style={{ maxHeight: "70vh", overflowY: "auto" }}>
        <h3>Evacuation Routes</h3>
        {routes.map((r) => (
          <div key={r.id} style={{ borderBottom: "1px solid #eee", padding: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>{r.name}</strong>
              <Badge className={getStatusColor(r.current_status)}>{r.current_status}</Badge>
            </div>
            <div style={{ fontSize: 13, color: "#666" }}>
              {r.from_location} → {r.to_location}
            </div>
            <div style={{ fontSize: 12 }}>
              {Math.round((r.distance_km ?? 0) * 10) / 10} km · {r.estimated_time_minutes ?? "-"} min
            </div>
            {r.ai_optimized && <Badge className="bg-blue-500 text-white">AI Optimized</Badge>}
            <div style={{ marginTop: 4 }}>
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
                  r.from_location
                )}&destination=${encodeURIComponent(r.to_location)}&travelmode=driving`}
                target="_blank"
                rel="noreferrer"
              >
                Open in Google Maps
              </a>
            </div>
          </div>
        ))}
      </aside>
    </div>
  );
}
