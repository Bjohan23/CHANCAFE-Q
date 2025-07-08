const { sendError } = require('../../shared/config/helpers/apiResponseHelper');

class SentinelErrorHandler {
    static handleSentinelError(error, req, res, next) {
        console.error('🔴 [Sentinel Error Handler] Error:', error.message);
        
        if (error.message.includes('DNI')) {
            return sendError(res, 400, error.message);
        }
        
        if (error.message.includes('no encontrada')) {
            return sendError(res, 404, 'Persona no encontrada en el sistema crediticio');
        }
        
        if (error.message.includes('Límite de consultas')) {
            return sendError(res, 429, 'Límite de consultas excedido. Intente más tarde');
        }
        
        if (error.message.includes('Tiempo de espera')) {
            return sendError(res, 408, 'Tiempo de espera agotado en consulta crediticia');
        }
        
        if (error.message.includes('no disponible')) {
            return sendError(res, 503, 'Servicio de consulta crediticia no disponible temporalmente');
        }
        
        return sendError(res, 500, 'Error interno en consulta crediticia');
    }

    static wrapSentinelCall(sentinelFunction) {
        return async (req, res, next) => {
            try {
                return await sentinelFunction(req, res, next);
            } catch (error) {
                return this.handleSentinelError(error, req, res, next);
            }
        };
    }

    static logSentinelRequest(req, res, next) {
        const { dni } = req.params;
        const { method, originalUrl } = req;
        
        console.log(`📋 [Sentinel Request] ${method} ${originalUrl} - DNI: ${dni}`);
        console.log(`📋 [Sentinel Request] IP: ${req.ip}, User-Agent: ${req.get('User-Agent')}`);
        
        next();
    }

    static logSentinelResponse(req, res, next) {
        const originalSend = res.send;
        
        res.send = function(data) {
            const { dni } = req.params;
            const statusCode = res.statusCode;
            
            console.log(`📋 [Sentinel Response] ${statusCode} - DNI: ${dni}`);
            
            if (statusCode >= 400) {
                console.error(`❌ [Sentinel Response] Error ${statusCode} for DNI: ${dni}`);
            } else {
                console.log(`✅ [Sentinel Response] Success ${statusCode} for DNI: ${dni}`);
            }
            
            return originalSend.call(this, data);
        };
        
        next();
    }

    static validateDNI(req, res, next) {
        const { dni } = req.params;
        
        if (!dni) {
            return sendError(res, 400, 'DNI es requerido');
        }
        
        const dniStr = dni.toString().trim();
        
        if (!/^\d{8}$/.test(dniStr)) {
            return sendError(res, 400, 'DNI debe tener exactamente 8 dígitos numéricos');
        }
        
        req.params.dni = dniStr;
        next();
    }

    static rateLimitByDNI(windowMs = 60000, maxRequests = 10) {
        const requests = new Map();
        
        return (req, res, next) => {
            const { dni } = req.params;
            const now = Date.now();
            const windowStart = now - windowMs;
            
            if (!requests.has(dni)) {
                requests.set(dni, []);
            }
            
            const dniRequests = requests.get(dni);
            
            const recentRequests = dniRequests.filter(timestamp => timestamp > windowStart);
            
            if (recentRequests.length >= maxRequests) {
                return sendError(res, 429, `Límite de consultas excedido para DNI ${dni}. Intente más tarde`);
            }
            
            recentRequests.push(now);
            requests.set(dni, recentRequests);
            
            setTimeout(() => {
                const current = requests.get(dni);
                if (current) {
                    const filtered = current.filter(timestamp => timestamp > Date.now() - windowMs);
                    if (filtered.length === 0) {
                        requests.delete(dni);
                    } else {
                        requests.set(dni, filtered);
                    }
                }
            }, windowMs);
            
            next();
        };
    }

    static handleTimeout(timeoutMs = 10000) {
        return (req, res, next) => {
            const timeout = setTimeout(() => {
                if (!res.headersSent) {
                    return sendError(res, 408, 'Tiempo de espera agotado en consulta crediticia');
                }
            }, timeoutMs);
            
            res.on('finish', () => {
                clearTimeout(timeout);
            });
            
            next();
        };
    }

    static auditSentinelAccess(req, res, next) {
        const { dni } = req.params;
        const { method, originalUrl } = req;
        const userAgent = req.get('User-Agent');
        const ip = req.ip;
        const timestamp = new Date().toISOString();
        
        const auditLog = {
            timestamp,
            method,
            url: originalUrl,
            dni,
            ip,
            userAgent,
            userId: req.user ? req.user.userId : null,
            userEmail: req.user ? req.user.email : null
        };
        
        console.log(`📋 [Sentinel Audit] ${JSON.stringify(auditLog)}`);
        
        next();
    }

    static cacheSentinelResponse(cacheTTL = 3600) {
        return (req, res, next) => {
            const { dni } = req.params;
            const { method, originalUrl } = req;
            
            if (method !== 'GET') {
                return next();
            }
            
            const cacheKey = `${originalUrl}_${dni}`;
            
            req.sentinelCacheKey = cacheKey;
            req.sentinelCacheTTL = cacheTTL;
            
            next();
        };
    }

    static handleCircuitBreaker(failureThreshold = 5, resetTimeout = 60000) {
        let failureCount = 0;
        let lastFailureTime = null;
        let circuitState = 'CLOSED';
        
        return (req, res, next) => {
            const now = Date.now();
            
            if (circuitState === 'OPEN') {
                if (now - lastFailureTime > resetTimeout) {
                    circuitState = 'HALF_OPEN';
                    failureCount = 0;
                    console.log('🔄 [Circuit Breaker] State changed to HALF_OPEN');
                } else {
                    return sendError(res, 503, 'Servicio de consulta crediticia temporalmente no disponible');
                }
            }
            
            const originalSend = res.send;
            res.send = function(data) {
                if (res.statusCode >= 500) {
                    failureCount++;
                    lastFailureTime = now;
                    
                    if (failureCount >= failureThreshold) {
                        circuitState = 'OPEN';
                        console.log('🔴 [Circuit Breaker] State changed to OPEN');
                    }
                } else if (circuitState === 'HALF_OPEN') {
                    circuitState = 'CLOSED';
                    failureCount = 0;
                    console.log('🟢 [Circuit Breaker] State changed to CLOSED');
                }
                
                return originalSend.call(this, data);
            };
            
            next();
        };
    }

    static healthCheck() {
        return async (req, res, next) => {
            try {
                const sentinelService = require('../services/sentinelApiService');
                const sentinelCache = require('../utils/sentinelCache');
                
                const [apiInfo, cacheHealth] = await Promise.all([
                    sentinelService.getApiInfo(),
                    sentinelCache.healthCheck()
                ]);
                
                res.json({
                    success: true,
                    message: 'Sentinel API integration healthy',
                    data: {
                        sentinelApi: {
                            status: 'OK',
                            info: apiInfo
                        },
                        cache: {
                            status: cacheHealth ? 'OK' : 'ERROR',
                            stats: sentinelCache.getStats()
                        }
                    }
                });
            } catch (error) {
                this.handleSentinelError(error, req, res, next);
            }
        };
    }
}

module.exports = SentinelErrorHandler;