package com.example.chancafe_q.repository;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.example.chancafe_q.data.remote.ApiClient;
import com.example.chancafe_q.data.remote.ApiService;
import com.example.chancafe_q.model.ApiResponse;
import com.example.chancafe_q.model.Product;
import com.example.chancafe_q.model.Category;
import com.example.chancafe_q.model.Supplier;
import java.util.List;
import java.util.Map;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ProductRepository {
    private final ApiService apiService;
    private final MutableLiveData<List<Product>> productsLiveData = new MutableLiveData<>();
    private final MutableLiveData<List<Category>> categoriesLiveData = new MutableLiveData<>();
    private final MutableLiveData<List<Supplier>> suppliersLiveData = new MutableLiveData<>();
    private final MutableLiveData<Product> productLiveData = new MutableLiveData<>();
    private final MutableLiveData<Boolean> loadingLiveData = new MutableLiveData<>();
    private final MutableLiveData<String> errorLiveData = new MutableLiveData<>();
    private final MutableLiveData<String> successLiveData = new MutableLiveData<>();

    public ProductRepository() {
        this.apiService = ApiClient.getApiService();
    }

    // Getters para LiveData
    public LiveData<List<Product>> getProductsLiveData() {
        return productsLiveData;
    }

    public LiveData<List<Category>> getCategoriesLiveData() {
        return categoriesLiveData;
    }

    public LiveData<List<Supplier>> getSuppliersLiveData() {
        return suppliersLiveData;
    }

    public LiveData<Product> getProductLiveData() {
        return productLiveData;
    }

    public LiveData<Boolean> getLoadingLiveData() {
        return loadingLiveData;
    }

    public LiveData<String> getErrorLiveData() {
        return errorLiveData;
    }

    public LiveData<String> getSuccessLiveData() {
        return successLiveData;
    }

    // Obtener todos los productos
    public void getAllProducts(String status, Integer categoryId, Integer supplierId, 
                               String brand, String search, Double priceMin, Double priceMax,
                               Integer stockMin, Integer stockMax, Integer page, Integer limit) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<List<Product>>> call = apiService.getAllProducts(
            status, categoryId, supplierId, brand, search, priceMin, priceMax,
            stockMin, stockMax, page, limit
        );
        
        call.enqueue(new Callback<ApiResponse<List<Product>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Product>>> call, Response<ApiResponse<List<Product>>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        productsLiveData.postValue(response.body().getData());
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al cargar productos");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Product>>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Obtener productos activos
    public void getActiveProducts() {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<List<Product>>> call = apiService.getActiveProducts();
        
        call.enqueue(new Callback<ApiResponse<List<Product>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Product>>> call, Response<ApiResponse<List<Product>>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        productsLiveData.postValue(response.body().getData());
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al cargar productos activos");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Product>>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Obtener productos destacados
    public void getFeaturedProducts() {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<List<Product>>> call = apiService.getFeaturedProducts();
        
        call.enqueue(new Callback<ApiResponse<List<Product>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Product>>> call, Response<ApiResponse<List<Product>>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        productsLiveData.postValue(response.body().getData());
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al cargar productos destacados");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Product>>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Buscar productos
    public void searchProducts(String query, Integer categoryId, Integer supplierId, String status) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<List<Product>>> call = apiService.searchProducts(query, categoryId, supplierId, status);
        
        call.enqueue(new Callback<ApiResponse<List<Product>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Product>>> call, Response<ApiResponse<List<Product>>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        productsLiveData.postValue(response.body().getData());
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error en la búsqueda");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Product>>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Obtener productos por categoría
    public void getProductsByCategory(int categoryId) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<List<Product>>> call = apiService.getProductsByCategory(categoryId);
        
        call.enqueue(new Callback<ApiResponse<List<Product>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Product>>> call, Response<ApiResponse<List<Product>>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        productsLiveData.postValue(response.body().getData());
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al cargar productos por categoría");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Product>>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Obtener productos por proveedor
    public void getProductsBySupplier(int supplierId) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<List<Product>>> call = apiService.getProductsBySupplier(supplierId);
        
        call.enqueue(new Callback<ApiResponse<List<Product>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Product>>> call, Response<ApiResponse<List<Product>>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        productsLiveData.postValue(response.body().getData());
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al cargar productos por proveedor");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Product>>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Obtener productos por marca
    public void getProductsByBrand(String brand) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<List<Product>>> call = apiService.getProductsByBrand(brand);
        
        call.enqueue(new Callback<ApiResponse<List<Product>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Product>>> call, Response<ApiResponse<List<Product>>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        productsLiveData.postValue(response.body().getData());
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al cargar productos por marca");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Product>>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Obtener productos con poco stock
    public void getLowStockProducts() {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<List<Product>>> call = apiService.getLowStockProducts();
        
        call.enqueue(new Callback<ApiResponse<List<Product>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Product>>> call, Response<ApiResponse<List<Product>>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        productsLiveData.postValue(response.body().getData());
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al cargar productos con poco stock");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Product>>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Obtener productos sin stock
    public void getOutOfStockProducts() {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<List<Product>>> call = apiService.getOutOfStockProducts();
        
        call.enqueue(new Callback<ApiResponse<List<Product>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Product>>> call, Response<ApiResponse<List<Product>>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        productsLiveData.postValue(response.body().getData());
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al cargar productos sin stock");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Product>>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Obtener producto por ID
    public void getProductById(int id) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<Product>> call = apiService.getProductById(id);
        
        call.enqueue(new Callback<ApiResponse<Product>>() {
            @Override
            public void onResponse(Call<ApiResponse<Product>> call, Response<ApiResponse<Product>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        productLiveData.postValue(response.body().getData());
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al cargar el producto");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Product>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Crear producto
    public void createProduct(Product product) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<Product>> call = apiService.createProduct(product);
        
        call.enqueue(new Callback<ApiResponse<Product>>() {
            @Override
            public void onResponse(Call<ApiResponse<Product>> call, Response<ApiResponse<Product>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        productLiveData.postValue(response.body().getData());
                        successLiveData.postValue("Producto creado exitosamente");
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al crear el producto");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Product>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Actualizar producto
    public void updateProduct(int id, Product product) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<Product>> call = apiService.updateProduct(id, product);
        
        call.enqueue(new Callback<ApiResponse<Product>>() {
            @Override
            public void onResponse(Call<ApiResponse<Product>> call, Response<ApiResponse<Product>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        productLiveData.postValue(response.body().getData());
                        successLiveData.postValue("Producto actualizado exitosamente");
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al actualizar el producto");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Product>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Eliminar producto
    public void deleteProduct(int id) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<String>> call = apiService.deleteProduct(id);
        
        call.enqueue(new Callback<ApiResponse<String>>() {
            @Override
            public void onResponse(Call<ApiResponse<String>> call, Response<ApiResponse<String>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        successLiveData.postValue("Producto eliminado exitosamente");
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al eliminar el producto");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<String>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Cambiar estado del producto
    public void changeProductStatus(int id, String status) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<Product>> call = apiService.changeProductStatus(id, status);
        
        call.enqueue(new Callback<ApiResponse<Product>>() {
            @Override
            public void onResponse(Call<ApiResponse<Product>> call, Response<ApiResponse<Product>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        productLiveData.postValue(response.body().getData());
                        successLiveData.postValue("Estado del producto actualizado");
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al cambiar el estado");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Product>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Actualizar stock
    public void updateStock(int id, int stock) {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<Product>> call = apiService.updateProductStock(id, stock);
        
        call.enqueue(new Callback<ApiResponse<Product>>() {
            @Override
            public void onResponse(Call<ApiResponse<Product>> call, Response<ApiResponse<Product>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        productLiveData.postValue(response.body().getData());
                        successLiveData.postValue("Stock actualizado exitosamente");
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al actualizar el stock");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Product>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Obtener categorías activas
    public void getActiveCategories() {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<List<Category>>> call = apiService.getActiveCategories();
        
        call.enqueue(new Callback<ApiResponse<List<Category>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Category>>> call, Response<ApiResponse<List<Category>>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        categoriesLiveData.postValue(response.body().getData());
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al cargar categorías");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Category>>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Obtener proveedores activos
    public void getActiveSuppliers() {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<List<Supplier>>> call = apiService.getActiveSuppliers();
        
        call.enqueue(new Callback<ApiResponse<List<Supplier>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Supplier>>> call, Response<ApiResponse<List<Supplier>>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        suppliersLiveData.postValue(response.body().getData());
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al cargar proveedores");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Supplier>>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Obtener marcas disponibles
    public void getAvailableBrands() {
        loadingLiveData.postValue(true);
        
        Call<ApiResponse<List<String>>> call = apiService.getAvailableBrands();
        
        call.enqueue(new Callback<ApiResponse<List<String>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<String>>> call, Response<ApiResponse<List<String>>> response) {
                loadingLiveData.postValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().isSuccess()) {
                        // Manejar la respuesta de marcas si es necesario
                        successLiveData.postValue("Marcas cargadas exitosamente");
                    } else {
                        errorLiveData.postValue(response.body().getMessage());
                    }
                } else {
                    errorLiveData.postValue("Error al cargar marcas");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<String>>> call, Throwable t) {
                loadingLiveData.postValue(false);
                errorLiveData.postValue("Error de conexión: " + t.getMessage());
            }
        });
    }

    // Limpiar mensajes
    public void clearMessages() {
        errorLiveData.postValue(null);
        successLiveData.postValue(null);
    }
}