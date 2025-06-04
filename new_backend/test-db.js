// test-db.js - Archivo para probar la conexión y sincronización
const { testConnection, syncDatabase, resetDatabase } = require('./shared/config/db');

async function testDatabase() {
  try {
    console.log('🧪 Iniciando prueba de base de datos...');
    
    // 1. Probar conexión
    console.log('\n1️⃣ Probando conexión...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('❌ No se pudo conectar a la base de datos');
      return;
    }
    
    // 2. Cargar modelos
    console.log('\n2️⃣ Cargando modelos...');
    const db = require('./shared/models');
    console.log('Modelos disponibles:', Object.keys(db).filter(key => key !== 'sequelize' && key !== 'Sequelize'));
    
    // 3. Verificar que el modelo User esté cargado
    if (db.User) {
      console.log('✅ Modelo User encontrado:', db.User.name);
      console.log('📋 Atributos del modelo User:', Object.keys(db.User.rawAttributes));
    } else {
      console.error('❌ Modelo User NO encontrado');
      return;
    }
    
    // 4. Sincronizar base de datos
    console.log('\n3️⃣ Sincronizando base de datos...');
    await syncDatabase({ alter: true });
    
    // 5. Probar crear un usuario de prueba
    console.log('\n4️⃣ Probando crear usuario de prueba...');
    try {
      await db.User.findOrCreate({
        where: { email: 'test@example.com' },
        defaults: {
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          password: 'hashedpassword123',
          phone: '123456789',
          role: 'sales_rep',
          status: 'active'
        }
      });
      console.log('✅ Usuario de prueba creado/encontrado exitosamente');
    } catch (userError) {
      console.error('❌ Error creando usuario de prueba:', userError.message);
    }
    
    console.log('\n🎉 Prueba completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar prueba
testDatabase();