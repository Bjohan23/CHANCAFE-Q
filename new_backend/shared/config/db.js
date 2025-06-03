const { Sequelize, DataTypes, Op } = require("sequelize");
require("dotenv").config();

let currentSequelize;

function createSequelizeInstance(dbName) {
  return new Sequelize(dbName, process.env.USERDB, process.env.PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: (sql) => console.log(`[DB Query] ${sql}`),
    timezone: "-05:00",
    dialectOptions: {
      timezone: "-05:00",
      dateStrings: true,
      typeCast: true,
    },
  });
}

const masterSequelize = createSequelizeInstance(process.env.MASTER_DB);
currentSequelize = masterSequelize;

function setCurrentSequelize(sequelize) {
  currentSequelize = sequelize;
  // Actualizar modelos con la nueva conexión
  Object.values(currentSequelize.models).forEach((model) => {
    model.sequelize = currentSequelize;
  });
}

function getSequelize() {
  return currentSequelize;
}

// Función para sincronizar la base de datos
async function syncDatabase(options = {}) {
  try {
    const env = process.env.NODE_ENV || 'development';
    
    // Configuración según el entorno
    let syncOptions = {};
    
    if (env === 'development') {
      // En desarrollo: actualiza las tablas sin eliminar datos
      syncOptions = { 
        alter: true,  // Actualiza las columnas sin eliminar la tabla
        ...options 
      };
    } else if (env === 'production') {
      // En producción: solo sincroniza sin cambios destructivos
      syncOptions = { 
        alter: false,
        force: false,
        ...options 
      };
    } else {
      // Para otros entornos (testing, etc.)
      syncOptions = { 
        force: false,  // No elimina las tablas existentes
        alter: true,   // Permite actualizaciones de columnas
        ...options 
      };
    }

    console.log(`🔄 Sincronizando base de datos en entorno: ${env}`);
    await currentSequelize.sync(syncOptions);
    console.log('✅ Base de datos sincronizada correctamente');
    
  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error);
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
    console.error('❌ Error al recrear la base de datos:', error);
    throw error;
  }
}

// Función para verificar la conexión a la base de datos
async function testConnection() {
  try {
    await currentSequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente');
    return true;
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error);
    return false;
  }
}

module.exports = {
  Sequelize,
  DataTypes,
  Op,
  masterSequelize,
  createSequelizeInstance,
  setCurrentSequelize,
  getSequelize,
  syncDatabase,
  resetDatabase,
  testConnection,
};