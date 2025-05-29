const { Quote, QuoteItem, Product, Client } = require('../models');
const { AppError } = require('../utils/helpers');
const { Op } = require('sequelize');

class QuoteController {
    
    // Obtener todas las cotizaciones
    async getAllQuotes(req, res, next) {
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
            
            const { count, rows: quotes } = await Quote.findAndCountAll({
                where: whereClause,
                limit: parseInt(limit),
                offset: offset,
                include: [
                    {
                        model: Client,
                        as: 'client',
                        attributes: ['id', 'name', 'email', 'phone']
                    },
                    {
                        model: QuoteItem,
                        as: 'items',
                        include: [{
                            model: Product,
                            as: 'product',
                            attributes: ['id', 'name', 'unit_price']
                        }]
                    }
                ],
                order: [['created_at', 'DESC']]
            });
            
            res.status(200).json({
                success: true,
                data: {
                    quotes,
                    pagination: {
                        current_page: parseInt(page),
                        total_pages: Math.ceil(count / parseInt(limit)),
                        total_records: count,
                        per_page: parseInt(limit)
                    }
                },
                message: 'Cotizaciones obtenidas exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }
    
    // Obtener cotización por ID
    async getQuoteById(req, res, next) {
        try {
            const { id } = req.params;
            
            const quote = await Quote.findByPk(id, {
                include: [
                    {
                        model: Client,
                        as: 'client'
                    },
                    {
                        model: QuoteItem,
                        as: 'items',
                        include: [{
                            model: Product,
                            as: 'product'
                        }]
                    }
                ]
            });
            
            if (!quote) {
                throw new AppError('Cotización no encontrada', 404);
            }
            
            res.status(200).json({
                success: true,
                data: quote,
                message: 'Cotización obtenida exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }
    
    // Crear nueva cotización
    async createQuote(req, res, next) {
        const transaction = await Quote.sequelize.transaction();
        
        try {
            const { client_id, items, discount = 0, tax_rate = 0, notes } = req.body;
            
            // Verificar que el cliente existe
            const client = await Client.findByPk(client_id);
            if (!client) {
                throw new AppError('Cliente no encontrado', 404);
            }
            
            // Calcular totales
            let subtotal = 0;
            
            for (const item of items) {
                const product = await Product.findByPk(item.product_id);
                if (!product) {
                    throw new AppError(`Producto con ID ${item.product_id} no encontrado`, 404);
                }
                subtotal += product.unit_price * item.quantity;
            }
            
            const discount_amount = (subtotal * discount) / 100;
            const tax_amount = ((subtotal - discount_amount) * tax_rate) / 100;
            const total = subtotal - discount_amount + tax_amount;
            
            // Generar número de cotización
            const quote_number = await this.generateQuoteNumber();
            
            // Crear cotización
            const quote = await Quote.create({
                quote_number,
                client_id,
                subtotal,
                discount,
                discount_amount,
                tax_rate,
                tax_amount,
                total,
                notes,
                status: 'draft',
                created_by: req.user.id
            }, { transaction });
            
            // Crear items de la cotización
            const quoteItems = [];
            for (const item of items) {
                const product = await Product.findByPk(item.product_id);
                const quoteItem = await QuoteItem.create({
                    quote_id: quote.id,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_price: product.unit_price,
                    total_price: product.unit_price * item.quantity
                }, { transaction });
                
                quoteItems.push(quoteItem);
            }
            
            await transaction.commit();
            
            // Obtener la cotización completa con las relaciones
            const fullQuote = await Quote.findByPk(quote.id, {
                include: [
                    {
                        model: Client,
                        as: 'client'
                    },
                    {
                        model: QuoteItem,
                        as: 'items',
                        include: [{
                            model: Product,
                            as: 'product'
                        }]
                    }
                ]
            });
            
            res.status(201).json({
                success: true,
                data: fullQuote,
                message: 'Cotización creada exitosamente'
            });
        } catch (error) {
            await transaction.rollback();
            next(error);
        }
    }
    
    // Actualizar cotización
    async updateQuote(req, res, next) {
        const transaction = await Quote.sequelize.transaction();
        
        try {
            const { id } = req.params;
            const { items, discount, tax_rate, notes, status } = req.body;
            
            const quote = await Quote.findByPk(id);
            if (!quote) {
                throw new AppError('Cotización no encontrada', 404);
            }
            
            // Solo permitir actualizar si está en draft o pending
            if (!['draft', 'pending'].includes(quote.status)) {
                throw new AppError('No se puede modificar una cotización en este estado', 400);
            }
            
            // Si se actualizan los items, recalcular totales
            if (items) {
                // Eliminar items existentes
                await QuoteItem.destroy({
                    where: { quote_id: id },
                    transaction
                });
                
                // Calcular nuevos totales
                let subtotal = 0;
                
                for (const item of items) {
                    const product = await Product.findByPk(item.product_id);
                    if (!product) {
                        throw new AppError(`Producto con ID ${item.product_id} no encontrado`, 404);
                    }
                    subtotal += product.unit_price * item.quantity;
                }
                
                const newDiscount = discount !== undefined ? discount : quote.discount;
                const newTaxRate = tax_rate !== undefined ? tax_rate : quote.tax_rate;
                
                const discount_amount = (subtotal * newDiscount) / 100;
                const tax_amount = ((subtotal - discount_amount) * newTaxRate) / 100;
                const total = subtotal - discount_amount + tax_amount;
                
                // Actualizar cotización
                await quote.update({
                    subtotal,
                    discount: newDiscount,
                    discount_amount,
                    tax_rate: newTaxRate,
                    tax_amount,
                    total,
                    notes: notes !== undefined ? notes : quote.notes,
                    status: status || quote.status,
                    updated_by: req.user.id
                }, { transaction });
                
                // Crear nuevos items
                for (const item of items) {
                    const product = await Product.findByPk(item.product_id);
                    await QuoteItem.create({
                        quote_id: quote.id,
                        product_id: item.product_id,
                        quantity: item.quantity,
                        unit_price: product.unit_price,
                        total_price: product.unit_price * item.quantity
                    }, { transaction });
                }
            } else {
                // Solo actualizar campos básicos
                await quote.update({
                    notes: notes !== undefined ? notes : quote.notes,
                    status: status || quote.status,
                    updated_by: req.user.id
                }, { transaction });
            }
            
            await transaction.commit();
            
            // Obtener la cotización actualizada
            const updatedQuote = await Quote.findByPk(id, {
                include: [
                    {
                        model: Client,
                        as: 'client'
                    },
                    {
                        model: QuoteItem,
                        as: 'items',
                        include: [{
                            model: Product,
                            as: 'product'
                        }]
                    }
                ]
            });
            
            res.status(200).json({
                success: true,
                data: updatedQuote,
                message: 'Cotización actualizada exitosamente'
            });
        } catch (error) {
            await transaction.rollback();
            next(error);
        }
    }
    
    // Cambiar estado de cotización
    async updateQuoteStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            const validStatuses = ['draft', 'pending', 'approved', 'rejected', 'expired'];
            
            if (!validStatuses.includes(status)) {
                throw new AppError('Estado de cotización inválido', 400);
            }
            
            const quote = await Quote.findByPk(id);
            if (!quote) {
                throw new AppError('Cotización no encontrada', 404);
            }
            
            await quote.update({
                status,
                updated_by: req.user.id
            });
            
            res.status(200).json({
                success: true,
                data: quote,
                message: `Estado de cotización actualizado a ${status}`
            });
        } catch (error) {
            next(error);
        }
    }
    
    // Generar número de cotización único
    async generateQuoteNumber() {
        const year = new Date().getFullYear();
        const lastQuote = await Quote.findOne({
            where: {
                quote_number: {
                    [Op.like]: `COT-${year}-%`
                }
            },
            order: [['created_at', 'DESC']]
        });
        
        let nextNumber = 1;
        if (lastQuote) {
            const lastNumber = parseInt(lastQuote.quote_number.split('-')[2]);
            nextNumber = lastNumber + 1;
        }
        
        return `COT-${year}-${nextNumber.toString().padStart(4, '0')}`;
    }
}

module.exports = new QuoteController();
