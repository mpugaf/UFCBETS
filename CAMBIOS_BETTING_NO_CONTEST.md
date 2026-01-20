# Cambios: Orden de Peleas y Opción No Contest en Pronósticos

## Fecha: 2026-01-15

## Resumen de Cambios

### 1. Campo de Orden Correlativo en fact_fights ✅

**Migración:** `migrations/2026-01-15-add-display-order-to-fights.sql`

Se agregó el campo `display_order` a la tabla `fact_fights` para manejar el orden de despliegue de las peleas.

```sql
ALTER TABLE fact_fights
ADD COLUMN display_order INT DEFAULT 0 AFTER card_position,
ADD INDEX idx_display_order (event_id, display_order);
```

**Orden Automático:**
- Title Fights primero (display_order 1, 2, ...)
- Main Card segundo (display_order continúa...)
- Preliminares al final

**Ejemplo de uso:**
```sql
SELECT * FROM fact_fights
WHERE event_id = 2
ORDER BY display_order ASC;
```

### 2. Opción "No Contest" en Pronósticos ✅

#### Frontend

**Archivo:** `frontend/src/components/FightCard.jsx`
- Cambiado de grid 3 columnas a 4 columnas
- Agregada opción "No Contest" entre "Empate" y "Peleador Azul"
- Estado `isNoContestSelected` para manejar la selección

**Archivo:** `frontend/src/components/BetOption.jsx`
- Agregado renderizado para tipo `no_contest`
- Icono: 🚫 (color naranja)
- Odds predeterminados: 15.00

**Layout de Opciones:**
```
[Peleador Rojo] [Empate] [No Contest] [Peleador Azul]
     🔴           ⚖️         🚫           🔵
```

#### Backend

**Archivo:** `src/models/FightCategory.js`
- Agregada consulta para obtener `no_contest_odds` de betting_odds
- Campo `no_contest_odds` incluido en la respuesta de peleas
- Ordenamiento actualizado: usa `display_order` en lugar de solo `card_position`

**Archivo:** `src/controllers/betsController.js`
- Validación de `bet_type` actualizada para incluir `'no_contest'`
- Tipos válidos: `['fighter_win', 'draw', 'no_contest']`

**Archivo:** `src/controllers/resultsController.js`
- Query de resultados actualizada para ordenar por `display_order`

### 3. Sobre el Evento 1 - Aclaración

**Estado Actual:**
- Evento 1 (UFC 324): 1 pelea registrada
- Evento 2 (UFC 323): 9 peleas registradas

El sistema está funcionando correctamente. El evento 1 solo tiene 1 pelea en la base de datos, por lo que solo muestra esa pelea. Para ver todas las peleas funcionando, usar:

```
http://192.168.100.16:5173/betting?event_id=2
```

### 4. Estructura de Apuestas

#### Tipos de Apuesta Soportados

1. **fighter_win**
   - Requiere: `predicted_winner_id` (ID del peleador)
   - Odds: Individuales por peleador

2. **draw**
   - Requiere: `predicted_winner_id = null`
   - Odds predeterminados: 10.00

3. **no_contest** ⬅️ NUEVO
   - Requiere: `predicted_winner_id = null`
   - Odds predeterminados: 15.00

#### Ejemplo de Apuesta (JSON)

```json
{
  "fight_id": 10,
  "bet_type": "no_contest",
  "predicted_winner_id": null,
  "odds_value": 15.00
}
```

### 5. Orden de Despliegue

Las peleas se despliegan en el siguiente orden:

1. **Por Categoría (descendente):**
   - Title Fight (🏆)
   - Main Card (⭐)
   - Preliminares (🥊)

2. **Dentro de cada categoría (ascendente):**
   - Por `display_order`
   - Por `fight_id` (desempate)

**Query Ejemplo:**
```sql
SELECT * FROM fact_fights
WHERE event_id = 2
ORDER BY
  (SELECT display_order FROM dim_fight_categories WHERE category_id = fight_category_id) DESC,
  display_order ASC,
  fight_id;
```

## Archivos Modificados

### Base de Datos
1. ✅ `migrations/2026-01-15-add-display-order-to-fights.sql` (nuevo)

### Backend
1. ✅ `src/models/FightCategory.js`
   - Agregada consulta de `no_contest_odds`
   - Actualizado ORDER BY para usar `display_order`

2. ✅ `src/controllers/betsController.js`
   - Validación de `bet_type` incluye `'no_contest'`

3. ✅ `src/controllers/resultsController.js`
   - Query de resultados usa `display_order`

### Frontend
1. ✅ `frontend/src/components/FightCard.jsx`
   - Grid de 3 a 4 columnas
   - Agregada opción No Contest
   - Estado `isNoContestSelected`

2. ✅ `frontend/src/components/BetOption.jsx`
   - Renderizado para tipo `no_contest`
   - Icono 🚫 y color naranja

## Testing

### Verificar display_order

```sql
-- Ver orden de peleas para evento 2
SELECT
  fight_id,
  display_order,
  CONCAT(fr.fighter_name, ' vs ', fb.fighter_name) as pelea
FROM fact_fights ff
JOIN dim_fighters fr ON ff.fighter_red_id = fr.fighter_id
JOIN dim_fighters fb ON ff.fighter_blue_id = fb.fighter_id
WHERE event_id = 2
ORDER BY display_order;
```

### Probar Apuesta No Contest

1. Ir a: `http://192.168.100.16:5173/betting?event_id=2`
2. Seleccionar cualquier pelea
3. Hacer clic en el botón "No Contest" (🚫 naranja)
4. Verificar que se seleccione correctamente
5. Enviar apuestas y verificar en la base de datos:

```sql
SELECT * FROM user_bets
WHERE bet_type = 'no_contest'
ORDER BY bet_id DESC
LIMIT 5;
```

## Estado de Servidores

✅ **Backend:** Corriendo en puerto 3021
✅ **Frontend:** Corriendo en puerto 5173
✅ **Base de datos:** Actualizada con `display_order`
✅ **Apuestas:** Soporta `no_contest`

## URLs

- **Dashboard:** http://192.168.100.16:5173/dashboard
- **Betting (Evento 1):** http://192.168.100.16:5173/betting?event_id=1 (1 pelea)
- **Betting (Evento 2):** http://192.168.100.16:5173/betting?event_id=2 (9 peleas) ⬅️ RECOMENDADO
- **Fight Results:** http://192.168.100.16:5173/fight-results?event_id=2

## Notas

1. El evento 1 solo tiene 1 pelea porque solo se registró 1 en la base de datos, no es un error del sistema
2. Para probar todas las funcionalidades, usa el evento 2 que tiene 9 peleas
3. Los odds de `no_contest` son predeterminados (15.00) pero pueden configurarse en la tabla `betting_odds`
4. El campo `display_order` se puede actualizar manualmente si se necesita cambiar el orden de las peleas
