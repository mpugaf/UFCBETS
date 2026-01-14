# 🥊 UFC Predictions - Aplicación Lista

## ✅ Servidores Corriendo

### Backend API
- **URL Local**: http://localhost:3021
- **URL Red**: http://192.168.100.16:3021
- **Estado**: ✓ Conectado a MySQL (192.168.100.16:3306)

### Frontend React
- **URL Local**: http://localhost:5173
- **URL Red**: http://192.168.100.16:5173
- **Estado**: ✓ Servidor Vite corriendo

## 🔑 Usuario de Prueba

Ya existe un usuario creado que puedes usar para probar:

```
Email: test@example.com
Password: password123
```

## 🌐 Acceso desde Windows

Puedes acceder a la aplicación desde cualquier dispositivo en tu red:

**Frontend**: http://192.168.100.16:5173

La pantalla de login te permitirá:
1. **Iniciar sesión** con el usuario de prueba
2. **Registrar** un nuevo usuario
3. Ver el **Dashboard** después de autenticarte

## 📱 Funcionalidades Implementadas

### ✓ Autenticación Completa
- ✅ Login de usuario
- ✅ Registro de usuario
- ✅ JWT Tokens (expiran en 7 días)
- ✅ Protección de rutas
- ✅ Validación de formularios
- ✅ Manejo de errores

### ✓ Dashboard
- ✅ Información del usuario
- ✅ Estadísticas básicas
- ✅ Perfil de usuario
- ✅ Botón de cerrar sesión

### ✓ Diseño
- ✅ TailwindCSS
- ✅ Diseño responsive (móvil y desktop)
- ✅ Gradientes y efectos modernos
- ✅ Animaciones suaves

## 🎨 Capturas de lo que verás

### Pantalla de Login
- Tabs para cambiar entre Login y Registro
- Campos validados
- Mensajes de error claros
- Botón con estado de carga
- Sugerencia del usuario de prueba

### Dashboard
- Header con nombre de usuario y puntos
- Tarjetas de estadísticas
- Información completa del perfil
- Sección "Próximamente" con funcionalidades futuras

## 🚀 Próximos Pasos (según stack.txt)

### Fase MVP:
1. **Sistema de pronósticos**
   - Seleccionar ganador de pelea
   - Elegir método de victoria
   - Predecir ronda de finalización

2. **Cálculo de puntos**
   - +10 pts por ganador correcto
   - +5 pts por método correcto
   - +3 pts por ronda exacta
   - Multiplicador por odds

3. **Tabla de clasificación**
   - Ranking global
   - Puntos por evento
   - Estadísticas personales

### Fase 2:
- Sistema de apuestas ficticias
- Ligas privadas entre amigos
- Chat por evento

## 🛠️ Comandos Útiles

### Backend
```bash
cd /home/mpuga/projects/UFC
npm run dev        # Modo desarrollo
npm start          # Modo producción
```

### Frontend
```bash
cd /home/mpuga/projects/UFC/frontend
npm run dev        # Modo desarrollo
npm run build      # Build para producción
```

## 📂 Estructura del Proyecto

```
UFC/
├── backend/
│   ├── src/
│   │   ├── config/       # Database, JWT
│   │   ├── controllers/  # AuthController
│   │   ├── middleware/   # JWT middleware
│   │   ├── models/       # User model
│   │   ├── routes/       # Auth routes
│   │   ├── utils/        # JWT utils
│   │   └── app.js        # Server
│   ├── schema.sql        # Database schema
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/   # (vacío por ahora)
    │   ├── context/      # AuthContext
    │   ├── pages/        # AuthPage, Dashboard
    │   ├── services/     # API axios
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

## 🔐 Seguridad

- ✅ Contraseñas hasheadas con bcryptjs (10 rounds)
- ✅ JWT con secret key
- ✅ Tokens expiran en 7 días
- ✅ Validación de entrada en backend
- ✅ CORS configurado
- ✅ Manejo de errores 401

## 🌟 Características del Diseño

- **Gradiente de fondo**: Púrpura a índigo
- **Tarjetas con efecto glass**: backdrop-blur
- **Sombras suaves**: shadow-2xl
- **Animaciones**: transitions suaves
- **Responsive**: Mobile-first
- **Iconos**: Emojis para mayor atractivo visual

## 📝 Notas Importantes

1. Los servidores están corriendo en segundo plano
2. Nodemon recarga automáticamente el backend al cambiar código
3. Vite recarga automáticamente el frontend (HMR)
4. Los tokens se guardan en localStorage
5. La base de datos ya tiene el usuario de prueba

## 🎯 Prueba Ahora

1. Abre en tu navegador: **http://192.168.100.16:5173**
2. Usa las credenciales de prueba o registra un nuevo usuario
3. Explora el dashboard

¡Disfruta la aplicación! 🥊
