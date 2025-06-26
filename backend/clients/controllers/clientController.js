const clientService = require('../services/clientService');
const { sendSuccess, sendError } = require("../../shared/config/helpers/apiResponseHelper");

const createClient = async (req, res) => {
  try {
    const result = await clientService.createClient(req.body);
    sendSuccess(res, result, result.message);
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

const getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await clientService.getClientById(id);
    sendSuccess(res, { client }, 'Cliente obtenido exitosamente');
  } catch (error) {
    sendError(res, 404, error.message);
  }
};

const getClientByDocument = async (req, res) => {
  try {
    const { documentNumber } = req.params;
    const client = await clientService.getClientByDocumentNumber(documentNumber);
    sendSuccess(res, { client }, 'Cliente obtenido exitosamente');
  } catch (error) {
    sendError(res, 404, error.message);
  }
};

const getAllClients = async (req, res) => {
  try {
    const { 
      status, 
      clientType, 
      documentType, 
      assignedUserId, 
      search,
      page,
      limit 
    } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (clientType) filters.clientType = clientType;
    if (documentType) filters.documentType = documentType;
    if (assignedUserId) filters.assignedUserId = assignedUserId;
    if (search) filters.search = search;

    const pagination = {};
    if (page && limit) {
      pagination.page = parseInt(page);
      pagination.limit = parseInt(limit);
    }

    const result = await clientService.getAllClients(filters, pagination);
    
    if (pagination.page) {
      sendSuccess(res, result, 'Clientes obtenidos exitosamente');
    } else {
      sendSuccess(res, { clients: result }, 'Clientes obtenidos exitosamente');
    }
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

const getActiveClients = async (req, res) => {
  try {
    const clients = await clientService.getActiveClients();
    sendSuccess(res, { clients }, 'Clientes activos obtenidos exitosamente');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

const getClientsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const clients = await clientService.getClientsByType(type);
    sendSuccess(res, { clients }, `Clientes de tipo ${type} obtenidos exitosamente`);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

const getClientsByAssignedUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const clients = await clientService.getClientsByAssignedUser(userId);
    sendSuccess(res, { clients }, 'Clientes asignados obtenidos exitosamente');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await clientService.updateClient(id, req.body);
    sendSuccess(res, result, result.message);
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

const changeClientStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await clientService.changeClientStatus(id, status);
    sendSuccess(res, result, result.message);
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

const updateCreditLimit = async (req, res) => {
  try {
    const { id } = req.params;
    const { creditLimit } = req.body;
    const result = await clientService.updateCreditLimit(id, creditLimit);
    sendSuccess(res, result, result.message);
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await clientService.deleteClient(id);
    sendSuccess(res, result, result.message);
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

const getClientStats = async (req, res) => {
  try {
    const stats = await clientService.getClientStats();
    sendSuccess(res, { stats }, 'Estadísticas de clientes obtenidas exitosamente');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

const getClientWithRelations = async (req, res) => {
  try {
    const { id } = req.params;
    const { relations } = req.query;
    
    let relationArray = [];
    if (relations) {
      relationArray = relations.split(',').map(r => r.trim());
    }

    const client = await clientService.getClientWithRelations(id, relationArray);
    sendSuccess(res, { client }, 'Cliente con relaciones obtenido exitosamente');
  } catch (error) {
    sendError(res, 404, error.message);
  }
};

const getClientsWithHighCreditLimit = async (req, res) => {
  try {
    const { minLimit } = req.query;
    if (!minLimit) {
      return sendError(res, 400, 'El parámetro minLimit es requerido');
    }

    const clients = await clientService.getClientsWithHighCreditLimit(parseFloat(minLimit));
    sendSuccess(res, { clients }, 'Clientes con alto límite de crédito obtenidos exitosamente');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

module.exports = {
  createClient,
  getClientById,
  getClientByDocument,
  getAllClients,
  getActiveClients,
  getClientsByType,
  getClientsByAssignedUser,
  updateClient,
  changeClientStatus,
  updateCreditLimit,
  deleteClient,
  getClientStats,
  getClientWithRelations,
  getClientsWithHighCreditLimit
};