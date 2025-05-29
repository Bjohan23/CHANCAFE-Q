const bcrypt = require('bcrypt');
const { config } = require('../config');

/**
 * Utilidades para manejo de contraseñas con bcrypt
 * Funciones para hashear y verificar contraseñas de forma segura
 */
class PasswordUtils {
  
  /**
   * Genera un hash de la contraseña usando bcrypt
   * @param {string} password - Contraseña en texto plano
   * @returns {Promise<string>} Hash de la contraseña
   */
  static async hashPassword(password) {
    try {
      if (!password || typeof password !== 'string') {
        throw new Error('La contraseña debe ser un string válido');
      }

      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      const saltRounds = config.security.bcryptRounds;
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      throw new Error('Error al hashear contraseña: ' + error.message);
    }
  }

  /**
   * Verifica si una contraseña coincide con su hash
   * @param {string} plainPassword - Contraseña en texto plano
   * @param {string} hashedPassword - Hash almacenado
   * @returns {Promise<boolean>} true si coinciden, false si no
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      if (!plainPassword || !hashedPassword) {
        return false;
      }

      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error al verificar contraseña:', error);
      return false;
    }
  }

  /**
   * Valida la fortaleza de una contraseña
   * @param {string} password - Contraseña a validar
   * @returns {Object} Objeto con validación y mensaje
   */
  static validatePasswordStrength(password) {
    const result = {
      isValid: false,
      score: 0,
      errors: [],
      suggestions: []
    };

    if (!password || typeof password !== 'string') {
      result.errors.push('La contraseña es requerida');
      return result;
    }

    // Validaciones básicas
    if (password.length < 6) {
      result.errors.push('Debe tener al menos 6 caracteres');
    } else {
      result.score += 1;
    }

    if (password.length >= 8) {
      result.score += 1;
    }

    // Validar mayúsculas
    if (!/[A-Z]/.test(password)) {
      result.suggestions.push('Incluir al menos una letra mayúscula');
    } else {
      result.score += 1;
    }

    // Validar minúsculas
    if (!/[a-z]/.test(password)) {
      result.suggestions.push('Incluir al menos una letra minúscula');
    } else {
      result.score += 1;
    }

    // Validar números
    if (!/\d/.test(password)) {
      result.suggestions.push('Incluir al menos un número');
    } else {
      result.score += 1;
    }

    // Validar caracteres especiales
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      result.suggestions.push('Incluir al menos un carácter especial');
    } else {
      result.score += 1;
    }

    // Validar patrones comunes débiles
    const weakPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /admin/i,
      /letmein/i
    ];

    if (weakPatterns.some(pattern => pattern.test(password))) {
      result.errors.push('No usar patrones comunes como "123456" o "password"');
      result.score -= 2;
    }

    // Determinar si es válida
    result.isValid = result.errors.length === 0 && result.score >= 3;

    return result;
  }

  /**
   * Genera una contraseña temporal segura
   * @param {number} length - Longitud de la contraseña (mínimo 8)
   * @returns {string} Contraseña temporal
   */
  static generateTemporaryPassword(length = 12) {
    const minLength = Math.max(8, length);
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let password = '';
    
    // Asegurar al menos un carácter de cada tipo
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Completar con caracteres aleatorios
    const allChars = uppercase + lowercase + numbers + symbols;
    for (let i = password.length; i < minLength; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Mezclar los caracteres
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Verifica si una contraseña ha sido comprometida (simulado)
   * En producción se podría integrar con APIs como HaveIBeenPwned
   * @param {string} password - Contraseña a verificar
   * @returns {Promise<boolean>} true si está comprometida
   */
  static async isPasswordCompromised(password) {
    // Lista simulada de contraseñas comprometidas comunes
    const compromisedPasswords = [
      '123456',
      'password',
      '123456789',
      'qwerty',
      'abc123',
      'password123',
      'admin',
      'letmein',
      'welcome',
      'monkey'
    ];

    return compromisedPasswords.includes(password.toLowerCase());
  }

  /**
   * Calcula el tiempo estimado para romper una contraseña
   * @param {string} password - Contraseña a analizar
   * @returns {Object} Información sobre tiempo de ruptura
   */
  static estimateCrackTime(password) {
    if (!password) {
      return { time: '0 segundos', strength: 'Muy débil' };
    }

    let charset = 0;
    
    if (/[a-z]/.test(password)) charset += 26;
    if (/[A-Z]/.test(password)) charset += 26;
    if (/\d/.test(password)) charset += 10;
    if (/[^a-zA-Z0-9]/.test(password)) charset += 32;

    const possibilities = Math.pow(charset, password.length);
    const attemptsPerSecond = 1000000000; // 1 billón por segundo (optimista)
    const secondsToCrack = possibilities / (2 * attemptsPerSecond);

    let timeString = '';
    let strength = '';

    if (secondsToCrack < 1) {
      timeString = 'Menos de 1 segundo';
      strength = 'Muy débil';
    } else if (secondsToCrack < 60) {
      timeString = `${Math.round(secondsToCrack)} segundos`;
      strength = 'Débil';
    } else if (secondsToCrack < 3600) {
      timeString = `${Math.round(secondsToCrack / 60)} minutos`;
      strength = 'Regular';
    } else if (secondsToCrack < 86400) {
      timeString = `${Math.round(secondsToCrack / 3600)} horas`;
      strength = 'Buena';
    } else if (secondsToCrack < 31536000) {
      timeString = `${Math.round(secondsToCrack / 86400)} días`;
      strength = 'Fuerte';
    } else {
      timeString = `${Math.round(secondsToCrack / 31536000)} años`;
      strength = 'Muy fuerte';
    }

    return {
      time: timeString,
      strength: strength,
      charset: charset,
      possibilities: possibilities
    };
  }
}

module.exports = PasswordUtils;