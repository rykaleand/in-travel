import { useEffect, useRef, useState } from "react";
import { LngLatBounds, Map, Marker, NavigationControl, Popup } from "maplibre-gl";
import { getStopLocation } from "./stopUtils";
import { OPEN_FREE_MAP_STYLE } from "./maplibre-config";

function makeStopMarker(dayNumber) {
    const element = document.createElement("div");
    element.className = "route-stop-marker";
    element.textContent = String(dayNumber);
    return element;
}

function makeStopPopup(stop) {
    const content = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = stop.title;
    const day = document.createElement("div");
    day.textContent = `День ${stop.day_number}`;
    content.append(title, day);
    return content;
}

function focusMapOnStops(map, located, duration = 500) {
    if (located.length === 0) return;
    map.resize();

    if (located.length === 1) {
        const { longitude, latitude } = located[0].location;
        map.easeTo({ center: [longitude, latitude], zoom: 15, duration, essential: false });
        return;
    }

    const bounds = located.reduce(
        (result, { location }) => result.extend([location.longitude, location.latitude]),
        new LngLatBounds(),
    );
    const mapWidth = map.getContainer().clientWidth;
    const padding = Math.max(32, Math.min(72, Math.round(mapWidth * 0.08)));
    map.fitBounds(bounds, {
        padding,
        maxZoom: 15,
        duration,
        essential: false,
    });
}

export default function RouteMap({ stops }) {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef([]);
    const locatedRef = useRef([]);
    const [isReady, setIsReady] = useState(false);

    const located = stops.flatMap((stop) => {
        const location = getStopLocation(stop);
        return location ? [{ stop, location }] : [];
    });
    locatedRef.current = located;

    useEffect(() => {
        const map = new Map({
            container: containerRef.current,
            style: OPEN_FREE_MAP_STYLE,
            center: [0, 20],
            zoom: 2,
            attributionControl: true,
        });
        map.addControl(new NavigationControl(), "top-left");
        map.on("load", () => setIsReady(true));
        mapRef.current = map;

        return () => {
            markersRef.current.forEach((marker) => marker.remove());
            markersRef.current = [];
            map.remove();
            mapRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!isReady || !containerRef.current || !mapRef.current) return undefined;
        const observer = new ResizeObserver(() => {
            requestAnimationFrame(() => {
                if (mapRef.current) focusMapOnStops(mapRef.current, locatedRef.current, 0);
            });
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [isReady]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map || !isReady || located.length === 0) return;

        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = located.map(({ stop, location }) => (
            new Marker({ element: makeStopMarker(stop.day_number), anchor: "bottom" })
                .setLngLat([location.longitude, location.latitude])
                .setPopup(new Popup({ offset: 18 }).setDOMContent(makeStopPopup(stop)))
                .addTo(map)
        ));

        focusMapOnStops(map, located);
    }, [isReady, stops]);

    return <div ref={containerRef} className="route-map route-map__container" aria-label="Карта маршрута" />;
}
