import 'ol/ol.css';
import { loadConfig } from './utils/configLoader.js';
import { initMap } from './map/map.js';
import { createLayer } from './map/layers.js';
import { initUI } from './ui/ui.js';
import './../style.css'; // Ensure CSS is imported by Vite

async function main() {
  const config = await loadConfig();
  if (!config) return;

  const map = initMap(config);
  const layerInstances = {};

  // Initialize Basemaps
  config.basemaps.forEach(bmConfig => {
    const layer = createLayer(bmConfig);
    if (layer) {
      layerInstances[bmConfig.id] = layer;
      map.addLayer(layer);
    }
  });

  // Initialize Operational Layers
  config.layers.forEach(lyrConfig => {
    const layer = createLayer(lyrConfig);
    if (layer) {
      layerInstances[lyrConfig.id] = layer;
      map.addLayer(layer);
    }
  });

  initUI(map, config, layerInstances);

  console.log("Antarctic Map Viewer Initialized");
}

main().catch(console.error);
