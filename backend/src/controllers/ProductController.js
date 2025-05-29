const { ProductService } = require('../services');
const { AppError } = require('../utils/helpers');

class ProductController {
    
    // Obtener todos los productos
    async getAllProducts(req, res, next) {
        try {
            const { page = 1, limit = 10, category, active } = req.query;
            
            const filters = {};
            if (category) filters.category_id = category;
            if (active !== undefined) filters.active = active === 'true';
            
            const products = await ProductService.getAllProducts({
                page: parseInt(page),
                limit: parseInt(limit),
                filters
            });
            
            res.status(200).json({
                success: true,
                data: products,
                message: 'Productos obtenidos exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }
    
    // Obtener producto por ID
    async getProductById(req, res, next) {
        try {
            const { id } = req.params;
            const product = await ProductService.getProductById(id);
            
            if (!product) {
                throw new AppError('Producto no encontrado', 404);
            }
            
            res.status(200).json({
                success: true,
                data: product,
                message: 'Producto obtenido exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }
    
    // Crear nuevo producto
    async createProduct(req, res, next) {
        try {
            const productData = req.body;
            productData.created_by = req.user.id;
            
            const product = await ProductService.createProduct(productData);
            
            res.status(201).json({
                success: true,
                data: product,
                message: 'Producto creado exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }
    
    // Actualizar producto
    async updateProduct(req, res, next) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            updateData.updated_by = req.user.id;
            
            const product = await ProductService.updateProduct(id, updateData);
            
            if (!product) {
                throw new AppError('Producto no encontrado', 404);
            }
            
            res.status(200).json({
                success: true,
                data: product,
                message: 'Producto actualizado exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }
    
    // Eliminar producto (soft delete)
    async deleteProduct(req, res, next) {
        try {
            const { id } = req.params;
            
            const deleted = await ProductService.deleteProduct(id, req.user.id);
            
            if (!deleted) {
                throw new AppError('Producto no encontrado', 404);
            }
            
            res.status(200).json({
                success: true,
                message: 'Producto eliminado exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }
    
    // Activar/Desactivar producto
    async toggleProductStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { active } = req.body;
            
            const product = await ProductService.updateProduct(id, { 
                active, 
                updated_by: req.user.id 
            });
            
            if (!product) {
                throw new AppError('Producto no encontrado', 404);
            }
            
            res.status(200).json({
                success: true,
                data: product,
                message: `Producto ${active ? 'activado' : 'desactivado'} exitosamente`
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ProductController();
