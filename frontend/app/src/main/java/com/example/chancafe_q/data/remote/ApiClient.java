package com.example.chancafe_q.data.remote;

/**
 * Clase preparatoria para futura integración con Retrofit
 * Esta clase contendrá la configuración del cliente HTTP
 * 
 * TODO: Descomentar cuando se implemente Retrofit
 */

/*
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import okhttp3.OkHttpClient;
import okhttp3.logging.HttpLoggingInterceptor;
import com.example.chancafe_q.utils.Constants;
import java.util.concurrent.TimeUnit;

public class ApiClient {
    private static Retrofit retrofit = null;
    
    public static Retrofit getClient() {
        if (retrofit == null) {
            // Logging interceptor para debug
            HttpLoggingInterceptor loggingInterceptor = new HttpLoggingInterceptor();
            loggingInterceptor.setLevel(HttpLoggingInterceptor.Level.BODY);
            
            // OkHttp client con timeouts
            OkHttpClient client = new OkHttpClient.Builder()
                .addInterceptor(loggingInterceptor)
                .connectTimeout(Constants.TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .readTimeout(Constants.TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .writeTimeout(Constants.TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .build();
            
            // Retrofit instance
            retrofit = new Retrofit.Builder()
                .baseUrl(Constants.BASE_URL)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        }
        return retrofit;
    }
}
*/

public class ApiClient {
    // Placeholder class - implementar cuando se añada Retrofit
    private ApiClient() {
        // Constructor privado para prevenir instanciación
    }
}