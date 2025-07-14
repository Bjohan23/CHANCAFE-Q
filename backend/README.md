# CHANCAFE Q Backend API Documentation

## Overview

The CHANCAFE Q backend is a Node.js Express REST API with MySQL database that provides sales advisor functionality including client management, product catalog, quote generation, and automated credit assessment through Sentinel API integration.

## Base Configuration

- **Base URL**: `http://localhost:3000/api` (development) or configured production URL
- **Content-Type**: `application/json`
- **Authentication**: JWT Bearer tokens

## Authentication System

### Authentication Flow
All endpoints except authentication routes require JWT Bearer token:
```
Authorization: Bearer <jwt_token>
```

### Available Auth Middleware Types
- **Full Authentication**: Validates token and checks user in database
- **Simple Authentication**: Token-only validation  
- **Role-based Access**: Admin, supervisor, user roles
- **Ownership Validation**: Users can only access their own resources

### Standard Response Format
```json
{
  "success": boolean,
  "data": object|array|null,
  "message": string
}
```

## Modules and Endpoints

### 🔐 Authentication Module (`/api/auth`)

#### Public Endpoints (No Authentication Required)

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `POST` | `/auth/login` | User login | `{ email: string, password: string }` |
| `POST` | `/auth/register` | User registration | `{ first_name, last_name, email, password, role?, phone?, branch_office? }` |

#### Protected Endpoints (Require Authentication)

| Method | Endpoint | Description | Auth Level |
|--------|----------|-------------|------------|
| `POST` | `/auth/logout` | User logout | User |
| `POST` | `/auth/change-password` | Change password | User |
| `GET` | `/auth/users/profile` | Get user profile | User |
| `PUT` | `/auth/users/profile` | Update user profile | User |
| `GET` | `/auth/users` | Get all users | Admin/Supervisor |
| `GET` | `/auth/users/active` | Get active users | User |
| `GET` | `/auth/users/stats` | User statistics | Admin |
| `GET` | `/auth/users/by-role/:role` | Users by role | Admin/Supervisor |
| `GET` | `/auth/users/by-branch/:branchOffice` | Users by branch | Admin/Supervisor |
| `GET` | `/auth/users/:id` | Get user by ID | Owner/Admin |
| `PUT` | `/auth/users/:id` | Update user | Owner/Admin |
| `DELETE` | `/auth/users/:id` | Delete user | Admin |
| `PATCH` | `/auth/users/:id/status` | Change user status | Admin |
| `PATCH` | `/auth/users/:id/role` | Change user role | Admin |

---

### 🏷️ Categories Module (`/api/categories`)

All endpoints require authentication.

#### CRUD Operations

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `POST` | `/categories` | Create category | `{ name, description?, parentId?, status?, sortOrder? }` |
| `GET` | `/categories` | Get all categories | Query params: `status`, `parentId`, `search`, `page`, `limit` |
| `GET` | `/categories/:id` | Get category by ID | Query param: `include` (relations) |
| `PUT` | `/categories/:id` | Update category | Category fields |
| `DELETE` | `/categories/:id` | Delete category | - |

#### Specific Queries

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/categories/active` | Get active categories |
| `GET` | `/categories/parentCategories` | Get parent categories |
| `GET` | `/categories/:parentId/subcategories` | Get subcategories |
| `GET` | `/categories/tree` | Get category tree structure |
| `GET` | `/categories/withProductCount` | Categories with product counts |
| `GET` | `/categories/search` | Search categories (query: `q`) |
| `GET` | `/categories/stats` | Category statistics |
| `PATCH` | `/categories/:id/status` | Change category status |
| `POST` | `/categories/reorder` | Reorder categories |

---

### 👥 Clients Module (`/api/clients`)

All endpoints require authentication.

#### CRUD Operations

| Method | Endpoint | Description | Request Body Schema |
|--------|----------|-------------|---------------------|
| `POST` | `/clients` | Create client | See ClientDTO below |
| `GET` | `/clients` | Get all clients | Query filters available |
| `GET` | `/clients/:id` | Get client by ID | - |
| `PUT` | `/clients/:id` | Update client | See ClientUpdateDTO below |
| `DELETE` | `/clients/:id` | Delete client | - |

#### Specific Queries

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/clients/active` | Get active clients |
| `GET` | `/clients/stats` | Client statistics |
| `GET` | `/clients/type/:type` | Clients by type |
| `GET` | `/clients/assigned/:userId` | Clients by assigned user |
| `GET` | `/clients/high-credit` | High credit limit clients |
| `GET` | `/clients/document/:documentNumber` | Client by document |
| `GET` | `/clients/:id/relations` | Client with relations |
| `PATCH` | `/clients/:id/status` | Change client status |
| `PATCH` | `/clients/:id/credit-limit` | Update credit limit |

#### ClientDTO Schema
```json
{
  "documentType": "DNI|RUC|passport|CE",
  "documentNumber": "string(20)",
  "clientType": "string",
  "businessName": "string(150)?",
  "firstName": "string(50)?", 
  "lastName": "string(50)?",
  "email": "string(100)",
  "phone": "string",
  "address": "string",
  "district": "string",
  "province": "string", 
  "department": "string",
  "postalCode": "string?",
  "creditLimit": "number?",
  "paymentTerms": "string?",
  "contactMethod": "string?",
  "contactPreference": "string?",
  "industry": "string?",
  "companySize": "string?",
  "website": "string?",
  "notes": "string?",
  "status": "active|inactive"
}
```

---

### 📦 Products Module (`/api/products`)

All endpoints require authentication.

#### CRUD Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/products` | Create product |
| `GET` | `/products` | Get all products (with filters/pagination) |
| `GET` | `/products/:id` | Get product by ID |
| `PUT` | `/products/:id` | Update product |
| `DELETE` | `/products/:id` | Delete product (admin only) |

#### Specific Queries

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/products/active` | Active products |
| `GET` | `/products/featured` | Featured products |
| `GET` | `/products/search` | Search products (query: `q`) |
| `GET` | `/products/lowStock` | Low stock products |
| `GET` | `/products/outOfStock` | Out of stock products |
| `GET` | `/products/byPriceRange` | Products by price range |
| `GET` | `/products/stats` | Product statistics |
| `GET` | `/products/statusSummary` | Status summary |
| `GET` | `/products/brands` | Available brands |
| `GET` | `/products/checkSku/:sku` | Check SKU availability |
| `GET` | `/products/checkBarcode/:barcode` | Check barcode availability |
| `GET` | `/products/bySku/:sku` | Product by SKU |
| `GET` | `/products/byBarcode/:barcode` | Product by barcode |
| `GET` | `/products/byCategory/:categoryId` | Products by category |
| `GET` | `/products/bySupplier/:supplierId` | Products by supplier |
| `GET` | `/products/byBrand/:brand` | Products by brand |

#### Product Actions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `PATCH` | `/products/:id/status` | Change product status |
| `PATCH` | `/products/:id/stock` | Update product stock |
| `POST` | `/products/:id/toggleFeatured` | Toggle featured status |

---

### 📄 Quotes Module (`/api/quotes`)

All endpoints require authentication. Includes Sentinel API credit integration.

#### CRUD Operations

| Method | Endpoint | Description | Request Body Schema |
|--------|----------|-------------|---------------------|
| `POST` | `/quotes` | Create quote | See QuoteDTO below |
| `GET` | `/quotes` | Get all quotes | Query filters available |
| `GET` | `/quotes/:id` | Get quote by ID | - |
| `PUT` | `/quotes/:id` | Update quote | See QuoteUpdateDTO below |
| `DELETE` | `/quotes/:id` | Delete quote | - |

#### 🆕 Credit Integration Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/quotes/with-credit-check` | Create quote with automatic credit assessment |
| `POST` | `/quotes/client/:clientId/credit-check` | Manual credit check for client |
| `GET` | `/quotes/client/:clientId/credit-assessment` | Get client credit assessment |
| `GET` | `/quotes/:id/credit-info` | Get quote with credit information |

#### Specific Queries

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/quotes/stats` | Quote statistics |
| `GET` | `/quotes/status/:status` | Quotes by status |
| `GET` | `/quotes/client/:clientId` | Quotes by client |
| `GET` | `/quotes/user/:userId` | Quotes by user |
| `GET` | `/quotes/number/:quoteNumber` | Quote by number |
| `GET` | `/quotes/:id/items` | Quote with items |
| `GET` | `/quotes/:id/relations` | Quote with relations |

#### Quote Actions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `PATCH` | `/quotes/:id/status` | Change quote status |
| `PATCH` | `/quotes/:id/recalculate` | Recalculate quote totals |
| `POST` | `/quotes/:id/items` | Add quote item |
| `PUT` | `/quotes/items/:itemId` | Update quote item |
| `DELETE` | `/quotes/items/:itemId` | Delete quote item |

#### QuoteDTO Schema
```json
{
  "clientId": "number",
  "userId": "number",
  "quoteNumber": "string?",
  "title": "string",
  "description": "string?",
  "subtotal": "number",
  "discountPercentage": "number",
  "discountAmount": "number", 
  "taxPercentage": "number",
  "taxAmount": "number",
  "totalAmount": "number",
  "currency": "PEN|USD",
  "exchangeRate": "number",
  "validUntil": "date",
  "status": "draft|sent|approved|rejected|expired",
  "notes": "string?",
  "internalNotes": "string?",
  "revision": "number",
  "projectName": "string?",
  "pdfGenerated": "boolean",
  "pdfUrl": "string?"
}
```

#### Credit Assessment Response
```json
{
  "quote": { /* quote object */ },
  "creditAssessment": {
    "recomendacion": "APROBAR|RECHAZAR|REVISAR",
    "limiteCredito": "number",
    "justificacion": "string"
  },
  "alerts": [
    {
      "type": "success|warning|error",
      "message": "string"
    }
  ]
}
```

---

### 🏢 Suppliers Module (`/api/suppliers`)

All endpoints require authentication.

#### CRUD Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/suppliers` | Create supplier |
| `GET` | `/suppliers` | Get all suppliers |
| `GET` | `/suppliers/:id` | Get supplier by ID |
| `PUT` | `/suppliers/:id` | Update supplier |
| `DELETE` | `/suppliers/:id` | Delete supplier |

#### Specific Queries

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/suppliers/active` | Active suppliers |
| `GET` | `/suppliers/withProductCount` | Suppliers with product counts |
| `GET` | `/suppliers/search` | Search suppliers (query: `q`) |
| `GET` | `/suppliers/stats` | Supplier statistics |
| `GET` | `/suppliers/byPaymentTerms` | Suppliers by payment terms |
| `GET` | `/suppliers/byDeliveryTime` | Suppliers by delivery time |
| `GET` | `/suppliers/statusSummary` | Status summary |
| `GET` | `/suppliers/byTaxId/:taxId` | Supplier by tax ID (RUC) |
| `GET` | `/suppliers/:id/contactInfo` | Supplier contact information |
| `PATCH` | `/suppliers/:id/status` | Change supplier status |

---

### 💳 Credit Requests Module (`/api/credit-requests`)

All endpoints require authentication.

#### CRUD Operations

| Method | Endpoint | Description | Request Body Schema |
|--------|----------|-------------|---------------------|
| `POST` | `/credit-requests` | Create credit request | See CreditRequestDTO below |
| `GET` | `/credit-requests` | Get all credit requests | Query filters available |
| `GET` | `/credit-requests/:id` | Get credit request by ID | - |
| `PUT` | `/credit-requests/:id` | Update credit request | See CreditRequestUpdateDTO below |
| `DELETE` | `/credit-requests/:id` | Delete credit request | - |

#### Specific Queries

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/credit-requests/stats` | Credit request statistics |
| `GET` | `/credit-requests/expiring` | Expiring credit requests |
| `GET` | `/credit-requests/expired` | Expired credit requests |
| `PATCH` | `/credit-requests/mark-expired` | Mark expired credit requests |
| `GET` | `/credit-requests/status/:status` | Credit requests by status |
| `GET` | `/credit-requests/client/:clientId` | Credit requests by client |
| `GET` | `/credit-requests/user/:userId` | Credit requests by user |
| `GET` | `/credit-requests/priority/:priority` | Credit requests by priority |
| `GET` | `/credit-requests/number/:requestNumber` | Credit request by number |
| `GET` | `/credit-requests/:id/relations` | Credit request with relations |

#### Credit Request Actions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `PATCH` | `/credit-requests/:id/status` | Change credit request status |
| `PATCH` | `/credit-requests/:id/approve` | Approve credit request |
| `PATCH` | `/credit-requests/:id/reject` | Reject credit request |
| `PATCH` | `/credit-requests/:id/risk-assessment` | Update risk assessment |

#### CreditRequestDTO Schema
```json
{
  "clientId": "number",
  "userId": "number",
  "requestNumber": "string?",
  "requestedAmount": "number",
  "currency": "PEN|USD",
  "exchangeRate": "number",
  "paymentTerms": "string",
  "purpose": "string",
  "description": "string?",
  "status": "pending|approved|rejected|expired",
  "priority": "low|medium|high|urgent",
  "riskAssessment": "string?",
  "documents": "string?",
  "approvalConditions": "string?",
  "rejectionReason": "string?",
  "approvedAmount": "number?",
  "approvedTerms": "string?",
  "approvedBy": "number?",
  "approvedAt": "date?",
  "expiresAt": "date?",
  "notes": "string?",
  "internalNotes": "string?"
}
```

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Optional validation errors array
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized (no token / invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Credit Bureau Integration

### Sentinel API Features
- **Automatic Assessment**: Triggered during quote creation for clients with DNI
- **Smart Caching**: 30-60 minute TTL to prevent redundant calls
- **Risk Classification**: BAJO/MEDIO/ALTO/MUY_ALTO
- **Credit Scoring**: 300-850 range
- **Business Rules**:
  - Score > 400: "Banked" status
  - Score 750+: Up to S/50,000 credit
  - Score 650-749: Up to S/30,000 credit
  - Score 550-649: Up to S/20,000 credit
  - Score 450-549: Up to S/10,000 credit
  - Score <450: Rejected

### Enhanced Client Fields (Credit Integration)
```json
{
  "credit_score": "number (300-850)",
  "risk_classification": "BAJO|MEDIO|ALTO|MUY_ALTO",
  "total_debts": "number",
  "automatic_evaluation": "APROBAR|RECHAZAR|REVISAR",
  "suggested_credit_limit": "number",
  "is_banked": "boolean",
  "last_credit_check": "datetime"
}
```

## Development Notes

### Authentication Headers
```javascript
headers: {
  'Authorization': 'Bearer ' + token,
  'Content-Type': 'application/json'
}
```

### Environment Variables Required
- `JWT_SECRET`: JWT signing secret
- `DB_HOST`, `DB_PORT`, `USERDB`, `PASSWORD`, `MASTER_DB`: Database config
- `SENTINEL_API_URL`: Credit bureau API URL
- `PORT`: Server port (default 3000)

### Testing
- Postman collection available at `/postman/CHANCAFE_Q_API.postman_collection.json`
- Test credentials: email: `admin@chancafe.com`, password: `123456`

## API Examples

### Authentication Example
```javascript
// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@chancafe.com',
    password: '123456'
  })
});

const { data: { token } } = await loginResponse.json();

// Use token in subsequent requests
const clientsResponse = await fetch('/api/clients', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Create Quote with Credit Check Example
```javascript
const quoteResponse = await fetch('/api/quotes/with-credit-check', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    clientId: 123,
    title: 'Cotización electrodomésticos',
    description: 'Cotización para cliente empresarial',
    subtotal: 5000,
    discountPercentage: 10,
    discountAmount: 500,
    taxPercentage: 18,
    taxAmount: 810,
    totalAmount: 5310,
    currency: 'PEN',
    exchangeRate: 1,
    validUntil: '2024-12-31',
    status: 'draft'
  })
});

const response = await quoteResponse.json();
// Response includes creditAssessment and alerts
```

This documentation provides a comprehensive reference for frontend developers to integrate with the CHANCAFE Q backend API, including all available endpoints, authentication requirements, request/response schemas, and the Sentinel credit bureau integration features.