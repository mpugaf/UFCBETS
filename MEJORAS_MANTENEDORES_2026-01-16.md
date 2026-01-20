# Mejoras en Mantenedores - 2026-01-16

## Resumen

Se implementaron dos mejoras principales en los mantenedores:

1. **Detalles de Evento con Link desde Lista de Eventos**
2. **Filtro por Evento en Lista de Peleas**

---

## 1. ✅ Detalles del Evento

### Problema Original:
- En el mantenedor de eventos, la lista solo mostraba nombre y fecha
- No había forma de ver los detalles completos del evento y sus peleas

### Solución Implementada:

#### A) Nuevo Componente: EventDetails.jsx

**Archivo:** `frontend/src/pages/EventDetails.jsx`

**Características:**
- Muestra información completa del evento:
  - Nombre del evento
  - Fecha completa (formato largo)
  - Venue y ubicación
  - Tipo de evento
  - Estado de apuestas (abiertas/cerradas)

- Lista de peleas del evento con detalles completos:
  - Número de pelea
  - Categoría de peso
  - Badges para pelea de título y main event
  - Rounds programados

- Detalles de cada peleador:
  - **Nombre y apodo**
  - **Record de peleas (W-L-D)** ✅
  - **Estatura en cm** ✅
  - **Alcance en cm** ✅
  - **País** ✅
  - **Guardia/Stance** ✅
  - **Cuotas de apuestas** ✅

- Cuotas especiales (si existen):
  - Empate (Draw)
  - No Contest

- Resultado de la pelea (si ya se jugó):
  - Ganador
  - Tipo de resultado

**Diseño:**
- Layout de 3 columnas: Peleador Rojo | VS | Peleador Azul
- Fondo degradado rojo para esquina roja
- Fondo degradado azul para esquina azul
- Divisor central con cuotas de empate/no contest

#### B) Link en Lista de Eventos

**Archivo:** `frontend/src/pages/Maintainers.jsx` (Líneas 285-299)

**Cambios:**
```jsx
<button
  onClick={() => navigate(`/event-details/${e.event_id}`)}
  className="ml-3 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg font-semibold transition-colors"
>
  Ver Detalles →
</button>
```

- Agregado botón "Ver Detalles →" en cada evento
- Hover effect para mejor UX
- Navega a `/event-details/:eventId`

#### C) Nueva Ruta

**Archivo:** `frontend/src/App.jsx` (Líneas 181-188)

```jsx
<Route
  path="/event-details/:eventId"
  element={
    <PrivateRoute>
      <EventDetails />
    </PrivateRoute>
  }
/>
```

---

## 2. ✅ Filtro por Evento en Lista de Peleas

### Problema Original:
- El mantenedor de peleas mostraba todas las peleas de todos los eventos
- Con muchas peleas, la lista se volvía muy grande e inmanejable
- Difícil encontrar peleas de un evento específico

### Solución Implementada:

**Archivo:** `frontend/src/pages/Maintainers.jsx` (Líneas 356-406)

**Características:**

1. **Selector de Evento:**
   - Dropdown con todos los eventos disponibles
   - Opción "Todos los eventos" por defecto
   - Muestra nombre y fecha de cada evento

2. **Filtrado Dinámico:**
   - Filtra peleas al seleccionar un evento
   - Actualiza el contador en el título
   - Muestra mensaje si no hay peleas para el evento

3. **Contador Inteligente:**
   - Con filtro: "Peleas (X)" donde X es el número de peleas filtradas
   - Sin filtro: "Peleas (X total)" donde X es el total

4. **Estado Vacío:**
   - Muestra icono 🥊 y mensaje cuando no hay peleas
   - "No hay peleas para este evento"

**Código:**
```jsx
{/* Event Filter */}
<div className="mb-4">
  <label className="block text-gray-700 text-sm font-bold mb-2">
    Filtrar por Evento
  </label>
  <select
    value={selectedEventFilter}
    onChange={(e) => setSelectedEventFilter(e.target.value)}
    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
  >
    <option value="">📋 Todos los eventos</option>
    {events.map((evt) => (
      <option key={evt.event_id} value={evt.event_id}>
        {evt.event_name} - {new Date(evt.event_date).toLocaleDateString()}
      </option>
    ))}
  </select>
</div>

{/* Filtered Fights List */}
{(selectedEventFilter
  ? fights.filter(f => f.event_id === parseInt(selectedEventFilter))
  : fights
).map((f) => (
  // ... renderizado de peleas
))}
```

---

## 3. ✅ Backend: Endpoints Actualizados

### A) Nuevo Endpoint: Obtener Evento por ID

**Archivo:** `src/controllers/maintainersController.js` (Líneas 88-109)

```javascript
async getEventById(req, res) {
  try {
    const { event_id } = req.params;
    const query = `
      SELECT e.*, et.event_type_name, c.country_name, c.country_code
      FROM dim_events e
      LEFT JOIN dim_event_types et ON e.event_type_id = et.event_type_id
      LEFT JOIN dim_countries c ON e.country_id = c.country_id
      WHERE e.event_id = ?
    `;
    const [events] = await pool.execute(query, [event_id]);

    if (events.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({ success: true, data: events[0] });
  } catch (error) {
    console.error('Get event by id error:', error);
    res.status(500).json({ success: false, message: 'Error fetching event', error: error.message });
  }
}
```

**Ruta:** `GET /api/maintainers/events/:event_id`

**Archivo:** `src/routes/maintainersRoutes.js` (Línea 18)

### B) Endpoint de Peleas Mejorado

**Archivo:** `src/controllers/maintainersController.js` (Líneas 159-227)

**Mejoras:**

1. **Soporte para filtro por evento:**
   ```javascript
   const { event_id } = req.query;

   if (event_id) {
     query += ' WHERE ff.event_id = ?';
     params.push(event_id);
   }
   ```

2. **Detalles completos de peleadores:**
   - Record de peleas calculado dinámicamente (W-L-D)
   - Estatura (height_cm)
   - Alcance (reach_cm)
   - País (country_name)
   - Guardia (stance_name)
   - Apodo (nickname)

3. **Cuotas de apuestas completas:**
   - Cuota peleador rojo (`red_odds`)
   - Cuota peleador azul (`blue_odds`)
   - Cuota empate (`draw_odds`)
   - Cuota no contest (`no_contest_odds`)

4. **Ordenamiento:**
   ```sql
   ORDER BY e.event_date DESC, ff.display_order ASC, ff.fight_id DESC
   ```

**Query SQL Completa:**
```sql
SELECT
  ff.*,
  e.event_name, e.event_date,
  wc.class_name as weight_class_name,
  fr.fighter_name as red_fighter_name,
  fr.nickname as red_fighter_nickname,
  fr.height_cm as red_fighter_height,
  fr.reach_cm as red_fighter_reach,
  cr.country_name as red_fighter_country,
  sr.stance_name as red_fighter_stance,
  CONCAT(...) as red_fighter_record,  -- W-L-D format
  fb.fighter_name as blue_fighter_name,
  fb.nickname as blue_fighter_nickname,
  fb.height_cm as blue_fighter_height,
  fb.reach_cm as blue_fighter_reach,
  cb.country_name as blue_fighter_country,
  sb.stance_name as blue_fighter_stance,
  CONCAT(...) as blue_fighter_record,  -- W-L-D format
  w.fighter_name as winner_name,
  rt.result_type_name,
  (SELECT decimal_odds FROM betting_odds WHERE fight_id = ff.fight_id AND fighter_id = ff.fighter_red_id LIMIT 1) as red_odds,
  (SELECT decimal_odds FROM betting_odds WHERE fight_id = ff.fight_id AND fighter_id = ff.fighter_blue_id LIMIT 1) as blue_odds,
  (SELECT decimal_odds FROM betting_odds WHERE fight_id = ff.fight_id AND bet_type = 'draw' LIMIT 1) as draw_odds,
  (SELECT decimal_odds FROM betting_odds WHERE fight_id = ff.fight_id AND bet_type = 'no_contest' LIMIT 1) as no_contest_odds
FROM fact_fights ff
LEFT JOIN dim_events e ON ff.event_id = e.event_id
LEFT JOIN dim_weight_classes wc ON ff.weight_class_id = wc.weight_class_id
LEFT JOIN dim_fighters fr ON ff.fighter_red_id = fr.fighter_id
LEFT JOIN dim_countries cr ON fr.country_id = cr.country_id
LEFT JOIN dim_stances sr ON fr.stance_id = sr.stance_id
LEFT JOIN dim_fighters fb ON ff.fighter_blue_id = fb.fighter_id
LEFT JOIN dim_countries cb ON fb.country_id = cb.country_id
LEFT JOIN dim_stances sb ON fb.stance_id = sb.stance_id
LEFT JOIN dim_fighters w ON ff.winner_id = w.fighter_id
LEFT JOIN dim_result_types rt ON ff.result_type_code = rt.result_type_code
WHERE ff.event_id = ? -- opcional
ORDER BY e.event_date DESC, ff.display_order ASC, ff.fight_id DESC
```

**Ruta:** `GET /api/maintainers/fights?event_id=X`

**Parámetros:**
- `event_id` (query param, opcional): Filtra peleas por evento

---

## Archivos Modificados

### Frontend:
1. ✅ `frontend/src/pages/EventDetails.jsx` (nuevo)
2. ✅ `frontend/src/pages/Maintainers.jsx`
   - Líneas 13-17: Agregado state `selectedEventFilter`
   - Líneas 285-299: Agregado botón "Ver Detalles" en eventos
   - Líneas 356-406: Agregado filtro de evento en peleas
3. ✅ `frontend/src/App.jsx`
   - Línea 19: Import de EventDetails
   - Líneas 181-188: Ruta para `/event-details/:eventId`

### Backend:
4. ✅ `src/controllers/maintainersController.js`
   - Líneas 88-109: Método `getEventById`
   - Líneas 159-227: Método `getFights` mejorado
5. ✅ `src/routes/maintainersRoutes.js`
   - Línea 18: Ruta `GET /events/:event_id`

---

## Testing Recomendado

### 1. Detalles de Evento:
```bash
# Login como admin
# Navegar a: http://192.168.100.16:5173/maintainers
# Click en tab "Eventos"
# Click en "Ver Detalles →" de cualquier evento

# Verificar:
- ✅ Se muestra información completa del evento
- ✅ Se listan todas las peleas del evento
- ✅ Cada peleador muestra:
  - Record de peleas (ej: "15-3-0")
  - Estatura en cm (si está disponible)
  - Alcance en cm (si está disponible)
  - País
  - Guardia/Stance
- ✅ Se muestran cuotas de apuestas
- ✅ Botón "Volver a Mantenedores" funciona
```

### 2. Filtro de Peleas:
```bash
# Login como admin
# Navegar a: http://192.168.100.16:5173/maintainers
# Click en tab "Peleas"

# Verificar:
- ✅ Selector de evento visible
- ✅ Por defecto muestra "📋 Todos los eventos"
- ✅ Al seleccionar un evento, filtra peleas
- ✅ Contador se actualiza correctamente
- ✅ Si no hay peleas, muestra mensaje apropiado
```

### 3. Endpoints Backend:
```bash
# Obtener evento específico:
curl -H "Authorization: Bearer <admin_token>" \
  http://localhost:3021/api/maintainers/events/2

# Obtener todas las peleas:
curl -H "Authorization: Bearer <admin_token>" \
  http://localhost:3021/api/maintainers/fights

# Obtener peleas de un evento:
curl -H "Authorization: Bearer <admin_token>" \
  http://localhost:3021/api/maintainers/fights?event_id=2
```

---

## Estado del Sistema

```
✅ Backend: Puerto 3021 - Ejecutándose
✅ Frontend: Puerto 5173 - Ejecutándose
✅ Frontend build: Exitoso (sin errores)
✅ Base de datos: 192.168.100.16:3306 - Conectada
```

---

## Beneficios de las Mejoras

### 1. Mejor Organización:
- Lista de peleas más manejable con filtro por evento
- Acceso rápido a detalles de evento desde la lista

### 2. Información Completa:
- Detalles estadísticos de cada peleador
- Record de peleas calculado automáticamente
- Todas las cuotas de apuestas visibles

### 3. Mejor UX:
- Navegación intuitiva con botones claros
- Estados vacíos con mensajes informativos
- Diseño visual atractivo con gradientes de color

### 4. Escalabilidad:
- Filtro por evento evita problemas de rendimiento con muchas peleas
- Query optimizada con JOINs apropiados
- Cálculo dinámico de records sin almacenamiento redundante

---

## URLs para Acceder

### Mantenedores:
- **URL:** http://192.168.100.16:5173/maintainers
- **Acceso:** Solo administradores
- **Tab "Eventos":** Lista con botón "Ver Detalles"
- **Tab "Peleas":** Lista con filtro por evento

### Detalles de Evento:
- **URL:** http://192.168.100.16:5173/event-details/:eventId
- **Ejemplo:** http://192.168.100.16:5173/event-details/2
- **Acceso:** Solo administradores

---

## Notas Técnicas

1. **Cálculo de Record:**
   - Se calcula dinámicamente desde fact_fights
   - Formato: "W-L-D" (Wins-Losses-Draws)
   - Solo cuenta peleas donde el peleador participó (red o blue)

2. **Orden de Peleas:**
   - Por fecha de evento (descendente)
   - Por display_order (ascendente) - orden dentro del evento
   - Por fight_id (descendente) - más reciente primero

3. **Performance:**
   - Subqueries optimizadas para cuotas
   - Filtro por evento reduce payload significativamente
   - COALESCE para manejo de NULLs en records

4. **Compatibilidad:**
   - React Router v6 con useParams
   - useNavigate para navegación programática
   - Responsive design con Tailwind CSS

---

## Estado Final: ✅ COMPLETADO

Ambas mejoras han sido implementadas exitosamente:
- ✅ Link a detalles de evento con información completa
- ✅ Filtro por evento en lista de peleas
- ✅ Backend con endpoints mejorados
- ✅ Frontend compilando sin errores
- ✅ Sistema ejecutándose correctamente
