const { CreditRequest, Client } = require('../models');
const { AppError } = require('../utils/helpers');
const { Op } = require('sequelize');

class CreditRequestController {
    
    // Obtener todas las solicitudes de crédito
    async getAllCreditRequests(req, res, next) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                status, 
                client_id, 
                date_from, 
                date_to 
            } = req.query;
            
            const whereClause = {};
            
            if (status) whereClause.status = status;
            if (client_id) whereClause.client_id = client_id;
            
            if (date_from || date_to) {
                whereClause.created_at = {};
                if (date_from) whereClause.created_at[Op.gte] = new Date(date_from);
                if (date_to) whereClause.created_at[Op.lte] = new Date(date_to);
            }
            
            const offset = (parseInt(page) - 1) * parseInt(limit);
            
            const { count, rows: creditRequests } = await CreditRequest.findAndCountAll({
                where: whereClause,
                limit: parseInt(limit),
                offset: offset,
                include: [
                    {
                        model: Client,
                        as: 'client',
                        attributes: ['id', 'name', 'email', 'phone', 'company']
                    }
                ],
                order: [['created_at', 'DESC']]
            });
            
            res.status(200).json({
                success: true,
                data: {
                    credit_requests: creditRequests,
                    pagination: {
                        current_page: parseInt(page),
                        total_pages: Math.ceil(count / parseInt(limit)),
                        total_records: count,
                        per_page: parseInt(limit)
                    }
                },
                message: 'Solicitudes de crédito obtenidas exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }
    
    // Obtener solicitud de crédito por ID
    async getCreditRequestById(req, res, next) {
        try {
            const { id } = req.params;
            
            const creditRequest = await CreditRequest.findByPk(id, {
                include: [
                    {
                        model: Client,
                        as: 'client'
                    }
                ]
            });
            
            if (!creditRequest) {
                throw new AppError('Solicitud de crédito no encontrada', 404);
            }
            
            res.status(200).json({
                success: true,
                data: creditRequest,
                message: 'Solicitud de crédito obtenida exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }
    
    // Crear nueva solicitud de crédito
    async createCreditRequest(req, res, next) {
        try {
            const { 
                client_id, 
                requested_amount, 
                purpose, 
                monthly_income, 
                employment_status, 
                employment_duration,
                collateral_description,
                notes 
            } = req.body;
            
            // Verificar que el cliente existe
            const client = await Client.findByPk(client_id);
            if (!client) {
                throw new AppError('Cliente no encontrado', 404);
            }
            
            // Generar número de solicitud
            const request_number = await this.generateRequestNumber();
            
            const creditRequest = await CreditRequest.create({
                request_number,
                client_id,
                requested_amount,
                purpose,
                monthly_income,
                employment_status,
                employment_duration,
                collateral_description,
                notes,
                status: 'pending',
                created_by: req.user.id
            });
            
            // Obtener la solicitud completa con las relaciones
            const fullCreditRequest = await CreditRequest.findByPk(creditRequest.id, {
                include: [
                    {
                        model: Client,
                        as: 'client'
                    }
                ]
            });
            
            res.status(201).json({
                success: true,
                data: fullCreditRequest,
                message: 'Solicitud de crédito creada exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }
    
    // Actualizar solicitud de crédito
    async updateCreditRequest(req, res, next) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            
            const creditRequest = await CreditRequest.findByPk(id);
            if (!creditRequest) {
                throw new AppError('Solicitud de crédito no encontrada', 404);
            }
            
            // Solo permitir actualizar si está en pending
            if (creditRequest.status !== 'pending') {
                throw new AppError('No se puede modificar una solicitud que ya fue procesada', 400);
            }
            
            updateData.updated_by = req.user.id;
            
            await creditRequest.update(updateData);
            
            const updatedCreditRequest = await CreditRequest.findByPk(id, {
                include: [
                    {
                        model: Client,
                        as: 'client'
                    }
                ]
            });
            
            res.status(200).json({
                success: true,
                data: updatedCreditRequest,
                message: 'Solicitud de crédito actualizada exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }
    
    // Aprobar solicitud de crédito
    async approveCreditRequest(req, res, next) {
        try {
            const { id } = req.params;
            const { approved_amount, approval_notes, credit_limit } = req.body;
            
            const creditRequest = await CreditRequest.findByPk(id);
            if (!creditRequest) {
                throw new AppError('Solicitud de crédito no encontrada', 404);
            }
            
            if (creditRequest.status !== 'pending') {
                throw new AppError('Esta solicitud ya fue procesada', 400);
            }
            
            await creditRequest.update({
                status: 'approved',
                approved_amount: approved_amount || creditRequest.requested_amount,
                approval_notes,
                approved_by: req.user.id,
                approved_at: new Date(),
                updated_by: req.user.id
            });
            
            // Si se especifica un límite de crédito, actualizar el cliente
            if (credit_limit) {
                const client = await Client.findByPk(creditRequest.client_id);
                await client.update({
                    credit_limit,
                    updated_by: req.user.id
                });
            }
            
            const updatedCreditRequest = await CreditRequest.findByPk(id, {
                include: [
                    {
                        model: Client,
                        as: 'client'
                    }
                ]
            });
            
            res.status(200).json({
                success: true,
                data: updatedCreditRequest,
                message: 'Solicitud de crédito aprobada exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }
    
    // Rechazar solicitud de crédito
    async rejectCreditRequest(req, res, next) {
        try {
            const { id } = req.params;
            const { rejection_reason } = req.body;
            
            const creditRequest = await CreditRequest.findByPk(id);
            if (!creditRequest) {
                throw new AppError('Solicitud de crédito no encontrada', 404);
            }
            
            if (creditRequest.status !== 'pending') {
                throw new AppError('Esta solicitud ya fue procesada', 400);
            }
            
            await creditRequest.update({
                status: 'rejected',
                rejection_reason,
                rejected_by: req.user.id,
                rejected_at: new Date(),
                updated_by: req.user.id
            });
            
            const updatedCreditRequest = await CreditRequest.findByPk(id, {
                include: [
                    {
                        model: Client,
                        as: 'client'
                    }
                ]
            });
            
            res.status(200).json({
                success: true,
                data: updatedCreditRequest,
                message: 'Solicitud de crédito rechazada'
            });
        } catch (error) {
            next(error);
        }
    }
    
    // Generar número de solicitud único
    async generateRequestNumber() {
        const year = new Date().getFullYear();
        const lastRequest = await CreditRequest.findOne({
            where: {
                request_number: {
                    [Op.like]: `CR-${year}-%`
                }
            },
            order: [['created_at', 'DESC']]
        });
        
        let nextNumber = 1;
        if (lastRequest) {
            const lastNumber = parseInt(lastRequest.request_number.split('-')[2]);
            nextNumber = lastNumber + 1;
        }
        
        return `CR-${year}-${nextNumber.toString().padStart(4, '0')}`;
    }
    
    // Obtener estadísticas de solicitudes
    async getCreditRequestStats(req, res, next) {
        try {
            const stats = await CreditRequest.findAll({
                attributes: [
                    'status',
                    [CreditRequest.sequelize.fn('COUNT', CreditRequest.sequelize.col('id')), 'count'],
                    [CreditRequest.sequelize.fn('SUM', CreditRequest.sequelize.col('requested_amount')), 'total_requested'],
                    [CreditRequest.sequelize.fn('SUM', CreditRequest.sequelize.col('approved_amount')), 'total_approved']
                ],
                group: ['status']
            });
            
            res.status(200).json({
                success: true,
                data: stats,
                message: 'Estadísticas obtenidas exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CreditRequestController();
