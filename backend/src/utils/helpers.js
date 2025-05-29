const moment = require('moment');

/**
 * Funciones auxiliares generales para la aplicación
 * Contiene utilidades comunes que se usan en diferentes partes del sistema
 */
class Helpers {

  /**
   * Formatea una respuesta de API estándar
   * @param {boolean} success - Si la operación fue exitosa
   * @param {string} message - Mensaje descriptivo
   * @param {*} data - Datos a retornar
   * @param {string} code - Código de error o estado
   * @param {number} statusCode - Código de estado HTTP
   * @returns {Object} Respuesta formateada
   */
  static formatResponse(success, message, data = null, code = null, statusCode = 200) {
    const response = {
      success,
      message,
      timestamp: new Date().toISOString(),
      statusCode
    };

    if (data !== null) {
      response.data = data;
    }

    if (code) {
      response.code = code;
    }

    return response;
  }

  /**
   * Formatea una respuesta de éxito
   * @param {string} message - Mensaje de éxito
   * @param {*} data - Datos a retornar
   * @param {number} statusCode - Código de estado HTTP
   * @returns {Object} Respuesta de éxito
   */
  static successResponse(message, data = null, statusCode = 200) {
    return this.formatResponse(true, message, data, 'SUCCESS', statusCode);
  }

  /**
   * Formatea una respuesta de error
   * @param {string} message - Mensaje de error
   * @param {string} code - Código de error
   * @param {*} details - Detalles adicionales del error
   * @param {number} statusCode - Código de estado HTTP
   * @returns {Object} Respuesta de error
   */
  static errorResponse(message, code = 'ERROR', details = null, statusCode = 400) {
    const response = this.formatResponse(false, message, null, code, statusCode);
    
    if (details) {
      response.details = details;
    }

    return response;
  }

  /**
   * Calcula la paginación para consultas
   * @param {number} page - Página actual (base 1)
   * @param {number} limit - Elementos por página
   * @returns {Object} Objeto con offset, limit y información de paginación
   */
  static calculatePagination(page = 1, limit = 10) {
    const pageNumber = Math.max(1, parseInt(page));
    const limitNumber = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNumber - 1) * limitNumber;

    return {
      offset,
      limit: limitNumber,
      page: pageNumber,
      getMetadata: (totalItems) => ({
        currentPage: pageNumber,
        itemsPerPage: limitNumber,
        totalItems,
        totalPages: Math.ceil(totalItems / limitNumber),
        hasNextPage: pageNumber < Math.ceil(totalItems / limitNumber),
        hasPreviousPage: pageNumber > 1
      })
    };
  }

  /**
   * Sanitiza un string removiendo caracteres peligrosos
   * @param {string} input - String a sanitizar
   * @returns {string} String sanitizado
   */
  static sanitizeString(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/[<>\"'%;&()]/g, '') // Remover caracteres peligrosos
      .trim();
  }

  /**
   * Genera un código único basado en prefijo y timestamp
   * @param {string} prefix - Prefijo del código
   * @param {number} length - Longitud del número secuencial
   * @returns {string} Código único generado
   */
  static generateUniqueCode(prefix = 'COD', length = 6) {
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(Math.random() * Math.pow(10, length))
      .toString()
      .padStart(length, '0');
    
    return `${prefix}${timestamp}${randomNum}`;
  }

  /**
   * Convierte un string a slug (URL amigable)
   * @param {string} text - Texto a convertir
   * @returns {string} Slug generado
   */
  static slugify(text) {
    if (!text || typeof text !== 'string') return '';
    
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
      .replace(/\s+/g, '-') // Espacios a guiones
      .replace(/-+/g, '-') // Múltiples guiones a uno
      .trim('-'); // Remover guiones al inicio y final
  }

  /**
   * Formatea un número como moneda peruana
   * @param {number} amount - Cantidad a formatear
   * @param {string} currency - Tipo de moneda (PEN o USD)
   * @returns {string} Cantidad formateada
   */
  static formatCurrency(amount, currency = 'PEN') {
    if (isNaN(amount)) return '0.00';
    
    const formatter = new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'PEN',
      minimumFractionDigits: 2
    });
    
    return formatter.format(amount);
  }

  /**
   * Formatea una fecha en español peruano
   * @param {Date|string} date - Fecha a formatear
   * @param {string} format - Formato deseado
   * @returns {string} Fecha formateada
   */
  static formatDate(date, format = 'DD/MM/YYYY') {
    if (!date) return '';
    
    moment.locale('es');
    return moment(date).format(format);
  }

  /**
   * Formatea fecha y hora en español peruano
   * @param {Date|string} date - Fecha a formatear
   * @returns {string} Fecha y hora formateada
   */
  static formatDateTime(date) {
    return this.formatDate(date, 'DD/MM/YYYY HH:mm');
  }

  /**
   * Calcula la diferencia en días entre dos fechas
   * @param {Date|string} startDate - Fecha inicial
   * @param {Date|string} endDate - Fecha final
   * @returns {number} Diferencia en días
   */
  static daysDifference(startDate, endDate = new Date()) {
    const start = moment(startDate);
    const end = moment(endDate);
    return end.diff(start, 'days');
  }

  /**
   * Valida si una fecha está en el futuro
   * @param {Date|string} date - Fecha a validar
   * @returns {boolean} true si está en el futuro
   */
  static isFutureDate(date) {
    return moment(date).isAfter(moment());
  }

  /**
   * Obtiene información del dispositivo desde User-Agent
   * @param {string} userAgent - User agent string
   * @returns {Object} Información del dispositivo
   */
  static parseUserAgent(userAgent) {
    if (!userAgent) return { device: 'Unknown', browser: 'Unknown', os: 'Unknown' };
    
    const ua = userAgent.toLowerCase();
    
    // Detectar dispositivo
    let device = 'Desktop';
    if (ua.includes('mobile') || ua.includes('android')) device = 'Mobile';
    else if (ua.includes('tablet') || ua.includes('ipad')) device = 'Tablet';
    
    // Detectar navegador
    let browser = 'Unknown';
    if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari')) browser = 'Safari';
    else if (ua.includes('edge')) browser = 'Edge';
    
    // Detectar SO
    let os = 'Unknown';
    if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
    else if (ua.includes('mac')) os = 'macOS';
    else if (ua.includes('linux')) os = 'Linux';
    
    return { device, browser, os, full: userAgent };
  }

  /**
   * Genera un hash simple para strings (no criptográfico)
   * @param {string} str - String a hashear
   * @returns {string} Hash hexadecimal
   */
  static simpleHash(str) {
    let hash = 0;
    if (str.length === 0) return hash.toString(16);
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32bit
    }
    
    return Math.abs(hash).toString(16);
  }

  /**
   * Remueve propiedades con valores null, undefined o vacíos de un objeto
   * @param {Object} obj - Objeto a limpiar
   * @returns {Object} Objeto limpio
   */
  static cleanObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    
    const cleaned = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined && value !== '') {
        if (typeof value === 'object' && !Array.isArray(value)) {
          const cleanedNested = this.cleanObject(value);
          if (Object.keys(cleanedNested).length > 0) {
            cleaned[key] = cleanedNested;
          }
        } else {
          cleaned[key] = value;
        }
      }
    }
    
    return cleaned;
  }

  /**
   * Convierte los primeros caracteres de cada palabra a mayúscula
   * @param {string} str - String a convertir
   * @returns {string} String con formato título
   */
  static toTitleCase(str) {
    if (!str || typeof str !== 'string') return str;
    
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Valida si un string es un JSON válido
   * @param {string} str - String a validar
   * @returns {boolean} true si es JSON válido
   */
  static isValidJSON(str) {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtiene la IP real del cliente considerando proxies
   * @param {Object} req - Request de Express
   * @returns {string} IP del cliente
   */
  static getClientIP(req) {
    return req.ip ||
           req.connection?.remoteAddress ||
           req.socket?.remoteAddress ||
           req.connection?.socket?.remoteAddress ||
           req.headers['x-forwarded-for']?.split(',')[0] ||
           req.headers['x-real-ip'] ||
           '127.0.0.1';
  }

  /**
   * Genera un nombre de archivo único
   * @param {string} originalName - Nombre original del archivo
   * @param {string} prefix - Prefijo opcional
   * @returns {string} Nombre único del archivo
   */
  static generateUniqueFileName(originalName, prefix = '') {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const extension = originalName.split('.').pop();
    const name = originalName.split('.').slice(0, -1).join('.');
    const sanitizedName = this.slugify(name);
    
    return `${prefix}${sanitizedName}_${timestamp}_${random}.${extension}`;
  }
}

module.exports = Helpers;