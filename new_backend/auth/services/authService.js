// services/authService.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user"); 
const {getSequelize} = require('../../shared/config/db');
const user = require("../models/user");

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
  if (user.length < 1 ) {
    throw new Error("El usuario no existe");
  }

  const isMatch = await bcrypt.compare(password, user[0].password);
  if (!isMatch) {
    throw new Error("Contraseña incorrecta");
  }

  const token = generateToken(user[0]);

  const userWithoutPassword = {
    id: user[0].id,
    username: user[0].username,
    email: user[0].email,
    profile: user[0].profile,
    profile_id: user[0].profile_id,
    establishment_id: user[0].establishment_id,
    warehouse_id: user[0].warehouse_id,
  };
 // const userResponse = user[0]
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
