const { Sequelize } = require('sequelize');
const { config, database } = require('../config');

// Usar la instancia de Sequelize ya configurada
const sequelize = database;

// Objeto para almacenar todos los modelos
const db = {};

// Importar y definir modelos
db.User = require('./User')(sequelize);
db.Client = require('./Client')(sequelize);
db.Category = require('./Category')(sequelize);
db.Product = require('./Product')(sequelize);
db.Quote = require('./Quote')(sequelize);
db.QuoteItem = require('./QuoteItem')(sequelize);
db.CreditRequest = require('./CreditRequest')(sequelize);
db.UserSession = require('./UserSession')(sequelize);
db.ActivityLog = require('./ActivityLog')(sequelize);

// Configurar asociaciones
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Agregar instancia de Sequelize y constructor
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Función para probar la conexión
db.testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    return false;
  }
};

// Función para sincronizar modelos (solo en desarrollo)
db.syncModels = async (force = false) => {
  try {
    if (env === 'development') {
      await sequelize.sync({ force });
      console.log('✅ Modelos sincronizados correctamente.');
    }
    return true;
  } catch (error) {
    console.error('❌ Error al sincronizar modelos:', error.message);
    return false;
  }
};

// Función para cerrar la conexión
db.closeConnection = async () => {
  try {
    await sequelize.close();
    console.log('✅ Conexión a la base de datos cerrada correctamente.');
  } catch (error) {
    console.error('❌ Error al cerrar la conexión:', error.message);
  }
};

// Manejo de errores de conexión
sequelize.addHook('beforeConnect', (config) => {
  // console.log('Intentando conectar a la base de datos...');
});

sequelize.addHook('afterConnect', (connection, config) => {
  // console.log('Conectado a la base de datos exitosamente.');
});

sequelize.addHook('beforeDisconnect', (connection) => {
  // console.log('Desconectando de la base de datos...');
});

// Manejo de errores globales de Sequelize
process.on('unhandledRejection', (reason, promise) => {
  if (reason && reason.name && reason.name.includes('Sequelize')) {
    console.error('Error de Sequelize no manejado:', reason);
  }
});

module.exports = db;