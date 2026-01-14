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

## Próximos Pasos
1. Implementación del modelo de datos ✓ (en revisión)
2. Scripts de carga de datos (ETL)
3. Vistas y procedimientos almacenados para análisis
4. API de acceso a datos
5. Dashboards y visualizaciones
