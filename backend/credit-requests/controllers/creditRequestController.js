const creditRequestService = require('../services/creditRequestService');
const { sendSuccess, sendError } = require("../../shared/config/helpers/apiResponseHelper");

const createCreditRequest = async (req, res) => {
  try {
    const result = await creditRequestService.createCreditRequest(req.body);
    sendSuccess(res, result, result.message);
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

const getCreditRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const creditRequest = await creditRequestService.getCreditRequestById(id);
    sendSuccess(res, { creditRequest }, 'Solicitud de crédito obtenida exitosamente');
  } catch (error) {
    sendError(res, 404, error.message);
  }
};

const getCreditRequestByNumber = async (req, res) => {
  try {
    const { requestNumber } = req.params;
    const creditRequest = await creditRequestService.getCreditRequestByNumber(requestNumber);
    sendSuccess(res, { creditRequest }, 'Solicitud de crédito obtenida exitosamente');
  } catch (error) {
    sendError(res, 404, error.message);
  }
};

const getAllCreditRequests = async (req, res) => {
  try {
    const { 
      status, 
      clientId, 
      userId, 
      approvedBy,
      priority,
      currency,
      minAmount,
      maxAmount,
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
    if (approvedBy) filters.approvedBy = approvedBy;
    if (priority) filters.priority = priority;
    if (currency) filters.currency = currency;
    if (minAmount) filters.minAmount = parseFloat(minAmount);
    if (maxAmount) filters.maxAmount = parseFloat(maxAmount);
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (search) filters.search = search;

    const pagination = {};
    if (page && limit) {
      pagination.page = parseInt(page);
      pagination.limit = parseInt(limit);
    }

    const result = await creditRequestService.getAllCreditRequests(filters, pagination);
    
    if (pagination.page) {
      sendSuccess(res, result, 'Solicitudes de crédito obtenidas exitosamente');
    } else {
      sendSuccess(res, { creditRequests: result }, 'Solicitudes de crédito obtenidas exitosamente');
    }
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

const getCreditRequestsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const creditRequests = await creditRequestService.getCreditRequestsByStatus(status);
    sendSuccess(res, { creditRequests }, `Solicitudes con estado ${status} obtenidas exitosamente`);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

const getCreditRequestsByClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const creditRequests = await creditRequestService.getCreditRequestsByClient(clientId);
    sendSuccess(res, { creditRequests }, 'Solicitudes del cliente obtenidas exitosamente');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

const getCreditRequestsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const creditRequests = await creditRequestService.getCreditRequestsByUser(userId);
    sendSuccess(res, { creditRequests }, 'Solicitudes del usuario obtenidas exitosamente');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

const getCreditRequestsByPriority = async (req, res) => {
  try {
    const { priority } = req.params;
    const creditRequests = await creditRequestService.getCreditRequestsByPriority(priority);
    sendSuccess(res, { creditRequests }, `Solicitudes con prioridad ${priority} obtenidas exitosamente`);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

const updateCreditRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await creditRequestService.updateCreditRequest(id, req.body);
    sendSuccess(res, result, result.message);
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

const changeCreditRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await creditRequestService.changeCreditRequestStatus(id, status);
    sendSuccess(res, result, result.message);
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

const approveCreditRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const approvedByUserId = req.user?.userId || req.user?.id;
    
    if (!approvedByUserId) {
      return sendError(res, 401, 'Usuario no autenticado');
    }

    const result = await creditRequestService.approveCreditRequest(id, req.body, approvedByUserId);
    sendSuccess(res, result, result.message);
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

const rejectCreditRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const rejectedByUserId = req.user?.userId || req.user?.id;
    
    if (!rejectedByUserId) {
      return sendError(res, 401, 'Usuario no autenticado');
    }

    const result = await creditRequestService.rejectCreditRequest(id, req.body, rejectedByUserId);
    sendSuccess(res, result, result.message);
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

const deleteCreditRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await creditRequestService.deleteCreditRequest(id);
    sendSuccess(res, result, result.message);
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

const getCreditRequestStats = async (req, res) => {
  try {
    const stats = await creditRequestService.getCreditRequestStats();
    sendSuccess(res, { stats }, 'Estadísticas de solicitudes de crédito obtenidas exitosamente');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

const getCreditRequestWithRelations = async (req, res) => {
  try {
    const { id } = req.params;
    const { relations } = req.query;
    
    let relationArray = [];
    if (relations) {
      relationArray = relations.split(',').map(r => r.trim());
    }

    const creditRequest = await creditRequestService.getCreditRequestWithRelations(id, relationArray);
    sendSuccess(res, { creditRequest }, 'Solicitud con relaciones obtenida exitosamente');
  } catch (error) {
    sendError(res, 404, error.message);
  }
};

const getExpiringCreditRequests = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const creditRequests = await creditRequestService.getExpiringCreditRequests(parseInt(days));
    sendSuccess(res, { creditRequests }, 'Solicitudes próximas a vencer obtenidas exitosamente');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

const getExpiredCreditRequests = async (req, res) => {
  try {
    const creditRequests = await creditRequestService.getExpiredCreditRequests();
    sendSuccess(res, { creditRequests }, 'Solicitudes vencidas obtenidas exitosamente');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

const markExpiredCreditRequests = async (req, res) => {
  try {
    const result = await creditRequestService.markExpiredCreditRequests();
    sendSuccess(res, result, result.message);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

const updateRiskAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const { riskAssessment } = req.body;
    
    if (!riskAssessment) {
      return sendError(res, 400, 'La evaluación de riesgo es requerida');
    }

    const result = await creditRequestService.updateRiskAssessment(id, riskAssessment);
    sendSuccess(res, result, result.message);
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

module.exports = {
  createCreditRequest,
  getCreditRequestById,
  getCreditRequestByNumber,
  getAllCreditRequests,
  getCreditRequestsByStatus,
  getCreditRequestsByClient,
  getCreditRequestsByUser,
  getCreditRequestsByPriority,
  updateCreditRequest,
  changeCreditRequestStatus,
  approveCreditRequest,
  rejectCreditRequest,
  deleteCreditRequest,
  getCreditRequestStats,
  getCreditRequestWithRelations,
  getExpiringCreditRequests,
  getExpiredCreditRequests,
  markExpiredCreditRequests,
  updateRiskAssessment
};