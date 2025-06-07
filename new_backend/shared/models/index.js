const fs = require('fs');
const path = require('path');

const basename = path.basename(__filename);
const db = {};

// Variable para controlar si los modelos ya fueron inicializados
let initialized = false;

// Directorios donde buscar modelos
const modelDirectories = [
  __dirname,  // shared/models
  path.join(__dirname, '../../auth/models'),  // auth/models ← AGREGADO PARA TU ESTRUCTURA
  // Agregar aquí más directorios si tienes modelos en otros lugares
];

// Función para cargar modelos desde un directorio
function loadModelsFromDirectory(directory, sequelize) {
  // Verificar si el directorio existe
  if (!fs.existsSync(directory)) {
    console.log(`📁 Directorio de modelos no encontrado: ${directory}`);
    return;
  }

  console.log(`📂 Cargando modelos desde: ${directory}`);
  
  fs.readdirSync(directory)
    .filter(file => {
      return (
        file.indexOf('.') !== 0 &&
        file !== basename &&
        file.slice(-3) === '.js' &&
        file.indexOf('.test.js') === -1
      );
    })
    .forEach(file => {
      try {
        const model = require(path.join(directory, file));
        
        // Si el modelo tiene un método de inicialización, llamarlo
        if (typeof model === 'function') {
          const initializedModel = model(sequelize);
          db[initializedModel.name] = initializedModel;
          console.log(`✅ Modelo cargado: ${initializedModel.name} desde ${file}`);
        } else if (model.name) {
          db[model.name] = model;
          console.log(`✅ Modelo cargado: ${model.name} desde ${file}`);
        }
      } catch (error) {
        console.error(`❌ Error cargando modelo ${file}:`, error.message);
      }
    });
}

// Función para inicializar todos los modelos
function initializeModels(sequelize) {
  if (initialized) {
    console.log('⚠️  Los modelos ya han sido inicializados');
    return db;
  }

  console.log('📦 Inicializando modelos de Sequelize...');

  // Cargar modelos desde todos los directorios
  modelDirectories.forEach(directory => {
    loadModelsFromDirectory(directory, sequelize);
  });

  // Configurar asociaciones si existen
  console.log('🔗 Configurando asociaciones entre modelos...');
  Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
      try {
        db[modelName].associate(db);
        console.log(`✅ Asociaciones de ${modelName} configuradas`);
      } catch (error) {
        console.error(`❌ Error al configurar asociaciones de ${modelName}:`, error.message);
      }
    }
  });

  // Agregar instancias de Sequelize al objeto db
  db.sequelize = sequelize;
  db.Sequelize = require('sequelize');

  initialized = true;
  
  const modelNames = Object.keys(db).filter(key => key !== 'sequelize' && key !== 'Sequelize');
  console.log(`📦 Total de modelos cargados: ${modelNames.length}`);
  if (modelNames.length > 0) {
    console.log(`📋 Modelos disponibles: ${modelNames.join(', ')}`);
  }

  return db;
}

// Función para obtener los modelos (solo después de inicializar)
function getModels() {
  if (!initialized) {
    console.warn('⚠️  Los modelos aún no han sido inicializados. Llama a initializeModels(sequelize) primero.');
    return {};
  }
  return db;
}

// Función para obtener un modelo específico
function getModel(modelName) {
  if (!initialized) {
    console.warn(`⚠️  Los modelos aún no han sido inicializados. No se puede obtener ${modelName}.`);
    return null;
  }
  return db[modelName] || null;
}

// Exportar funciones y el objeto db
module.exports = {
  initializeModels,
  getModels,
  getModel,
  ...db  // Esto permite seguir usando la sintaxis antigua después de inicializar
};