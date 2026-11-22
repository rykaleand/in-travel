import { setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";

// Один worker и один стиль используются обеими картами раздела маршрута.
setWorkerUrl(workerUrl);

export const OPEN_FREE_MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
