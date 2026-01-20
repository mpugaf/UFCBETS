# Resumen Completo de Cambios - Sistema de Apuestas UFC

## Fecha: 2026-01-16

---

## 1. ✅ Corrección: Mostrar Todas las Peleas en Betting

### Problema
Solo se mostraba 1 pelea cuando debían mostrarse todas las 9 peleas del evento.

### Solución
**Archivo:** `src/models/FightCategory.js:56`
- Eliminado filtro `WHERE ff.winner_id IS NULL`
- Ahora muestra todas las peleas del evento, independientemente de su estado

**Resultado:** Todas las 9 peleas se muestran correctamente en `/betting?event_id=2`

---

## 2. ✅ Módulo Admin: Limpiar Resultados

### Archivos Creados/Modificados
1. **`frontend/src/pages/ClearBets.jsx`** (actualizado)
   - Interfaz para limpiar resultados de eventos
   - Confirmación en dos pasos
   - Muestra estadísticas del evento (total peleas, finalizadas, pendientes)

2. **`src/controllers/betsController.js:573-581`** (actualizado)
   - Limpia `winner_id` y `result_type_code` de fact_fights
   - Resetea status de user_bets a 'pending'
   - Re-habilita `can_bet = TRUE` para todos los usuarios

3. **`frontend/src/pages/Dashboard.jsx:127-132`** (nuevo botón)
   - Botón "🧹 Limpiar Resultados" en Dashboard admin

4. **`frontend/src/App.jsx:173-179`** (ya existía)
   - Ruta `/clear-bets` registrada

### Funcionalidad
- Permite a admins resetear resultados de un evento para pruebas
- Los usuarios pueden volver a apostar después de la limpieza
- Transacción atómica (rollback si falla)

**URL:** http://192.168.100.16:5173/clear-bets

---

## 3. ✅ Cálculo Automático de Puntos

### Implementación
**Archivo:** `src/controllers/resultsController.js:79-121`

#### Cuando un usuario acierta:
```javascript
// Ganancia = bet_amount * odds_value
// Por defecto: 100 puntos * cuota
UPDATE users SET total_points = total_points + (100 * odds_value)
```

#### Lógica por tipo de resultado:

**fighter_win:**
- Apuestas correctas → `total_points += (100 * odds_value)`
- Apuestas incorrectas → status = 'lost'
- Empates y no contests → status = 'lost'

**draw:**
- Apuestas de empate → `total_points += (100 * odds_value)`
- Apuestas de peleador → status = 'lost'

**no_contest:**
- Todas las apuestas → status = 'pending'
- No se asignan ni restan puntos

### Ejemplo
```
Usuario apuesta a peleador con odds 2.50:
- Si acierta: +250 puntos (100 * 2.50)
- Si falla: 0 puntos
- Total acumulado en users.total_points
```

---

## 4. ✅ Ranking Anual de Usuarios

### Backend
**Archivo:** `src/controllers/leaderboardController.js:71-115`

#### Query Actualizada:
```sql
SELECT
  u.user_id,
  u.username,
  u.total_points,         -- ⬅️ Campo principal de ordenamiento
  COUNT(DISTINCT ub.event_id) as events_participated,
  COUNT(ub.bet_id) as total_bets,
  SUM(CASE WHEN ub.status = 'won' THEN 1 ELSE 0 END) as correct_bets,
  accuracy_percentage
FROM users u
WHERE u.role = 'user'
  AND YEAR(e.event_date) = ?
ORDER BY u.total_points DESC  -- ⬅️ Ordenado por puntos totales
```

### Frontend
**Archivo:** `frontend/src/pages/Leaderboard.jsx:236,288-297`

#### Cambios:
- Columna "Ganancia Neta" → "Puntos Totales"
- Muestra `entry.total_points` en lugar de `net_profit`
- Formato: `{points}.toFixed(2) pts`

#### Características:
- **Vista por Evento:** Clasificación de un evento específico
- **Vista Anual:** Ranking acumulado del año calendario
- Selector de año (2024, 2025, 2026, etc.)
- Medallas 🥇🥈🥉 para top 3
- Destaca al usuario actual en morado

**URL:** http://192.168.100.16:5173/leaderboard

---

## 5. ✅ Campo display_order para Orden de Peleas

### Migración
**Archivo:** `migrations/2026-01-15-add-display-order-to-fights.sql`

```sql
ALTER TABLE fact_fights
ADD COLUMN display_order INT DEFAULT 0 AFTER card_position,
ADD INDEX idx_display_order (event_id, display_order);
```

#### Orden Automático:
1. Title Fights (display_order: 1, 2, ...)
2. Main Card (continúa la numeración)
3. Preliminares (al final)

### Implementación
- **Backend:** Queries actualizadas para `ORDER BY display_order`
- **Frontend:** Las peleas se muestran en orden correlativo
- **Mantenedores:** Campo editable desde admin panel

---

## 6. ✅ Opción "No Contest" en Pronósticos

### Frontend

**Archivo:** `frontend/src/components/FightCard.jsx:70-104`
- Grid cambiado de 3 a 4 columnas
- Nuevo botón "No Contest" (🚫 naranja)
- Layout: `[Rojo] [Empate] [No Contest] [Azul]`

**Archivo:** `frontend/src/components/BetOption.jsx:36-48`
- Renderizado para tipo `no_contest`
- Icono 🚫 con fondo naranja
- Odds predeterminados: 15.00

### Backend

**Archivo:** `src/models/FightCategory.js:49`
- Consulta de `no_contest_odds` desde betting_odds

**Archivo:** `src/controllers/betsController.js:469-472`
- Validación de bet_type incluye `'no_contest'`

**Archivo:** `src/controllers/resultsController.js:132-141`
- Lógica: todas las apuestas → 'pending'
- No se asignan puntos en no contest

---

## Estructura de Tablas Actualizada

### users
```sql
- user_id
- username
- total_points  ⬅️ Suma acumulada de puntos ganados
- can_bet       ⬅️ Se resetea a TRUE al limpiar resultados
- role          ⬅️ 'user' o 'admin'
```

### fact_fights
```sql
- fight_id
- winner_id         ⬅️ NULL si pendiente o empate/no contest
- result_type_code  ⬅️ 'fighter_win', 'draw', 'no_contest', NULL
- display_order     ⬅️ Orden de despliegue (1, 2, 3, ...)
```

### user_bets
```sql
- bet_id
- bet_type          ⬅️ 'fighter_win', 'draw', 'no_contest'
- bet_amount        ⬅️ Siempre 100 puntos
- odds_value        ⬅️ Cuota de la apuesta
- potential_return  ⬅️ bet_amount * odds_value
- status            ⬅️ 'pending', 'won', 'lost'
```

---

## URLs del Sistema

### Usuario Regular
- Dashboard: http://192.168.100.16:5173/dashboard
- Apuestas: http://192.168.100.16:5173/betting?event_id=2
- Mis Apuestas: http://192.168.100.16:5173/my-bets
- Ranking: http://192.168.100.16:5173/leaderboard

### Administrador
- Resultados: http://192.168.100.16:5173/fight-results?event_id=2
- Limpiar Resultados: http://192.168.100.16:5173/clear-bets
- Mantenedores: http://192.168.100.16:5173/maintainers

---

## Flujo Completo de Apuestas

### 1. Fase de Apuestas
1. Admin configura `betting_enabled = TRUE`
2. Usuarios acceden a `/betting?event_id=X`
3. Ven **TODAS** las 9 peleas (corregido ✅)
4. Pueden elegir: **Rojo** | **Empate** | **No Contest** | **Azul**
5. Envían apuestas → `can_bet = FALSE`

### 2. Fase de Resultados
1. Admin accede a `/fight-results`
2. Ingresa resultados pelea por pelea
3. Sistema calcula automáticamente:
   - `users.total_points += (100 * odds_value)` si acierta
   - `user_bets.status = 'won'` o 'lost'
   - No contest → todos a 'pending'

### 3. Fase de Ranking
1. Usuarios acceden a `/leaderboard`
2. Ven clasificación **por evento** o **anual**
3. Ordenado por `total_points` (mayor a menor)
4. Muestra: eventos participados, apuestas, aciertos, precisión%

### 4. Fase de Pruebas (Admin)
1. Admin accede a `/clear-bets`
2. Selecciona evento
3. Confirma limpieza
4. Sistema resetea:
   - Resultados (`winner_id`, `result_type_code` → NULL)
   - Apuestas (`status` → 'pending')
   - Permisos (`can_bet` → TRUE)
5. Usuarios pueden volver a apostar

---

## Estado del Sistema

✅ Backend: Puerto 3021 - Funcionando
✅ Frontend: Puerto 5173 - Funcionando
✅ Base de datos: Actualizada con todos los campos

---

## Credenciales

**Admin:**
- Username: `admin`
- Password: `admin123`
- Rol: `admin`

**Usuarios de Prueba:**
Creados mediante tokens de registro

---

## Notas Importantes

1. **Puntos Acumulativos:** Los puntos se suman en `users.total_points` y **no se restan** al perder
2. **Apuesta Fija:** Todas las apuestas son de 100 puntos
3. **Cuotas Variables:** Cada peleador y opción tiene su propia cuota
4. **Año Calendario:** El ranking anual filtra eventos del año seleccionado
5. **Empate/No Contest:** Odds más altos (10.00 y 15.00) por ser menos probables

---

## Archivos Modificados (Resumen)

### Backend
- `src/models/FightCategory.js`
- `src/controllers/betsController.js`
- `src/controllers/resultsController.js`
- `src/controllers/leaderboardController.js`

### Frontend
- `frontend/src/pages/ClearBets.jsx`
- `frontend/src/pages/Dashboard.jsx`
- `frontend/src/pages/Leaderboard.jsx`
- `frontend/src/components/FightCard.jsx`
- `frontend/src/components/BetOption.jsx`

### Migraciones
- `migrations/2026-01-15-add-display-order-to-fights.sql`
- `migrations/2026-01-15-add-result-type-to-fights.sql`

---

## Testing Sugerido

1. **Apuestas:**
   - Ir a `/betting?event_id=2`
   - Verificar que se muestren las 9 peleas
   - Probar apostar a las 4 opciones (Rojo, Empate, No Contest, Azul)

2. **Resultados:**
   - Login como admin
   - Ir a `/fight-results?event_id=2`
   - Ingresar resultado de una pelea
   - Verificar que los puntos se suman en users.total_points

3. **Ranking:**
   - Ir a `/leaderboard`
   - Cambiar entre vista "Evento" y "Anual"
   - Verificar que muestra total_points correctamente

4. **Limpiar:**
   - Ir a `/clear-bets`
   - Limpiar evento 2
   - Verificar que se resetean resultados y apuestas
   - Confirmar que usuarios pueden volver a apostar

---

## Próximos Pasos Sugeridos

1. Agregar más eventos de prueba
2. Crear usuarios de prueba adicionales
3. Configurar odds personalizados por pelea
4. Agregar gráficos al ranking (opcional)
5. Implementar notificaciones de resultados (opcional)
