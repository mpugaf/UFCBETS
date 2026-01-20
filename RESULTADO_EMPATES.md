# Corrección del Sistema de Resultados - Empates y No Contest

## Problema Original

El sistema solo almacenaba `winner_id` en NULL para empates, lo que no permitía diferenciar entre:
- Una pelea sin resultado (pending)
- Un empate (draw)
- Un no contest

Esto causaba que los empates no se visualizaran correctamente en el frontend.

## Solución Implementada

### 1. Base de Datos

**Migración:** `migrations/2026-01-15-add-result-type-to-fights.sql`

Se agregó el campo `result_type_code` a la tabla `fact_fights`:

```sql
ALTER TABLE fact_fights
ADD COLUMN result_type_code VARCHAR(20) NULL AFTER winner_id;
```

**Valores posibles:**
- `'fighter_win'` - Victoria de un peleador
- `'draw'` - Empate
- `'no_contest'` - No contest
- `NULL` - Pelea sin resultado (pending)

### 2. Backend

**Archivo:** `src/controllers/resultsController.js`

#### Actualización de Resultados (updateFightResult)

**Antes:**
```javascript
UPDATE fact_fights SET winner_id = ? WHERE fight_id = ?
```

**Ahora:**
```javascript
UPDATE fact_fights
SET winner_id = ?, result_type_code = ?
WHERE fight_id = ?
```

**Lógica de almacenamiento:**
- **fighter_win:** Guarda `winner_id` del peleador ganador + `result_type_code = 'fighter_win'`
- **draw:** Guarda `winner_id = NULL` + `result_type_code = 'draw'`
- **no_contest:** Guarda `winner_id = NULL` + `result_type_code = 'no_contest'`

#### Obtención de Resultados (getFightResults)

**Antes:**
```javascript
CASE
  WHEN ff.winner_id IS NULL THEN 'pending'
  WHEN EXISTS(...draw logic...) THEN 'draw'
  ELSE 'fighter_win'
END as result_type
```

**Ahora:**
```javascript
ff.result_type_code as result_type
```

Se lee directamente el campo de la base de datos, eliminando la lógica compleja.

#### Manejo de Apuestas

**fighter_win:**
- Apuestas correctas al ganador → `won`
- Apuestas incorrectas y empates → `lost`

**draw:**
- Apuestas de empate → `won`
- Apuestas de peleador → `lost`

**no_contest:**
- Todas las apuestas → `pending` (se devuelven)

### 3. Frontend

**Archivo:** `frontend/src/pages/FightResults.jsx`

#### Visualización del Estado

**Antes:**
```javascript
{fight.winner_id && (
  <div>✓ Resultado: {fight.result_type === 'draw' ? 'Empate' : fight.winner_name}</div>
)}
```

**Ahora:**
```javascript
{fight.result_type && fight.result_type !== 'pending' && (
  <div>
    ✓ Resultado: {
      fight.result_type === 'draw' ? 'Empate' :
      fight.result_type === 'no_contest' ? 'No Contest' :
      fight.winner_name
    }
  </div>
)}
```

#### Botones de Resultado

**Antes:** 3 botones (Ganó Rojo, Empate, Ganó Azul)

**Ahora:** 4 botones
1. **Ganó Rojo** (rojo) - `fighter_win` con winner_id del peleador rojo
2. **Empate** (gris) - `draw` con winner_id = null
3. **No Contest** (naranja) - `no_contest` con winner_id = null
4. **Ganó Azul** (azul) - `fighter_win` con winner_id del peleador azul

#### Resaltado de Botones

Los botones se resaltan correctamente según `result_type` Y `winner_id`:

```javascript
className={`... ${
  fight.result_type === 'fighter_win' && fight.winner_id === fight.red_fighter_id
    ? 'bg-red-600 text-white'
    : 'bg-red-100 text-red-600'
}`}
```

## Flujo de Uso

### Ingresar un Empate

1. Admin selecciona un evento en `/fight-results?event_id=2`
2. Se listan todas las peleas del evento
3. Admin hace clic en el botón **"Empate"** (gris)
4. El sistema:
   - Actualiza `fact_fights`: `winner_id = NULL`, `result_type_code = 'draw'`
   - Actualiza apuestas: empates → `won`, peleadores → `lost`
5. El botón "Empate" se resalta en gris oscuro
6. Aparece mensaje: "✓ Resultado registrado: Empate"

### Ingresar un No Contest

1. Admin hace clic en el botón **"No Contest"** (naranja)
2. El sistema:
   - Actualiza `fact_fights`: `winner_id = NULL`, `result_type_code = 'no_contest'`
   - Actualiza apuestas: todas → `pending` (devueltas)
3. El botón "No Contest" se resalta en naranja oscuro
4. Aparece mensaje: "✓ Resultado registrado: No Contest"

### Ingresar Victoria de Peleador

1. Admin hace clic en **"Ganó Rojo"** o **"Ganó Azul"**
2. El sistema:
   - Actualiza `fact_fights`: `winner_id = [id del ganador]`, `result_type_code = 'fighter_win'`
   - Actualiza apuestas: correctas → `won`, incorrectas → `lost`
3. El botón correspondiente se resalta
4. Aparece mensaje: "✓ Resultado registrado: [Nombre del Ganador]"

## Verificación

### Consulta SQL para ver resultados:

```sql
SELECT
  fight_id,
  winner_id,
  result_type_code,
  CONCAT(fr.fighter_name, ' vs ', fb.fighter_name) as pelea
FROM fact_fights ff
JOIN dim_fighters fr ON ff.fighter_red_id = fr.fighter_id
JOIN dim_fighters fb ON ff.fighter_blue_id = fb.fighter_id
WHERE event_id = 2;
```

### Credenciales Admin

Para acceder a la página de resultados:
- **Usuario:** admin
- **Contraseña:** admin123
- **URL:** http://192.168.100.16:5173/fight-results

## Archivos Modificados

1. ✅ `migrations/2026-01-15-add-result-type-to-fights.sql` (nuevo)
2. ✅ `src/controllers/resultsController.js`
3. ✅ `frontend/src/pages/FightResults.jsx`

## Estado Actual

✅ Backend corriendo en puerto 3021
✅ Frontend corriendo en puerto 5173
✅ Migración aplicada a la base de datos
✅ Sistema de empates funcionando correctamente
✅ Sistema de no contest implementado
✅ Botones se resaltan correctamente según el resultado
✅ Visualización de resultados funcionando
