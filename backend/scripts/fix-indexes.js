/**
 * Script para limpiar índices duplicados en la base de datos
 * Soluciona el error: "Too many keys specified; max 64 keys allowed"
 */

const { initializeDatabase, getSequelize } = require('../shared/config/db');

async function fixIndexes() {
    // Inicializar la base de datos primero
    console.log('🔌 Inicializando conexión a la base de datos...');
    await initializeDatabase();
    
    const sequelize = getSequelize();
    
    if (!sequelize) {
        console.error('❌ No se pudo conectar a la base de datos');
        return;
    }

    try {
        console.log('🔍 Verificando índices en la base de datos...');
        
        // Lista de tablas principales
        const tables = ['users', 'clients', 'credit_requests', 'quotes', 'quote_items', 'products', 'categories'];
        
        for (const table of tables) {
            console.log(`\n📋 Analizando tabla: ${table}`);
            
            // Obtener información de los índices
            const indexes = await sequelize.query(
                `SHOW INDEX FROM ${table}`,
                { type: sequelize.QueryTypes.SELECT }
            );
            
            console.log(`📊 Total de índices encontrados: ${indexes.length}`);
            
            // Agrupar por nombre de índice
            const indexGroups = {};
            indexes.forEach(index => {
                if (!indexGroups[index.Key_name]) {
                    indexGroups[index.Key_name] = [];
                }
                indexGroups[index.Key_name].push(index);
            });
            
            // Buscar índices duplicados o problemáticos
            for (const [indexName, indexData] of Object.entries(indexGroups)) {
                if (indexName === 'PRIMARY') continue; // No tocar la clave primaria
                
                // Si hay muchas entradas para el mismo índice, podría estar duplicado
                if (indexData.length > 1) {
                    console.log(`⚠️  Índice con múltiples entradas: ${indexName} (${indexData.length} entradas)`);
                }
            }
            
            // Mostrar índices únicos problemáticos
            const uniqueIndexes = indexes.filter(idx => idx.Non_unique === 0 && idx.Key_name !== 'PRIMARY');
            if (uniqueIndexes.length > 0) {
                console.log(`🔑 Índices únicos encontrados: ${uniqueIndexes.length}`);
                uniqueIndexes.forEach(idx => {
                    console.log(`   - ${idx.Key_name} en columna ${idx.Column_name}`);
                });
            }
        }
        
        console.log('\n🛠️ Iniciando limpieza de índices...');
        
        // Limpiar índices específicos de la tabla users que podrían estar causando problemas
        try {
            // Primero obtener todos los índices de users
            const userIndexes = await sequelize.query(
                `SELECT DISTINCT index_name FROM information_schema.statistics 
                 WHERE table_schema = DATABASE() AND table_name = 'users' 
                 AND index_name != 'PRIMARY'`,
                { type: sequelize.QueryTypes.SELECT }
            );
            
            console.log('\n📋 Índices en tabla users:');
            userIndexes.forEach(idx => console.log(`   - ${idx.index_name}`));
            
            // Eliminar índices específicos que podrían estar duplicados
            const indexesToDrop = [
                'users_email_unique',
                'idx_users_email',
                'idx_users_status', 
                'idx_users_role',
                'idx_users_name'
            ];
            
            for (const indexName of indexesToDrop) {
                try {
                    await sequelize.query(`DROP INDEX ${indexName} ON users`);
                    console.log(`✅ Eliminado índice: ${indexName}`);
                } catch (error) {
                    if (!error.message.includes("doesn't exist")) {
                        console.log(`⚠️  No se pudo eliminar ${indexName}: ${error.message}`);
                    }
                }
            }
            
        } catch (error) {
            console.log(`⚠️  Error limpiando índices: ${error.message}`);
        }
        
        console.log('\n✅ Limpieza de índices completada');
        console.log('🔄 Intenta reiniciar el servidor ahora');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await sequelize.close();
    }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
    fixIndexes().then(() => {
        process.exit(0);
    }).catch(error => {
        console.error('❌ Error crítico:', error);
        process.exit(1);
    });
}

module.exports = fixIndexes;