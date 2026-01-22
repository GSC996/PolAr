import Map from 'ol/Map';
import View from 'ol/View';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { get as getProjection } from 'ol/proj';
import { defaults as defaultControls } from 'ol/control';

// Define EPSG:3031
proj4.defs(
  'EPSG:3031',
  '+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs'
);
register(proj4);

export function initMap(config) {
  const projection = getProjection('EPSG:3031');

  // Antarctica Extent (Approximate)
  // The prompt asks strictly limited to Antarctica.
  // A reasonable extent covers the continent.
  const extent = [-4000000, -4000000, 4000000, 4000000];
  projection.setExtent(extent);

  const view = new View({
    projection: projection,
    center: config.initialView.center,
    zoom: config.initialView.zoom,
    minZoom: 0.1,
    maxZoom: config.initialView.maxZoom,
    extent: extent, // Constrain view to this extent
    enableRotation: false
  });

  const map = new Map({
    target: 'map',
    view: view,
    controls: defaultControls({
      zoom: true,
      rotate: false,
      attribution: true
    })
  });

  return map;
}
