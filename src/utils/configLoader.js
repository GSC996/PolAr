/**
 * Loads and validates the configuration.
 * Merges JSON config with URL parameters.
 */
export async function loadConfig() {
  try {
    const response = await fetch('./config.json');
    if (!response.ok) throw new Error(`Failed to load config: ${response.statusText}`);
    const config = await response.json();

    // Parse URL params to override defaults
    const urlParams = new URLSearchParams(window.location.search);

    // Override View
    if (urlParams.has('center')) {
      const center = urlParams.get('center').split(',').map(Number);
      if (center.length === 2 && !center.some(isNaN)) {
        config.initialView.center = center;
      }
    }

    if (urlParams.has('zoom')) {
      const zoom = Number(urlParams.get('zoom'));
      if (!isNaN(zoom)) {
        config.initialView.zoom = zoom;
      }
    }

    // Override Basemap selection
    if (urlParams.has('basemap')) {
      const basemapId = urlParams.get('basemap');
      config.basemaps.forEach(bm => bm.visible = (bm.id === basemapId));
    }

    // Override Layers visibility
    if (urlParams.has('layers')) {
      const activeLayerIds = urlParams.get('layers').split(',');
      config.layers.forEach(l => {
        l.visible = activeLayerIds.includes(l.id);
      });
    }

    return config;
  } catch (error) {
    console.error("Configuration Error:", error);
    alert("Error cargando la configuración. Ver consola.");
    return null;
  }
}
