require('dotenv').config();

/**
 * Configuración general de la aplicación
 * Centraliza todas las variables de entorno y configuraciones
 */
module.exports = {
  // Configuración del servidor
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
    env: process.env.NODE_ENV || 'development',
    apiVersion: process.env.API_VERSION || 'v1',
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    apiBasePath: process.env.API_BASE_PATH || '/api/v1'
  },

  // Configuración de base de datos
  database: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    name: process.env.DB_NAME || 'chancafe_q_dev',
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    dialect: process.env.DB_DIALECT || 'mysql'
  },

  // Configuración JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: 'CHANCAFE-Q',
    audience: 'chancafe-app'
  },

  // Configuración de seguridad
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    lockoutTime: parseInt(process.env.LOCKOUT_TIME) * 60 * 1000 || 15 * 60 * 1000, // 15 minutos en ms
    sessionTimeout: 24 * 60 * 60 * 1000 // 24 horas en ms
  },

  // Configuración de Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
      error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  },

  // Configuración de CORS
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
    methods: process.env.ALLOWED_METHODS ? process.env.ALLOWED_METHODS.split(',') : ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
  },

  // Configuración de archivos
  upload: {
    directory: process.env.UPLOAD_DIR || 'uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES ? process.env.ALLOWED_FILE_TYPES.split(',') : ['jpg', 'jpeg', 'png', 'pdf'],
    tempDirectory: 'temp'
  },

  // Configuración de logs
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
    maxSize: '10m',
    maxFiles: '14d'
  },

  // Configuración de email (para futuro uso)
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    from: process.env.EMAIL_FROM || 'noreply@chancafe.com'
  },

  // URLs importantes
  urls: {
    frontend: process.env.FRONTEND_URL || 'http://localhost:3001',
    api: process.env.BASE_URL || 'http://localhost:3000',
    docs: '/api-docs'
  },

  // Configuración de la aplicación
  app: {
    name: 'CHANCAFE Q API',
    version: '1.0.0',
    description: 'Sistema de Asesores de Ventas',
    company: 'CHANCAFE',
    timezone: 'America/Lima'
  },

  // Configuraciones específicas del negocio
  business: {
    defaultTaxRate: 18.00, // IGV en Perú
    defaultCurrency: 'PEN',
    quotesValidityDays: 30,
    maxDiscountPercentage: 20.00,
    commissionRates: {
      asesor: 3.50,
      supervisor: 5.00,
      admin: 0.00
    }
  },

  // Configuración de desarrollo
  development: {
    seedDatabase: process.env.SEED_DB === 'true',
    debugMode: process.env.DEBUG === 'true',
    mockExternalServices: process.env.MOCK_SERVICES === 'true'
  }
};