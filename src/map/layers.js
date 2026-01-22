import TileLayer from 'ol/layer/Tile';
import ImageLayer from 'ol/layer/Image';
import XYZ from 'ol/source/XYZ';
import TileWMS from 'ol/source/TileWMS';
import ImageWMS from 'ol/source/ImageWMS';
import WMTS from 'ol/source/WMTS';
import { get as getProjection } from 'ol/proj';

/**
 * Factory to create OpenLayers layers from config objects.
 */
export function createLayer(layerConfig) {
  switch (layerConfig.type) {
    case 'XYZ':
      return createXYZLayer(layerConfig);
    case 'WMS':
      // Decide logic for Tiled vs Image WMS based on needs. Using TileWMS for better performance usually.
      return createWMSLayer(layerConfig);
    case 'WMTS':
      // Simplified WMTS for this MVP, often XYZ/TMS patterns are easier if standard.
      // If it's pure WMTS, we need capabilities usually, but let's try XYZ if URL pattern allows, 
      // otherwise standard WMS. The prompt examples suggest XYZ/TMS pattern for Argenmap.
      if (layerConfig.url.includes('{z}')) {
        return createXYZLayer(layerConfig);
      }
      return createWMSLayer(layerConfig); // Fallback
    default:
      console.warn(`Unknown layer type: ${layerConfig.type}`);
      return null;
  }
}

function createXYZLayer(config) {
  return new TileLayer({
    source: new XYZ({
      url: config.url,
      attributions: config.attribution,
      projection: config.projection || 'EPSG:3857', // Most XYZ are 3857
    }),
    visible: config.visible,
    properties: {
      id: config.id,
      name: config.name,
      type: 'base',
      isBase: true
    }
  });
}

function createWMSLayer(config) {
  return new TileLayer({
    source: new TileWMS({
      url: config.url,
      params: {
        'LAYERS': config.layers,
        'TILED': true,
        'VERSION': '1.1.1'
      },
      serverType: 'geoserver',
      attributions: config.attribution
    }),
    visible: config.visible,
    properties: {
      id: config.id,
      name: config.name,
      type: 'overlay',
      queryable: config.queryable
    }
  });
}
