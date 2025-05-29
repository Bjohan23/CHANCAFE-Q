# CHANCAFE Q - Backend API

Backend desarrollado con Node.js, Express y MySQL para el sistema de gestión de CHANCAFE Q.

## 🏗️ Arquitectura

El proyecto sigue una arquitectura de capas (Screaming Architecture) organizada por dominio funcional:

```
backend/
├── src/
│   ├── config/          # Configuración de BD y variables
│   ├── controllers/     # Lógica de control de rutas
│   ├── middlewares/     # Middleware de auth, errores, etc.
│   ├── models/          # Modelos de Sequelize
│   ├── repositories/    # Lógica de acceso a datos
│   ├── routes/          # Rutas del API por recurso
│   ├── services/        # Lógica de negocio
│   ├── utils/           # Funciones utilitarias
│   └── app.js           # Configuración principal de Express
├── .env                 # Variables de entorno
├── .gitignore
├── package.json
└── server.js            # Servidor principal
```

## 🚀 Instalación y Configuración

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   Edita el archivo `.env` con tus datos:
   ```env
   NODE_ENV=development
   PORT=3000
   HOST=localhost
   
   # Base de datos
   DB_HOST=localhost
   DB_USER=tu_usuario
   DB_PASSWORD=tu_password
   DB_NAME=chancafe_q
   DB_PORT=3306
   
   # JWT
   JWT_SECRET=tu_secret_muy_seguro
   JWT_EXPIRES_IN=24h
   JWT_REFRESH_SECRET=tu_refresh_secret
   JWT_REFRESH_EXPIRES_IN=7d
   
   # CORS
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
   ```

3. **Crear la base de datos:**
   ```bash
   npm run db:create
   ```

4. **Ejecutar migraciones (si las tienes):**
   ```bash
   npm run db:migrate
   ```

## 🏃 Ejecución

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

## 📡 Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Usuarios
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Productos
- `GET /api/products` - Listar productos
- `POST /api/products` - Crear producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

### Clientes
- `GET /api/clients` - Listar clientes
- `POST /api/clients` - Crear cliente
- `PUT /api/clients/:id` - Actualizar cliente
- `GET /api/clients/:id/quotes` - Cotizaciones del cliente

### Cotizaciones
- `GET /api/quotes` - Listar cotizaciones
- `POST /api/quotes` - Crear cotización
- `PUT /api/quotes/:id` - Actualizar cotización
- `PATCH /api/quotes/:id/status` - Cambiar estado

### Solicitudes de Crédito
- `GET /api/credit-requests` - Listar solicitudes
- `POST /api/credit-requests` - Crear solicitud
- `PATCH /api/credit-requests/:id/approve` - Aprobar
- `PATCH /api/credit-requests/:id/reject` - Rechazar

### Estado del API
- `GET /api/status` - Estado de la API (público)
- `GET /health` - Health check

## 🔐 Autenticación

Todas las rutas están protegidas con JWT excepto:
- `GET /api/status`
- `GET /health`  
- `POST /api/auth/login`
- `POST /api/auth/register`

Incluye el token en el header:
```
Authorization: Bearer tu_jwt_token
```

## 🛠️ Scripts Disponibles

- `npm start` - Ejecutar en producción
- `npm run dev` - Ejecutar en desarrollo con nodemon
- `npm run db:create` - Crear base de datos
- `npm run db:migrate` - Ejecutar migraciones
- `npm run lint` - Linter de código
- `npm test` - Ejecutar tests

## 📋 Estados de Respuesta

### Éxito
```json
{
  "success": true,
  "data": { ... },
  "message": "Operación exitosa"
}
```

### Error
```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": [ ... ]
}
```

## 🔧 Tecnologías Utilizadas

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **Sequelize** - ORM para MySQL
- **MySQL** - Base de datos
- **JWT** - Autenticación
- **Bcrypt** - Encriptación de contraseñas
- **Helmet** - Seguridad
- **CORS** - Cross-Origin Resource Sharing
- **Morgan** - Logging de HTTP

---
**Desarrollado para CHANCAFE Q** 🚀
