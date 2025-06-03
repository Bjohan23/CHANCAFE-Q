const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');

// Importar las funciones de base de datos
const { testConnection, syncDatabase } = require('./shared/config/db'); // Asume que tu archivo está en config/database.js

// Determinar el entorno y cargar el archivo .env apropiado
const env = process.env.NODE_ENV || 'development'; 
let envPath;
if (env === 'production') {
    envPath = path.resolve(__dirname, '.env.production');
} else if (env === 'qas') {
    envPath = path.resolve(__dirname, '.env.development');
} else {
    envPath = path.resolve(__dirname, '.env');
}

// Cargar las variables de entorno
dotenv.config({ path: envPath });

// Crear la instancia de Express
const app = express();

// Configuración de CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
}));

app.get('/', (req, res) => {
    res.send('🚀 API Chancafe Q está activa y funcionando correctamente! ✅');
});

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));
app.use('/storage', express.static(path.join(__dirname, 'storage')));

// Rutas principales
const routes = require('./routes');
app.use('/v1/api', routes);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal!');
});

// Log para mostrar entorno y variables clave
console.log('Environment:', env);
console.log('Server URL:', process.env.SERVER_URL);

// Puerto en el que escuchará el servidor
const PORT = process.env.PORT || 3000;

// Función para inicializar la aplicación
async function startServer() {
    try {
        // 1. Verificar conexión a la base de datos
        console.log('🔌 Verificando conexión a la base de datos...');
        const isConnected = await testConnection();
        
        if (!isConnected) {
            console.error('❌ No se pudo establecer conexión con la base de datos');
            process.exit(1);
        }

        // 2. Importar todos los modelos (esto debe hacerse después de verificar la conexión)
        require('./shared/models/index'); // Asegúrate de que tengas un archivo index.js en models que importe todos los modelos

        // 3. Sincronizar la base de datos
        console.log('🔄 Sincronizando modelos con la base de datos...');
        await syncDatabase();

        // 4. Iniciar el servidor
        app.listen(PORT, () => {
            console.log(`🚀 Server listening on port ${PORT}`);
            console.log(`📍 Environment: ${env}`);
            console.log(`🌐 Server URL: ${process.env.SERVER_URL || `http://localhost:${PORT}`}`);
        });

    } catch (error) {
        console.error('❌ Error al inicializar el servidor:', error);
        process.exit(1);
    }
}

// Inicializar el servidor
startServer();

module.exports = app;