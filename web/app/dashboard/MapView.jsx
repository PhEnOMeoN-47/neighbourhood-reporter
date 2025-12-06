"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ✅ Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function MapView({ reports }) {
  return (
    <MapContainer
      center={[19.076, 72.8777]}
      zoom={12}
      style={{ height: "400px", width: "100%", marginBottom: "30px" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {reports
        .filter(r => r.latitude && r.longitude)
        .map(report => (
          <Marker
            key={report.id}
            position={[report.latitude, report.longitude]}
          >
            <Popup>
              <strong>{report.title}</strong>
              <br />
              {report.category}
              <br />
              Status: {report.status}
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
