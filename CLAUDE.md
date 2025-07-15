# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend (Node.js Express API)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Development environment (default)
npm start
npm run start:dev

# QAS environment
npm run start:qa

# Production environment
npm run start:prod

# Database migrations/improvements
npm run migrate
npm run db:improve

# Testing (not configured yet)
npm test
```

### Frontend (Android)

```bash
# Navigate to frontend directory
cd frontend

# Build the project
./gradlew build

# Run on device/emulator
./gradlew installDebug

# Clean build
./gradlew clean

# Run tests
./gradlew test

# Run instrumented tests
./gradlew connectedAndroidTest

# Build release APK
./gradlew assembleRelease

# Check for lint issues
./gradlew lint
```

## Project Architecture

### High-Level Structure

**CHANCAFE Q** is a sales advisor application consisting of:

- **Backend**: Node.js Express REST API with MySQL database (backend/)
- **Frontend**: Android application using Java/MVVM architecture (frontend/)
- **Integration**: Sentinel Credit Bureau API for automated credit assessment

### Backend Architecture

#### Module-Based Domain Design
Each business domain has its own module with consistent 3-layer architecture:

```
/auth/              - Authentication & user management
/categories/        - Product categories  
/clients/           - Client management with credit assessment
/credit-requests/   - Credit request processing
/products/          - Product catalog
/quotes/            - Quote generation with automatic credit checks
/suppliers/         - Supplier management
/external-apis/     - Sentinel API integration
```

#### Layer Structure (Each Module)
- **controllers/**: Handle HTTP requests/responses
- **services/**: Business logic implementation
- **repository/**: Data access layer
- **routes/**: Route definitions
- **interfaces/**: DTOs and data validation

#### Shared Components
- **shared/models/**: Sequelize models for database entities
- **shared/config/**: Database configuration and response helpers
- **shared/middlewares/**: Authentication and authorization middleware
- **shared/utils/**: Utility functions including `routerFactory.js`

### Frontend Architecture

#### MVVM Pattern (Model-View-ViewModel)
```
com.example.chancafe_q/
├── ui/                    # Activities and UI components
│   ├── login/             # Login screen
│   ├── dashboard/         # Main dashboard
│   ├── clients/           # Client management
│   ├── quotes/            # Quote management
│   └── profile/           # User profile
├── viewmodel/             # ViewModels for business logic
├── model/                 # Data models
├── repository/            # Data repositories
├── data/
│   ├── local/             # Room database (prepared)
│   └── remote/            # Retrofit API client
└── utils/                 # Utilities and configuration
```

#### Key Android Components
- **Language**: Java
- **Min SDK**: 25 (Android 7.0)
- **Target SDK**: 35
- **Build System**: Gradle with Kotlin DSL
- **UI**: Material Design Components with View Binding
- **Architecture**: MVVM with LiveData and ViewModel

## Environment Configuration

### Backend Environment Variables

The application uses environment-specific .env files:
- `.env.development` - Development environment
- `.env.production` - Production environment

Required variables:
```bash
# Database
DB_HOST=localhost
DB_PORT=3306
USERDB=database_user
PASSWORD=database_password
MASTER_DB=database_name

# Security
JWT_SECRET=your_jwt_secret

# Server
PORT=3000

# Sentinel API Integration
SENTINEL_API_URL=https://sentinel-api-5c7y.vercel.app
SENTINEL_API_TIMEOUT=10000
SENTINEL_API_RETRY_ATTEMPTS=3
SENTINEL_CACHE_TTL=3600
```

### Frontend Environment Configuration

Environment switching is handled via `Configuration.java` in `frontend/app/src/main/java/com/example/chancafe_q/utils/`:
- Development: Currently using Cloudflare tunnel (configurable)
- Staging: `https://staging.chancafe.com/api/`
- Production: `https://api.chancafe.com/api/`

To switch environments, modify the `CURRENT_ENVIRONMENT` constant in `Configuration.java`:
```java
private static final Environment CURRENT_ENVIRONMENT = Environment.DEVELOPMENT;
```

Available development URLs (uncomment as needed):
- `http://10.0.2.2:3000/api/` - For Android emulator (localhost)
- `http://192.168.0.112/api/` - For physical device on local network
- `http://172.21.208.1:3000/api/` - For WSL environment
- Cloudflare tunnel URL - For remote development

## Database Configuration

### Technology Stack
- **ORM**: Sequelize
- **Database**: MySQL
- **Timezone**: America/Lima (-05:00)

### Model Initialization Process
1. Auto-loads all .js files from model directories
2. Initializes models with Sequelize instance
3. Configures associations between models
4. Uses `alter: true` in development, safe sync in production

### Application Startup Sequence
1. Environment configuration loading
2. Database connection testing
3. Model initialization and association setup
4. Database synchronization
5. Express server startup

## Authentication System

### JWT-based Authentication
- Token generation via `jsonwebtoken`
- Multiple middleware options in `shared/middlewares/authMiddleware.js`:
  - `authMiddleware` - Full authentication with database validation
  - `simpleAuthMiddleware` - Token-only validation
  - `requireRole(['admin', 'user'])` - Role-based access control
  - `requireOwnershipOrAdmin` - Resource ownership validation

### Protected Routes
Most API routes require authentication header:
```
Authorization: Bearer <jwt_token>
```

## Sentinel Credit Bureau Integration

### Key Features
- **Automatic Credit Assessment**: Triggered during quote creation for clients with DNI
- **Smart Caching**: 30-60 minute TTL to prevent redundant API calls
- **Risk Classification**: BAJO/MEDIO/ALTO/MUY_ALTO with automatic recommendations
- **Credit Scoring**: 300-850 score range with suggested credit limits

### New Database Fields (Clients Table)
- `credit_score` - Credit score (300-850)
- `risk_classification` - Risk level
- `total_debts` - Current debt amount
- `automatic_evaluation` - APROBAR/RECHAZAR/REVISAR
- `suggested_credit_limit` - Recommended credit limit
- `is_banked` - Banking status (score > 400)
- `last_credit_check` - Last assessment timestamp

### Credit Assessment API Endpoints
- `POST /api/quotes/with-credit-check` - Create quote with automatic credit check
- `POST /api/quotes/client/:clientId/credit-check` - Manual credit assessment
- `GET /api/quotes/client/:clientId/credit-assessment` - Get credit assessment
- `GET /api/quotes/:id/credit-info` - Quote with credit information

## Development Patterns

### Router Factory Pattern
Standardized route creation using `shared/utils/routerFactory.js`:
```javascript
const routes = [
  { method: 'get', path: '/', handler: controllerFunction },
  { method: 'post', path: '/create', handler: createFunction }
];
const router = createRouter(routes);
```

### Response Helpers
Consistent API responses via `shared/config/helpers/apiResponseHelper.js`:
- `sendSuccess(res, data, message)` - Success responses
- `sendError(res, statusCode, message)` - Error responses

### Error Handling
- Try/catch blocks in controllers
- Circuit breaker pattern for external API calls
- Descriptive error logging
- Graceful degradation when services are unavailable

## Testing

### Backend Testing
```bash
# Run tests (framework not configured yet)
npm test
```

### Frontend Testing
```bash
# Unit tests
./gradlew test

# Instrumented tests
./gradlew connectedAndroidTest
```

### Manual Testing
- Backend: Postman collections in `/postman/` directory
- Frontend: Test credentials - Username: `admin`, Password: `123456`

## Key Business Logic

### Credit Assessment Business Rules
- **Banked Status**: Score > 400 considered "banked"
- **Credit Limits**:
  - Score 750+: Up to S/50,000
  - Score 650-749: Up to S/30,000
  - Score 550-649: Up to S/20,000
  - Score 450-549: Up to S/10,000
  - Score <450: Rejected
- **Cache Strategy**: 30 minutes for quick queries, 60 minutes for detailed reports

### Database Operations
- Use `npm run migrate` for database schema changes
- Development uses `alter: true` for schema modifications
- Production uses safe sync without destructive changes

## Common Development Workflows

### Adding New Backend Module
1. Create module directory with controllers/, services/, repository/, routes/
2. Define models in shared/models/
3. Add routes to routes/index.js
4. Update authentication middleware as needed

### Adding New Android Feature
1. Create UI components in ui/[feature]/
2. Add corresponding ViewModel
3. Update models and repositories
4. Configure navigation in bottom navigation

### API Integration
- Backend APIs follow RESTful conventions
- Use `apiResponseHelper.js` for consistent responses
- Implement authentication middleware for protected routes
- Frontend uses Retrofit with Configuration.java environment switching

## File Organization Guidelines

### Backend
- Controllers should be thin - delegate to services
- Services contain business logic
- Repositories handle data access
- Use DTOs in interfaces/ for data validation

### Frontend
- Follow MVVM pattern strictly
- Use View Binding for UI components
- Implement proper error handling
- Follow Material Design guidelines

## Production Considerations

### Database Synchronization
- Development: `alter: true` for schema changes
- Production: Safe sync without destructive operations
- Always backup before running migrations

### Security Best Practices
- Environment variables for sensitive data
- JWT tokens for authentication
- Role-based access control
- Input validation via DTOs

### Performance Optimization
- Implement caching for external API calls
- Use pagination for large datasets
- Optimize database queries
- Implement proper error boundaries