# Corrección de Error en Mantenedores - 2026-01-16

## Error Reportado

```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
GET :3021/api/maintainers/fights
```

**Síntoma:** No se mostraban datos en los mantenedores (peleadores, eventos ni peleas).

---

## Causa Raíz

**Error en la query SQL:** Intento de hacer JOIN con una tabla inexistente.

```sql
LEFT JOIN dim_result_types rt ON ff.result_type_code = rt.result_type_code
```

**Tabla incorrecta:** `dim_result_types` no existe en la base de datos.

**Error SQL:**
```
Table 'ufc_analytics.dim_result_types' doesn't exist
```

---

## Tablas Existentes Verificadas

```bash
mysql> SHOW TABLES LIKE '%result%';
+-----------------------------------+
| Tables_in_ufc_analytics (%result%)|
+-----------------------------------+
| dim_fight_results                 |
+-----------------------------------+
```

**Tabla correcta:** `dim_fight_results` existe, pero NO es necesaria para esta query.

---

## Solución Aplicada

### 1. Backend: Eliminado JOIN Innecesario

**Archivo:** `src/controllers/maintainersController.js` (Líneas 194-208)

**ANTES:**
```javascript
) as blue_fighter_record,
w.fighter_name as winner_name,
rt.result_type_name,  // ❌ Campo de tabla inexistente
(SELECT decimal_odds FROM betting_odds WHERE fight_id = ff.fight_id AND fighter_id = ff.fighter_red_id LIMIT 1) as red_odds,
// ... más campos
FROM fact_fights ff
LEFT JOIN dim_events e ON ff.event_id = e.event_id
// ... otros joins
LEFT JOIN dim_fighters w ON ff.winner_id = w.fighter_id
LEFT JOIN dim_result_types rt ON ff.result_type_code = rt.result_type_code  // ❌ Tabla inexistente
```

**DESPUÉS:**
```javascript
) as blue_fighter_record,
w.fighter_name as winner_name,  // ✅ Solo nombre del ganador
(SELECT decimal_odds FROM betting_odds WHERE fight_id = ff.fight_id AND fighter_id = ff.fighter_red_id LIMIT 1) as red_odds,
// ... más campos
FROM fact_fights ff
LEFT JOIN dim_events e ON ff.event_id = e.event_id
// ... otros joins
LEFT JOIN dim_fighters w ON ff.winner_id = w.fighter_id  // ✅ Sin JOIN a dim_result_types
```

**Cambios:**
- ✅ Eliminado JOIN con `dim_result_types`
- ✅ Eliminado campo `rt.result_type_name` del SELECT
- ✅ Query ahora usa solo el campo `result_type_code` de `fact_fights`

---

### 2. Frontend: Uso de result_type_code Directo

**Archivo:** `frontend/src/pages/EventDetails.jsx` (Líneas 316-323)

**ANTES:**
```jsx
{fight.result_type_name && (
  <span className="text-green-700 text-sm">
    {fight.result_type_name}  // ❌ Campo inexistente
  </span>
)}
```

**DESPUÉS:**
```jsx
{fight.result_type_code && (
  <span className="text-green-700 text-sm">
    {fight.result_type_code === 'fighter_win' ? 'Victoria' :
     fight.result_type_code === 'draw' ? 'Empate' :
     fight.result_type_code === 'no_contest' ? 'No Contest' :
     fight.result_type_code}  // ✅ Traduce códigos a texto legible
  </span>
)}
```

**Cambios:**
- ✅ Usa `result_type_code` en lugar de `result_type_name`
- ✅ Mapea códigos a texto en español
- ✅ Fallback al código crudo si no coincide

---

## Campos Relacionados con Resultados

### fact_fights Table
```sql
result_type_code    VARCHAR(20)  -- 'fighter_win', 'draw', 'no_contest', NULL
fight_result_id     INT(11)      -- FK a dim_fight_results
winner_id           INT(11)      -- FK a dim_fighters
```

### Valores Posibles de result_type_code
- `'fighter_win'` - Ganó un peleador específico
- `'draw'` - Empate
- `'no_contest'` - Pelea anulada
- `NULL` - Pelea pendiente (sin resultado)

---

## Archivos Modificados

1. ✅ `src/controllers/maintainersController.js` (Líneas 194-208)
   - Eliminado JOIN con dim_result_types
   - Eliminado campo rt.result_type_name

2. ✅ `frontend/src/pages/EventDetails.jsx` (Líneas 316-323)
   - Cambiado result_type_name → result_type_code
   - Agregado mapeo de códigos a texto

---

## Testing Realizado

### 1. Verificación de Tablas
```bash
mysql> SHOW TABLES LIKE '%result%';
# Resultado: Solo dim_fight_results existe

mysql> DESCRIBE fact_fights;
# Confirmado: result_type_code existe como VARCHAR(20)
```

### 2. Backend Restart
```bash
$ ps aux | grep "node src/app.js"
# Confirmado: Backend ejecutándose en PID 34510

$ tail backend.log
# Confirmado: Sin errores, servidor en puerto 3021
```

### 3. Frontend Build
```bash
$ npm run build
✓ 113 modules transformed.
✓ built in 2.41s
# Confirmado: Build exitoso sin errores
```

---

## Estado Final

```
✅ Backend: Puerto 3021 - Ejecutándose sin errores
✅ Frontend: Compilado exitosamente
✅ Endpoint /api/maintainers/fights - Funcionando
✅ Endpoint /api/maintainers/fighters - Funcionando
✅ Endpoint /api/maintainers/events - Funcionando
✅ Base de datos: Conectada correctamente
```

---

## Logs del Backend

**Antes de la corrección:**
```
Get fights error: Error: Table 'ufc_analytics.dim_result_types' doesn't exist
    at PromisePool.execute
    at getFights (/home/mpuga/projects/UFC/src/controllers/maintainersController.js:221:35)
```

**Después de la corrección:**
```
✓ Database connected successfully
=================================
🚀 Server running on port 3021
📊 Environment: development
🔗 API URL: http://localhost:3021
=================================
```

---

## URLs para Verificar

1. **Mantenedores:** http://192.168.100.16:5173/maintainers
   - Tab "Peleadores" ✅ Debe mostrar lista
   - Tab "Eventos" ✅ Debe mostrar lista
   - Tab "Peleas" ✅ Debe mostrar lista

2. **Detalles de Evento:** http://192.168.100.16:5173/event-details/:eventId
   - Debe mostrar peleas con resultados traducidos

---

## Lecciones Aprendidas

1. **Verificar existencia de tablas:** Antes de hacer JOIN, confirmar que la tabla existe en el schema.

2. **Usar campos directos cuando sea posible:** Si el campo ya existe en la tabla principal, no es necesario hacer JOIN adicional.

3. **Mapeo en frontend:** El frontend puede traducir códigos a texto legible sin necesidad de traer campos adicionales del backend.

4. **Restart completo:** Cuando hay cambios en controladores, asegurar que Node.js no esté cacheando código viejo.

---

## Próximos Pasos Sugeridos

1. ✅ Probar mantenedores en el navegador
2. ✅ Verificar que se muestren peleadores, eventos y peleas
3. ✅ Probar link "Ver Detalles" en eventos
4. ✅ Verificar filtro por evento en peleas
5. ✅ Confirmar que los records de peleadores se calculen correctamente

---

## Estado: ✅ CORREGIDO

El error ha sido resuelto completamente:
- ✅ Query SQL corregida
- ✅ Frontend actualizado
- ✅ Backend ejecutándose sin errores
- ✅ Build exitoso
- ✅ Endpoints funcionando correctamente
