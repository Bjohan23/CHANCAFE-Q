const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');

// Función para mostrar banner de inicio
function showStartupBanner() {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 CHANCAFE Q - API SERVER');
    console.log('='.repeat(60));
}

// Función para determinar y cargar el archivo .env apropiado
function loadEnvironmentConfig() {
    console.log('🔧 Configurando variables de entorno...');
    
    // Determinar el entorno basado en argumentos de línea de comandos o variable de entorno
    const args = process.argv.slice(2);
    let env = process.env.NODE_ENV;
    
    // Verificar si se pasó un entorno como argumento
    if (args.includes('--production') || args.includes('--prod')) {
        env = 'production';
    } else if (args.includes('--development') || args.includes('--dev')) {
        env = 'development';
    } else if (args.includes('--qas')) {
        env = 'qas';
    }
    
    // Si no hay entorno definido, usar 'development' por defecto
    if (!env) {
        env = 'development';
    }

    let envPath;
    let envFileName;

    if (env === 'production') {
        envPath = path.resolve(__dirname, '.env.production');
        envFileName = '.env.production';
    } else if (env === 'qas' || env === 'development') {
        envPath = path.resolve(__dirname, '.env.development');
        envFileName = '.env.development';
    } else {
        envPath = path.resolve(__dirname, '.env');
        envFileName = '.env';
    }

    console.log(`📁 Cargando configuración desde: ${envFileName}`);
    
    // Verificar si el archivo existe
    const fs = require('fs');
    if (!fs.existsSync(envPath)) {
        console.error(`❌ Error: No se encontró el archivo ${envFileName}`);
        console.log('📂 Archivos .env disponibles:');
        ['.env', '..env.development', '.env.production'].forEach(file => {
            const filePath = path.resolve(__dirname, file);
            if (fs.existsSync(filePath)) {
                console.log(`   ✅ ${file}`);
            } else {
                console.log(`   ❌ ${file} (no existe)`);
            }
        });
        process.exit(1);
    }

    // Cargar las variables de entorno
    const result = dotenv.config({ path: envPath });
    
    if (result.error) {
        console.error(`❌ Error al cargar ${envFileName}:`, result.error);
        process.exit(1);
    }

    console.log(`✅ Variables de entorno cargadas desde ${envFileName}`);
    return env;
}

// Función para mostrar información del entorno
function showEnvironmentInfo(env) {
    console.log('\n📋 INFORMACIÓN DEL ENTORNO:');
    console.log('-'.repeat(40));
    console.log(`🌍 Entorno: ${env.toUpperCase()}`);
    console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`🚪 Puerto: ${process.env.PORT || 3000}`);
    console.log(`🌐 URL del servidor: ${process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3000}`}`);
    console.log(`🔑 JWT Secret: ${process.env.JWT_SECRET ? '***configurado***' : '❌ NO CONFIGURADO'}`);
    console.log('\n📊 CONFIGURACIÓN DE BASE DE DATOS:');
    console.log('-'.repeat(40));
    console.log(`🖥️  Host: ${process.env.DB_HOST || '❌ NO CONFIGURADO'}`);
    console.log(`🚪 Puerto: ${process.env.DB_PORT || '❌ NO CONFIGURADO'}`);
    console.log(`👤 Usuario: ${process.env.USERDB || '❌ NO CONFIGURADO'}`);
    console.log(`🗄️  Base de datos: ${process.env.MASTER_DB || '❌ NO CONFIGURADO'}`);
    console.log(`🔒 Contraseña: ${process.env.PASSWORD ? '***configurada***' : '❌ NO CONFIGURADA'}`);
    console.log('-'.repeat(40) + '\n');
}

// Función para validar variables de entorno críticas
function validateEnvironmentVariables() {
    const requiredVars = [
        'DB_HOST',
        'DB_PORT', 
        'USERDB',
        'PASSWORD',
        'MASTER_DB',
        'JWT_SECRET'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.error('❌ Variables de entorno faltantes:');
        missingVars.forEach(varName => {
            console.error(`   - ${varName}`);
        });
        console.error('\n💡 Asegúrate de que tu archivo .env contenga todas las variables necesarias.');
        process.exit(1);
    }

    console.log('✅ Todas las variables de entorno requeridas están configuradas');
}

// Mostrar banner de inicio
showStartupBanner();

// Cargar configuración de entorno
const env = loadEnvironmentConfig();

// Validar variables de entorno
validateEnvironmentVariables();

// Mostrar información del entorno
showEnvironmentInfo(env);

// Importar las funciones de base de datos DESPUÉS de cargar las variables de entorno
const { testConnection, syncDatabase } = require('./shared/config/db');

// Crear la instancia de Express
const app = express();

// Configuración de CORS
console.log('🔧 Configurando CORS...');
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
}));

// Ruta de prueba
app.get('/', (req, res) => {
    const responseData = {
        message: '🚀 API Chancafe Q está activa y funcionando correctamente! ✅',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        database: process.env.MASTER_DB,
        version: '1.0.0'
    };
    res.json(responseData);
});

// Middleware para parsear JSON
console.log('🔧 Configurando middlewares...');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));
app.use('/storage', express.static(path.join(__dirname, 'storage')));
console.log('📁 Configurados directorios estáticos: /uploads, /storage');

// Rutas principales
console.log('🛣️  Configurando rutas...');
const routes = require('./routes');
app.use('/api', routes);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error('❌ Error del servidor:', err.stack);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal!',
        timestamp: new Date().toISOString()
    });
});

// Puerto en el que escuchará el servidor
const PORT = process.env.PORT || 3000;

// Función para inicializar la aplicación
async function startServer() {
    try {
        console.log('🚀 INICIANDO SERVIDOR...');
        console.log('='.repeat(60));

        // 1. Verificar conexión a la base de datos
        console.log('1️⃣  Verificando conexión a la base de datos...');
        const isConnected = await testConnection();
        
        if (!isConnected) {
            console.error('❌ No se pudo establecer conexión con la base de datos');
            console.log('💡 Verifica que MySQL esté ejecutándose y que las credenciales sean correctas');
            process.exit(1);
        }

        // 2. Inicializar modelos de base de datos
        console.log('2️⃣  Inicializando modelos de base de datos...');
        try {
            const { initializeModels } = require('./shared/models/index');
            const { getSequelize } = require('./shared/config/db');
            const sequelize = getSequelize();
            
            // Inicializar modelos
            const models = initializeModels(sequelize);
            console.log('✅ Modelos inicializados correctamente');
            
            // Verificar que todos los modelos críticos estén disponibles
            const requiredModels = ['User', 'Client', 'Quote', 'QuoteItem', 'CreditRequest'];
            const missingModels = requiredModels.filter(modelName => !models[modelName]);
            
            if (missingModels.length > 0) {
                console.warn('⚠️  Modelos faltantes:', missingModels.join(', '));
            } else {
                console.log('✅ Todos los modelos críticos están disponibles');
            }
        } catch (error) {
            console.error('❌ Error al inicializar modelos:', error.message);
            console.error('Stack:', error.stack);
            // Detener el servidor si hay errores críticos de modelos
            process.exit(1);
        }

        // 3. Sincronizar la base de datos
        console.log('3️⃣  Sincronizando modelos con la base de datos...');
        await syncDatabase();

        // 4. Iniciar el servidor
        console.log('4️⃣  Iniciando servidor HTTP...');
        app.listen(PORT, () => {
            console.log('\n' + '='.repeat(60));
            console.log('🎉 ¡SERVIDOR INICIADO EXITOSAMENTE!');
            console.log('='.repeat(60));
            console.log(`🚀 Servidor escuchando en puerto: ${PORT}`);
            console.log(`🌍 Entorno: ${env.toUpperCase()}`);
            console.log(`🌐 URL: ${process.env.SERVER_URL || `http://localhost:${PORT}`}`);
            console.log(`📊 Base de datos: ${process.env.MASTER_DB}`);
            console.log(`⏰ Iniciado: ${new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' })}`);
            console.log('='.repeat(60));
            console.log('📚 Rutas disponibles:');
            console.log(`   🏠 GET  ${process.env.SERVER_URL || `http://localhost:${PORT}`}/`);
            console.log(`   🔌 API  ${process.env.SERVER_URL || `http://localhost:${PORT}`}/v1/api`);
            console.log('='.repeat(60) + '\n');
        });

    } catch (error) {
        console.error('\n❌ ERROR CRÍTICO AL INICIALIZAR EL SERVIDOR:');
        console.error('='.repeat(60));
        console.error(error.message);
        console.error('='.repeat(60));
        process.exit(1);
    }
}

// Manejo de señales del sistema para cierre limpio
process.on('SIGTERM', () => {
    console.log('\n🛑 Recibida señal SIGTERM. Cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n🛑 Recibida señal SIGINT (Ctrl+C). Cerrando servidor...');
    process.exit(0);
});

// Inicializar el servidor
startServer().catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
});

module.exports = app;