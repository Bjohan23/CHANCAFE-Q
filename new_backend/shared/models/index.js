const fs = require('fs');
const path = require('path');
const { getSequelize } = require('../config/db');

const sequelize = getSequelize();
const basename = path.basename(__filename);
const db = {};

// Directorios donde buscar modelos
const modelDirectories = [
  __dirname,  // shared/models
  path.join(__dirname, '../../auth/models'),  // auth/models
  // Agregar aquí más directorios si tienes modelos en otros lugares
];

// Función para cargar modelos desde un directorio
function loadModelsFromDirectory(directory) {
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

// Cargar modelos desde todos los directorios
modelDirectories.forEach(directory => {
  loadModelsFromDirectory(directory);
});

// Configurar asociaciones si existen
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = require('sequelize');

console.log(`📦 Modelos cargados: ${Object.keys(db).filter(key => key !== 'sequelize' && key !== 'Sequelize').join(', ')}`);

module.exports = db;