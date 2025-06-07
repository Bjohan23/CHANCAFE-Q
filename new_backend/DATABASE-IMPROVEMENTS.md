# 🚀 Mejoras Aplicadas a la Base de Datos

## 📋 Resumen de Cambios

Se han aplicado mejoras significativas al esquema de la base de datos para optimizar el sistema de cotizaciones y gestión de productos.

## 🔧 **INSTRUCCIONES PARA APLICAR LOS CAMBIOS:**

### Opción 1: Usando npm (Recomendado)
```bash
npm run migrate
# o
npm run db:improve
```

### Opción 2: Directamente con Node
```bash
node apply-database-improvements.js
```

---

## ✨ **NUEVAS FUNCIONALIDADES**

### 🏢 **1. Gestión de Proveedores (Suppliers)**
```javascript
// Crear proveedor
const supplier = await Supplier.create({
  name: 'TechCorp S.A.',
  business_name: 'TechCorp Sociedad Anónima',
  tax_id: '20123456789',
  contact_name: 'Juan Pérez',
  email: 'contacto@techcorp.com',
  phone: '987654321',
  website: 'https://techcorp.com',
  payment_terms: '30 días',
  delivery_time: '7-10 días'
});

// Buscar proveedores activos
const activeSuppliers = await Supplier.findActive();

// Buscar por nombre
const suppliers = await Supplier.searchByName('Tech');
```

### 📦 **2. Productos Mejorados**
```javascript
// Crear producto con nuevos campos
const product = await Product.create({
  name: 'Laptop Dell XPS 13',
  sku: 'DELL-XPS13-001',
  barcode: '1234567890123',
  supplier_sku: 'DELL-XPS13',
  is_digital: false,
  tax_exempt: false,
  supplier_id: 1,
  created_by: userId,
  category_id: 1,
  price: 2500.00
});

// Buscar por código de barras
const product = await Product.findByBarcode('1234567890123');

// Buscar productos de un proveedor
const products = await Product.findBySupplier(supplierId);
```

### 📋 **3. Cotizaciones con Revisiones**
```javascript
// Crear revisión de cotización
const quote = await Quote.findByPk(1);
const revision = await quote.createRevision({
  title: 'Cotización Revisada - Descuento Especial',
  discount_percentage: 10.00
});

// Buscar cotizaciones originales (no revisiones)
const originalQuotes = await Quote.findOriginalQuotes();

// Buscar revisiones de una cotización
const revisions = await Quote.findRevisions(originalQuoteId);
```

### 👥 **4. Clientes con Información Empresarial**
```javascript
// Crear cliente empresa
const client = await Client.create({
  user_id: advisorId,
  document_type: 'ruc',
  document_number: '20123456789',
  business_name: 'Empresa ABC S.A.C.',
  contact_name: 'María García',
  client_type: 'business',
  industry: 'tecnologia',
  company_size: 'medium',
  website: 'https://empresaabc.com',
  preferred_contact_method: 'email'
});

// Reportes por industria
const industries = await Client.getIndustriesReport();

// Buscar por tamaño de empresa
const mediumCompanies = await Client.findByCompanySize('medium');
```

### 🔗 **5. Relación Muchos a Muchos: Productos-Categorías**
```javascript
// Asignar producto a múltiples categorías
await ProductCategories.addProductToCategory(productId, categoryId, true); // primaria
await ProductCategories.addProductToCategory(productId, secondaryCategoryId, false);

// Obtener categoría principal
const primaryCategory = await ProductCategories.findPrimaryCategory(productId);

// Cambiar categoría principal
await ProductCategories.setPrimaryCategory(productId, newCategoryId);
```

### 📄 **6. Plantillas de Cotización**
```javascript
// Crear plantilla
const template = await QuoteTemplate.create({
  name: 'Plantilla Tecnología',
  description: 'Para productos tecnológicos',
  category: 'tecnologia',
  created_by: userId,
  template_data: {
    title: 'Cotización de Productos Tecnológicos',
    delivery_time: '7-15 días',
    payment_terms: 'Contado',
    tax_percentage: 18.00,
    currency: 'PEN'
  }
});

// Aplicar plantilla a cotización
const quoteData = template.applyToQuote({
  client_id: clientId,
  user_id: userId
});

// Obtener plantilla por defecto
const defaultTemplate = await QuoteTemplate.findDefault('tecnologia');
```

---

## 📊 **NUEVOS CAMPOS POR TABLA**

### Products
- ✅ `is_digital` - Producto digital/físico
- ✅ `tax_exempt` - Exento de impuestos  
- ✅ `created_by` - Usuario que creó el producto
- ✅ `barcode` - Código de barras
- ✅ `supplier_sku` - SKU del proveedor
- ✅ `supplier_id` - Proveedor principal

### Quotes  
- ✅ `revision_number` - Número de revisión
- ✅ `original_quote_id` - ID de cotización original
- ✅ `pdf_generated_at` - Última generación de PDF
- ✅ `client_reference` - Referencia del cliente
- ✅ `project_name` - Nombre del proyecto

### Clients
- ✅ `website` - Sitio web del cliente
- ✅ `industry` - Industria/sector  
- ✅ `company_size` - Tamaño de empresa
- ✅ `tax_id` - RUC/Tax ID adicional
- ✅ `preferred_contact_method` - Método de contacto preferido

### Activity Logs
- ✅ `session_id` - ID de sesión relacionada
- ✅ `duration_ms` - Duración de la acción
- ✅ `error_message` - Mensaje de error

---

## 🗄️ **NUEVAS TABLAS**

### 1. `suppliers` - Gestión de Proveedores
### 2. `product_categories` - Relación muchos a muchos productos-categorías  
### 3. `quote_templates` - Plantillas reutilizables de cotizaciones

---

## 🎯 **CASOS DE USO PRÁCTICOS**

### 📈 Reportes Mejorados
```javascript
// Productos por proveedor
const supplierReport = await Supplier.findWithProductCount();

// Clientes por industria
const industryReport = await Client.getIndustriesReport();

// Cotizaciones con revisiones
const quotesWithRevisions = await Quote.findAll({
  include: ['revisions', 'originalQuote']
});
```

### 🔍 Búsquedas Avanzadas
```javascript
// Buscar productos por múltiples criterios
const products = await Product.searchProducts('laptop');

// Incluye: nombre, descripción, marca, modelo, SKU, código de barras
```

### 📋 Gestión de Plantillas
```javascript
// Crear cotización desde plantilla
const template = await QuoteTemplate.findDefault('tecnologia');
const quoteData = template.applyToQuote({
  client_id: 1,
  user_id: 2
});
const quote = await Quote.create(quoteData);
```

---

## ⚠️ **NOTAS IMPORTANTES**

1. **Compatibilidad**: Todos los cambios son compatibles con el código existente
2. **Indices**: Se agregaron índices para optimizar las consultas
3. **Validaciones**: Los hooks validan automáticamente los datos
4. **Rollback**: Se puede revertir la migración si es necesario

---

## 🚨 **SI ALGO SALE MAL**

Para revertir todos los cambios:
```javascript
// En la consola de Node.js
const migration = require('./migrations/20250603-database-improvements');
const { getSequelize } = require('./shared/config/db');
const sequelize = getSequelize();

migration.down(sequelize.getQueryInterface(), sequelize.Sequelize);
```

---

## 📞 **SOPORTE**

Si tienes problemas:
1. Verifica que la base de datos esté corriendo
2. Revisa las credenciales en `.env`
3. Asegúrate de tener permisos para modificar esquemas
4. Consulta los logs para más detalles

¡Disfruta de las nuevas funcionalidades! 🎉