# Guía de Imágenes

Este documento explica la estructura de carpetas para las imágenes del sitio.

## Estructura de Carpetas

### Frontend - Imágenes Estáticas

**Ubicación:** `frontend/public/images/`

```
frontend/public/images/
├── logo/           # Logos de la app, favicon
├── betting/        # Iconos y elementos de apuestas
├── icons/          # Iconos generales de UI
├── backgrounds/    # Imágenes de fondo
├── banners/        # Banners promocionales
└── ui/             # Elementos visuales de interfaz
```

**Uso en el código:**
```jsx
// En componentes React
<img src="/images/logo/app-logo.png" alt="Logo" />
<img src="/images/betting/chip-gold.png" alt="Ficha" />
```

### Backend - Imágenes Dinámicas

**Ubicación:** `uploads/fighters/`

```
uploads/
└── fighters/       # Fotos de peleadores (subidas por la app)
```

**Uso en el código:**
```jsx
// Fotos de peleadores
<img src={`/uploads/fighters/${fighterId}.jpg`} alt="Peleador" />
```

## Configuración Git

Las carpetas están configuradas para:
- ✅ **Subir al repo:** Estructura de carpetas y archivos README.md
- ❌ **NO subir al repo:** Archivos de imagen (JPG, PNG, SVG, etc.)

Esto significa que:
1. La estructura de carpetas se mantiene en el repositorio
2. Cada carpeta tiene un README.md explicando su uso
3. Las imágenes NO se suben a Git (ahorro de espacio)

## Subir Imágenes al Hosting

Para desplegar en producción:

1. **Crear las carpetas en el servidor:**
   ```bash
   mkdir -p frontend/public/images/{logo,betting,icons,backgrounds,banners,ui}
   mkdir -p uploads/fighters
   ```

2. **Configurar permisos de escritura:**
   ```bash
   chmod 755 frontend/public/images/
   chmod 775 uploads/fighters/  # Necesita escritura para la app
   ```

3. **Subir las imágenes vía FTP/SFTP:**
   - Subir las imágenes estáticas a sus respectivas carpetas en `frontend/public/images/`
   - Las fotos de peleadores se subirán automáticamente por la app

## Formatos Recomendados

| Tipo de Imagen | Formato | Optimización |
|---------------|---------|--------------|
| Logos | SVG, PNG | Transparente, alta calidad |
| Iconos | SVG, PNG | Pequeños, optimizados |
| Fotos | JPG, WebP | Comprimidas para web |
| Fondos | JPG, WebP | Optimizadas, responsive |
| UI Elements | PNG, SVG | Transparente si es necesario |

## Herramientas de Optimización

Antes de subir imágenes, optimízalas con:
- **TinyPNG** - https://tinypng.com/
- **Squoosh** - https://squoosh.app/
- **ImageOptim** - https://imageoptim.com/

## Ejemplos de Uso

### Logo en Header
```jsx
<img
  src="/images/logo/app-logo.svg"
  alt="UFC Betting"
  className="h-12"
/>
```

### Icono de Apuesta
```jsx
<img
  src="/images/betting/winner-icon.png"
  alt="Ganador"
  className="w-6 h-6"
/>
```

### Foto de Peleador
```jsx
<img
  src={`/uploads/fighters/${fighter.id}.jpg`}
  alt={fighter.name}
  className="w-32 h-32 rounded-full object-cover"
  onError={(e) => {
    e.target.src = '/images/ui/default-avatar.png'
  }}
/>
```

### Banner de Evento
```jsx
<div
  className="hero-section"
  style={{
    backgroundImage: "url('/images/banners/ufc-323.jpg')"
  }}
>
  {/* Contenido */}
</div>
```

## Notas Importantes

1. **Nombres de archivos:** Usa nombres descriptivos en minúsculas con guiones
   - ✅ `app-logo.svg`
   - ✅ `winner-icon.png`
   - ❌ `Logo1.PNG`

2. **Tamaños:** Optimiza las imágenes antes de subirlas
   - Logos: Máximo 100KB
   - Iconos: Máximo 50KB
   - Fotos: Máximo 500KB
   - Fondos: Máximo 1MB

3. **Responsive:** Considera múltiples tamaños para diferentes dispositivos
   ```jsx
   <picture>
     <source srcset="/images/banners/hero-mobile.jpg" media="(max-width: 768px)" />
     <img src="/images/banners/hero-desktop.jpg" alt="Hero" />
   </picture>
   ```

4. **Lazy Loading:** Usa carga diferida para imágenes grandes
   ```jsx
   <img
     src="/images/backgrounds/arena.jpg"
     loading="lazy"
     alt="Arena"
   />
   ```
