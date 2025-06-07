const { getSequelize } = require('./shared/config/db');
const migration = require('./migrations/20250603-database-improvements');

async function runMigration() {
  const sequelize = getSequelize();
  
  try {
    console.log('🚀 Iniciando aplicación de mejoras a la base de datos...');
    console.log('📊 Esto aplicará todos los cambios sugeridos automáticamente');
    console.log('');
    
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');
    
    // Ejecutar la migración
    await migration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
    
    console.log('');
    console.log('🎯 ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!');
    console.log('');
    console.log('📋 PRÓXIMOS PASOS:');
    console.log('  1. Reinicia tu servidor de desarrollo');
    console.log('  2. Los nuevos modelos estarán disponibles automáticamente');
    console.log('  3. Puedes usar las nuevas funcionalidades en tus controladores');
    console.log('');
    console.log('🔧 NUEVAS FUNCIONALIDADES DISPONIBLES:');
    console.log('  • Gestión de proveedores (Supplier)');
    console.log('  • Productos con campos extendidos (códigos de barras, proveedor, etc.)');
    console.log('  • Cotizaciones con revisiones y plantillas');
    console.log('  • Clientes con información empresarial expandida');
    console.log('  • Relaciones muchos a muchos entre productos y categorías');
    console.log('  • Sistema de plantillas de cotización');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    console.error('');
    console.error('💡 POSIBLES SOLUCIONES:');
    console.error('  1. Verifica que la base de datos esté corriendo');
    console.error('  2. Revisa las credenciales de conexión en .env');
    console.error('  3. Asegúrate de que el usuario tenga permisos para modificar esquemas');
    console.error('');
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar la migración
runMigration();