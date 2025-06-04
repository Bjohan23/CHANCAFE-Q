// services/authService.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getSequelize } = require('../../shared/config/db');
const db = require('../../shared/models'); // Importar todos los modelos
const { User } = db; // Extraer el modelo User

// Función para generar un token JWT
const generateToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
  };

  const secret = process.env.JWT_SECRET;
  const options = { expiresIn: "6h" };

  return jwt.sign(payload, secret, options);
};

// Función para manejar el login
const loginUser = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  console.log("Usuario encontrado:--------->", user);
  
  // Si no se encuentra el usuario, findOne devuelve null
  if (!user) {
    throw new Error("El usuario no existe");
  }

  // Comparar contraseñas - usar directamente user.password (Sequelize getter)
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Contraseña incorrecta");
  }

  // Generar token - pasar el usuario directamente, no user[0]
  const token = generateToken(user);

  // Crear objeto sin contraseña usando los campos correctos del modelo User
  const userWithoutPassword = {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    avatar_url: user.avatar_url,
    hire_date: user.hire_date,
    branch_office: user.branch_office,
    commission_rate: user.commission_rate,
    last_login: user.last_login,
    full_name: user.getFullName() // Usar el método del modelo
  };
  
  return { user: userWithoutPassword, token };
};

const registerUser = async (userData) => {
  // Función para generar avatar aleatorio si no se proporciona uno
  const generateRandomAvatar = () => {
    const avatars = ['avatar.png', 'avatar2.png'];
    const randomIndex = Math.floor(Math.random() * avatars.length);
    return `/storage/img/${avatars[randomIndex]}`;
  };

  // Si no hay avatar_url, asignar uno aleatorio
  const avatarUrlRandom = userData.avatar_url || generateRandomAvatar();

  const {
    first_name,
    last_name,
    email,
    password,
    phone,
    role,
    status = 'active',
    avatar_url = avatarUrlRandom,
    hire_date,
    branch_office,
    commission_rate
  } = userData;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error("ya existe un usuario con este email");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    first_name,
    last_name,
    email,
    password: hashedPassword,
    phone,
    role,
    status,
    avatar_url,
    hire_date,
    branch_office,
    commission_rate
  });

  const token = generateToken(newUser);
  const userWithoutPassword = {
    id: newUser.id,
    first_name: newUser.first_name,
    last_name: newUser.last_name,
    email: newUser.email,
    phone: newUser.phone,
    role: newUser.role,
    status: newUser.status,
    avatar_url: newUser.avatar_url,
    hire_date: newUser.hire_date,
    branch_office: newUser.branch_office,
    commission_rate: newUser.commission_rate
  };
  
  return { user: userWithoutPassword, token };
}

module.exports = { loginUser ,registerUser };