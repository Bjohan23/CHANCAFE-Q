# 📨 CHANCAFE Q - Colección de Postman

Esta colección contiene todos los endpoints de la API de CHANCAFE Q organizados por módulos para facilitar las pruebas.

## 🚀 Importar la Colección

1. **Abrir Postman**
2. **Importar Colección:**
   - Click en "Import" 
   - Seleccionar `CHANCAFE-Q.postman_collection.json`
   - Click en "Import"

3. **Importar Entorno:**
   - Click en "Import"
   - Seleccionar `CHANCAFE-Q.postman_environment.json`
   - Click en "Import"
   - Seleccionar el entorno "CHANCAFE-Q Development" en el dropdown

## 🔧 Configuración Inicial

### Variables de Entorno
- `base_url`: `http://localhost:3000/api`
- `server_url`: `http://localhost:3000`
- `admin_email`: Email del administrador
- `admin_password`: Contraseña del administrador
- `authToken`: Se configura automáticamente después del login
- `refreshToken`: Se configura automáticamente después del login

### Modificar URLs para otros entornos:
```
Desarrollo:   http://localhost:3000/api
Testing:      https://api-test.chancafe.com/api
Producción:   https://api.chancafe.com/api
```

## 🏗️ Estructura de la Colección

### 🔍 Status & Health
- `GET /api/status` - Estado de la API (público)
- `GET /health` - Health check del servidor

### 🔐 Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/refresh-token` - Renovar token
- `GET /api/auth/me` - Obtener perfil actual
- `POST /api/auth/change-password` - Cambiar contraseña
- `POST /api/auth/logout` - Cerrar sesión

### 👥 Usuarios
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario
- `PATCH /api/users/:id/status` - Cambiar estado

### 📦 Productos
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Obtener producto
- `POST /api/products` - Crear producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto
- `PATCH /api/products/:id/status` - Cambiar estado

### 👤 Clientes
- `GET /api/clients` - Listar clientes
- `GET /api/clients/:id` - Obtener cliente
- `POST /api/clients` - Crear cliente
- `PUT /api/clients/:id` - Actualizar cliente
- `DELETE /api/clients/:id` - Eliminar cliente
- `PATCH /api/clients/:id/status` - Cambiar estado
- `GET /api/clients/:id/quotes` - Cotizaciones del cliente

### 🏷️ Categorías
- `GET /api/categories` - Listar categorías
- `GET /api/categories/:id` - Obtener categoría
- `POST /api/categories` - Crear categoría
- `PUT /api/categories/:id` - Actualizar categoría
- `DELETE /api/categories/:id` - Eliminar categoría
- `GET /api/categories/:id/products` - Productos de categoría

### 📄 Cotizaciones
- `GET /api/quotes` - Listar cotizaciones
- `GET /api/quotes/:id` - Obtener cotización
- `POST /api/quotes` - Crear cotización
- `PUT /api/quotes/:id` - Actualizar cotización
- `PATCH /api/quotes/:id/status` - Cambiar estado

### 💰 Solicitudes de Crédito
- `GET /api/credit-requests` - Listar solicitudes
- `GET /api/credit-requests/stats` - Estadísticas
- `GET /api/credit-requests/:id` - Obtener solicitud
- `POST /api/credit-requests` - Crear solicitud
- `PUT /api/credit-requests/:id` - Actualizar solicitud
- `PATCH /api/credit-requests/:id/approve` - Aprobar
- `PATCH /api/credit-requests/:id/reject` - Rechazar

## 🔑 Autenticación

### Paso 1: Hacer Login
1. Ir a la carpeta "🔐 Autenticación"
2. Ejecutar "Login" con credenciales válidas
3. El token se guardará automáticamente en `authToken`

### Paso 2: Usar Endpoints Protegidos
Todos los endpoints (excepto `/status` y `/health`) requieren el header:
```
Authorization: Bearer {{authToken}}
```

**Nota:** Este header ya está configurado automáticamente en todos los endpoints que lo requieren.

## 📝 Ejemplos de Uso

### 1. Crear una Cotización Completa
```json
{
    "client_id": 1,
    "items": [
        {
            "product_id": 1,
            "quantity": 5
        },
        {
            "product_id": 2,
            "quantity": 10
        }
    ],
    "discount": 5,
    "tax_rate": 18,
    "notes": "Cotización para pedido mensual"
}
```

### 2. Crear Cliente
```json
{
    "name": "Juan Carlos Rodríguez",
    "email": "juan.rodriguez@empresa.com",
    "phone": "987654321",
    "company": "Empresa ABC S.A.C.",
    "address": "Av. Principal 123, Lima",
    "document_type": "RUC",
    "document_number": "20123456789",
    "credit_limit": 5000.00,
    "active": true
}
```

### 3. Crear Producto
```json
{
    "name": "Café Premium",
    "description": "Café de alta calidad cultivado en las montañas",
    "unit_price": 25.50,
    "category_id": 1,
    "stock_quantity": 100,
    "min_stock": 10,
    "unit_of_measure": "kg",
    "active": true
}
```

## 🧪 Tests Automáticos

Cada endpoint incluye tests automáticos que verifican:
- ✅ Código de estado HTTP correcto
- ✅ Estructura de respuesta válida
- ✅ Tiempo de respuesta menor a 2 segundos
- ✅ Guardado automático de tokens

### Ver Resultados de Tests
1. Ejecutar cualquier request
2. Ir a la pestaña "Test Results"
3. Ver los tests que pasaron/fallaron

## 🔄 Workflow Recomendado

### Para Testing Manual:
1. **Status Check** - Verificar que la API esté funcionando
2. **Login** - Autenticarse
3. **Crear Datos Base** - Categorías, Productos, Clientes
4. **Crear Cotizaciones** - Con los datos creados
5. **Gestionar Créditos** - Solicitudes y aprobaciones

### Para Testing Automatizado:
1. Ejecutar toda la colección con "Run Collection"
2. Configurar el orden de ejecución
3. Ver reporte de resultados

## 🚨 Troubleshooting

### Error 401 (Unauthorized)
- Verificar que el token esté guardado en `authToken`
- Hacer login nuevamente
- Verificar que el servidor esté corriendo

### Error 404 (Not Found)
- Verificar que la `base_url` sea correcta
- Verificar que el servidor esté corriendo en el puerto correcto

### Error 500 (Internal Server Error)
- Verificar logs del servidor
- Verificar conexión a la base de datos
- Verificar formato de datos enviados

---
**¡Tu colección de Postman está lista para usar!** 🚀
