const quoteService = require('../services/quoteService');
const clientService = require('../../clients/services/clientService');
const { sendSuccess, sendError } = require("../../shared/config/helpers/apiResponseHelper");

const createQuote = async (req, res) => {
  try {
    const result = await quoteService.createQuote(req.body);
    sendSuccess(res, result, result.message);
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

const getQuoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const quote = await quoteService.getQuoteById(id);
    sendSuccess(res, { quote }, 'Cotización obtenida exitosamente');
  } catch (error) {
    sendError(res, 404, error.message);
  }
};

const getQuoteByNumber = async (req, res) => {
  try {
    const { quoteNumber } = req.params;
    const quote = await quoteService.getQuoteByNumber(quoteNumber);
    sendSuccess(res, { quote }, 'Cotización obtenida exitosamente');
  } catch (error) {
    sendError(res, 404, error.message);
  }
};

const getQuoteWithItems = async (req, res) => {
  try {
    const { id } = req.params;
    const quote = await quoteService.getQuoteWithItems(id);
    sendSuccess(res, { quote }, 'Cotización con items obtenida exitosamente');
  } catch (error) {
    sendError(res, 404, error.message);
  }
};

const getAllQuotes = async (req, res) => {
  try {
    const { 
      status, 
      clientId, 
      userId, 
      currency,
      dateFrom,
      dateTo,
      search,
      page,
      limit 
    } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (clientId) filters.clientId = clientId;
    if (userId) filters.userId = userId;
    if (currency) filters.currency = currency;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (search) filters.search = search;

    const pagination = {};
    if (page && limit) {
      pagination.page = parseInt(page);
      pagination.limit = parseInt(limit);
    }

    const result = await quoteService.getAllQuotes(filters, pagination);
    
    if (pagination.page) {
      sendSuccess(res, result, 'Cotizaciones obtenidas exitosamente');
    } else {
      sendSuccess(res, { quotes: result }, 'Cotizaciones obtenidas exitosamente');
    }
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

const getQuotesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const quotes = await quoteService.getQuotesByStatus(status);
    sendSuccess(res, { quotes }, `Cotizaciones con estado ${status} obtenidas exitosamente`);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

const getQuotesByClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const quotes = await quoteService.getQuotesByClient(clientId);
    sendSuccess(res, { quotes }, 'Cotizaciones del cliente obtenidas exitosamente');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

const getQuotesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const quotes = await quoteService.getQuotesByUser(userId);
    sendSuccess(res, { quotes }, 'Cotizaciones del usuario obtenidas exitosamente');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

const updateQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await quoteService.updateQuote(id, req.body);
    sendSuccess(res, result, result.message);
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

const changeQuoteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;
    console.log(`🔄 [Quote Controller] Changing status for quote ${id} to: ${status}`);
    const result = await quoteService.changeQuoteStatus(id, status);
    sendSuccess(res, result, result.message);
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

const deleteQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await quoteService.deleteQuote(id);
    sendSuccess(res, result, result.message);
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

const addQuoteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await quoteService.addQuoteItem(id, req.body);
    sendSuccess(res, result, result.message);
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

const updateQuoteItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const result = await quoteService.updateQuoteItem(itemId, req.body);
    sendSuccess(res, result, result.message);
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

const deleteQuoteItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const result = await quoteService.deleteQuoteItem(itemId);
    sendSuccess(res, result, result.message);
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

const recalculateQuoteTotals = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await quoteService.recalculateQuoteTotals(id);
    sendSuccess(res, { totals: result }, 'Totales recalculados exitosamente');
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

const getQuoteStats = async (req, res) => {
  try {
    const stats = await quoteService.getQuoteStats();
    sendSuccess(res, { stats }, 'Estadísticas de cotizaciones obtenidas exitosamente');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

const getQuoteWithRelations = async (req, res) => {
  try {
    const { id } = req.params;
    const { relations } = req.query;
    
    let relationArray = [];
    if (relations) {
      relationArray = relations.split(',').map(r => r.trim());
    }

    const quote = await quoteService.getQuoteWithRelations(id, relationArray);
    sendSuccess(res, { quote }, 'Cotización con relaciones obtenida exitosamente');
  } catch (error) {
    sendError(res, 404, error.message);
  }
};

// 🆕 NUEVOS ENDPOINTS PARA INTEGRACIÓN CON SENTINEL API
const createQuoteWithCreditCheck = async (req, res) => {
  try {
    console.log('🔍 [Quote Controller] Iniciando creación de cotización con consulta crediticia');
    
    const { clientId, client_id } = req.body;
    const finalClientId = clientId || client_id;
    
    if (!finalClientId) {
      return sendError(res, 400, 'Client ID es requerido para consulta crediticia');
    }

    // Obtener información del cliente
    const client = await clientService.getClientById(finalClientId);
    if (!client) {
      return sendError(res, 404, 'Cliente no encontrado');
    }

    let creditAssessment = null;
    let creditCheckPerformed = false;

    // Si el cliente tiene DNI y puede realizar consulta crediticia
    if (client.documentType === 'DNI' && client.documentNumber && client.documentNumber.length === 8) {
      try {
        // Verificar si necesita consulta crediticia
        if (!client.creditInfo || !client.creditInfo.lastCreditCheck || 
            (Date.now() - new Date(client.creditInfo.lastCreditCheck).getTime()) > 30 * 24 * 60 * 60 * 1000) {
          
          console.log(`🔍 [Quote Controller] Realizando consulta crediticia para cliente ${client.id} - DNI: ${client.documentNumber}`);
          
          // Realizar consulta crediticia automática
          const creditResult = await clientService.performCreditCheck(finalClientId);
          creditAssessment = creditResult.creditAssessment;
          creditCheckPerformed = true;
          
          console.log(`✅ [Quote Controller] Consulta crediticia completada: ${creditAssessment.recomendacion}`);
        } else {
          // Usar datos crediticios existentes
          creditAssessment = {
            recomendacion: client.creditInfo.automaticEvaluation,
            limiteCredito: client.creditInfo.suggestedCreditLimit,
            justificacion: client.creditInfo.evaluationJustification,
            factores: {
              scoreCredito: client.creditInfo.score,
              clasificacionRiesgo: client.creditInfo.riskClassification,
              totalDeudas: client.creditInfo.totalDebts,
              cantidadDeudas: client.creditInfo.activeCredits
            }
          };
          
          console.log(`📋 [Quote Controller] Usando datos crediticios existentes: ${creditAssessment.recomendacion}`);
        }
      } catch (creditError) {
        console.error(`❌ [Quote Controller] Error en consulta crediticia:`, creditError.message);
        // Continuar con la creación de la cotización sin datos crediticios
      }
    }

    // Crear la cotización normalmente
    const result = await quoteService.createQuote(req.body);
    
    // Preparar respuesta con datos crediticios
    const response = {
      quote: result.quote,
      creditAssessment,
      creditCheckPerformed,
      client: {
        id: client.id,
        fullName: client.fullName,
        documentType: client.documentType,
        documentNumber: client.documentNumber,
        creditInfo: client.creditInfo
      }
    };

    // Agregar alertas basadas en la evaluación crediticia
    if (creditAssessment) {
      response.alerts = [];
      
      if (creditAssessment.recomendacion === 'RECHAZAR') {
        response.alerts.push({
          type: 'danger',
          message: `Evaluación crediticia: RECHAZAR - ${creditAssessment.justificacion}`
        });
      } else if (creditAssessment.recomendacion === 'REVISAR') {
        response.alerts.push({
          type: 'warning',
          message: `Evaluación crediticia: REVISAR - ${creditAssessment.justificacion}`
        });
      } else if (creditAssessment.recomendacion === 'APROBAR') {
        response.alerts.push({
          type: 'success',
          message: `Evaluación crediticia: APROBAR - Límite sugerido: S/ ${creditAssessment.limiteCredito.toLocaleString()}`
        });
      }
    }

    sendSuccess(res, response, 'Cotización creada con evaluación crediticia exitosa');
  } catch (error) {
    console.error('❌ [Quote Controller] Error en createQuoteWithCreditCheck:', error.message);
    sendError(res, 400, error.message);
  }
};

const performClientCreditCheck = async (req, res) => {
  try {
    const { clientId } = req.params;
    
    console.log(`🔍 [Quote Controller] Consulta crediticia manual para cliente ${clientId}`);
    
    const result = await clientService.performCreditCheck(clientId);
    
    sendSuccess(res, {
      client: result.client,
      creditAssessment: result.creditAssessment,
      message: result.message
    }, 'Consulta crediticia realizada exitosamente');
  } catch (error) {
    console.error('❌ [Quote Controller] Error en performClientCreditCheck:', error.message);
    sendError(res, 400, error.message);
  }
};

const getClientCreditAssessment = async (req, res) => {
  try {
    const { clientId } = req.params;
    
    const result = await clientService.getCreditAssessment(clientId);
    
    sendSuccess(res, result, 'Evaluación crediticia obtenida exitosamente');
  } catch (error) {
    console.error('❌ [Quote Controller] Error en getClientCreditAssessment:', error.message);
    sendError(res, 404, error.message);
  }
};

const getQuoteWithCreditInfo = async (req, res) => {
  try {
    const { id } = req.params;
    
    const quote = await quoteService.getQuoteWithItems(id);
    
    // Obtener información crediticia del cliente si está disponible
    if (quote.clientId) {
      try {
        const client = await clientService.getClientById(quote.clientId);
        if (client.creditInfo) {
          quote.clientCreditInfo = client.creditInfo;
        }
      } catch (error) {
        console.warn('⚠️ [Quote Controller] No se pudo obtener información crediticia del cliente:', error.message);
      }
    }
    
    sendSuccess(res, { quote }, 'Cotización con información crediticia obtenida exitosamente');
  } catch (error) {
    console.error('❌ [Quote Controller] Error en getQuoteWithCreditInfo:', error.message);
    sendError(res, 404, error.message);
  }
};

module.exports = {
  createQuote,
  getQuoteById,
  getQuoteByNumber,
  getQuoteWithItems,
  getAllQuotes,
  getQuotesByStatus,
  getQuotesByClient,
  getQuotesByUser,
  updateQuote,
  changeQuoteStatus,
  deleteQuote,
  addQuoteItem,
  updateQuoteItem,
  deleteQuoteItem,
  recalculateQuoteTotals,
  getQuoteStats,
  getQuoteWithRelations,
  // 🆕 NUEVOS ENDPOINTS PARA INTEGRACIÓN CON SENTINEL API
  createQuoteWithCreditCheck,
  performClientCreditCheck,
  getClientCreditAssessment,
  getQuoteWithCreditInfo
};