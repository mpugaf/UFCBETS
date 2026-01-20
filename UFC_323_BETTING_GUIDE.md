# UFC 323 Betting System - Guía Completa

## Descripción General

Sistema completo de apuestas para eventos UFC con soporte para:
- ✅ Clasificación de peleas por categorías (Preliminares, Estelares, Título)
- ✅ Apuestas por peleador o empate (odds de empate: 10.00)
- ✅ Imágenes clickeables de peleadores
- ✅ Vista de eventos disponibles (futuros y pasados)
- ✅ Historial de apuestas organizadas por evento

## Características Nuevas

### Backend
1. **Tabla de Categorías de Peleas** (`dim_fight_categories`)
   - Preliminares (preliminary)
   - Cartelera Estelar (main_card)
   - Pelea por el Título (title_fight)

2. **Endpoints Nuevos**
   - `GET /api/bets/events` - Lista todos los eventos con estadísticas
   - `GET /api/bets/available` - Peleas disponibles organizadas por categoría
   - `GET /api/bets/my-bets?event_id=X` - Historial de apuestas por evento

3. **Modelo FightCategory**
   - Gestiona categorías y organiza peleas por tipo

### Frontend
1. **Página de Eventos** (`/events`)
   - Lista todos los eventos UFC
   - Filtros: Todos, Próximos, Pasados
   - Estadísticas por evento

2. **Página de Apuestas Mejorada** (`/betting`)
   - Peleas organizadas por categoría
   - Imágenes clickeables de peleadores
   - Checkbox de empate con odds 10.00
   - Vista en tres columnas: Peleador Rojo | Empate | Peleador Azul

3. **Componentes Actualizados**
   - `FightCard` - Soporta nueva estructura de datos
   - `BetOption` - Imágenes clickeables con odds
   - `EventsList` - Nueva página de eventos

## Instalación y Configuración

### 1. Aplicar Migraciones y Cargar Datos

```bash
# Opción 1: Usar el script automatizado
./apply_updates.sh

# Opción 2: Aplicar manualmente
mysql -u root -p ufc_analytics < migrations/2026-01-14-fight-categories.sql
mysql -u root -p ufc_analytics < seed_ufc_323_updated.sql
```

### 2. Verificar Datos Cargados

```sql
USE ufc_analytics;

-- Ver categorías creadas
SELECT * FROM dim_fight_categories;

-- Ver peleas de UFC 323 con categorías
SELECT
    fc.category_name,
    CONCAT(fr.fighter_name, ' vs ', fb.fighter_name) as Fight,
    wc.class_name as Weight_Class
FROM fact_fights f
JOIN dim_fighters fr ON f.fighter_red_id = fr.fighter_id
JOIN dim_fighters fb ON f.fighter_blue_id = fb.fighter_id
LEFT JOIN dim_weight_classes wc ON f.weight_class_id = wc.weight_class_id
LEFT JOIN dim_fight_categories fc ON f.fight_category_id = fc.category_id
WHERE f.event_id = (SELECT event_id FROM dim_events WHERE event_name = 'UFC 323: Test Event')
ORDER BY fc.display_order DESC, f.card_position ASC;

-- Ver odds de empate (deben ser 10.00)
SELECT
    f.fight_id,
    CONCAT(fr.fighter_name, ' vs ', fb.fighter_name) as Fight,
    bo.decimal_odds as Draw_Odds
FROM fact_fights f
JOIN dim_fighters fr ON f.fighter_red_id = fr.fighter_id
JOIN dim_fighters fb ON f.fighter_blue_id = fb.fighter_id
JOIN betting_odds bo ON f.fight_id = bo.fight_id
WHERE bo.outcome_type = 'draw'
  AND f.event_id = (SELECT event_id FROM dim_events WHERE event_name = 'UFC 323: Test Event');
```

### 3. Iniciar Servidores

```bash
# Terminal 1: Backend
cd /home/mpuga/projects/UFC
node src/app.js

# Terminal 2: Frontend
cd /home/mpuga/projects/UFC/frontend
npm run dev
```

## Uso del Sistema

### Para Usuarios (No Admin)

1. **Login**
   - Accede con tus credenciales
   - Serás redirigido al Dashboard

2. **Ver Eventos** (`/events`)
   - Click en "📅 Ver Eventos" desde el Dashboard
   - Verás todos los eventos UFC disponibles
   - Eventos próximos: Disponibles para apostar
   - Eventos pasados: Ver tus apuestas

3. **Realizar Apuestas** (`/betting`)
   - Click en "🎲 Realizar Apuestas" o selecciona un evento próximo
   - Las peleas están organizadas por:
     - 🏆 Pelea por el Título
     - ⭐ Cartelera Estelar
     - 🥊 Preliminares

   **Cómo apostar:**
   - **Opción 1:** Click en la imagen del peleador que crees que ganará
   - **Opción 2:** Click en el ícono de empate (⚖️) si crees que será empate
   - Verás las odds y la ganancia potencial
   - Monto de apuesta: 100 puntos (fijo por pelea)

4. **Enviar Apuestas**
   - Selecciona múltiples peleas
   - Click en "Enviar Todas las Apuestas" en la barra inferior
   - Se procesarán todas tus selecciones

5. **Ver Mis Apuestas** (`/my-bets`)
   - Organizado por evento
   - Muestra: tu predicción, resultado real, puntos ganados
   - Filtra por evento específico usando `?event_id=X`

### Estructura de Datos de UFC 323

**Evento:** UFC 323: Test Event
- **Fecha:** 15 de febrero de 2026
- **Lugar:** T-Mobile Arena, Las Vegas

**Peleas:**
1. **🏆 Pelea por el Título**
   - Peleador 1 vs Peleador 2 (Lightweight)
   - 5 rounds
   - Odds: 1.85 / 2.10 / 10.00 (empate)

2. **⭐ Co-Main Event**
   - Peleador 3 vs Peleador 4 (Welterweight)
   - Odds: 1.65 / 2.35 / 10.00 (empate)

3-4. **⭐ Main Card**
   - Peleador 5 vs Peleador 6 (Middleweight)
   - Peleador 7 vs Peleador 8 (Featherweight)

5-6. **🥊 Preliminares**
   - Peleador 9 vs Peleador 10 (Heavyweight)
   - Peleador 11 vs Peleador 12 (Bantamweight)

## Estructura de Base de Datos

### Nuevas Tablas

```sql
-- Categorías de peleas
CREATE TABLE dim_fight_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL UNIQUE,
    category_code VARCHAR(20) NOT NULL UNIQUE,
    display_order INT NOT NULL,
    description VARCHAR(255)
);

-- Campos agregados a fact_fights
ALTER TABLE fact_fights
ADD COLUMN fight_category_id INT NULL,
ADD COLUMN card_position INT DEFAULT 0;
```

### Odds de Empate

```sql
-- Estructura de betting_odds
CREATE TABLE betting_odds (
    odds_id INT AUTO_INCREMENT PRIMARY KEY,
    fight_id INT NOT NULL,
    fighter_id INT NULL, -- NULL para empates
    decimal_odds DECIMAL(5,2),
    outcome_type ENUM('fighter', 'draw'),
    FOREIGN KEY (fight_id) REFERENCES fact_fights(fight_id),
    FOREIGN KEY (fighter_id) REFERENCES dim_fighters(fighter_id)
);
```

## API Endpoints

### Eventos
```
GET /api/bets/events
Response:
{
  "success": true,
  "data": [
    {
      "event_id": 1,
      "event_name": "UFC 323: Test Event",
      "event_date": "2026-02-15",
      "total_fights": 6,
      "pending_fights": 6,
      "user_bets": 0,
      "event_status": "upcoming"
    }
  ]
}
```

### Peleas Disponibles
```
GET /api/bets/available
Response:
{
  "success": true,
  "data": {
    "betting_enabled": true,
    "event": { ... },
    "categories": [
      {
        "category_name": "Pelea por el Título",
        "category_code": "title_fight",
        "fights": [
          {
            "fight_id": 1,
            "red_fighter": {
              "fighter_id": 1,
              "fighter_name": "Fighter 1",
              "image_path": "/uploads/fighters/...",
              "odds": 1.85
            },
            "blue_fighter": { ... },
            "draw_odds": 10.00
          }
        ]
      }
    ]
  }
}
```

### Enviar Apuestas
```
POST /api/bets/submit-all
Body:
{
  "bets": [
    {
      "fight_id": 1,
      "bet_type": "fighter_win",
      "predicted_winner_id": 123,
      "odds_value": 1.85
    },
    {
      "fight_id": 2,
      "bet_type": "draw",
      "predicted_winner_id": null,
      "odds_value": 10.00
    }
  ]
}
```

## Troubleshooting

### Las apuestas no aparecen
```sql
-- Verificar que betting está habilitado
SELECT * FROM app_config WHERE config_key = 'betting_enabled';
-- Debe ser 'true'

-- Verificar evento actual
SELECT * FROM app_config WHERE config_key = 'current_event_id';
-- Debe apuntar al event_id de UFC 323
```

### Las categorías no se muestran
```sql
-- Verificar categorías
SELECT * FROM dim_fight_categories;

-- Verificar que las peleas tienen categoría asignada
SELECT fight_id, fight_category_id FROM fact_fights WHERE event_id = X;
```

### Los odds de empate no son 10.00
```sql
-- Actualizar odds de empate
UPDATE betting_odds
SET decimal_odds = 10.00
WHERE outcome_type = 'draw';
```

## Arquitectura del Sistema

```
Backend (Node.js/Express)
├── models/
│   ├── FightCategory.js (NUEVO)
│   └── ...
├── controllers/
│   └── betsController.js (ACTUALIZADO)
│       ├── getAllEvents() (NUEVO)
│       ├── getAvailableFights() (MEJORADO)
│       └── getUserBets() (MEJORADO)
└── routes/
    └── betsRoutes.js (ACTUALIZADO)

Frontend (React)
├── pages/
│   ├── EventsList.jsx (NUEVO)
│   ├── Betting.jsx (ACTUALIZADO)
│   ├── Dashboard.jsx (ACTUALIZADO)
│   └── ...
└── components/
    ├── FightCard.jsx (ACTUALIZADO)
    └── BetOption.jsx (Ya existente)

Database (MySQL)
├── dim_fight_categories (NUEVO)
├── fact_fights (ACTUALIZADO: +fight_category_id, +card_position)
└── betting_odds (Ya soporta empates)
```

## Próximos Pasos Sugeridos

1. **Imágenes de Peleadores**
   - Cargar imágenes reales en `/uploads/fighters/`
   - Actualizar `dim_fighters.image_path`

2. **Resultados de Peleas**
   - Actualizar `fact_fights.winner_id` después del evento
   - El sistema calculará automáticamente puntos ganados

3. **Configuración de Odds**
   - Las odds de empate se pueden ajustar por pelea
   - Por defecto: 10.00 (configurable)

## Contacto y Soporte

Para problemas o preguntas:
1. Revisa esta guía completa
2. Verifica los logs del backend y frontend
3. Consulta la sección de Troubleshooting

---

**Última actualización:** 14 de enero de 2026
**Versión:** 1.0
