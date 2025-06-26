require('dotenv').config();
const bcrypt = require('bcrypt');
const { initializeDatabase, getSequelize } = require('./shared/config/db');

async function createAdminUser() {
    try {
        console.log('🔧 Creando usuario administrador por defecto...');
        
        // Inicializar base de datos
        await initializeDatabase();
        
        // Importar modelos
        const { initializeModels, getModel } = require('./shared/models/index');
        const sequelize = getSequelize();
        await initializeModels(sequelize);
        
        const User = getModel('User');
        
        if (!User) {
            console.error('❌ Modelo User no encontrado');
            return;
        }
        
        // Verificar si ya existe el usuario admin
        const existingAdmin = await User.findOne({
            where: { email: 'admin@example.com' }
        });
        
        if (existingAdmin) {
            console.log('✅ Usuario administrador ya existe');
            console.log('📧 Email: admin@example.com');
            console.log('🔐 Password: admin123');
            return;
        }
        
        // Crear hash de la contraseña
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        // Crear usuario administrador
        const adminUser = await User.create({
            first_name: 'Administrador',
            last_name: 'Sistema',
            email: 'admin@example.com',
            password: hashedPassword,
            phone: '+51999999999',
            role: 'admin',
            status: 'active',
            avatar_url: '/storage/img/avatar.png',
            hire_date: new Date(),
            branch_office: 'Oficina Principal',
            commission_rate: 0.00
        });
        
        console.log('✅ Usuario administrador creado exitosamente!');
        console.log('📧 Email: admin@example.com');
        console.log('🔐 Password: admin123');
        console.log('👤 ID:', adminUser.id);
        console.log('🎯 Rol:', adminUser.role);
        
    } catch (error) {
        console.error('❌ Error al crear usuario administrador:', error.message);
    } finally {
        process.exit(0);
    }
}

// Ejecutar la función
createAdminUser();
