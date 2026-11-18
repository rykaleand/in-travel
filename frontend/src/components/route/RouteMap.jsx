import { useEffect, useRef } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { getStopLocation } from "./stopUtils";

const stopIcon = L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

function FitToMarkers({ positions }) {
    const map = useMap();
    const latest = useRef(positions);
    latest.current = positions;
    const key = positions.map((position) => position.join(",")).join("|");

    useEffect(() => {
        if (latest.current.length === 0) return;
        map.fitBounds(L.latLngBounds(latest.current), { padding: [32, 32], maxZoom: 14 });
    }, [key, map]);

    return null;
}

export default function RouteMap({ stops }) {
    const located = [];
    for (const stop of stops) {
        const location = getStopLocation(stop);
        if (location) located.push({ stop, position: [location.latitude, location.longitude] });
    }
    if (located.length === 0) return null;

    const positions = located.map((item) => item.position);

    return (
        <div className="route-map">
            <MapContainer
                center={positions[0]}
                zoom={5}
                scrollWheelZoom={false}
                className="route-map__container"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitToMarkers positions={positions} />
                {located.map(({ stop, position }) => (
                    <Marker key={stop.id} position={position} icon={stopIcon}>
                        <Popup>
                            {stop.title}
                            <br />
                            День {stop.day_number}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}