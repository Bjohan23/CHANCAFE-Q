const quoteService = require('../services/quoteService');
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
    const { status } = req.body;
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
  getQuoteWithRelations
};