const app = require('./src/app');
const { config, database } = require('./src/config');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// Función para iniciar el servidor
async function startServer() {
    try {
        // Verificar conexión a la base de datos
        console.log('🔄 Verificando conexión a la base de datos...');
        await database.authenticate();
        console.log('✅ Conexión a la base de datos establecida exitosamente');
        
        // Sincronizar modelos (solo en desarrollo)
        if (process.env.NODE_ENV === 'development') {
            console.log('🔄 Sincronizando modelos de base de datos...');
            await database.sync({ alter: false }); // Cambia a true si quieres alterar tablas automáticamente
            console.log('✅ Modelos sincronizados exitosamente');
        }
        
        // Iniciar servidor
        const server = app.listen(PORT, HOST, () => {
            console.log('\n🚀 ===================================');
            console.log('🚀 CHANCAFE Q API SERVER INICIADO');
            console.log('🚀 ===================================');
            console.log(`🌐 Servidor corriendo en: http://${HOST}:${PORT}`);
            console.log(`📊 Health Check: http://${HOST}:${PORT}/health`);
            console.log(`📋 API Status: http://${HOST}:${PORT}/api/status`);
            console.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📅 Iniciado: ${new Date().toLocaleString()}`);
            console.log('🚀 ===================================\n');
        });
        
        // Manejo de cierre graceful
        const gracefulShutdown = async (signal) => {
            console.log(`\n⚠️  Recibida señal ${signal}. Iniciando cierre graceful...`);
            
            server.close(async () => {
                console.log('🔄 Servidor HTTP cerrado');
                
                try {
                    await database.close();
                    console.log('✅ Conexión a base de datos cerrada');
                } catch (error) {
                    console.error('❌ Error cerrando conexión a base de datos:', error);
                }
                
                console.log('👋 Proceso terminado exitosamente');
                process.exit(0);
            });
            
            // Forzar cierre después de 10 segundos
            setTimeout(() => {
                console.error('⚠️  Forzando cierre del proceso...');
                process.exit(1);
            }, 10000);
        };
        
        // Escuchar señales de cierre
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        
        // Manejo de errores no capturados
        process.on('uncaughtException', (error) => {
            console.error('❌ Excepción no capturada:', error);
            process.exit(1);
        });
        
        process.on('unhandledRejection', (reason, promise) => {
            console.error('❌ Promesa rechazada no manejada en:', promise, 'razón:', reason);
            process.exit(1);
        });
        
    } catch (error) {
        console.error('❌ Error iniciando el servidor:', error);
        process.exit(1);
    }
}

// Iniciar servidor
startServer();
