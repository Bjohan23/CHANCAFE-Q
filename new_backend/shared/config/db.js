const { Sequelize, DataTypes, Op } = require("sequelize");

let currentSequelize;

function createSequelizeInstance(dbName) {
  // Validar que las variables de entorno existan
  if (!process.env.USERDB || !process.env.PASSWORD || !process.env.DB_HOST || !process.env.DB_PORT) {
    throw new Error('❌ Variables de entorno de base de datos no configuradas correctamente');
  }

  console.log(`🔗 Creando conexión a la base de datos: ${dbName}`);
  console.log(`🖥️  Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  console.log(`👤 Usuario: ${process.env.USERDB}`);

  return new Sequelize(dbName, process.env.USERDB, process.env.PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: process.env.NODE_ENV === 'development' ? 
      (sql) => console.log(`🔍 [DB Query] ${sql}`) : false,
    timezone: "-05:00",
    dialectOptions: {
      timezone: "-05:00",
      dateStrings: true,
      typeCast: true,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
}

// Inicializar la conexión con la base de datos maestra
function initializeDatabase() {
  if (!process.env.MASTER_DB) {
    throw new Error('❌ Variable MASTER_DB no está configurada en el archivo .env');
  }

  console.log(`📊 Inicializando conexión con base de datos maestra: ${process.env.MASTER_DB}`);
  currentSequelize = createSequelizeInstance(process.env.MASTER_DB);
  return currentSequelize;
}

function setCurrentSequelize(sequelize) {
  currentSequelize = sequelize;
  // Actualizar modelos con la nueva conexión
  Object.values(currentSequelize.models).forEach((model) => {
    model.sequelize = currentSequelize;
  });
}

function getSequelize() {
  if (!currentSequelize) {
    throw new Error('❌ Sequelize no ha sido inicializado. Llama a initializeDatabase() primero.');
  }
  return currentSequelize;
}

// Función para sincronizar la base de datos
async function syncDatabase(options = {}) {
  try {
    const env = process.env.NODE_ENV || 'development';
    
    console.log(`🔄 Sincronizando base de datos...`);
    console.log(`📂 Base de datos actual: ${process.env.MASTER_DB}`);
    console.log(`🌍 Entorno: ${env}`);
    
    // Configuración según el entorno
    let syncOptions = {};
    
    if (env === 'development' || env === 'qas') {
      // En desarrollo/QAS: actualiza las tablas sin eliminar datos
      syncOptions = { 
        alter: true,  // Actualiza las columnas sin eliminar la tabla
        ...options 
      };
      console.log('⚠️  Modo: ALTER (actualizará estructura sin eliminar datos)');
    } else if (env === 'production') {
      // En producción: solo sincroniza sin cambios destructivos
      syncOptions = { 
        alter: false,
        force: false,
        ...options 
      };
      console.log('🔒 Modo: SEGURO (sin cambios destructivos)');
    } else {
      // Para otros entornos
      syncOptions = { 
        force: false,
        alter: false,
        ...options 
      };
      console.log('🛡️  Modo: CONSERVADOR (sin cambios)');
    }

    await currentSequelize.sync(syncOptions);
    console.log('✅ Base de datos sincronizada correctamente');
    
  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error.message);
    throw error;
  }
}

// Función para forzar recreación de tablas (¡CUIDADO: Elimina datos!)
async function resetDatabase() {
  try {
    console.log('🚨 ADVERTENCIA: Recreando todas las tablas (se perderán los datos)');
    await currentSequelize.sync({ force: true });
    console.log('✅ Base de datos recreada completamente');
  } catch (error) {
    console.error('❌ Error al recrear la base de datos:', error.message);
    throw error;
  }
}

// Función para verificar la conexión a la base de datos
async function testConnection() {
  try {
    if (!currentSequelize) {
      console.log('🔌 Inicializando conexión a la base de datos...');
      initializeDatabase();
    }

    console.log('🔌 Probando conexión a la base de datos...');
    await currentSequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente');
    
    // Mostrar información adicional de la conexión
    const [results] = await currentSequelize.query('SELECT DATABASE() as db_name, USER() as user_name, VERSION() as version');
    const dbInfo = results[0];
    console.log(`📊 Base de datos activa: ${dbInfo.db_name}`);
    console.log(`👤 Usuario conectado: ${dbInfo.user_name}`);
    console.log(`🔢 Versión MySQL: ${dbInfo.version}`);
    
    return true;
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error.message);
    return false;
  }
}

module.exports = {
  Sequelize,
  DataTypes,
  Op,
  createSequelizeInstance,
  initializeDatabase,
  setCurrentSequelize,
  getSequelize,
  syncDatabase,
  resetDatabase,
  testConnection,
};