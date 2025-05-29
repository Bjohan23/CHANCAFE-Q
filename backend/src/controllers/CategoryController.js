const { Category } = require('../models');
const { AppError } = require('../utils/helpers');

class CategoryController {
    
    // Obtener todas las categorías
    async getAllCategories(req, res, next) {
        try {
            const { active } = req.query;
            
            const whereClause = {};
            if (active !== undefined) {
                whereClause.active = active === 'true';
            }
            
            const categories = await Category.findAll({
                where: whereClause,
                order: [['name', 'ASC']]
            });
            
            res.status(200).json({
                success: true,
                data: categories,
                message: 'Categorías obtenidas exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }
    
    // Obtener categoría por ID
    async getCategoryById(req, res, next) {
        try {
            const { id } = req.params;
            const category = await Category.findByPk(id);
            
            if (!category) {
                throw new AppError('Categoría no encontrada', 404);
            }
            
            res.status(200).json({
                success: true,
                data: category,
                message: 'Categoría obtenida exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }
    
    // Crear nueva categoría
    async createCategory(req, res, next) {
        try {
            const { name, description } = req.body;
            
            // Verificar si ya existe una categoría con ese nombre
            const existingCategory = await Category.findOne({ 
                where: { name } 
            });
            
            if (existingCategory) {
                throw new AppError('Ya existe una categoría con ese nombre', 409);
            }
            
            const category = await Category.create({
                name,
                description,
                created_by: req.user.id
            });
            
            res.status(201).json({
                success: true,
                data: category,
                message: 'Categoría creada exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }
    
    // Actualizar categoría
    async updateCategory(req, res, next) {
        try {
            const { id } = req.params;
            const { name, description, active } = req.body;
            
            const category = await Category.findByPk(id);
            
            if (!category) {
                throw new AppError('Categoría no encontrada', 404);
            }
            
            // Verificar si el nuevo nombre ya existe (si se está cambiando)
            if (name && name !== category.name) {
                const existingCategory = await Category.findOne({
                    where: { name }
                });
                
                if (existingCategory) {
                    throw new AppError('Ya existe una categoría con ese nombre', 409);
                }
            }
            
            await category.update({
                name: name || category.name,
                description: description !== undefined ? description : category.description,
                active: active !== undefined ? active : category.active,
                updated_by: req.user.id
            });
            
            res.status(200).json({
                success: true,
                data: category,
                message: 'Categoría actualizada exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }
    
    // Eliminar categoría
    async deleteCategory(req, res, next) {
        try {
            const { id } = req.params;
            
            const category = await Category.findByPk(id);
            
            if (!category) {
                throw new AppError('Categoría no encontrada', 404);
            }
            
            // Desactivar en lugar de eliminar
            await category.update({
                active: false,
                updated_by: req.user.id
            });
            
            res.status(200).json({
                success: true,
                message: 'Categoría eliminada exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }
    
    // Obtener productos de una categoría
    async getCategoryProducts(req, res, next) {
        try {
            const { id } = req.params;
            const { Product } = require('../models');
            
            const category = await Category.findByPk(id, {
                include: [{
                    model: Product,
                    as: 'products',
                    where: { active: true },
                    required: false
                }]
            });
            
            if (!category) {
                throw new AppError('Categoría no encontrada', 404);
            }
            
            res.status(200).json({
                success: true,
                data: category,
                message: 'Productos de la categoría obtenidos exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CategoryController();
