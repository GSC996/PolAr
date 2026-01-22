# Visor Antártico (PolAr)

Visor de mapas web especializado en la Antártida, utilizando la proyección Polar Estereográfica Sur (EPSG:3031).
Diseñado para ser simple, ligero y embebible.

## Tecnologías

- **OpenLayers**: Motor cartográfico.
- **Vite**: Build tool.
- **Vanilla JS**: Sin frameworks complejos.
- **CSS**: Variables y diseño responsivo.

## Instalación y Desarrollo

### Requisitos

- Node.js (solo para desarrollo/build).

### Pasos

1. Clonar repositorio.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Correr servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Build para Producción

Para generar los archivos estáticos listos para desplegar:

```bash
npm run build
```

Esto generará una carpeta `dist/`. Copiar el contenido de `dist/` a cualquier servidor web estático (Apache, Nginx, GitHub Pages).

## Configuración

La aplicación se configura mediante el archivo `config.json` ubicado en la raíz (en producción).
Ver `USER_GUIDE.md` para detalles de configuración.

## Estructura del Proyecto

- `public/`: Archivos estáticos (config.json, favicon).
- `src/`: Código fuente.
  - `map/`: Lógica de mapa y capas.
  - `ui/`: Lógica de interfaz.
  - `utils/`: Utilidades (loader).
  - `main.js`: Entrada principal.
- `index.html`: Entry point HTML.

## Licencia

MIT
