# Imágenes del Sitio

Esta carpeta contiene todas las imágenes estáticas utilizadas en la aplicación.

## Estructura

- **logo/** - Logos de la aplicación, favicon
- **betting/** - Iconos y elementos relacionados con apuestas
- **icons/** - Iconos generales de la interfaz
- **backgrounds/** - Imágenes de fondo
- **banners/** - Banners promocionales y de eventos
- **ui/** - Elementos visuales de la interfaz

## Notas

- Las imágenes de peleadores se guardan en `/uploads/fighters/` (directorio del backend)
- Mantener las imágenes optimizadas para web
- Usar nombres descriptivos para los archivos
- Considerar usar formatos modernos como WebP para mejor compresión

## Acceso en el código

Las imágenes en esta carpeta son servidas estáticamente y se pueden referenciar directamente:

```jsx
// Ejemplo en React
<img src="/images/logo/app-logo.png" alt="Logo" />
```
