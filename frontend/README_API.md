# 🚀 Guía de Configuración API - ChancafeQ Android

## ✅ Configuración Completada

Tu aplicación Android está ahora completamente configurada para comunicarse con tu API REST en `http://localhost:3000/api`. 

## 📁 Estructura del Proyecto

```
app/src/main/java/com/example/chancafe_q/
├── data/
│   ├── local/          # Base de datos local (Room)
│   └── remote/         # Comunicación API
│       ├── ApiClient.java      ✅ Configurado
│       └── ApiService.java     ✅ Optimizado
├── model/              # Modelos de datos
├── repository/         # Repositorios (patrón Repository)
│   ├── AuthRepository.java     ✅ Configurado
│   └── ClientRepository.java   ✅ Ejemplo creado
├── utils/              # Utilidades
│   ├── Constants.java          ✅ Actualizado
│   ├── Configuration.java      ✅ Nuevo
│   └── NetworkUtils.java       ✅ Nuevo
├── viewmodel/          # ViewModels (MVVM)
│   └── ClientViewModel.java    ✅ Ejemplo creado
└── ui/                 # Interfaz de usuario
```

## 🔧 Configuraciones Principales

### 1. **Configuration.java** - Manejo de Ambientes
```java
// Cambiar fácilmente entre ambientes
private static final Environment CURRENT_ENVIRONMENT = Environment.DEVELOPMENT;

// URLs automáticas:
// DEVELOPMENT: http://localhost:3000/api/
// STAGING: https://staging.chancafe.com/api/
// PRODUCTION: https://api.chancafe.com/api/
```

### 2. **ApiClient.java** - Cliente HTTP Optimizado
- ✅ JWT Authentication automática
- ✅ Interceptors para logging (solo en desarrollo)
- ✅ Timeouts configurables por ambiente
- ✅ Manejo automático de headers Authorization

### 3. **NetworkUtils.java** - Utilidades de Red
- ✅ Callback genérico para simplificar llamadas API
- ✅ Manejo automático de errores HTTP
- ✅ Verificación de conectividad

## 📝 Cómo Usar la API

### Paso 1: Crear Repository
```java
public class ProductRepository {
    private static ProductRepository instance;
    private ApiService apiService;

    private ProductRepository() {
        apiService = ApiClient.getApiService();
    }

    public static synchronized ProductRepository getInstance() {
        if (instance == null) {
            instance = new ProductRepository();
        }
        return instance;
    }

    public MutableLiveData<ApiResponse<List<Product>>> getProducts() {
        MutableLiveData<ApiResponse<List<Product>>> result = new MutableLiveData<>();

        NetworkUtils.executeCall(
            apiService.getProducts(),
            new NetworkUtils.ApiCallback<List<Product>>() {
                @Override
                public void onSuccess(List<Product> data) {
                    // Manejo del éxito
                }

                @Override
                public void onError(String message, int errorCode) {
                    // Manejo del error
                }
            }
        );

        return result;
    }
}
```

### Paso 2: Usar en ViewModel
```java
public class ProductViewModel extends AndroidViewModel {
    private ProductRepository repository;

    public ProductViewModel(@NonNull Application application) {
        super(application);
        repository = ProductRepository.getInstance();
    }

    public LiveData<ApiResponse<List<Product>>> getProducts() {
        // Verificar conexión
        if (!NetworkUtils.isNetworkAvailable(getApplication())) {
            // Manejar sin conexión
            return createErrorResponse("No hay conexión a internet");
        }

        return repository.getProducts();
    }
}
```

### Paso 3: Usar en Activity/Fragment
```java
public class ProductActivity extends AppCompatActivity {
    private ProductViewModel viewModel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_product);

        viewModel = new ViewModelProvider(this).get(ProductViewModel.class);

        // Observar datos
        viewModel.getProducts().observe(this, response -> {
            if (response.isSuccess()) {
                // Mostrar productos
                updateUI(response.getData());
            } else {
                // Mostrar error
                showError(response.getMessage());
            }
        });
    }
}
```

## 🔐 Autenticación JWT

El sistema maneja automáticamente los tokens JWT:

```java
// Login
AuthRepository.getInstance().login(loginRequest).observe(this, response -> {
    if (response.isSuccess()) {
        // Token guardado automáticamente
        String token = response.getData().getToken();
        // Navegar a Dashboard
    }
});

// Las siguientes llamadas incluyen automáticamente el token
// No necesitas agregarlo manualmente
clientRepository.getClients(); // Token incluido automáticamente
```

## 🌐 Endpoints Disponibles

### Authentication
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrarse
- `POST /auth/logout` - Cerrar sesión
- `GET /auth/profile` - Obtener perfil

### Clients
- `GET /clients` - Listar clientes
- `POST /clients` - Crear cliente
- `GET /clients/{id}` - Obtener cliente
- `PUT /clients/{id}` - Actualizar cliente
- `DELETE /clients/{id}` - Eliminar cliente

### Quotes
- `GET /quotes` - Listar cotizaciones
- `POST /quotes` - Crear cotización
- `GET /quotes/{id}` - Obtener cotización
- `PUT /quotes/{id}` - Actualizar cotización

### Products, Categories, Suppliers
- Similar estructura CRUD para cada entidad

## 🚀 Para Empezar a Desarrollar

1. **Asegúrate de que tu API esté corriendo:**
   ```bash
   # Tu API debe estar en http://localhost:3000/api
   ```

2. **Para usar en emulador Android:**
   - El emulador puede acceder a `localhost` directamente
   - Si usas dispositivo físico, cambia `localhost` por la IP de tu PC

3. **Para cambiar a producción:**
   ```java
   // En Configuration.java, cambiar:
   private static final Environment CURRENT_ENVIRONMENT = Environment.PRODUCTION;
   ```

## 🔍 Debugging

### Ver logs de red (solo en desarrollo):
```
# En Logcat, filtrar por "ApiClient" o "NetworkUtils"
D/OkHttp: --> POST http://localhost:3000/api/auth/login
D/OkHttp: Content-Type: application/json; charset=utf-8
D/OkHttp: {"username":"test","password":"123456"}
```

### Verificar conectividad:
```java
if (NetworkUtils.isNetworkAvailable(context)) {
    // Hacer llamada API
} else {
    // Mostrar mensaje de no conexión
}
```

## 🎯 Próximos Pasos

1. **Implementar más repositorios** siguiendo el ejemplo de `ClientRepository`
2. **Crear ViewModels** para cada pantalla
3. **Configurar base de datos local** (Room) para cache offline
4. **Implementar push notifications** si es necesario
5. **Agregar tests unitarios** para repositorios y ViewModels

## 📞 Soporte

Si encuentras algún problema:
1. Verifica que tu API esté corriendo en `http://localhost:3000/api`
2. Revisa los logs en Logcat
3. Asegúrate de que el dispositivo/emulador tenga conexión a internet
4. Verifica que el token JWT esté siendo incluido en las requests

---
✅ **¡Tu aplicación Android está lista para comunicarse con tu API!** 🎉
