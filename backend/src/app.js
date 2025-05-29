const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

// Importar configuraciones y middlewares
const { config } = require('./config');
const { errorHandler, logging, rateLimit } = require('./middlewares');
const routes = require('./routes');

// Crear instancia de Express
const app = express();

// Configurar CORS
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middlewares globales
app.use(helmet()); // Seguridad
app.use(cors(corsOptions)); // CORS
app.use(compression()); // Compresión
app.use(express.json({ limit: '10mb' })); // Parser JSON
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parser URL-encoded

// Logging
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Rate limiting
app.use(rateLimit);

// Logging personalizado
app.use(logging);

// Health check básico
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Rutas principales
app.use('/api', routes);

// Ruta de bienvenida
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Bienvenido a CHANCAFE Q API',
        version: '1.0.0',
        docs: '/api/status',
        timestamp: new Date().toISOString()
    });
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint no encontrado',
        path: req.originalUrl,
        method: req.method
    });
});

module.exports = app;
