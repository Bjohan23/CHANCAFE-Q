const jwt = require('jsonwebtoken');
const config = require('../config');
const { v4: uuidv4 } = require('uuid');

/**
 * Utilidades para manejo de JWT (JSON Web Tokens)
 * Funciones para generar, verificar y decodificar tokens
 */
class JWTUtils {
  
  /**
   * Genera un token JWT para el usuario
   * @param {Object} user - Objeto usuario
   * @param {string} sessionId - ID único de la sesión
   * @returns {string} Token JWT firmado
   */
  static generateToken(user, sessionId = null) {
    const payload = {
      id: user.id,
      code: user.code,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      sessionId: sessionId || uuidv4(),
      iat: Math.floor(Date.now() / 1000),
      iss: config.jwt.issuer,
      aud: config.jwt.audience
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
      issuer: config.jwt.issuer,
      audience: config.jwt.audience
    });
  }

  /**
   * Genera un refresh token
   * @param {Object} user - Objeto usuario  
   * @param {string} sessionId - ID único de la sesión
   * @returns {string} Refresh token
   */
  static generateRefreshToken(user, sessionId = null) {
    const payload = {
      id: user.id,
      sessionId: sessionId || uuidv4(),
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.refreshExpiresIn,
      issuer: config.jwt.issuer,
      audience: config.jwt.audience
    });
  }

  /**
   * Verifica y decodifica un token JWT
   * @param {string} token - Token a verificar
   * @returns {Object} Payload decodificado del token
   * @throws {Error} Si el token es inválido o expirado
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret, {
        issuer: config.jwt.issuer,
        audience: config.jwt.audience
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expirado');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Token inválido');
      } else if (error.name === 'NotBeforeError') {
        throw new Error('Token no válido aún');
      } else {
        throw new Error('Error al verificar token: ' + error.message);
      }
    }
  }

  /**
   * Decodifica un token sin verificar la firma (para debugging)
   * @param {string} token - Token a decodificar
   * @returns {Object|null} Payload decodificado o null si hay error
   */
  static decodeToken(token) {
    try {
      return jwt.decode(token, { complete: true });
    } catch (error) {
      return null;
    }
  }

  /**
   * Verifica si un token está expirado sin lanzar excepción
   * @param {string} token - Token a verificar
   * @returns {boolean} true si está expirado, false si no
   */
  static isTokenExpired(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) return true;
      
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Obtiene el tiempo restante de un token en segundos
   * @param {string} token - Token a analizar
   * @returns {number} Segundos restantes (0 si expirado o inválido)
   */
  static getTokenRemainingTime(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) return 0;
      
      const currentTime = Math.floor(Date.now() / 1000);
      const remainingTime = decoded.exp - currentTime;
      
      return remainingTime > 0 ? remainingTime : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Extrae el token del header Authorization
   * @param {string} authHeader - Header Authorization
   * @returns {string|null} Token extraído o null
   */
  static extractTokenFromHeader(authHeader) {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  }

  /**
   * Crea un token de sesión único
   * @returns {string} Token de sesión único
   */
  static generateSessionToken() {
    return uuidv4() + '_' + Date.now();
  }

  /**
   * Valida la estructura básica de un JWT
   * @param {string} token - Token a validar
   * @returns {boolean} true si tiene estructura válida
   */
  static hasValidJWTStructure(token) {
    if (!token || typeof token !== 'string') return false;
    
    const parts = token.split('.');
    return parts.length === 3;
  }

  /**
   * Genera tokens de acceso y refresh para una sesión
   * @param {Object} user - Usuario
   * @param {string} sessionId - ID de sesión
   * @returns {Object} Objeto con accessToken y refreshToken
   */
  static generateTokenPair(user, sessionId = null) {
    const sessionIdentifier = sessionId || uuidv4();
    
    return {
      accessToken: this.generateToken(user, sessionIdentifier),
      refreshToken: this.generateRefreshToken(user, sessionIdentifier),
      sessionId: sessionIdentifier,
      expiresIn: config.jwt.expiresIn,
      tokenType: 'Bearer'
    };
  }

  /**
   * Renueva un token usando el refresh token
   * @param {string} refreshToken - Refresh token válido
   * @param {Object} user - Usuario actualizado
   * @returns {Object} Nuevo par de tokens
   */
  static renewTokens(refreshToken, user) {
    try {
      const decoded = this.verifyToken(refreshToken);
      
      if (decoded.type !== 'refresh') {
        throw new Error('Token de tipo incorrecto');
      }
      
      if (decoded.id !== user.id) {
        throw new Error('Token no corresponde al usuario');
      }
      
      return this.generateTokenPair(user, decoded.sessionId);
    } catch (error) {
      throw new Error('Error al renovar tokens: ' + error.message);
    }
  }
}

module.exports = JWTUtils;