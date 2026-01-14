# UFC Predictions API

API Backend para sistema de pronósticos de peleas UFC.

## Stack Tecnológico

- **Backend**: Node.js + Express
- **Base de datos**: MySQL 8.0
- **Autenticación**: JWT (JSON Web Tokens)
- **Seguridad**: bcryptjs para hash de contraseñas

## Estructura del Proyecto

```
UFC/
├── src/
│   ├── config/          # Configuración (DB, JWT)
│   ├── controllers/     # Lógica de negocio
│   ├── middleware/      # Middleware (autenticación, etc)
│   ├── models/          # Modelos de datos
│   ├── routes/          # Definición de rutas
│   ├── utils/           # Utilidades
│   └── app.js          # Punto de entrada
├── schema.sql          # Esquema de base de datos
├── seed_data.sql       # Datos de prueba
├── .env.example        # Ejemplo de variables de entorno
└── package.json        # Dependencias
```

## Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar base de datos

Crear la base de datos usando el archivo `schema.sql`:

```bash
mysql -u root -p < schema.sql
```

Opcionalmente, cargar datos de prueba:

```bash
mysql -u root -p ufc_analytics < seed_data.sql
```

### 3. Configurar variables de entorno

Copiar el archivo `.env.example` a `.env` y configurar las variables:

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=ufc_analytics
JWT_SECRET=tu_clave_secreta_super_segura
JWT_EXPIRES_IN=7d
```

### 4. Ejecutar el servidor

Modo desarrollo (con nodemon):
```bash
npm run dev
```

Modo producción:
```bash
npm start
```

## API Endpoints

### Autenticación

#### Registro de usuario
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepass123",
  "country_id": 1
}
```

**Respuesta exitosa (201)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "user_id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "country_id": 1,
      "country_name": "United States",
      "country_code": "USA",
      "total_points": 0,
      "created_at": "2024-01-14T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "user_id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "total_points": 150
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Obtener perfil de usuario (requiere autenticación)
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "country_name": "United States",
    "total_points": 150,
    "created_at": "2024-01-14T10:30:00.000Z"
  }
}
```

## Autenticación

La API usa JWT (JSON Web Tokens) para autenticación. Después de hacer login o registro, recibirás un token que debes incluir en el header `Authorization` de las peticiones protegidas:

```
Authorization: Bearer <tu_token_aqui>
```

El token expira en 7 días por defecto (configurable en `.env`).

## Base de Datos

### Tablas principales del sistema de usuarios:

- **users**: Usuarios de la plataforma
- **predictions**: Pronósticos de usuarios por pelea
- **betting_odds**: Cuotas de apuesta por pelea y peleador

### Modelo de datos UFC:

- **dim_fighters**: Información de peleadores
- **dim_events**: Eventos UFC
- **fact_fights**: Peleas y estadísticas
- **dim_weight_classes**: Categorías de peso
- Y más...

## Próximos Pasos

Funcionalidades a implementar:

1. **Sistema de pronósticos**
   - Crear pronósticos para peleas
   - Ver pronósticos de otros usuarios
   - Calcular puntos ganados

2. **Tabla de clasificación**
   - Ranking global
   - Ranking por evento
   - Estadísticas personales

3. **Gestión de eventos**
   - Listar próximos eventos
   - Ver detalles de peleas
   - Información de peleadores

4. **Sistema de apuestas ficticias** (Fase 2)
   - Monedas virtuales
   - Gestión de bankroll
   - ROI tracking

## Desarrollo

Para instalar dependencias de desarrollo:

```bash
npm install --save-dev nodemon
```

Ejecutar en modo desarrollo con recarga automática:

```bash
npm run dev
```

## Despliegue Gratuito

Opciones recomendadas según el stack:

- **Backend**: Railway.app, Render.com
- **Base de datos**: PlanetScale (5GB gratis)

## Licencia

MIT
