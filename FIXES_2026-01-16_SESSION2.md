# Correcciones Aplicadas - Sesión 2
## Fecha: 2026-01-16 - 02:15

---

## Problemas Reportados por Usuario

1. **Endpoint de pronósticos públicos muestra solo 1 pelea en lugar de 9**
   - URL: `http://192.168.100.16:5173/public-predictions?event_id=2`
   - Síntoma: Al hacer click en "ver pronósticos" solo muestra una pelea

2. **No se indica si las predicciones fueron acertadas o no**
   - Las predicciones no muestran indicadores visuales de correcto/incorrecto

3. **Ranking general muestra datos incorrectos**
   - Muestra "1 apuesta y 0 aciertos" cuando el total debería ser 9 peleas
   - Los datos ya estaban en la base de datos, solo faltaba mostrarlos correctamente

---

## Correcciones Aplicadas

### 1. ✅ Fix: Endpoint de Pronósticos Públicos

**Archivo:** `src/controllers/betsController.js` (Líneas 202-340)

**Problema Raíz:**
- La query filtraba peleas con `WHERE ff.winner_id IS NULL`
- Esto excluía todas las peleas que ya tenían resultados
- Solo mostraba peleas pendientes (sin resultado)

**Solución:**
```javascript
// ANTES (línea 254):
WHERE ff.winner_id IS NULL AND ff.event_id = ?

// DESPUÉS (línea 254):
WHERE ff.event_id = ?
```

**Campos Agregados:**
- `ff.winner_id` - ID del ganador de la pelea
- `ff.result_type_code` - Tipo de resultado ('fighter_win', 'draw', 'no_contest')
- `fw.fighter_name as winner_name` - Nombre del peleador ganador
- `ub.status` - Estado de la apuesta ('won', 'lost', 'pending')
- `is_draw: row.result_type_code === 'draw'` - Campo computado para compatibilidad con frontend

**Resultado:**
- Ahora muestra todas las 9 peleas del evento
- Incluye información completa de resultados y estado de cada apuesta

---

### 2. ✅ Fix: Ranking de Evento (Leaderboard)

**Archivo:** `src/controllers/leaderboardController.js` (Líneas 29-57)

**Problema Raíz:**
- La query intentaba usar `ub.event_id` que NO existe en la tabla `user_bets`
- Causaba que no se encontraran apuestas para ningún evento

**Solución:**
```javascript
// ANTES:
FROM users u
LEFT JOIN user_bets ub ON u.user_id = ub.user_id AND ub.event_id = ?
WHERE EXISTS(SELECT 1 FROM user_bets WHERE user_id = u.user_id AND event_id = ?)

// DESPUÉS:
FROM users u
INNER JOIN user_bets ub ON u.user_id = ub.user_id
INNER JOIN fact_fights ff ON ub.fight_id = ff.fight_id
WHERE ff.event_id = ?
```

**Cambios Clave:**
- Agregado JOIN con `fact_fights` para obtener `event_id`
- Cambiado de LEFT JOIN a INNER JOIN para usuarios con apuestas
- Eliminado subquery EXISTS innecesario
- Reducido de 2 parámetros a 1 en la query

**Resultado:**
- Leaderboard ahora muestra correctamente 9 apuestas por usuario
- Muestra correctamente aciertos y errores para cada usuario

---

### 3. ✅ Fix: Indicadores Visuales en Pronósticos

**Archivo:** `frontend/src/pages/PublicPredictions.jsx`

**Cambios:**

#### A) Nueva función `getPredictionStatus` (Líneas 165-191)
```javascript
const getPredictionStatus = (prediction, fight) => {
  // Pendiente
  if (fight.winner_id === null && !fight.is_draw && fight.result_type_code !== 'no_contest') {
    return { status: 'pending', label: 'Pendiente', color: 'bg-gray-100 text-gray-800', icon: '⏳' };
  }

  // No Contest
  if (fight.result_type_code === 'no_contest') {
    return { status: 'pending', label: 'No Contest', color: 'bg-orange-100 text-orange-800', icon: '🚫' };
  }

  // Verificar si es correcto
  let isCorrect = false;
  if (fight.is_draw) {
    isCorrect = prediction.bet_type === 'draw';
  } else if (prediction.bet_type === 'no_contest') {
    isCorrect = fight.result_type_code === 'no_contest';
  } else {
    isCorrect = prediction.predicted_winner_id === fight.winner_id;
  }

  if (isCorrect) {
    return { status: 'won', label: 'Acertado', color: 'bg-green-100 text-green-800', icon: '✓' };
  } else {
    return { status: 'lost', label: 'Fallado', color: 'bg-red-100 text-red-800', icon: '✗' };
  }
};
```

#### B) Badge de estado agregado a predicciones (Líneas 290-298)
```javascript
{(() => {
  const predictionStatus = getPredictionStatus(fight.user_prediction, fight);
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold mt-2 ${predictionStatus.color}`}>
      <span>{predictionStatus.icon}</span>
      <span>{predictionStatus.label}</span>
    </span>
  );
})()}
```

**Indicadores Disponibles:**
- ✓ **Acertado** - Fondo verde (predicción correcta)
- ✗ **Fallado** - Fondo rojo (predicción incorrecta)
- ⏳ **Pendiente** - Fondo gris (pelea sin resultado)
- 🚫 **No Contest** - Fondo naranja (pelea anulada)

---

## Verificación de Datos

### Base de Datos (Evento 2):
```
Total de peleas: 9
user3: 9 apuestas, 9 aciertos, 0 errores
user4: 9 apuestas, 0 aciertos, 9 errores
```

### Estado de Servicios:
```
✅ Backend: Puerto 3021 - Ejecutándose
✅ Frontend: Puerto 5173 - Ejecutándose
✅ Base de datos: 192.168.100.16:3306 - Conectada
✅ Frontend build: Exitoso (sin errores)
```

---

## URLs Actualizadas

### Pronósticos Públicos:
- **URL:** http://192.168.100.16:5173/public-predictions?event_id=2
- **Estado:** ✅ Muestra las 9 peleas
- **Estado:** ✅ Indica si cada predicción fue acertada o no

### Ranking/Leaderboard:
- **URL:** http://192.168.100.16:5173/leaderboard
- **Estado:** ✅ Muestra 9 apuestas por usuario
- **Estado:** ✅ Muestra aciertos y errores correctos

---

## Archivos Modificados en Esta Sesión

### Backend:
1. `src/controllers/betsController.js`
   - Línea 254: Eliminado filtro `WHERE ff.winner_id IS NULL`
   - Líneas 220, 221, 234, 243: Agregados campos winner_id, result_type_code, winner_name, status
   - Línea 250: Agregado JOIN con dim_fighters para winner
   - Línea 270: Agregado campo computado `is_draw`

2. `src/controllers/leaderboardController.js`
   - Líneas 51-53: Agregado JOIN con fact_fights
   - Línea 53: Cambiado filtro a usar ff.event_id
   - Línea 56: Reducido parámetros de [eventId, eventId] a [eventId]

### Frontend:
3. `frontend/src/pages/PublicPredictions.jsx`
   - Líneas 165-191: Agregada función getPredictionStatus
   - Líneas 290-298: Agregado badge de estado en predicciones

---

## Testing Recomendado

### 1. Pronósticos Públicos:
```bash
# Iniciar sesión como usuario
# Navegar a: http://192.168.100.16:5173/public-predictions?event_id=2
# Verificar:
- Se muestran las 9 peleas ✓
- Cada predicción tiene badge de estado (✓ o ✗) ✓
- Los badges muestran el estado correcto ✓
```

### 2. Leaderboard/Ranking:
```bash
# Navegar a: http://192.168.100.16:5173/leaderboard
# Seleccionar "Por Evento" → UFC 323
# Verificar:
- user3: 9 apuestas, 9 aciertos ✓
- user4: 9 apuestas, 0 aciertos ✓
- Ganancia neta calculada correctamente ✓
```

---

## Lógica de Cálculo de Estado

### Backend (Calculado al ingresar resultados):
```javascript
// En resultsController.js:
if (result_type === 'fighter_win') {
  // Predicciones correctas → status = 'won'
  // Predicciones incorrectas → status = 'lost'
} else if (result_type === 'draw') {
  // Apuestas a empate → status = 'won'
  // Otras apuestas → status = 'lost'
} else if (result_type === 'no_contest') {
  // Todas las apuestas → status = 'pending'
}
```

### Frontend (Visualización):
```javascript
// Pelea sin resultado → ⏳ Pendiente
// No contest → 🚫 No Contest
// Empate acertado → ✓ Acertado
// Peleador correcto → ✓ Acertado
// Predicción incorrecta → ✗ Fallado
```

---

## Notas Técnicas

1. **Compatibilidad:** El campo `is_draw` se agregó como campo computado en el backend para mantener compatibilidad con el código frontend existente que lo requería.

2. **Joins Optimizados:** Se cambió de LEFT JOIN a INNER JOIN en el leaderboard porque solo necesitamos usuarios que tienen apuestas.

3. **Order By:** Se usa `ff.display_order ASC` para mantener el orden secuencial de las peleas.

4. **Status Field:** El campo `status` viene directamente de la tabla `user_bets`, calculado automáticamente cuando se ingresan resultados.

---

## Estado Final: ✅ COMPLETADO

Todos los problemas reportados han sido corregidos:
- ✅ Pronósticos públicos muestra las 9 peleas
- ✅ Indicadores visuales de acertado/fallado funcionando
- ✅ Leaderboard muestra estadísticas correctas
- ✅ Frontend compila sin errores
- ✅ Backend ejecutándose sin errores
