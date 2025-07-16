# CHANCAFE Q - Sistema de Asesor de Ventas

Una aplicación móvil completa para asesoramiento de ventas con evaluación crediticia automática, diseñada para optimizar el proceso de cotización y gestión de clientes.

## 📱 Características Principales

- **Gestión de Clientes**: Registro y administración completa de clientes
- **Cotizaciones Inteligentes**: Generación automática de cotizaciones con evaluación crediticia
- **Evaluación Crediticia**: Integración con Sentinel Credit Bureau para análisis automático de riesgo
- **Catálogo de Productos**: Gestión completa de productos y categorías
- **Dashboard Analítico**: Vista general de métricas y estadísticas de ventas

## 🏗️ Arquitectura del Sistema

### Backend - API REST
- **Patrón**: Arquitectura modular por dominios
- **Capas**: Controllers → Services → Repository → Models
- **Autenticación**: JWT con middleware de autorización
- **Base de Datos**: MySQL con Sequelize ORM

### Frontend - Android Nativo
- **Patrón**: MVVM (Model-View-ViewModel)
- **Lenguaje**: Java
- **UI**: Material Design Components con View Binding
- **Arquitectura**: Clean Architecture con repositorios

## 🛠️ Stack Tecnológico

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | Latest | Runtime de JavaScript |
| **Express.js** | Latest | Framework web |
| **MySQL** | 8.0+ | Base de datos relacional |
| **Sequelize** | Latest | ORM para JavaScript |
| **JWT** | Latest | Autenticación y autorización |
| **bcrypt** | Latest | Encriptación de contraseñas |

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Android SDK** | API 25-35 | Plataforma móvil |
| **Java** | 8+ | Lenguaje de programación |
| **Material Design** | Latest | Sistema de diseño |
| **Retrofit** | 2.9+ | Cliente HTTP |
| **View Binding** | - | Vinculación de vistas |
| **ViewModel & LiveData** | - | Arquitectura MVVM |

### APIs Externas
| Servicio | Propósito |
|----------|-----------|
| **Sentinel Credit Bureau** | Evaluación crediticia automática |

## 🗄️ Base de Datos

### Modelo de Datos Principal

```sql
-- Usuarios del sistema
Users (id, username, email, password, role, created_at, updated_at)

-- Clientes con información crediticia
Clients (
  id, name, email, phone, address, dni, ruc,
  credit_score, risk_classification, total_debts,
  automatic_evaluation, suggested_credit_limit,
  is_banked, last_credit_check,
  created_at, updated_at
)

-- Productos del catálogo
Products (id, name, description, price, category_id, created_at, updated_at)
Categories (id, name, description, created_at, updated_at)

-- Cotizaciones con evaluación crediticia
Quotes (
  id, client_id, user_id, total_amount, status,
  credit_approved, credit_limit_used,
  created_at, updated_at
)

-- Items de cotización
QuoteItems (id, quote_id, product_id, quantity, unit_price, total_price)

-- Solicitudes de crédito
CreditRequests (id, client_id, amount, status, approved_at, created_at)
```

## 🏛️ Arquitectura Detallada

### Backend - Estructura Modular

```
backend/
├── auth/                    # Módulo de autenticación
│   ├── controllers/         # Manejo de requests HTTP
│   ├── services/           # Lógica de negocio
│   ├── repository/         # Acceso a datos
│   ├── routes/            # Definición de rutas
│   └── interfaces/        # DTOs y validación
├── clients/               # Gestión de clientes
├── quotes/                # Sistema de cotizaciones
├── products/              # Catálogo de productos
├── credit-requests/       # Solicitudes de crédito
├── external-apis/         # Integración Sentinel
└── shared/
    ├── models/            # Modelos Sequelize
    ├── config/            # Configuración DB
    ├── middlewares/       # Autenticación JWT
    └── utils/             # Utilidades comunes
```

### Frontend - Arquitectura MVVM

```
app/src/main/java/com/example/chancafe_q/
├── ui/                    # Capa de presentación
│   ├── login/             # Pantalla de login
│   ├── dashboard/         # Dashboard principal
│   ├── clients/           # Gestión de clientes
│   ├── quotes/            # Cotizaciones
│   └── products/          # Selección de productos
├── viewmodel/             # ViewModels (lógica de UI)
├── model/                 # Modelos de datos
├── repository/            # Repositorios de datos
├── data/
│   ├── local/             # Base de datos local (Room)
│   └── remote/            # Cliente API (Retrofit)
└── utils/                 # Configuración y utilidades
```

## 🔧 Configuración del Entorno

### Backend Setup

```bash
# Navegar al directorio backend
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.development

# Ejecutar migraciones
npm run migrate

# Iniciar en desarrollo
npm run start:dev
```

### Variables de Entorno Requeridas

```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
USERDB=your_db_user
PASSWORD=your_db_password
MASTER_DB=chancafe_db

# Seguridad
JWT_SECRET=your_super_secret_jwt_key

# Servidor
PORT=3000

# Sentinel API
SENTINEL_API_URL=https://sentinel-api-5c7y.vercel.app
SENTINEL_API_TIMEOUT=10000
SENTINEL_API_RETRY_ATTEMPTS=3
SENTINEL_CACHE_TTL=3600
```

### Frontend Setup

```bash
# Navegar al directorio frontend
cd frontend

# Construir proyecto
./gradlew build

# Instalar en dispositivo/emulador
./gradlew installDebug

# Ejecutar pruebas
./gradlew test
```

### Configuración de Entornos Android

Editar `Configuration.java` para cambiar entre entornos:

```java
// Cambiar esta línea según el entorno deseado
private static final Environment CURRENT_ENVIRONMENT = Environment.DEVELOPMENT;

// Opciones disponibles:
// Environment.DEVELOPMENT  - Local/Cloudflare tunnel
// Environment.STAGING      - https://staging.chancafe.com/api/
// Environment.PRODUCTION   - https://api.chancafe.com/api/
```

## 🔌 APIs y Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/profile` - Obtener perfil

### Clientes
- `GET /api/clients` - Listar clientes
- `POST /api/clients` - Crear cliente
- `PUT /api/clients/:id` - Actualizar cliente
- `GET /api/clients/:id` - Obtener cliente específico

### Cotizaciones
- `GET /api/quotes` - Listar cotizaciones
- `POST /api/quotes` - Crear cotización
- `POST /api/quotes/with-credit-check` - Cotización con evaluación crediticia
- `GET /api/quotes/:id/credit-info` - Información crediticia de cotización

### Productos
- `GET /api/products` - Listar productos
- `GET /api/categories` - Listar categorías

### Evaluación Crediticia (Sentinel Integration)
- `POST /api/quotes/client/:clientId/credit-check` - Evaluación manual
- `GET /api/quotes/client/:clientId/credit-assessment` - Obtener evaluación

## 💳 Sistema de Evaluación Crediticia

### Reglas de Negocio Sentinel

| Score Range | Clasificación | Límite de Crédito | Estado Bancario |
|-------------|---------------|-------------------|------------------|
| 750+ | BAJO | Hasta S/50,000 | Bancarizado |
| 650-749 | MEDIO | Hasta S/30,000 | Bancarizado |
| 550-649 | ALTO | Hasta S/20,000 | Bancarizado |
| 450-549 | ALTO | Hasta S/10,000 | Bancarizado |
| <450 | MUY_ALTO | Rechazado | No bancarizado |

### Cache Strategy
- **Consultas rápidas**: 30 minutos TTL
- **Reportes detallados**: 60 minutos TTL
- **Prevención de llamadas redundantes** a la API externa

## 🚀 Comandos de Desarrollo

### Backend
```bash
npm start              # Producción
npm run start:dev      # Desarrollo
npm run start:qa       # QAS
npm run migrate        # Migraciones DB
npm test              # Pruebas (pendiente configurar)
```

### Frontend
```bash
./gradlew build                    # Compilar proyecto
./gradlew installDebug            # Instalar versión debug
./gradlew clean                   # Limpiar build
./gradlew test                    # Pruebas unitarias
./gradlew connectedAndroidTest    # Pruebas instrumentadas
./gradlew assembleRelease         # Build de producción
./gradlew lint                    # Análisis de código
```

## 🔐 Seguridad

### Backend
- **JWT Authentication** con middleware personalizado
- **Bcrypt** para hash de contraseñas
- **Role-based access control** (Admin/User)
- **Input validation** via DTOs
- **Environment variables** para datos sensibles

### Frontend
- **Token storage** seguro en SharedPreferences
- **HTTPS** para todas las comunicaciones
- **Certificate pinning** (recomendado para producción)

## 📊 Patrones de Diseño Implementados

### Backend
- **Repository Pattern** - Abstracción de acceso a datos
- **Factory Pattern** - `routerFactory.js` para creación de rutas
- **Middleware Pattern** - Autenticación y autorización
- **Circuit Breaker** - Para APIs externas (Sentinel)

### Frontend
- **MVVM** - Separación de lógica de negocio y UI
- **Repository Pattern** - Abstracción de fuentes de datos
- **Observer Pattern** - LiveData para reactividad
- **Singleton Pattern** - Configuración de entornos

## 🧪 Testing (En Desarrollo)

### Backend
- Framework de testing pendiente de configuración
- Estructura preparada para Jest/Mocha
- Endpoints documentados para testing manual con Postman

### Frontend
- Tests unitarios con JUnit configurados
- Tests instrumentados con Espresso preparados
- Comandos Gradle listos para ejecución

## 📱 Credenciales de Prueba

**Usuario administrador:**
- Username: `admin`
- Password: `123456`

## 📊 **Estado de Implementación**

### **✅ MÓDULOS COMPLETADOS**

#### **🔧 Backend Infrastructure (100%)**
- ✅ API REST Node.js/Express con MySQL
- ✅ Sistema de autenticación JWT con roles
- ✅ Configuración multi-entorno (dev/qa/prod)
- ✅ Manejo estandarizado de respuestas
- ✅ Documentación completa con 80+ endpoints

#### **📱 Frontend Infrastructure (95%)**
- ✅ Arquitectura MVVM con ViewModels
- ✅ Cliente Retrofit multi-entorno
- ✅ Material Design con View Binding
- ✅ Autenticación JWT integrada

#### **👥 Gestión de Clientes (100%)**
- ✅ **Backend**: API CRUD completa
- ✅ **Frontend**: UI completa implementada
- ✅ Búsqueda y filtros avanzados
- ✅ Gestión de estados y límites crediticios

#### **📦 Gestión de Productos (95%)**
- ✅ **Backend**: API completa con categorías
- ✅ **Frontend**: Catálogo con filtros
- ✅ Selector de productos para cotizaciones

#### **📄 Cotizaciones (98%)**
- ✅ **Backend**: API completa con integración crediticia
- ✅ **Frontend**: UI completa implementada
- ✅ Creación/edición con items dinámicos
- ✅ Integración con evaluación crediticia
- ✅ Workflow de estados y aprobaciones

#### **💳 Evaluación Crediticia (100% Backend, 85% Frontend)**
- ✅ **Backend**: Integración Sentinel completa
- ✅ Cache inteligente y circuit breaker
- ✅ **Frontend**: Displays de score y clasificación
- 🚧 Visualización detallada de historial

### **🚧 PENDIENTES MENORES**

#### **📱 Módulos Administrativos**
- ❌ **Gestión de Categorías**: UI administrativa
- ❌ **Gestión de Proveedores**: Interfaz de administración
- ❌ **Perfil de Usuario**: Edición de perfil
- ❌ **Configuraciones**: Preferencias de aplicación

#### **🔧 Funcionalidades Avanzadas**
- ❌ **Reportes y Analytics**: Dashboard con insights
- ❌ **Notificaciones Push**: Sistema de notificaciones
- ❌ **Capacidades Offline**: Sincronización local
- ❌ **Testing**: Implementación de pruebas unitarias

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📝 Notas de Desarrollo

- **Timezone**: America/Lima (-05:00)
- **Base de datos**: Usar `alter: true` solo en desarrollo
- **Logs**: Implementar logging estructurado para producción
- **Monitoreo**: Preparado para integración con herramientas de APM

## 📄 Licencia

Este proyecto es desarrollado para fines académicos en el marco del curso "Taller de Desarrollo de Aplicaciones Móviles".

---

**Desarrollado para:** Curso de Aplicaciones Móviles  
**Institución:** Facultad de Ingeniería, Arquitectura y Urbanismo - Ingeniería de Sistemas  
**Estado:** Proyecto funcional con módulos core implementados