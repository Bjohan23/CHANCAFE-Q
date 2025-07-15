package com.example.chancafe_q.data.remote;

import com.example.chancafe_q.model.ApiResponse;
import com.example.chancafe_q.model.LoginRequest;
import com.example.chancafe_q.model.LoginResponse;
import com.example.chancafe_q.model.User;
import com.example.chancafe_q.model.Client;
import com.example.chancafe_q.model.Quote;
import com.example.chancafe_q.model.QuotesResponse;
import com.example.chancafe_q.model.ClientsResponse;
import com.example.chancafe_q.model.CreditRequest;
import com.example.chancafe_q.model.Product;
import com.example.chancafe_q.model.Category;
import com.example.chancafe_q.model.Supplier;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.PATCH;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Path;
import retrofit2.http.Query;

import java.util.List;

/**
 * Interfaz API Service para todas las llamadas HTTP
 * Los headers de autorización se manejan automáticamente por el ApiClient interceptor
 */
public interface ApiService {
    
    // ===============================
    // AUTHENTICATION ENDPOINTS
    // ===============================
    
    @POST("auth/register")
    Call<ApiResponse<User>> register(@Body User user);
    
    @POST("auth/login")
    Call<ApiResponse<LoginResponse>> login(@Body LoginRequest loginRequest);
    
    @POST("auth/logout")
    Call<ApiResponse<Void>> logout();
    
    @POST("auth/refresh")
    Call<ApiResponse<String>> refreshToken();
    
    @GET("auth/users/profile")
    Call<ApiResponse<User>> getUserProfile();
    
    // ===============================
    // CLIENTS ENDPOINTS
    // ===============================
    
    @GET("clients")
    Call<ApiResponse<ClientsResponse>> getAllClients();
    
    @GET("clients/active")
    Call<ApiResponse<ClientsResponse>> getActiveClients();
    
    @GET("clients/stats")
    Call<ApiResponse<Object>> getClientStats();
    
    @GET("clients/type/{type}")
    Call<ApiResponse<ClientsResponse>> getClientsByType(@Path("type") String type);
    
    @GET("clients/assigned/{userId}")
    Call<ApiResponse<ClientsResponse>> getClientsByAssignedUser(@Path("userId") int userId);
    
    @GET("clients/high-credit")
    Call<ApiResponse<ClientsResponse>> getClientsWithHighCreditLimit();
    
    @GET("clients/document/{documentNumber}")
    Call<ApiResponse<Client>> getClientByDocument(@Path("documentNumber") String documentNumber);
    
    @GET("clients/{id}")
    Call<ApiResponse<Client>> getClientById(@Path("id") int id);
    
    @GET("clients/{id}/relations")
    Call<ApiResponse<Client>> getClientWithRelations(@Path("id") int id);
    
    @POST("clients")
    Call<ApiResponse<Client>> createClient(@Body Client client);
    
    @PUT("clients/{id}")
    Call<ApiResponse<Client>> updateClient(@Path("id") int id, @Body Client client);
    
    @PATCH("clients/{id}/status")
    Call<ApiResponse<Client>> changeClientStatus(@Path("id") int id, @Body Object statusData);
    
    @PATCH("clients/{id}/credit-limit")
    Call<ApiResponse<Client>> updateCreditLimit(@Path("id") int id, @Body Object creditData);
    
    @DELETE("clients/{id}")
    Call<ApiResponse<Void>> deleteClient(@Path("id") int id);
    
    // ===============================
    // QUOTES ENDPOINTS
    // ===============================
    
    @GET("quotes")
    Call<ApiResponse<QuotesResponse>> getAllQuotes(
        @Query("status") String status,
        @Query("client_id") Integer clientId,
        @Query("user_id") Integer userId,
        @Query("currency") String currency,
        @Query("date_from") String dateFrom,
        @Query("date_to") String dateTo,
        @Query("search") String search,
        @Query("page") Integer page,
        @Query("limit") Integer limit
    );
    
    @GET("quotes")
    Call<ApiResponse<QuotesResponse>> getQuotes();
    
    @GET("quotes/{id}")
    Call<ApiResponse<Quote>> getQuoteById(@Path("id") int id);
    
    @GET("quotes/{id}")
    Call<ApiResponse<Quote>> getQuote(@Path("id") int id);
    
    @GET("quotes/client/{clientId}")
    Call<ApiResponse<QuotesResponse>> getQuotesByClient(@Path("clientId") int clientId);
    
    @GET("quotes/user/{userId}")
    Call<ApiResponse<QuotesResponse>> getQuotesByUser(@Path("userId") int userId);
    
    @GET("quotes/status/{status}")
    Call<ApiResponse<QuotesResponse>> getQuotesByStatus(@Path("status") String status);
    
    @GET("quotes/number/{quoteNumber}")
    Call<ApiResponse<Quote>> getQuoteByNumber(@Path("quoteNumber") String quoteNumber);
    
    @POST("quotes")
    Call<ApiResponse<Quote>> createQuote(@Body Quote quote);
    
    @POST("quotes/with-credit-check")
    Call<ApiResponse<java.util.Map<String, Object>>> createQuoteWithCreditCheck(@Body Quote quote);
    
    @PUT("quotes/{id}")
    Call<ApiResponse<Quote>> updateQuote(@Path("id") int id, @Body Quote quote);
    
    @DELETE("quotes/{id}")
    Call<ApiResponse<String>> deleteQuote(@Path("id") int id);
    
    @PUT("quotes/{id}/status")
    Call<ApiResponse<Quote>> changeQuoteStatus(@Path("id") int id, @Query("status") String status);
    
    @POST("quotes/{id}/recalculate")
    Call<ApiResponse<Quote>> recalculateQuote(@Path("id") int id);
    
    @GET("quotes/{quoteId}/items")
    Call<ApiResponse<List<com.example.chancafe_q.model.QuoteItem>>> getQuoteItems(@Path("quoteId") int quoteId);
    
    @POST("quotes/{quoteId}/items")
    Call<ApiResponse<com.example.chancafe_q.model.QuoteItem>> addQuoteItem(@Path("quoteId") int quoteId, @Body com.example.chancafe_q.model.QuoteItem quoteItem);
    
    @PUT("quotes/items/{itemId}")
    Call<ApiResponse<com.example.chancafe_q.model.QuoteItem>> updateQuoteItem(@Path("itemId") int itemId, @Body com.example.chancafe_q.model.QuoteItem quoteItem);
    
    @DELETE("quotes/items/{itemId}")
    Call<ApiResponse<String>> deleteQuoteItem(@Path("itemId") int itemId);
    
    @POST("quotes/client/{clientId}/credit-check")
    Call<ApiResponse<java.util.Map<String, Object>>> performCreditCheck(@Path("clientId") int clientId);
    
    @GET("quotes/client/{clientId}/credit-assessment")
    Call<ApiResponse<java.util.Map<String, Object>>> getCreditAssessment(@Path("clientId") int clientId);
    
    @GET("quotes/{quoteId}/credit-info")
    Call<ApiResponse<java.util.Map<String, Object>>> getQuoteWithCreditInfo(@Path("quoteId") int quoteId);
    
    @POST("quotes/{id}/generate-pdf")
    Call<ApiResponse<String>> generateQuotePdf(@Path("id") int id);
    
    // ===============================
    // CREDIT REQUESTS ENDPOINTS
    // ===============================
    
    @GET("credit-requests")
    Call<ApiResponse<List<CreditRequest>>> getAllCreditRequests(
        @Query("status") String status,
        @Query("client_id") Integer clientId,
        @Query("user_id") Integer userId,
        @Query("priority") String priority,
        @Query("currency") String currency,
        @Query("date_from") String dateFrom,
        @Query("date_to") String dateTo,
        @Query("search") String search,
        @Query("page") Integer page,
        @Query("limit") Integer limit
    );
    
    @GET("credit-requests")
    Call<ApiResponse<List<CreditRequest>>> getCreditRequests();
    
    @GET("credit-requests/{id}")
    Call<ApiResponse<CreditRequest>> getCreditRequestById(@Path("id") int id);
    
    @GET("credit-requests/{id}")
    Call<ApiResponse<CreditRequest>> getCreditRequest(@Path("id") int id);
    
    @GET("credit-requests/status/{status}")
    Call<ApiResponse<List<CreditRequest>>> getCreditRequestsByStatus(@Path("status") String status);
    
    @GET("credit-requests/client/{clientId}")
    Call<ApiResponse<List<CreditRequest>>> getCreditRequestsByClient(@Path("clientId") int clientId);
    
    @GET("credit-requests/user/{userId}")
    Call<ApiResponse<List<CreditRequest>>> getCreditRequestsByUser(@Path("userId") int userId);
    
    @GET("credit-requests/priority/{priority}")
    Call<ApiResponse<List<CreditRequest>>> getCreditRequestsByPriority(@Path("priority") String priority);
    
    @GET("credit-requests/statistics")
    Call<ApiResponse<java.util.Map<String, Object>>> getCreditRequestStatistics();
    
    @POST("credit-requests")
    Call<ApiResponse<CreditRequest>> createCreditRequest(@Body CreditRequest creditRequest);
    
    @PUT("credit-requests/{id}")
    Call<ApiResponse<CreditRequest>> updateCreditRequest(@Path("id") int id, @Body CreditRequest creditRequest);
    
    @DELETE("credit-requests/{id}")
    Call<ApiResponse<String>> deleteCreditRequest(@Path("id") int id);
    
    @PATCH("credit-requests/{id}/status")
    Call<ApiResponse<CreditRequest>> changeCreditRequestStatus(@Path("id") int id, @Query("status") String status);
    
    @PUT("credit-requests/{id}/approve")
    Call<ApiResponse<CreditRequest>> approveCreditRequest(
        @Path("id") int id, 
        @Query("approved_amount") Double approvedAmount, 
        @Query("approved_terms") String approvedTerms,
        @Query("conditions") String conditions
    );
    
    @PUT("credit-requests/{id}/reject")
    Call<ApiResponse<CreditRequest>> rejectCreditRequest(@Path("id") int id, @Query("rejection_reason") String rejectionReason);
    
    @PATCH("credit-requests/{id}/risk-assessment")
    Call<ApiResponse<CreditRequest>> updateCreditRequestRiskAssessment(@Path("id") int id, @Query("risk_assessment") String riskAssessment);
    
    @POST("credit-requests/mark-expired")
    Call<ApiResponse<String>> markExpiredCreditRequests();
    
    // ===============================
    // PRODUCTS ENDPOINTS
    // ===============================
    
    @GET("products")
    Call<ApiResponse<List<Product>>> getAllProducts(
        @Query("status") String status,
        @Query("category_id") Integer categoryId,
        @Query("supplier_id") Integer supplierId,
        @Query("brand") String brand,
        @Query("search") String search,
        @Query("price_min") Double priceMin,
        @Query("price_max") Double priceMax,
        @Query("stock_min") Integer stockMin,
        @Query("stock_max") Integer stockMax,
        @Query("page") Integer page,
        @Query("limit") Integer limit
    );
    
    @GET("products")
    Call<ApiResponse<List<Product>>> getProducts();
    
    @GET("products/active")
    Call<ApiResponse<List<Product>>> getActiveProducts();
    
    @GET("products/featured")
    Call<ApiResponse<List<Product>>> getFeaturedProducts();
    
    @GET("products/low-stock")
    Call<ApiResponse<List<Product>>> getLowStockProducts();
    
    @GET("products/out-of-stock")
    Call<ApiResponse<List<Product>>> getOutOfStockProducts();
    
    @GET("products/{id}")
    Call<ApiResponse<Product>> getProductById(@Path("id") int id);
    
    @GET("products/{id}")
    Call<ApiResponse<Product>> getProduct(@Path("id") int id);
    
    @POST("products")
    Call<ApiResponse<Product>> createProduct(@Body Product product);
    
    @PUT("products/{id}")
    Call<ApiResponse<Product>> updateProduct(@Path("id") int id, @Body Product product);
    
    @DELETE("products/{id}")
    Call<ApiResponse<String>> deleteProduct(@Path("id") int id);
    
    @PATCH("products/{id}/status")
    Call<ApiResponse<Product>> changeProductStatus(@Path("id") int id, @Query("status") String status);
    
    @PATCH("products/{id}/stock")
    Call<ApiResponse<Product>> updateProductStock(@Path("id") int id, @Query("stock") Integer stock);
    
    @GET("products/search")
    Call<ApiResponse<List<Product>>> searchProducts(
        @Query("q") String query,
        @Query("category_id") Integer categoryId,
        @Query("supplier_id") Integer supplierId,
        @Query("status") String status
    );
    
    @GET("products/search")
    Call<ApiResponse<List<Product>>> searchProducts(@Query("q") String query);
    
    @GET("products/category/{categoryId}")
    Call<ApiResponse<List<Product>>> getProductsByCategory(@Path("categoryId") int categoryId);
    
    @GET("products/supplier/{supplierId}")
    Call<ApiResponse<List<Product>>> getProductsBySupplier(@Path("supplierId") int supplierId);
    
    @GET("products/brand/{brand}")
    Call<ApiResponse<List<Product>>> getProductsByBrand(@Path("brand") String brand);
    
    @GET("products/brands")
    Call<ApiResponse<List<String>>> getAvailableBrands();
    
    // ===============================
    // CATEGORIES ENDPOINTS
    // ===============================
    
    @GET("categories")
    Call<ApiResponse<List<Category>>> getCategories();
    
    @GET("categories/active")
    Call<ApiResponse<List<Category>>> getActiveCategories();
    
    @GET("categories/{id}")
    Call<ApiResponse<Category>> getCategory(@Path("id") int id);
    
    @POST("categories")
    Call<ApiResponse<Category>> createCategory(@Body Category category);
    
    @PUT("categories/{id}")
    Call<ApiResponse<Category>> updateCategory(@Path("id") int id, @Body Category category);
    
    @DELETE("categories/{id}")
    Call<ApiResponse<Void>> deleteCategory(@Path("id") int id);
    
    // ===============================
    // SUPPLIERS ENDPOINTS
    // ===============================
    
    @GET("suppliers")
    Call<ApiResponse<List<Supplier>>> getSuppliers();
    
    @GET("suppliers/active")
    Call<ApiResponse<List<Supplier>>> getActiveSuppliers();
    
    @GET("suppliers/{id}")
    Call<ApiResponse<Supplier>> getSupplier(@Path("id") int id);
    
    @POST("suppliers")
    Call<ApiResponse<Supplier>> createSupplier(@Body Supplier supplier);
    
    @PUT("suppliers/{id}")
    Call<ApiResponse<Supplier>> updateSupplier(@Path("id") int id, @Body Supplier supplier);
    
    @DELETE("suppliers/{id}")
    Call<ApiResponse<Void>> deleteSupplier(@Path("id") int id);
    
    @GET("suppliers/search")
    Call<ApiResponse<List<Supplier>>> searchSuppliers(@Query("q") String query);
}
