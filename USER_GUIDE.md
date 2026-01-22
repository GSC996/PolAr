# Guía de Usuario y Configuración

Este visor de mapas está diseñado para ser configurado fácilmente sin necesidad de conocimientos de programación.

## Archivo de Configuración (`config.json`)

El comportamiento del visor se controla desde el archivo `config.json` que se encuentra en la carpeta principal de la aplicación desplegada.

### Estructura Básica

```json
{
  "projection": "EPSG:3031",
  "initialView": {
    "center": [0, 0],   // Coordenadas [x, y] en metros (EPSG:3031)
    "zoom": 4,          // Zoom inicial
    "minZoom": 1,
    "maxZoom": 12
  },
  "basemaps": [ ... ],  // Lista de mapas base
  "layers": [ ... ]     // Lista de capas operativas
}
```

### Configuración de Mapas Base (`basemaps`)

Cada mapa base necesita:

- `id`: Identificador único (ej: "argenmap").
- `type`: "WMTS", "WMS" o "XYZ".
- `name`: Nombre que verá el usuario.
- `url`: Dirección del servicio.
- `visible`: `true` si es el mapa por defecto.
- `reproject`: `true` si el mapa está en Mercator (EPSG:3857) y debe reproyectarse.

**Ejemplo:**

```json
{
  "id": "google_sat",
  "type": "XYZ",
  "name": "Google Satellite",
  "url": "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
  "visible": false,
  "reproject": true
}
```

### Configuración de Capas (`layers`)

Las capas de información funcionan igual, pero permiten ser "consultables" (click para ver datos).

- `queryable`: `true` para permitir consultar información al hacer click.

**Ejemplo:**

```json
{
  "id": "bases",
  "type": "WMS",
  "name": "Bases Antárticas",
  "url": "https://servidor.ign.gob.ar/geoserver/wms",
  "layers": "capa:bases",
  "visible": true,
  "queryable": true
}
```

## Embeber en otro sitio

Para usar este visor dentro de otra página, use un `<iframe>`:

```html
<iframe src="https://su-servidor.com/antartida/" width="100%" height="600px" style="border:none;"></iframe>
```

### Parámetros URL

Puede modificar el estado inicial usando la URL:

- `?basemap=id_mapa`: Elige el mapa base activo.
- `?layers=id_capa1,id_capa2`: Enciende capas específicas.
- `?center=x,y`: Centra el mapa.
- `?zoom=nivel`: Define el zoom.

Ejemplo:
`https://su-servidor.com/antartida/?basemap=google_sat&zoom=6`
