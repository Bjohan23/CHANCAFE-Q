package com.example.chancafe_q;

import android.app.Application;
import com.example.chancafe_q.data.remote.ApiClient;

/**
 * Clase Application para inicializar componentes globales
 */
public class ChancafeApplication extends Application {
    
    @Override
    public void onCreate() {
        super.onCreate();
        
        // Inicializar ApiClient con el contexto de la aplicación
        ApiClient.init(this);
    }
}