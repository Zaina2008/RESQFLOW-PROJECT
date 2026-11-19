import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { CLASSIFICATION_COLORS } from "@/components/dashboard/Badges";
import { formatCoordinate, formatDateTime } from "@/lib/format";

export default function ObservationMap({ observations = [], facilities = [] }) {
  return (
    <MapContainer
      center={[22.8, 79]}
      zoom={4}
      scrollWheelZoom
      style={{ height: "100%", width: "100%", background: "#090D16" }}
    >
      <TileLayer
        attribution="Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
      />

      {facilities.map((facility) => (
        <CircleMarker
          key={`facility-${facility.id}`}
          center={[Number(facility.latitude) || 0, Number(facility.longitude) || 0]}
          radius={7}
          pathOptions={{
            color: "#E9DFC8",
            weight: 1,
            dashArray: "2 3",
            fillColor: "#263A57",
            fillOpacity: 0.55,
          }}
        >
          <Tooltip direction="top" offset={[0, -6]}>
            <span style={{ fontSize: 11 }}>{facility.name}</span>
          </Tooltip>
          <Popup>
            <div style={{ fontSize: 12, lineHeight: 1.5 }}>
              <strong>{facility.name}</strong>
              <br />
              {facility.facility_type} · {facility.region || "—"}
              <br />
              {formatCoordinate(facility.latitude, facility.longitude)}
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {observations.map((observation) => {
        const color = CLASSIFICATION_COLORS[observation.classification] || "#2789E8";
        const radius = 4 + Math.min(8, Math.round(Number(observation.confidence || 0) / 14));
        return (
          <CircleMarker
            key={`obs-${observation.id}`}
            center={[Number(observation.latitude) || 0, Number(observation.longitude) || 0]}
            radius={radius}
            pathOptions={{ color, weight: 1, fillColor: color, fillOpacity: 0.45 }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              <span style={{ fontSize: 11 }}>{observation.site_name}</span>
            </Tooltip>
            <Popup>
              <div style={{ fontSize: 12, lineHeight: 1.5 }}>
                <strong>{observation.site_name}</strong>
                <br />
                {observation.classification} · {Math.round(Number(observation.confidence) || 0)}% confidence
                <br />
                {observation.source || "Unknown source"}
                <br />
                {formatDateTime(observation.detected_at)}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
