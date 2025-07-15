package com.example.chancafe_q.viewmodel;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;
import com.example.chancafe_q.model.Product;
import com.example.chancafe_q.model.Category;
import com.example.chancafe_q.model.Supplier;
import com.example.chancafe_q.repository.ProductRepository;
import java.util.List;

public class ProductViewModel extends ViewModel {
    private final ProductRepository productRepository;
    private final MutableLiveData<String> filterStatusLiveData = new MutableLiveData<>();
    private final MutableLiveData<String> searchQueryLiveData = new MutableLiveData<>();
    private final MutableLiveData<Integer> selectedCategoryLiveData = new MutableLiveData<>();
    private final MutableLiveData<Integer> selectedSupplierLiveData = new MutableLiveData<>();
    private final MutableLiveData<String> selectedBrandLiveData = new MutableLiveData<>();
    private final MutableLiveData<String> sortOrderLiveData = new MutableLiveData<>();

    public ProductViewModel() {
        productRepository = new ProductRepository();
        // Inicializar valores por defecto
        filterStatusLiveData.setValue("active");
        searchQueryLiveData.setValue("");
        selectedCategoryLiveData.setValue(null);
        selectedSupplierLiveData.setValue(null);
        selectedBrandLiveData.setValue(null);
        sortOrderLiveData.setValue("name_asc");
    }

    // Getters para LiveData del repository
    public LiveData<List<Product>> getProducts() {
        return productRepository.getProductsLiveData();
    }

    public LiveData<List<Category>> getCategories() {
        return productRepository.getCategoriesLiveData();
    }

    public LiveData<List<Supplier>> getSuppliers() {
        return productRepository.getSuppliersLiveData();
    }

    public LiveData<Product> getProduct() {
        return productRepository.getProductLiveData();
    }

    public LiveData<Boolean> getLoading() {
        return productRepository.getLoadingLiveData();
    }

    public LiveData<String> getError() {
        return productRepository.getErrorLiveData();
    }

    public LiveData<String> getSuccess() {
        return productRepository.getSuccessLiveData();
    }

    // Getters para filtros
    public LiveData<String> getFilterStatus() {
        return filterStatusLiveData;
    }

    public LiveData<String> getSearchQuery() {
        return searchQueryLiveData;
    }

    public LiveData<Integer> getSelectedCategory() {
        return selectedCategoryLiveData;
    }

    public LiveData<Integer> getSelectedSupplier() {
        return selectedSupplierLiveData;
    }

    public LiveData<String> getSelectedBrand() {
        return selectedBrandLiveData;
    }

    public LiveData<String> getSortOrder() {
        return sortOrderLiveData;
    }

    // Métodos para actualizar filtros
    public void setFilterStatus(String status) {
        filterStatusLiveData.setValue(status);
        loadProducts();
    }

    public void setSearchQuery(String query) {
        searchQueryLiveData.setValue(query);
        if (query != null && !query.isEmpty()) {
            searchProducts();
        } else {
            loadProducts();
        }
    }

    public void setSelectedCategory(Integer categoryId) {
        selectedCategoryLiveData.setValue(categoryId);
        if (categoryId != null) {
            loadProductsByCategory(categoryId);
        } else {
            loadProducts();
        }
    }

    public void setSelectedSupplier(Integer supplierId) {
        selectedSupplierLiveData.setValue(supplierId);
        if (supplierId != null) {
            loadProductsBySupplier(supplierId);
        } else {
            loadProducts();
        }
    }

    public void setSelectedBrand(String brand) {
        selectedBrandLiveData.setValue(brand);
        if (brand != null && !brand.isEmpty()) {
            loadProductsByBrand(brand);
        } else {
            loadProducts();
        }
    }

    public void setSortOrder(String sortOrder) {
        sortOrderLiveData.setValue(sortOrder);
        loadProducts();
    }

    // Métodos principales para cargar productos
    public void loadProducts() {
        String status = filterStatusLiveData.getValue();
        Integer categoryId = selectedCategoryLiveData.getValue();
        Integer supplierId = selectedSupplierLiveData.getValue();
        String brand = selectedBrandLiveData.getValue();
        String search = searchQueryLiveData.getValue();

        // Si hay una búsqueda específica, usar el endpoint de búsqueda
        if (search != null && !search.trim().isEmpty()) {
            productRepository.searchProducts(search, categoryId, supplierId, status);
        } else {
            // Usar el endpoint general con filtros
            productRepository.getAllProducts(
                status, categoryId, supplierId, brand, null, 
                null, null, null, null, null, null
            );
        }
    }

    public void loadActiveProducts() {
        productRepository.getActiveProducts();
    }

    public void loadFeaturedProducts() {
        productRepository.getFeaturedProducts();
    }

    public void loadLowStockProducts() {
        filterStatusLiveData.setValue("low_stock");
        productRepository.getLowStockProducts();
    }

    public void loadOutOfStockProducts() {
        filterStatusLiveData.setValue("out_of_stock");
        productRepository.getOutOfStockProducts();
    }

    public void searchProducts() {
        String query = searchQueryLiveData.getValue();
        Integer categoryId = selectedCategoryLiveData.getValue();
        Integer supplierId = selectedSupplierLiveData.getValue();
        String status = filterStatusLiveData.getValue();
        
        if (query != null && !query.trim().isEmpty()) {
            productRepository.searchProducts(query, categoryId, supplierId, status);
        } else {
            loadProducts();
        }
    }

    public void loadProductsByCategory(int categoryId) {
        productRepository.getProductsByCategory(categoryId);
    }

    public void loadProductsBySupplier(int supplierId) {
        productRepository.getProductsBySupplier(supplierId);
    }

    public void loadProductsByBrand(String brand) {
        productRepository.getProductsByBrand(brand);
    }

    public void loadProductById(int id) {
        productRepository.getProductById(id);
    }

    // Métodos CRUD
    public void createProduct(Product product) {
        if (validateProduct(product)) {
            productRepository.createProduct(product);
        }
    }

    public void updateProduct(int id, Product product) {
        if (validateProduct(product)) {
            productRepository.updateProduct(id, product);
        }
    }

    public void deleteProduct(int id) {
        productRepository.deleteProduct(id);
    }

    public void changeProductStatus(int id, String status) {
        productRepository.changeProductStatus(id, status);
    }

    public void updateProductStock(int id, int stock) {
        if (stock >= 0) {
            productRepository.updateStock(id, stock);
        } else {
            // Let the repository handle the error
            return;
        }
    }

    // Métodos para cargar datos auxiliares
    public void loadCategories() {
        productRepository.getActiveCategories();
    }

    public void loadSuppliers() {
        productRepository.getActiveSuppliers();
    }

    public void loadBrands() {
        productRepository.getAvailableBrands();
    }

    // Validación de productos
    private boolean validateProduct(Product product) {
        if (product == null) {
            return false;
        }

        if (product.getName() == null || product.getName().trim().isEmpty()) {
            return false;
        }

        if (product.getDescription() == null || product.getDescription().trim().isEmpty()) {
            return false;
        }

        if (product.getPrice() == null || product.getPrice() <= 0) {
            return false;
        }

        if (product.getStock() == null || product.getStock() < 0) {
            return false;
        }

        if (product.getCategoryId() == null || product.getCategoryId() <= 0) {
            return false;
        }

        if (product.getSupplierId() == null || product.getSupplierId() <= 0) {
            return false;
        }

        if (product.getBrand() == null || product.getBrand().trim().isEmpty()) {
            return false;
        }

        if (product.getSku() == null || product.getSku().trim().isEmpty()) {
            return false;
        }

        return true;
    }

    // Métodos de utilidad
    public void clearFilters() {
        filterStatusLiveData.setValue("active");
        searchQueryLiveData.setValue("");
        selectedCategoryLiveData.setValue(null);
        selectedSupplierLiveData.setValue(null);
        selectedBrandLiveData.setValue(null);
        loadProducts();
    }

    public void clearMessages() {
        productRepository.clearMessages();
    }

    public void refresh() {
        loadProducts();
        loadCategories();
        loadSuppliers();
    }

    // Métodos para manejo de estados
    public String getFilterStatusValue() {
        return filterStatusLiveData.getValue();
    }

    public String getSearchQueryValue() {
        return searchQueryLiveData.getValue();
    }

    public Integer getSelectedCategoryValue() {
        return selectedCategoryLiveData.getValue();
    }

    public Integer getSelectedSupplierValue() {
        return selectedSupplierLiveData.getValue();
    }

    public String getSelectedBrandValue() {
        return selectedBrandLiveData.getValue();
    }

    public String getSortOrderValue() {
        return sortOrderLiveData.getValue();
    }

    // Métodos para manejar diferentes vistas
    public void applyQuickFilter(String filterType) {
        clearFilters();
        switch (filterType) {
            case "all":
                setFilterStatus("active");
                break;
            case "featured":
                loadFeaturedProducts();
                break;
            case "low_stock":
                loadLowStockProducts();
                break;
            case "out_of_stock":
                loadOutOfStockProducts();
                break;
            default:
                loadProducts();
                break;
        }
    }

    public boolean hasActiveFilters() {
        String search = searchQueryLiveData.getValue();
        Integer categoryId = selectedCategoryLiveData.getValue();
        Integer supplierId = selectedSupplierLiveData.getValue();
        String brand = selectedBrandLiveData.getValue();
        String status = filterStatusLiveData.getValue();

        return (search != null && !search.trim().isEmpty()) ||
               (categoryId != null && categoryId > 0) ||
               (supplierId != null && supplierId > 0) ||
               (brand != null && !brand.trim().isEmpty()) ||
               (status != null && !status.equals("active"));
    }

    @Override
    protected void onCleared() {
        super.onCleared();
        // Limpiar recursos si es necesario
    }
}