# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Starting the Application
```bash
# Development environment
npm run start:dev

# QAS environment  
npm run start:qa

# Production environment
npm run start:prod

# Default (development)
npm start
```

### Database Operations
```bash
# Run database migrations/improvements
npm run migrate
# or
npm run db:improve
```

### Testing
```bash
# Run tests (not configured yet)
npm test
```

## Project Architecture

### High-Level Structure
This is a Node.js REST API for **CHANCAFE Q**, a sales advisor application. The project consists of:

- **Backend**: Node.js Express API with MySQL database (current directory)
- **Frontend**: Android application using Java/MVVM architecture (../frontend/)

### Backend Architecture

#### Module-Based Structure
The backend follows a domain-driven design with each business domain having its own module:

```
/auth/           - Authentication & user management
/categories/     - Product categories
/clients/        - Client management  
/credit-requests/ - Credit request processing
/products/       - Product catalog
/quotes/         - Quote generation and management
/suppliers/      - Supplier management
```

#### Layer Architecture
Each module follows a consistent 3-layer architecture:
- **controllers/**: Handle HTTP requests/responses
- **services/**: Business logic
- **repository/**: Data access layer
- **routes/**: Route definitions
- **interfaces/**: DTOs and data interfaces

#### Shared Components
- **shared/models/**: Sequelize models for database entities
- **shared/config/**: Database configuration and helpers
- **shared/middlewares/**: Authentication and other middleware
- **shared/utils/**: Utility functions like `routerFactory.js`

### Database Configuration

#### Environment-Based Configuration
The app uses environment-specific .env files:
- `.env.development` - Development environment
- `.env.production` - Production environment
- `.env` - Fallback configuration

#### Required Environment Variables
```
DB_HOST=localhost
DB_PORT=3306
USERDB=database_user
PASSWORD=database_password
MASTER_DB=database_name
JWT_SECRET=your_jwt_secret
PORT=3000
```

#### Database Technology
- **ORM**: Sequelize
- **Database**: MySQL
- **Timezone**: America/Lima (-05:00)

### Authentication System

#### JWT-based Authentication
- Uses `jsonwebtoken` for token generation
- Middleware in `shared/middlewares/authMiddleware.js` provides multiple auth options:
  - `authMiddleware` - Full authentication with database validation
  - `simpleAuthMiddleware` - Token-only validation
  - `requireRole(['admin', 'user'])` - Role-based access control
  - `requireOwnershipOrAdmin` - Resource ownership validation

#### Protected Routes
Most API routes except `/auth` require authentication via Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Key Development Patterns

#### Model Initialization
Models are auto-loaded from multiple directories and initialized via `shared/models/index.js`. The system:
1. Loads all .js files from model directories
2. Initializes models with Sequelize instance
3. Configures associations between models

#### Response Helpers
Standardized API responses via `shared/config/helpers/apiResponseHelper.js`:
- `sendSuccess(res, data, message)` - Success responses
- `sendError(res, statusCode, message)` - Error responses

#### Router Factory
Simplified route creation using `shared/utils/routerFactory.js`:
```javascript
const routes = [
  { method: 'get', path: '/', handler: controllerFunction },
  { method: 'post', path: '/create', handler: createFunction }
];
const router = createRouter(routes);
```

### Application Startup Process

1. **Environment Loading**: Loads appropriate .env file based on NODE_ENV
2. **Database Connection**: Tests MySQL connection
3. **Model Initialization**: Loads and initializes all Sequelize models
4. **Database Sync**: Syncs models with database (alter in dev, safe in prod)
5. **Server Start**: Starts Express server on configured port

### Development Guidelines

#### File Organization
- Controllers should be thin - delegate to services
- Services contain business logic
- Repositories handle data access
- Use DTOs in interfaces/ for data validation

#### Database Changes
- Use `alter: true` in development for schema changes
- Production uses safe sync without destructive changes
- Run `npm run migrate` for manual database updates

#### Error Handling
- Use try/catch in controllers
- Return appropriate HTTP status codes
- Log errors with descriptive messages

### API Documentation
- Postman collection available in `/postman/` directory
- Environment files for Development and Production
- Collection: `CHANCAFE_Q_API.postman_collection.json`

## Sentinel Credit Bureau API Integration

### Overview
The system integrates with **Sentinel Credit Bureau API** (https://sentinel-api-5c7y.vercel.app/) to provide automated credit assessment during quote creation. This integration solves CHANCAFE Q's core business problem of quickly evaluating client creditworthiness.

### Architecture
- **Service Layer**: `external-apis/services/sentinelApiService.js`
- **Cache System**: `external-apis/utils/sentinelCache.js` 
- **Error Handling**: `external-apis/middleware/sentinelErrorHandler.js`
- **Client Integration**: Extended `clients/` module with credit fields
- **Quote Integration**: Enhanced `quotes/` module with automatic credit checks

### Key Features
1. **Automatic Credit Assessment**: When creating quotes, system automatically queries Sentinel API for clients with DNI
2. **Smart Caching**: 30-60 minute TTL prevents redundant API calls
3. **Risk Classification**: Automatic APPROVE/REJECT/REVIEW recommendations
4. **Credit Scoring**: 300-850 score range with risk classification
5. **Debt Analysis**: Current debts and credit history evaluation

### Configuration
Required environment variables:
```bash
SENTINEL_API_URL=https://sentinel-api-5c7y.vercel.app
SENTINEL_API_TIMEOUT=10000
SENTINEL_API_RETRY_ATTEMPTS=3
SENTINEL_CACHE_TTL=3600
```

### New API Endpoints

#### Quote Creation with Credit Check
```bash
POST /api/quotes/with-credit-check
```
Creates quote and automatically performs credit assessment if client has DNI.

#### Manual Credit Check
```bash
POST /api/quotes/client/:clientId/credit-check
```
Manually trigger credit assessment for specific client.

#### Get Credit Assessment
```bash
GET /api/quotes/client/:clientId/credit-assessment
```
Retrieve existing credit assessment data.

#### Quote with Credit Info
```bash
GET /api/quotes/:id/credit-info
```
Get quote with associated client credit information.

### Database Schema Changes
New fields added to `clients` table:
- `credit_score` - Credit score (300-850)
- `risk_classification` - BAJO/MEDIO/ALTO/MUY_ALTO
- `total_debts` - Current debt amount
- `automatic_evaluation` - APROBAR/RECHAZAR/REVISAR
- `suggested_credit_limit` - Recommended credit limit
- `is_banked` - Banking status indicator
- `last_credit_check` - Timestamp of last assessment

### Business Logic
- **Banked Status**: Score > 400 considered "banked"
- **Credit Limits**: 
  - Score 750+: Up to S/50,000
  - Score 650-749: Up to S/30,000  
  - Score 550-649: Up to S/20,000
  - Score 450-549: Up to S/10,000
  - Score <450: Rejected
- **Cache Duration**: 30 minutes for quick queries, 60 minutes for detailed reports

### Error Handling
- Circuit breaker pattern for API availability
- Graceful degradation when Sentinel API is unavailable
- Detailed logging for audit trails
- Rate limiting by DNI to prevent abuse

### Usage Example
```javascript
// Create quote with automatic credit check
const response = await fetch('/api/quotes/with-credit-check', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer <token>' },
  body: JSON.stringify({
    clientId: 123,
    title: 'Cotización electrodomésticos',
    items: [...]
  })
});

// Response includes credit assessment
{
  "quote": { ... },
  "creditAssessment": {
    "recomendacion": "APROBAR",
    "limiteCredito": 25000,
    "justificacion": "Excelente score crediticio"
  },
  "alerts": [
    {
      "type": "success", 
      "message": "Evaluación crediticia: APROBAR - Límite sugerido: S/ 25,000"
    }
  ]
}
```