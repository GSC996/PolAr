export function initUI(map, config, layers) {
  renderBasemapSwitcher(map, config.basemaps, layers);
  renderLayerList(map, config.layers, layers);
  setupShareButton(map, config, layers);
  setupInteractions(map);
  setupPanelToggles(); // New toggle logic

  // Hide loader
  document.getElementById('loader').style.display = 'none';
}

function setupPanelToggles() {
  const toggles = [
    { btnId: 'toggle-basemaps', panelId: 'basemap-panel' },
    { btnId: 'toggle-layers', panelId: 'layers-panel' }
  ];

  toggles.forEach(toggle => {
    const btn = document.getElementById(toggle.btnId);
    const panel = document.getElementById(toggle.panelId);

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = panel.classList.contains('hidden');

      // Close all others (optional, keeps UI clean)
      // toggles.forEach(t => document.getElementById(t.panelId).classList.add('hidden'));

      if (isHidden) {
        panel.classList.remove('hidden');
        btn.classList.add('active');
      } else {
        panel.classList.add('hidden');
        btn.classList.remove('active');
      }
    });

    // Close when clicking outside (optional but good UX)
    // map click handles this implicitly often if we listen to document click, 
    // but let's keep it simple.
  });
}

function renderBasemapSwitcher(map, basemapsConfig, layerInstances) {
  const container = document.getElementById('basemap-list');
  container.innerHTML = '';

  basemapsConfig.forEach(bm => {
    const wrapper = document.createElement('div');
    wrapper.className = 'layer-item';

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'basemap';
    input.id = `bm-${bm.id}`;
    input.value = bm.id;
    input.checked = bm.visible;

    input.addEventListener('change', () => {
      // Turn off all basemaps
      basemapsConfig.forEach(b => {
        const layer = layerInstances[b.id];
        if (layer) layer.setVisible(false);
      });
      // Turn on selected
      const selected = layerInstances[bm.id];
      if (selected) selected.setVisible(true);
    });

    const label = document.createElement('label');
    label.htmlFor = `bm-${bm.id}`;
    label.textContent = bm.name;
    if (bm.reproject) label.textContent += ' (Reproyectado)';

    wrapper.appendChild(input);
    wrapper.appendChild(label);
    container.appendChild(wrapper);
  });
}

function renderLayerList(map, layersConfig, layerInstances) {
  const container = document.getElementById('layer-list');
  container.innerHTML = '';

  if (layersConfig.length === 0) {
    container.innerHTML = '<div style="padding:5px; color:#888;">No hay capas operativas.</div>';
    return;
  }

  layersConfig.forEach(l => {
    const wrapper = document.createElement('div');
    wrapper.className = 'layer-item';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = `lyr-${l.id}`;
    input.checked = l.visible;

    input.addEventListener('change', (e) => {
      const layer = layerInstances[l.id];
      if (layer) layer.setVisible(e.target.checked);
    });

    const label = document.createElement('label');
    label.htmlFor = `lyr-${l.id}`;
    label.textContent = l.name;

    wrapper.appendChild(input);
    wrapper.appendChild(label);
    container.appendChild(wrapper);
  });
}

function setupShareButton(map, config, layerInstances) {
  const btn = document.getElementById('share-btn');
  btn.addEventListener('click', () => {
    const view = map.getView();
    const center = view.getCenter();
    const zoom = view.getZoom();

    // Find active basemap
    const activeBasemap = config.basemaps.find(bm => {
      const layer = layerInstances[bm.id];
      return layer && layer.getVisible();
    });

    // Find active layers
    const activeLayers = config.layers
      .filter(l => {
        const layer = layerInstances[l.id];
        return layer && layer.getVisible();
      })
      .map(l => l.id);

    const url = new URL(window.location.href);
    url.searchParams.set('center', `${center[0].toFixed(2)},${center[1].toFixed(2)}`);
    url.searchParams.set('zoom', zoom.toFixed(1));
    if (activeBasemap) url.searchParams.set('basemap', activeBasemap.id);
    if (activeLayers.length > 0) url.searchParams.set('layers', activeLayers.join(','));
    else url.searchParams.delete('layers');

    navigator.clipboard.writeText(url.toString()).then(() => {
      const originalText = btn.innerHTML;
      btn.textContent = "¡Copiado!";
      setTimeout(() => {
        btn.innerHTML = originalText;
      }, 2000);
    });
  });
}

function setupInteractions(map) {
  const tooltip = document.getElementById('info-tooltip');

  map.on('singleclick', async (evt) => {
    const view = map.getView();
    const viewResolution = view.getResolution();
    const projection = view.getProjection();

    // Iterate over visible queryable layers
    const layers = map.getLayers().getArray();
    let found = false;

    // Reset tooltip
    tooltip.classList.add('hidden');
    tooltip.innerHTML = 'Consultando...';
    tooltip.style.left = evt.pixel[0] + 'px';
    tooltip.style.top = evt.pixel[1] + 'px';

    let hasQueryable = false;

    for (const layer of layers) {
      const props = layer.getProperties();
      if (layer.getVisible() && props.queryable && layer.getSource().getFeatureInfoUrl) {
        hasQueryable = true;
        tooltip.classList.remove('hidden'); // Show loading state

        const url = layer.getSource().getFeatureInfoUrl(
          evt.coordinate,
          viewResolution,
          projection,
          { 'INFO_FORMAT': 'application/json' }
        );

        if (url) {
          try {
            const response = await fetch(url);
            if (response.ok) {
              const text = await response.text();
              // Verify if text is actually JSON
              try {
                const data = JSON.parse(text);
                if (data.features && data.features.length > 0) {
                  showTooltip(evt.pixel, data.features[0].properties);
                  found = true;
                  break; // Stop after first hit
                }
              } catch (jsonErr) {
                // Sometimes geoserver returns XML despite asking for JSON or if error
                console.warn("Response was not JSON", text);
              }
            }
          } catch (e) {
            console.warn("Feature info failed", e);
          }
        }
      }
    }

    if (!found) {
      tooltip.classList.add('hidden');
    }
  });

  map.on('pointermove', (evt) => {
    if (evt.dragging) {
      tooltip.classList.add('hidden');
      return;
    }
  });
}

function showTooltip(pixel, properties) {
  const tooltip = document.getElementById('info-tooltip');
  const keys = Object.keys(properties).filter(k => k !== 'bbox').slice(0, 8); // Filter generic stuff
  if (keys.length === 0) return;

  const content = keys.map(k => `<div style="margin-bottom:2px"><b>${k}:</b> ${properties[k]}</div>`).join('');

  tooltip.innerHTML = content;
  tooltip.style.left = pixel[0] + 'px';
  tooltip.style.top = pixel[1] + 'px';
  tooltip.classList.remove('hidden');
}
