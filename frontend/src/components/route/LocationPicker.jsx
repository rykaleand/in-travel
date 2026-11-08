// Выбор координат для формы точки. Значение и сохранение держит родительская форма.
import { Icon } from "leaflet";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import markerUrl from "leaflet/dist/images/marker-icon.png";
import markerRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import "./location-picker.css";

// Явные импорты позволяют Vite найти картинки маркера и в production-сборке.
const markerIcon = new Icon({
  iconUrl: markerUrl,
  iconRetinaUrl: markerRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
});

function SelectLocation({ value, onChange }) {
  useMapEvents({
    click({ latlng }) {
      // На карте можно прокрутить несколько копий мира: нормализуем долготу.
      const point = latlng.wrap();
      if (point.lat >= -90 && point.lat <= 90) {
        onChange({ latitude: point.lat, longitude: point.lng });
      }
    },
  });
  return value ? (
    <Marker
      position={[value.latitude, value.longitude]}
      icon={markerIcon}
      alt="Выбранное место"
      title="Выбранное место"
    />
  ) : null;
}

// value: null или { latitude, longitude }; onChange(null) убирает выбранное место.
// При открытии другой точки создавайте форму заново с key={stop.id}.
export default function LocationPicker({ value, onChange }) {
  return (
    <div className="location-picker">
      <p>Нажмите на карту, чтобы выбрать место. Повторный клик перенесёт маркер.</p>
      <MapContainer
        className="location-picker__map"
        center={value ? [value.latitude, value.longitude] : [20, 0]}
        zoom={value ? 13 : 2}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
        <SelectLocation value={value} onChange={onChange} />
      </MapContainer>
      {value && (
        <button type="button" className="btn btn--secondary" onClick={() => onChange(null)}>
          Убрать место
        </button>
      )}
    </div>
  );
}
