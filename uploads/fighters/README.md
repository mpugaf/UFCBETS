# Fotos de Peleadores

Esta carpeta contiene las fotografías de los peleadores subidas dinámicamente por la aplicación.

## Uso

Las imágenes se suben a través del backend cuando se crean o actualizan peleadores. El sistema guarda las fotos con el formato:

```
{fighter_id}.{extension}
```

## Formatos aceptados

- JPG/JPEG
- PNG
- WebP (recomendado para mejor compresión)

## Consideraciones

- Las imágenes se optimizan automáticamente al subirlas
- Tamaño máximo recomendado: 2MB por imagen
- Dimensiones recomendadas: 400x400px (o proporcional)

## Acceso

Las imágenes son servidas estáticamente desde:
```
/uploads/fighters/{fighter_id}.{ext}
```
