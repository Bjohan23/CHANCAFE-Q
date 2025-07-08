const axios = require('axios');
const sentinelCache = require('../utils/sentinelCache');

class SentinelApiService {
    constructor() {
        this.baseURL = process.env.SENTINEL_API_URL || 'https://sentinel-api-5c7y.vercel.app';
        this.timeout = parseInt(process.env.SENTINEL_API_TIMEOUT) || 10000;
        this.retryAttempts = parseInt(process.env.SENTINEL_API_RETRY_ATTEMPTS) || 3;
        
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: this.timeout,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        this.setupInterceptors();
    }

    setupInterceptors() {
        this.client.interceptors.request.use(
            (config) => {
                console.log(`🔍 [Sentinel API] Request: ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => Promise.reject(error)
        );

        this.client.interceptors.response.use(
            (response) => {
                console.log(`✅ [Sentinel API] Response: ${response.status} - ${response.config.url}`);
                return response;
            },
            (error) => {
                console.error(`❌ [Sentinel API] Error: ${error.message} - ${error.config?.url}`);
                return Promise.reject(error);
            }
        );
    }

    validateDNI(dni) {
        if (!dni) {
            throw new Error('DNI es requerido');
        }

        const dniStr = dni.toString().trim();
        
        if (!/^\d{8}$/.test(dniStr)) {
            throw new Error('DNI debe tener exactamente 8 dígitos numéricos');
        }

        return dniStr;
    }

    async makeRequest(endpoint, cacheKey = null, cacheTTL = 3600) {
        try {
            if (cacheKey && sentinelCache.has(cacheKey)) {
                console.log(`💾 [Sentinel API] Cache hit: ${cacheKey}`);
                return sentinelCache.get(cacheKey);
            }

            const response = await this.retryRequest(() => this.client.get(endpoint));
            const data = response.data;

            if (cacheKey) {
                sentinelCache.set(cacheKey, data, cacheTTL);
                console.log(`💾 [Sentinel API] Cached: ${cacheKey} (TTL: ${cacheTTL}s)`);
            }

            return data;
        } catch (error) {
            this.handleError(error, endpoint);
        }
    }

    async retryRequest(requestFn) {
        let lastError;
        
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                return await requestFn();
            } catch (error) {
                lastError = error;
                
                if (attempt < this.retryAttempts && this.shouldRetry(error)) {
                    const delay = Math.pow(2, attempt) * 1000;
                    console.log(`⏳ [Sentinel API] Retry ${attempt}/${this.retryAttempts} after ${delay}ms`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    break;
                }
            }
        }
        
        throw lastError;
    }

    shouldRetry(error) {
        const retryableCodes = [408, 429, 500, 502, 503, 504];
        return error.code === 'ECONNABORTED' || 
               error.code === 'ENOTFOUND' || 
               error.code === 'ECONNREFUSED' ||
               (error.response && retryableCodes.includes(error.response.status));
    }

    handleError(error, endpoint) {
        if (error.response) {
            const { status, data } = error.response;
            
            switch (status) {
                case 400:
                    throw new Error(`DNI inválido: ${data.message || 'Formato incorrecto'}`);
                case 404:
                    throw new Error('Persona no encontrada en el sistema crediticio');
                case 429:
                    throw new Error('Límite de consultas excedido. Intente más tarde');
                case 500:
                    throw new Error('Error interno del servicio crediticio');
                case 503:
                    throw new Error('Servicio crediticio no disponible temporalmente');
                default:
                    throw new Error(`Error del servicio crediticio: ${data.message || 'Error desconocido'}`);
            }
        } else if (error.code === 'ECONNABORTED') {
            throw new Error('Tiempo de espera agotado al consultar servicio crediticio');
        } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            throw new Error('Servicio crediticio no disponible');
        } else {
            throw new Error(`Error de conexión: ${error.message}`);
        }
    }

    async getPersonData(dni) {
        const validDni = this.validateDNI(dni);
        const cacheKey = `person_${validDni}`;
        
        try {
            const data = await this.makeRequest(`/api/persona/${validDni}`, cacheKey, 1800);
            
            return {
                dni: data.dni,
                nombres: data.nombres,
                apellidos: data.apellidos,
                nombreCompleto: `${data.nombres} ${data.apellidos}`,
                scoreCredito: data.scoreCredito,
                clasificacionRiesgo: data.clasificacionRiesgo,
                fechaConsulta: new Date().toISOString(),
                fuente: 'Sentinel'
            };
        } catch (error) {
            console.error(`❌ [Sentinel API] Error obteniendo datos de persona ${validDni}:`, error.message);
            throw error;
        }
    }

    async getCreditHistory(dni) {
        const validDni = this.validateDNI(dni);
        const cacheKey = `history_${validDni}`;
        
        try {
            const data = await this.makeRequest(`/api/persona/${validDni}/historial`, cacheKey, 3600);
            
            return {
                dni: data.dni,
                historial: data.historial,
                totalRegistros: data.historial.length,
                fechaConsulta: new Date().toISOString(),
                fuente: 'Sentinel'
            };
        } catch (error) {
            console.error(`❌ [Sentinel API] Error obteniendo historial de ${validDni}:`, error.message);
            throw error;
        }
    }

    async getCurrentDebts(dni) {
        const validDni = this.validateDNI(dni);
        const cacheKey = `debts_${validDni}`;
        
        try {
            const data = await this.makeRequest(`/api/persona/${validDni}/deudas`, cacheKey, 1800);
            
            const totalDeudas = data.deudas.reduce((sum, deuda) => sum + deuda.saldoActual, 0);
            
            return {
                dni: data.dni,
                deudas: data.deudas,
                totalDeudas,
                cantidadDeudas: data.deudas.length,
                fechaConsulta: new Date().toISOString(),
                fuente: 'Sentinel'
            };
        } catch (error) {
            console.error(`❌ [Sentinel API] Error obteniendo deudas de ${validDni}:`, error.message);
            throw error;
        }
    }

    async getCompleteReport(dni) {
        const validDni = this.validateDNI(dni);
        const cacheKey = `report_${validDni}`;
        
        try {
            const data = await this.makeRequest(`/api/persona/${validDni}/reporte`, cacheKey, 3600);
            
            return {
                dni: data.dni,
                nombres: data.nombres,
                apellidos: data.apellidos,
                nombreCompleto: `${data.nombres} ${data.apellidos}`,
                scoreCredito: data.scoreCredito,
                clasificacionRiesgo: data.clasificacionRiesgo,
                resumen: data.resumen,
                historial: data.historial,
                alertas: data.alertas,
                fechaConsulta: new Date().toISOString(),
                fuente: 'Sentinel'
            };
        } catch (error) {
            console.error(`❌ [Sentinel API] Error obteniendo reporte completo de ${validDni}:`, error.message);
            throw error;
        }
    }

    async getAlerts(dni) {
        const validDni = this.validateDNI(dni);
        const cacheKey = `alerts_${validDni}`;
        
        try {
            const data = await this.makeRequest(`/api/persona/${validDni}/alertas`, cacheKey, 900);
            
            return {
                dni: data.dni,
                alertas: data.alertas,
                cantidadAlertas: data.alertas.length,
                fechaConsulta: new Date().toISOString(),
                fuente: 'Sentinel'
            };
        } catch (error) {
            console.error(`❌ [Sentinel API] Error obteniendo alertas de ${validDni}:`, error.message);
            throw error;
        }
    }

    async getQuickCreditAssessment(dni) {
        const validDni = this.validateDNI(dni);
        
        try {
            const [personData, debts] = await Promise.all([
                this.getPersonData(validDni),
                this.getCurrentDebts(validDni)
            ]);

            const assessment = this.calculateCreditAssessment(personData, debts);
            
            return {
                dni: validDni,
                persona: personData,
                deudas: debts,
                evaluacion: assessment,
                fechaEvaluacion: new Date().toISOString()
            };
        } catch (error) {
            console.error(`❌ [Sentinel API] Error en evaluación rápida de ${validDni}:`, error.message);
            throw error;
        }
    }

    calculateCreditAssessment(personData, debts) {
        const score = personData.scoreCredito;
        const totalDebts = debts.totalDeudas;
        const riskClass = personData.clasificacionRiesgo;

        let recomendacion = 'RECHAZAR';
        let limiteCredito = 0;
        let justificacion = '';

        if (score >= 750) {
            recomendacion = 'APROBAR';
            limiteCredito = totalDebts > 50000 ? 30000 : 50000;
            justificacion = 'Excelente score crediticio';
        } else if (score >= 650) {
            recomendacion = 'APROBAR';
            limiteCredito = totalDebts > 30000 ? 15000 : 30000;
            justificacion = 'Buen score crediticio';
        } else if (score >= 550) {
            recomendacion = 'REVISAR';
            limiteCredito = totalDebts > 20000 ? 10000 : 20000;
            justificacion = 'Score crediticio regular, requiere revisión';
        } else if (score >= 450) {
            recomendacion = 'REVISAR';
            limiteCredito = totalDebts > 10000 ? 5000 : 10000;
            justificacion = 'Score crediticio bajo, requiere análisis detallado';
        } else {
            recomendacion = 'RECHAZAR';
            limiteCredito = 0;
            justificacion = 'Score crediticio muy bajo';
        }

        if (riskClass === 'ALTO' || riskClass === 'MUY_ALTO') {
            recomendacion = 'RECHAZAR';
            limiteCredito = 0;
            justificacion = 'Clasificación de riesgo elevada';
        }

        return {
            recomendacion,
            limiteCredito,
            justificacion,
            factores: {
                scoreCredito: score,
                clasificacionRiesgo: riskClass,
                totalDeudas: totalDebts,
                cantidadDeudas: debts.cantidadDeudas
            }
        };
    }

    async getApiInfo() {
        try {
            const data = await this.makeRequest('/api/info', 'api_info', 86400);
            return data;
        } catch (error) {
            console.error('❌ [Sentinel API] Error obteniendo información de API:', error.message);
            throw error;
        }
    }

    clearCache(dni = null) {
        if (dni) {
            const validDni = this.validateDNI(dni);
            const keys = [`person_${validDni}`, `history_${validDni}`, `debts_${validDni}`, `report_${validDni}`, `alerts_${validDni}`];
            keys.forEach(key => sentinelCache.delete(key));
            console.log(`🗑️ [Sentinel API] Cache cleared for DNI: ${validDni}`);
        } else {
            sentinelCache.clear();
            console.log('🗑️ [Sentinel API] All cache cleared');
        }
    }
}

module.exports = new SentinelApiService();