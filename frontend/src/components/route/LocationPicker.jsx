import { useEffect, useRef, useState } from "react";
import { Map as MapLibreMap, Marker, NavigationControl } from "maplibre-gl";
import { OPEN_FREE_MAP_STYLE } from "./maplibre-config";
import "./location-picker.css";

const SUGGESTION_RADIUS_METERS = 1500;
const MOSCOW_CENTER = [37.6173, 55.7558];
const POI_CLASSES = new Set([
  "attraction", "museum", "gallery", "historic", "monument", "memorial",
  "castle", "viewpoint", "zoo", "aquarium", "park", "theme_park",
]);

const TYPE_LABELS = {
  attraction: "Достопримечательность",
  museum: "Музей",
  gallery: "Галерея",
  historic: "Историческое место",
  monument: "Памятник",
  memorial: "Мемориал",
  castle: "Замок",
  viewpoint: "Смотровая площадка",
  zoo: "Зоопарк",
  aquarium: "Океанариум",
  park: "Парк",
  theme_park: "Парк развлечений",
};

const NOMINATIM_URL = import.meta.env.VITE_NOMINATIM_URL || "https://nominatim.openstreetmap.org/search";
const searchCache = new Map();
let lastNominatimRequestAt = 0;

async function searchPlaces(query) {
  const cacheKey = query.trim().toLocaleLowerCase("ru");
  if (searchCache.has(cacheKey)) return searchCache.get(cacheKey);

  const waitTime = Math.max(0, 1000 - (Date.now() - lastNominatimRequestAt));
  if (waitTime) await new Promise((resolve) => setTimeout(resolve, waitTime));
  lastNominatimRequestAt = Date.now();

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("q", query.trim());
  url.searchParams.set("limit", "5");
  url.searchParams.set("layer", "poi");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("namedetails", "1");
  url.searchParams.set("accept-language", "ru,en");

  const response = await fetch(url);
  if (!response.ok) throw new Error("Сервис поиска мест временно недоступен");
  const data = await response.json();
  const results = data.map((item) => ({
    id: `${item.osm_type}-${item.osm_id}`,
    name: item.namedetails?.["name:ru"] || item.name || item.display_name.split(",")[0],
    address: item.display_name,
    type: String(item.type || item.addresstype || "место").replaceAll("_", " "),
    location: { latitude: Number(item.lat), longitude: Number(item.lon) },
  })).filter((item) => Number.isFinite(item.location.latitude) && Number.isFinite(item.location.longitude));
  searchCache.set(cacheKey, results);
  return results;
}

function parseCoordinate(value) {
  return Number(String(value).trim().replace(",", "."));
}

function distanceMeters(first, second) {
  const toRadians = (degrees) => degrees * Math.PI / 180;
  const latitudeDelta = toRadians(second.latitude - first.latitude);
  const longitudeDelta = toRadians(second.longitude - first.longitude);
  const firstLatitude = toRadians(first.latitude);
  const secondLatitude = toRadians(second.latitude);
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function placeFromFeature(feature, origin) {
  if (feature.geometry?.type !== "Point") return null;
  const [longitude, latitude] = feature.geometry.coordinates;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const properties = feature.properties || {};
  const type = String(properties.subclass || properties.class || properties.type || "").toLowerCase();
  if (!POI_CLASSES.has(type)) return null;
  const name = properties["name:ru"] || properties.name_ru || properties.name || properties.name_en;
  if (!name) return null;

  const location = { latitude, longitude };
  const distance = Math.round(distanceMeters(origin, location));
  if (distance > SUGGESTION_RADIUS_METERS) return null;
  return {
    id: `${name}-${latitude}-${longitude}`,
    name,
    type: TYPE_LABELS[type] || "Интересное место",
    distance,
    location,
  };
}

function markerElement() {
  const element = document.createElement("div");
  element.className = "location-picker__marker";
  element.setAttribute("aria-label", "Выбранное место");
  return element;
}

export default function LocationPicker({ value, onChange, onPlaceSelect }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [latitude, setLatitude] = useState(value ? String(value.latitude) : "");
  const [longitude, setLongitude] = useState(value ? String(value.longitude) : "");
  const [coordinateError, setCoordinateError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionMessage, setSuggestionMessage] = useState("");
  const [isLookingForPlaces, setIsLookingForPlaces] = useState(false);
  const [placeQuery, setPlaceQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchMessage, setSearchMessage] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const map = new MapLibreMap({
      container: containerRef.current,
      style: OPEN_FREE_MAP_STYLE,
      center: value ? [value.longitude, value.latitude] : MOSCOW_CENTER,
      zoom: value ? 14 : 10,
      attributionControl: true,
    });
    map.addControl(new NavigationControl(), "top-left");
    map.on("click", ({ lngLat }) => {
      onChange({ latitude: lngLat.lat, longitude: lngLat.lng });
      setSuggestions([]);
      setSuggestionMessage("");
    });
    mapRef.current = map;
    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    setLatitude(value ? String(value.latitude) : "");
    setLongitude(value ? String(value.longitude) : "");

    const map = mapRef.current;
    if (!map) return;
    if (!value) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }
    if (!markerRef.current) {
      markerRef.current = new Marker({ element: markerElement(), anchor: "bottom" })
        .setLngLat([value.longitude, value.latitude])
        .addTo(map);
      return;
    }
    markerRef.current.setLngLat([value.longitude, value.latitude]);
  }, [value?.latitude, value?.longitude]);

  function applyCoordinates() {
    const parsedLatitude = parseCoordinate(latitude);
    const parsedLongitude = parseCoordinate(longitude);
    if (
      !Number.isFinite(parsedLatitude) || parsedLatitude < -90 || parsedLatitude > 90
      || !Number.isFinite(parsedLongitude) || parsedLongitude < -180 || parsedLongitude > 180
    ) {
      setCoordinateError("Широта должна быть от −90 до 90, долгота — от −180 до 180");
      return;
    }
    const location = { latitude: parsedLatitude, longitude: parsedLongitude };
    setCoordinateError("");
    setSuggestions([]);
    setSuggestionMessage("");
    onChange(location);
    mapRef.current?.flyTo({ center: [parsedLongitude, parsedLatitude], zoom: 14, essential: false });
  }

  async function handlePlaceSearch() {
    if (isSearching) return;
    const query = placeQuery.trim();
    if (query.length < 2) {
      setSearchResults([]);
      setSearchMessage("Введите хотя бы два символа");
      return;
    }
    setIsSearching(true);
    setSearchResults([]);
    setSearchMessage("Ищем место…");
    try {
      const results = await searchPlaces(query);
      setSearchResults(results);
      setSearchMessage(results.length ? "" : "Ничего не найдено. Попробуйте добавить город или страну.");
    } catch (error) {
      setSearchMessage(error.message || "Не удалось выполнить поиск");
    } finally {
      setIsSearching(false);
    }
  }

  function chooseSearchResult(place) {
    onChange(place.location);
    onPlaceSelect?.(place.name);
    setPlaceQuery(place.name);
    setSearchResults([]);
    setSearchMessage(`Выбрано: ${place.name}`);
    setSuggestions([]);
    setSuggestionMessage("");
    mapRef.current?.flyTo({ center: [place.location.longitude, place.location.latitude], zoom: 16, essential: false });
  }

  async function suggestNearbyPlaces() {
    const map = mapRef.current;
    if (!map || !value) return;
    setIsLookingForPlaces(true);
    setSuggestions([]);
    setSuggestionMessage("Загружаем места рядом…");
    map.flyTo({ center: [value.longitude, value.latitude], zoom: Math.max(map.getZoom(), 14), essential: false });

    await new Promise((resolve) => {
      let completed = false;
      const finish = () => {
        if (completed) return;
        completed = true;
        resolve();
      };
      map.once("idle", finish);
      setTimeout(finish, 1800);
    });

    const style = map.getStyle();
    const features = [];
    for (const [sourceId, source] of Object.entries(style.sources || {})) {
      if (source.type !== "vector") continue;
      try {
        features.push(...map.querySourceFeatures(sourceId, { sourceLayer: "poi" }));
      } catch {
        // У некоторых векторных источников нет слоя poi — просто пропускаем их.
      }
    }

    const unique = new Map();
    for (const feature of features) {
      const place = placeFromFeature(feature, value);
      if (place && !unique.has(place.id)) unique.set(place.id, place);
    }
    const nearby = [...unique.values()].sort((first, second) => first.distance - second.distance).slice(0, 12);
    setSuggestions(nearby);
    setSuggestionMessage(nearby.length ? "" : "В загруженной области не нашлось достопримечательностей.");
    setIsLookingForPlaces(false);
  }

  function choosePlace(place) {
    onChange(place.location);
    onPlaceSelect?.(place.name);
    setSuggestions([]);
    setSuggestionMessage(`Выбрано: ${place.name}`);
    mapRef.current?.flyTo({ center: [place.location.longitude, place.location.latitude], zoom: 16, essential: false });
  }

  function clearLocation() {
    onChange(null);
    setLatitude("");
    setLongitude("");
    setCoordinateError("");
    setSuggestions([]);
    setSuggestionMessage("");
  }

  return (
    <div className="location-picker">
      <p>Найдите место по названию, нажмите на карту или укажите координаты вручную.</p>
      <div className="location-picker__search">
        <label htmlFor="place-search">Поиск места</label>
        <div>
          <input
            id="place-search"
            value={placeQuery}
            onChange={(event) => setPlaceQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handlePlaceSearch();
              }
            }}
            placeholder="Например, Библиотека Алвара Аалто"
          />
          <button type="button" className="btn btn--secondary" onClick={handlePlaceSearch} disabled={isSearching}>
            {isSearching ? "Ищем…" : "Найти"}
          </button>
        </div>
      </div>
      {searchMessage && <p className="location-picker__message">{searchMessage}</p>}
      {searchResults.length > 0 && (
        <ul className="location-picker__suggestions location-picker__search-results">
          {searchResults.map((place) => (
            <li key={place.id}>
              <button type="button" onClick={() => chooseSearchResult(place)}>
                <span><strong>{place.name}</strong><small>{place.address}</small></span>
                <span>{place.type}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="location-picker__coordinates">
        <label>
          Широта
          <input value={latitude} onChange={(event) => setLatitude(event.target.value)} inputMode="decimal" placeholder="41.715" />
        </label>
        <label>
          Долгота
          <input value={longitude} onChange={(event) => setLongitude(event.target.value)} inputMode="decimal" placeholder="44.827" />
        </label>
        <button type="button" className="btn btn--secondary" onClick={applyCoordinates}>Показать</button>
      </div>
      {coordinateError && <p className="stop-form__error" role="alert">{coordinateError}</p>}

      <div ref={containerRef} className="location-picker__map" aria-label="Выбор места на карте" />

      <div className="location-picker__actions">
        <button type="button" className="btn btn--secondary" onClick={suggestNearbyPlaces} disabled={!value || isLookingForPlaces}>
          {isLookingForPlaces ? "Ищем места…" : "Предложить места рядом"}
        </button>
        {value && <button type="button" className="btn btn--secondary" onClick={clearLocation}>Убрать место</button>}
      </div>
      {suggestionMessage && <p className="location-picker__message">{suggestionMessage}</p>}
      {suggestions.length > 0 && (
        <ul className="location-picker__suggestions">
          {suggestions.map((place) => (
            <li key={place.id}>
              <button type="button" onClick={() => choosePlace(place)}>
                <span><strong>{place.name}</strong><small>{place.type}</small></span>
                <span>{place.distance < 1000 ? `${place.distance} м` : `${(place.distance / 1000).toFixed(1)} км`}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="location-picker__attribution">
        Поиск: <a href="https://nominatim.openstreetmap.org/" target="_blank" rel="noreferrer">Nominatim / OpenStreetMap</a>
      </p>
    </div>
  );
}
