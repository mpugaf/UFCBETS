# Proyecto UFC Data Analytics

## Descripción General
Proyecto de análisis de datos de la UFC (Ultimate Fighting Championship) basado en un modelo de base de datos dimensional (Data Warehouse) para almacenar y analizar estadísticas de peleadores, peleas y eventos.

## Arquitectura de Datos

### Modelo Dimensional
El proyecto utiliza un esquema estrella (star schema) con las siguientes componentes:

#### Dimensiones de Catálogo
Dimensiones sin ENUMs que permiten agregar nuevos valores dinámicamente:
- **dim_countries**: Países con nombre completo y código ISO de 3 letras (ej: Chile - CHI)
- **dim_stances**: Posturas de combate (Orthodox, Southpaw, Switch)
- **dim_genders**: Géneros para categorías de peso (Male, Female)
- **dim_event_types**: Tipos de eventos UFC (PPV, Fight Night, TUF Finale, Special)
- **dim_bonus_types**: Tipos de bonos otorgados (Performance of the Night, Fight of the Night, etc.)
- **dim_fight_results**: Tipos de resultados (Win, Loss, Draw, No Contest, DQ)
- **dim_fight_methods**: Métodos de finalización (KO/TKO, Submission, Decision types, etc.)

#### Dimensiones Principales
- **dim_fighters**: Información de peleadores con referencias a país y postura
- **dim_events**: Eventos UFC con referencia a tipo de evento y país
- **dim_weight_classes**: Categorías de peso con referencia a género
- **dim_rankings**: Rankings históricos de peleadores por categoría
- **dim_bonuses**: Bonos otorgados con referencia a tipo de bono y evento
- **dim_referees**: Árbitros con referencia a país
- **dim_time**: Dimensión temporal para análisis por fecha

#### Tabla de Hechos
- **fact_fights**: Tabla central que registra cada pelea con métricas detalladas, estadísticas por peleador y relaciones a todas las dimensiones

#### Tabla Puente
- **bridge_fight_bonuses**: Relación muchos-a-muchos entre peleas, peleadores y bonos otorgados

### Métricas y KPIs
- Estadísticas por pelea: strikes, takedowns, submission attempts, control time
- Resultados: método de victoria, round de finalización
- Rendimiento de peleadores a lo largo del tiempo
- Análisis de bonos otorgados
- Tendencias por categoría de peso

## Base de Datos

### Motor
MySQL 8.0+

### Scripts
- `schema.sql`: Modelo dimensional completo con dimensiones, hechos, claves e índices
- `seed_data.sql`: Datos iniciales para dimensiones de catálogo (idempotente - puede ejecutarse múltiples veces sin duplicar datos)

### Ejecución de Scripts
```bash
# 1. Crear estructura de base de datos
mysql -u root -p < schema.sql

# 2. Cargar datos iniciales
mysql -u root -p < seed_data.sql
```

**Nota:** El script `seed_data.sql` es idempotente y puede ejecutarse múltiples veces sin generar duplicados gracias al uso de `INSERT IGNORE` y verificaciones `NOT EXISTS`.

### Diseño sin ENUMs
El modelo evita el uso de tipos ENUM de MySQL en favor de tablas dimensionales:

**Ventajas:**
- **Extensibilidad**: Agregar nuevos valores no requiere ALTER TABLE
- **Integridad referencial**: Las foreign keys garantizan consistencia
- **Flexibilidad**: Valores pueden incluir descripciones y metadata adicional
- **Normalización**: Sigue principios de diseño dimensional
- **Reportes**: Facilita consultas y análisis sin conversiones

**Ejemplo:** En lugar de `stance ENUM('Orthodox', 'Southpaw', 'Switch')`, se usa:
```sql
stance_id INT
FOREIGN KEY (stance_id) REFERENCES dim_stances(stance_id)
```

Esto permite agregar nuevas posturas con un simple INSERT sin modificar la estructura de la tabla.

### Dimensión de Países
La tabla `dim_countries` centraliza información de países para peleadores, árbitros y eventos:

**Estructura:**
- `country_name`: Nombre completo del país (ej: "Chile")
- `country_code`: Código ISO 3166-1 alpha-3 de 3 letras (ej: "CHL")

**Ventajas:**
- Consistencia en nombres de países en todo el sistema
- Facilita análisis por nacionalidad
- Permite agregar metadata adicional (continente, región, etc.) en el futuro

### Categorías de Peso
La tabla `dim_weight_classes` permite nombres duplicados para diferentes géneros:

**Constraint único compuesto:**
```sql
UNIQUE KEY unique_class_gender (class_name, gender_id)
```

Esto permite que existan, por ejemplo:
- "Flyweight" para Male (125 lbs)
- "Flyweight" para Female (125 lbs)

Ambas son divisiones separadas en la UFC pero comparten el mismo nombre.

## Estándares de Código

### Comentarios
- Los comentarios se utilizan únicamente cuando la lógica es medianamente compleja
- El código autodocumentado se prefiere sobre comentarios excesivos
- Nombres descriptivos para tablas, campos y constraints

### Convenciones de Nomenclatura
- Tablas de dimensiones: prefijo `dim_`
- Tablas de hechos: prefijo `fact_`
- Tablas puente: prefijo `bridge_`
- Claves primarias: sufijo `_id`
- Claves foráneas: nombre de la tabla referenciada + `_id`
- Índices: prefijo `idx_`
- Vistas: prefijo `vw_`

### Principios de Diseño
- **Sin ENUMs**: Todos los valores categóricos se manejan como dimensiones
- **Integridad referencial**: Uso consistente de foreign keys
- **Normalización dimensional**: Separación clara entre dimensiones y hechos
- **Índices estratégicos**: Optimización para consultas analíticas comunes

## Ejecución de la Aplicación

### Backend (API Node.js/Express)
El backend se ejecuta en el puerto 3021 por defecto.

```bash
# Instalar dependencias (primera vez)
npm install

# Iniciar servidor backend
npm start
```

### Frontend (React)
El frontend se ejecuta en el puerto 5173 (Vite) por defecto.

```bash
# Navegar a la carpeta frontend
cd frontend

# Instalar dependencias (primera vez)
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### Ejecución Completa
Para ejecutar toda la aplicación, necesitas dos terminales:

**Terminal 1 - Backend:**
```bash
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend && npm run dev
```

Una vez iniciados ambos servicios:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3021

## Sistema de Permisos de Apuestas

### Funcionamiento
El sistema implementa un control de permisos para las apuestas de usuarios:

1. **Al enviar apuestas**: Cuando un usuario envía sus apuestas mediante el botón "Enviar Todas las Apuestas", automáticamente se bloquea su capacidad de realizar más apuestas (campo `can_bet` en tabla `users` se establece en `FALSE`).

2. **Gestión por administrador**: Solo los usuarios con rol `admin` pueden:
   - Habilitar/deshabilitar apuestas individualmente para cada usuario
   - Restablecer permisos de apuestas para todos los usuarios a la vez
   - Acceder al panel de gestión de usuarios en `/users-management`

### Campo can_bet
- **Ubicación**: Tabla `users`, campo `can_bet` (BOOLEAN)
- **Default**: `TRUE` para nuevos usuarios
- **Modificación**:
  - Se establece en `FALSE` automáticamente al enviar apuestas
  - Solo admins pueden cambiarlo mediante el panel de gestión

### Endpoints de Gestión (Solo Admin)
```
GET    /api/users                      - Lista todos los usuarios con estadísticas
PATCH  /api/users/:userId/toggle-betting - Habilita/deshabilita apuestas para un usuario
POST   /api/users/reset-all-betting   - Habilita apuestas para todos los usuarios
```

### Interfaz de Administración
Acceso: `/users-management` (solo para administradores)

Funcionalidades:
- Ver lista de todos los usuarios con sus estadísticas
- Estado actual de permisos de apuestas (Sí/No)
- Botón individual para habilitar/deshabilitar por usuario
- Botón global para habilitar apuestas para todos

## Estructura de Apuestas

### Selección de Ganador
Todos los eventos usan el mismo formato:
- Se permite seleccionar entre los dos peleadores (rojo vs azul) o empate
- Grid de 3 columnas en el componente FightCard (peleador rojo, empate, peleador azul)
- Empate tiene odds por defecto de 3.5 si no está especificado

### Montos y Odds
- Monto fijo de apuesta: 100 puntos por pelea
- Odds variables según el peleador o tipo de apuesta
- Ganancia potencial = monto × odds

## Sistema de Pronósticos Públicos

### Visibilidad de Pronósticos
Los pronósticos de todos los usuarios son visibles **solo cuando las apuestas están cerradas** (`betting_enabled = FALSE`):

**Cuando apuestas abiertas:**
- Usuarios solo ven sus propias apuestas
- No pueden ver qué han apostado otros usuarios
- Mantiene privacidad de las predicciones

**Cuando apuestas cerradas:**
- Se puede acceder a `/public-predictions?event_id=X`
- Muestra todos los pronósticos de todos los usuarios
- Se agrupan por pelea y categoría
- Indica con iconos qué peleador o empate eligió cada usuario

### Endpoints de Pronósticos
```
GET /api/bets/predictions/:eventId - Obtener pronósticos públicos (solo si betting_enabled=false)
```

### Interfaz de Pronósticos Públicos
Acceso: `/public-predictions?event_id=X`

Funcionalidades:
- Dos modos de vista: **Por Usuario** y **Ranking General**
- **Vista Por Usuario:**
  - Lista de usuarios con cantidad de pronósticos
  - Click en usuario para ver todos sus pronósticos detallados
  - Iconos visuales: 🔴 (peleador rojo), 🔵 (peleador azul), ⚖️ (empate)
- **Vista Ranking General:**
  - Tabla de posiciones completa del evento
  - Columnas: Posición, Usuario, Apuestas, Aciertos, Errores, Dinero Ganado, Dinero Perdido, Ganancia Neta
  - Medallas para top 3 (🥇🥈🥉)
  - Ordenamiento por ganancia neta
  - Resalta al usuario actual
- Solo disponible cuando apuestas están cerradas

#### Cálculos del Ranking:
```javascript
// Por cada usuario:
- Total de apuestas
- Aciertos: predicted_winner_id === fight.winner_id (o bet_type === 'draw' si fight.is_draw)
- Errores: predicción incorrecta y pelea con resultado
- Dinero ganado: Σ(potential_return de apuestas ganadoras)
- Dinero perdido: Σ(bet_amount de apuestas perdidas) // 100 pts por apuesta
- Ganancia neta: dinero_ganado - dinero_perdido
```

Ordenamiento: Ganancia Neta (desc) → Aciertos (desc)

## Lógica de Apuestas - Nivel Base de Datos

### Modelo de Datos de Apuestas

#### Tabla: user_bets
Almacena todas las apuestas realizadas por los usuarios.

**Estructura:**
```sql
CREATE TABLE user_bets (
  bet_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  fight_id INT NOT NULL,
  bet_type ENUM('fighter_win', 'draw') NOT NULL,
  predicted_winner_id INT,  -- NULL si bet_type = 'draw'
  bet_amount DECIMAL(10,2) DEFAULT 100.00,  -- Monto fijo por apuesta
  odds_value DECIMAL(5,2) NOT NULL,
  potential_return DECIMAL(10,2),  -- bet_amount * odds_value
  status ENUM('pending', 'won', 'lost') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (event_id) REFERENCES dim_events(event_id),
  FOREIGN KEY (fight_id) REFERENCES fact_fights(fight_id),
  FOREIGN KEY (predicted_winner_id) REFERENCES dim_fighters(fighter_id)
);
```

#### Tabla: betting_odds
Almacena las cuotas (odds) para cada resultado posible de una pelea.

**Estructura:**
```sql
CREATE TABLE betting_odds (
  odds_id INT PRIMARY KEY AUTO_INCREMENT,
  fight_id INT NOT NULL,
  fighter_id INT,  -- NULL para draws
  outcome_type ENUM('fighter', 'draw') DEFAULT 'fighter',
  decimal_odds DECIMAL(5,2),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (fight_id) REFERENCES fact_fights(fight_id),
  FOREIGN KEY (fighter_id) REFERENCES dim_fighters(fighter_id)
);
```

**Tipos de odds:**
- `outcome_type = 'fighter'`: Odds para victoria de un peleador específico (requiere fighter_id)
- `outcome_type = 'draw'`: Odds para empate (fighter_id = NULL, valor estándar: 10.00)

### Sistema de Control de Apuestas

#### Campo: users.can_bet
Controla si un usuario tiene permiso para realizar apuestas.

**Flujo automático:**
1. **Usuario nuevo**: `can_bet = TRUE` (puede apostar)
2. **Al enviar apuestas**: Sistema automáticamente establece `can_bet = FALSE` (bloqueado)
3. **Reactivación**: Solo administradores pueden cambiar `can_bet` de vuelta a `TRUE`

**Implementación:**
```sql
-- Al enviar apuestas
UPDATE users SET can_bet = FALSE WHERE user_id = ?;

-- Admin habilita usuario individual
UPDATE users SET can_bet = TRUE WHERE user_id = ?;

-- Admin habilita todos los usuarios
UPDATE users SET can_bet = TRUE;
```

### Lógica de Cálculo de Apuestas

#### Valores Fijos
- **Monto por apuesta**: 100 puntos (constante)
- **Odds de empate por defecto**: 10.00

#### Cálculo de Retorno Potencial
```sql
potential_return = bet_amount * odds_value
```

**Ejemplo:**
- Monto: 100 pts
- Odds peleador favorito: 1.42
- Retorno potencial: 100 × 1.42 = 142 pts

**Ejemplo con empate:**
- Monto: 100 pts
- Odds empate: 10.00
- Retorno potencial: 100 × 10.00 = 1000 pts

### Restricciones de Integridad

#### Validaciones a Nivel Base de Datos
1. **Apuesta de peleador**: Requiere `predicted_winner_id` NOT NULL
2. **Apuesta de empate**: Requiere `predicted_winner_id` IS NULL
3. **Usuario único por pelea**: Un usuario solo puede tener una apuesta activa por pelea
4. **Verificación de permisos**: Backend verifica `can_bet = TRUE` antes de INSERT

#### Constraint Recomendado
```sql
-- Prevenir apuestas duplicadas por usuario en la misma pelea
ALTER TABLE user_bets
ADD UNIQUE KEY unique_user_fight (user_id, fight_id);
```

### Ciclo de Vida de una Apuesta

1. **Creación** (`status = 'pending'`):
   - Usuario selecciona ganador o empate
   - Sistema calcula `potential_return`
   - Se inserta registro en `user_bets`
   - Usuario se bloquea (`can_bet = FALSE`)

2. **Evaluación** (después del evento):
   - Admin actualiza `fact_fights.winner_id`
   - Sistema compara `predicted_winner_id` con `winner_id`
   - Si coinciden: `status = 'won'`
   - Si no coinciden: `status = 'lost'`
   - Para draws: `bet_type = 'draw'` y `fight_result_id` corresponde a Draw

3. **Liquidación**:
   - Apuestas ganadas: Usuario recibe `potential_return` puntos
   - Apuestas perdidas: Pierde los 100 puntos apostados

### Query de Ejemplo: Obtener Apuestas Ganadoras
```sql
SELECT
  u.username,
  e.event_name,
  ff.fight_id,
  ub.bet_type,
  CASE
    WHEN ub.bet_type = 'draw' THEN 'Empate'
    ELSE f.fighter_name
  END as prediction,
  ub.bet_amount,
  ub.odds_value,
  ub.potential_return
FROM user_bets ub
JOIN users u ON ub.user_id = u.user_id
JOIN dim_events e ON ub.event_id = e.event_id
JOIN fact_fights ff ON ub.fight_id = ff.fight_id
LEFT JOIN dim_fighters f ON ub.predicted_winner_id = f.fighter_id
WHERE ub.status = 'won'
ORDER BY ub.potential_return DESC;
```

## Sistema de Resultados y Clasificación

### Módulo de Ingreso de Resultados (Solo Administradores)

**Acceso:** `/fight-results` (requiere rol admin)

Permite a los administradores ingresar los resultados reales de las peleas después de que ocurren.

#### Funcionalidades:
- Selección de evento mediante dropdown
- Visualización de todas las peleas del evento con detalles:
  - Categoría (Title Fight, Main Card, Prelims)
  - Clase de peso
  - Peleadores (rojo vs azul)
  - Estado actual del resultado
- Tres opciones de resultado por pelea:
  - **Ganó Rojo**: Victoria del peleador rojo
  - **Empate**: La pelea terminó en empate
  - **Ganó Azul**: Victoria del peleador azul
- Actualización automática de apuestas al ingresar resultado:
  - Apuestas correctas: `status = 'won'`
  - Apuestas incorrectas: `status = 'lost'`

#### Endpoints Backend:
```
GET  /api/results/event/:eventId        - Obtener peleas con resultados del evento
POST /api/results/fight/:fightId        - Actualizar resultado de una pelea
     Body: { result_type: 'fighter_win'|'draw', winner_id: int|null }
```

#### Lógica de Actualización:
1. Admin selecciona resultado de pelea
2. Sistema actualiza `fact_fights.winner_id`
3. Sistema evalúa todas las apuestas de esa pelea:
   - Si resultado = fighter_win → marca apuestas con predicted_winner_id correcto como 'won'
   - Si resultado = draw → marca apuestas con bet_type='draw' como 'won'
   - Todas las demás apuestas se marcan como 'lost'

### Módulo de Clasificación (Todos los Usuarios)

**Acceso:** `/leaderboard` (disponible para todos los usuarios autenticados)

Muestra tablas de clasificación con dos vistas diferentes:

#### Vista Por Evento
**Restricción:** Solo disponible cuando `betting_enabled = FALSE` para el evento

Muestra clasificación de usuarios para un evento específico con:
- Posición (con medallas 🥇🥈🥉 para top 3)
- Usuario (con avatar, nickname y username)
- Total de apuestas realizadas
- Apuestas correctas
- Porcentaje de precisión
- **Ganancia neta** (criterio principal de ordenamiento)

#### Vista Anual
Muestra clasificación agregada de todos los eventos cerrados del año con:
- Todas las métricas de vista por evento
- Cantidad de eventos en los que participó
- Suma total de apuestas, aciertos y ganancias del año

#### Cálculo de Métricas:
```sql
-- Ganancia Neta
net_profit = SUM(
  CASE
    WHEN status = 'won' THEN potential_return - bet_amount
    WHEN status = 'lost' THEN -bet_amount
    ELSE 0
  END
)

-- Precisión
accuracy_percentage = (correct_bets / resolved_bets) * 100

-- Ganancias Totales
total_winnings = SUM(potential_return WHERE status = 'won')

-- Pérdidas Totales
total_losses = SUM(bet_amount WHERE status = 'lost')
```

#### Endpoints Backend:
```
GET /api/leaderboard/event/:eventId     - Clasificación por evento (solo si betting cerrado)
GET /api/leaderboard/year/:year         - Clasificación anual
GET /api/leaderboard/years              - Años disponibles con eventos cerrados
```

#### Criterios de Ordenamiento:
1. **Ganancia Neta** (descendente) - criterio principal
2. Apuestas Correctas (descendente)
3. Porcentaje de Precisión (descendente)

### Navegación

Los nuevos módulos están integrados en la navegación principal:

**Para todos los usuarios:**
- Dashboard → Botón "🏆 Clasificación"
- Barra de navegación superior → "Clasificación"

**Solo para administradores:**
- Dashboard → Botón "📝 Ingresar Resultados"
- Barra de navegación superior → "Resultados"

## Sistema de Limpieza de Apuestas (Solo Administradores)

### Módulo de Limpieza de Apuestas

**Acceso:** `/clear-bets` (requiere rol admin)

Permite a los administradores eliminar todas las apuestas de un evento específico y resetear los resultados de peleas.

#### Funcionalidades:
- Selección de evento mediante dropdown
- Visualización de detalles del evento:
  - Nombre y fecha del evento
  - Total de peleas
  - Cantidad de apuestas registradas
- Confirmación modal antes de eliminar
- Advertencias visuales sobre la irreversibilidad de la acción

#### Endpoint Backend:
```
DELETE /api/bets/event/:eventId/clear - Eliminar todas las apuestas del evento (admin only)
```

#### Proceso de Limpieza:
1. Cuenta total de apuestas del evento
2. Elimina todas las apuestas: `DELETE FROM user_bets WHERE event_id = ?`
3. Resetea resultados de peleas: `UPDATE fact_fights SET winner_id = NULL WHERE event_id = ?`
4. Retorna confirmación con cantidad de apuestas eliminadas

#### Casos de Uso:
- Resetear evento después de pruebas
- Corregir errores masivos en apuestas
- Preparar evento para nueva ronda de apuestas
- Limpiar datos de eventos de prueba

#### Seguridad:
- **Solo administradores:** Requiere autenticación + rol admin
- **Confirmación doble:** Modal de confirmación antes de ejecutar
- **Advertencias visuales:** Alertas rojas indicando irreversibilidad
- **Transaccional:** Usa transacciones de BD para garantizar atomicidad

#### Navegación:
**Solo para administradores:**
- Página Mantenedores → Botón "Limpiar Apuestas" en barra de navegación

## Próximos Pasos
1. Implementación del modelo de datos ✓ (completado)
2. Sistema de apuestas ✓ (completado)
3. Sistema de resultados y clasificación ✓ (completado)
4. Scripts de carga de datos (ETL)
5. Vistas y procedimientos almacenados para análisis
6. Reportes y estadísticas avanzadas
