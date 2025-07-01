package com.example.chancafe_q.data.remote;

import com.example.chancafe_q.model.ApiResponse;
import com.example.chancafe_q.model.LoginRequest;
import com.example.chancafe_q.model.LoginResponse;
import com.example.chancafe_q.model.User;
import com.example.chancafe_q.model.Client;
import com.example.chancafe_q.model.Quote;
import com.example.chancafe_q.model.CreditRequest;
import com.example.chancafe_q.model.Product;
import com.example.chancafe_q.model.Category;
import com.example.chancafe_q.model.Supplier;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
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
    
    @GET("auth/profile")
    Call<ApiResponse<User>> getUserProfile();
    
    // ===============================
    // CLIENTS ENDPOINTS
    // ===============================
    
    @GET("clients")
    Call<ApiResponse<List<Client>>> getClients();
    
    @GET("clients/{id}")
    Call<ApiResponse<Client>> getClient(@Path("id") int id);
    
    @POST("clients")
    Call<ApiResponse<Client>> createClient(@Body Client client);
    
    @PUT("clients/{id}")
    Call<ApiResponse<Client>> updateClient(@Path("id") int id, @Body Client client);
    
    @DELETE("clients/{id}")
    Call<ApiResponse<Void>> deleteClient(@Path("id") int id);
    
    @GET("clients/search")
    Call<ApiResponse<List<Client>>> searchClients(@Query("q") String query);
    
    @GET("clients/document/{document}")
    Call<ApiResponse<Client>> getClientByDocument(@Path("document") String document);
    
    @PUT("clients/{id}/status")
    Call<ApiResponse<Client>> changeClientStatus(@Path("id") int id, @Query("status") String status);
    
    // ===============================
    // QUOTES ENDPOINTS
    // ===============================
    
    @GET("quotes")
    Call<ApiResponse<List<Quote>>> getQuotes();
    
    @GET("quotes/{id}")
    Call<ApiResponse<Quote>> getQuote(@Path("id") int id);
    
    @POST("quotes")
    Call<ApiResponse<Quote>> createQuote(@Body Quote quote);
    
    @PUT("quotes/{id}")
    Call<ApiResponse<Quote>> updateQuote(@Path("id") int id, @Body Quote quote);
    
    @DELETE("quotes/{id}")
    Call<ApiResponse<Void>> deleteQuote(@Path("id") int id);
    
    @GET("quotes/client/{clientId}")
    Call<ApiResponse<List<Quote>>> getQuotesByClient(@Path("clientId") int clientId);
    
    @PUT("quotes/{id}/status")
    Call<ApiResponse<Quote>> changeQuoteStatus(@Path("id") int id, @Query("status") String status);
    
    @POST("quotes/{id}/generate-pdf")
    Call<ApiResponse<String>> generateQuotePdf(@Path("id") int id);
    
    // ===============================
    // CREDIT REQUESTS ENDPOINTS
    // ===============================
    
    @GET("credit-requests")
    Call<ApiResponse<List<CreditRequest>>> getCreditRequests();
    
    @GET("credit-requests/{id}")
    Call<ApiResponse<CreditRequest>> getCreditRequest(@Path("id") int id);
    
    @POST("credit-requests")
    Call<ApiResponse<CreditRequest>> createCreditRequest(@Body CreditRequest creditRequest);
    
    @PUT("credit-requests/{id}")
    Call<ApiResponse<CreditRequest>> updateCreditRequest(@Path("id") int id, @Body CreditRequest creditRequest);
    
    @DELETE("credit-requests/{id}")
    Call<ApiResponse<Void>> deleteCreditRequest(@Path("id") int id);
    
    @PUT("credit-requests/{id}/approve")
    Call<ApiResponse<CreditRequest>> approveCreditRequest(@Path("id") int id, @Query("approved_amount") double approvedAmount, @Query("approved_terms") int approvedTerms);
    
    @PUT("credit-requests/{id}/reject")
    Call<ApiResponse<CreditRequest>> rejectCreditRequest(@Path("id") int id, @Query("rejection_reason") String reason);
    
    @GET("credit-requests/client/{clientId}")
    Call<ApiResponse<List<CreditRequest>>> getCreditRequestsByClient(@Path("clientId") int clientId);
    
    // ===============================
    // PRODUCTS ENDPOINTS
    // ===============================
    
    @GET("products")
    Call<ApiResponse<List<Product>>> getProducts();
    
    @GET("products/{id}")
    Call<ApiResponse<Product>> getProduct(@Path("id") int id);
    
    @POST("products")
    Call<ApiResponse<Product>> createProduct(@Body Product product);
    
    @PUT("products/{id}")
    Call<ApiResponse<Product>> updateProduct(@Path("id") int id, @Body Product product);
    
    @DELETE("products/{id}")
    Call<ApiResponse<Void>> deleteProduct(@Path("id") int id);
    
    @GET("products/search")
    Call<ApiResponse<List<Product>>> searchProducts(@Query("q") String query);
    
    @GET("products/category/{categoryId}")
    Call<ApiResponse<List<Product>>> getProductsByCategory(@Path("categoryId") int categoryId);
    
    // ===============================
    // CATEGORIES ENDPOINTS
    // ===============================
    
    @GET("categories")
    Call<ApiResponse<List<Category>>> getCategories();
    
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
