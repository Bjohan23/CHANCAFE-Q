const { ClientService } = require('../services');
const { AppError } = require('../utils/helpers');

class ClientController {
    
    // Obtener todos los clientes
    async getAllClients(req, res, next) {
        try {
            const { page = 1, limit = 10, search, active } = req.query;
            
            const filters = {};
            if (search) filters.search = search;
            if (active !== undefined) filters.active = active === 'true';
            
            const clients = await ClientService.getAllClients({
                page: parseInt(page),
                limit: parseInt(limit),
                filters
            });
            
            res.status(200).json({
                success: true,
                data: clients,
                message: 'Clientes obtenidos exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }
    
    // Obtener cliente por ID
    async getClientById(req, res, next) {
        try {
            const { id } = req.params;
            const client = await ClientService.getClientById(id);
            
            if (!client) {
                throw new AppError('Cliente no encontrado', 404);
            }
            
            res.status(200).json({
                success: true,
                data: client,
                message: 'Cliente obtenido exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }
    
    // Crear nuevo cliente
    async createClient(req, res, next) {
        try {
            const clientData = req.body;
            clientData.created_by = req.user.id;
            
            const client = await ClientService.createClient(clientData);
            
            res.status(201).json({
                success: true,
                data: client,
                message: 'Cliente creado exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }
    
    // Actualizar cliente
    async updateClient(req, res, next) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            updateData.updated_by = req.user.id;
            
            const client = await ClientService.updateClient(id, updateData);
            
            if (!client) {
                throw new AppError('Cliente no encontrado', 404);
            }
            
            res.status(200).json({
                success: true,
                data: client,
                message: 'Cliente actualizado exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }
    
    // Eliminar cliente (soft delete)
    async deleteClient(req, res, next) {
        try {
            const { id } = req.params;
            
            const deleted = await ClientService.deleteClient(id, req.user.id);
            
            if (!deleted) {
                throw new AppError('Cliente no encontrado', 404);
            }
            
            res.status(200).json({
                success: true,
                message: 'Cliente eliminado exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }
    
    // Obtener historial de cotizaciones del cliente
    async getClientQuotes(req, res, next) {
        try {
            const { id } = req.params;
            const { page = 1, limit = 10 } = req.query;
            
            const quotes = await ClientService.getClientQuotes(id, {
                page: parseInt(page),
                limit: parseInt(limit)
            });
            
            res.status(200).json({
                success: true,
                data: quotes,
                message: 'Cotizaciones del cliente obtenidas exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }
    
    // Activar/Desactivar cliente
    async toggleClientStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { active } = req.body;
            
            const client = await ClientService.updateClient(id, { 
                active, 
                updated_by: req.user.id 
            });
            
            if (!client) {
                throw new AppError('Cliente no encontrado', 404);
            }
            
            res.status(200).json({
                success: true,
                data: client,
                message: `Cliente ${active ? 'activado' : 'desactivado'} exitosamente`
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ClientController();
