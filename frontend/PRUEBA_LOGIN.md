# 🚀 Guía de Prueba - Login ChancafeQ

## ✅ Configuración Lista

Tu aplicación Android está ahora completamente configurada para realizar login con tu API. Todo está listo para probarse.

## 🔧 Configuraciones Realizadas

### ✅ Modelos de Datos
- `LoginRequest.java` - Modelo para enviar credenciales
- `LoginResponse.java` - Modelo para recibir respuesta con usuario y token
- `User.java` - Modelo de usuario (ya existía)
- `ApiResponse.java` - Wrapper genérico para respuestas API

### ✅ Configuración de Red
- `ApiClient.java` - Cliente HTTP con JWT automático
- `ApiService.java` - Interfaces de endpoints
- `Configuration.java` - Manejo de ambientes (dev/prod)
- `NetworkUtils.java` - Utilidades para llamadas API
- JWT Authentication automática en headers

### ✅ Arquitectura MVVM
- `AuthRepository.java` - Lógica de autenticación
- `LoginViewModel.java` - ViewModel con validaciones
- `LoginActivity.java` - Activity con observadores LiveData

### ✅ UI y Resources
- `activity_login.xml` - Layout del login
- `strings.xml` - Textos en español
- `colors.xml` - Colores de Chancafe
- `bg_edittext.xml` - Background de campos
- `bg_button_primary.xml` - Background de botón
- `logo_chancafe.xml` - Logo vectorial simple

### ✅ Configuración de Seguridad
- `AndroidManifest.xml` - Permisos de internet
- `network_security_config.xml` - Permite HTTP en desarrollo
- `usesCleartextTraffic="true"` - Para conexiones localhost

## 🧪 Cómo Probar el Login

### 1. **Asegurar que tu API esté corriendo:**
```bash
# Tu API debe estar disponible en:
http://localhost:3000/api/auth/login
```

### 2. **Compilar la aplicación:**
```bash
# En Android Studio:
Build > Make Project (Ctrl+F9)
# O desde terminal:
./gradlew assembleDebug
```

### 3. **Ejecutar en emulador/dispositivo:**
```bash
# En Android Studio:
Run > Run 'app' (Shift+F10)
```

### 4. **Datos de prueba para login:**
- **Usuario:** `test` (o el código que tengas en tu BD)
- **Contraseña:** `123456` (o la que tengas configurada)

## 🔍 Debug y Troubleshooting

### **Ver logs de red:**
```bash
# En Logcat, filtrar por:
- Tag: "ApiClient" - para ver configuración HTTP
- Tag: "NetworkUtils" - para ver llamadas API
- Tag: "OkHttp" - para ver requests/responses HTTP
```

### **Logs esperados en login exitoso:**
```
D/ApiClient: API POST: http://localhost:3000/api/auth/login
D/OkHttp: --> POST http://localhost:3000/api/auth/login
D/OkHttp: Content-Type: application/json; charset=utf-8
D/OkHttp: {"userCode":"test","password":"123456"}
D/OkHttp: <-- 200 OK http://localhost:3000/api/auth/login
D/OkHttp: {"success":true,"message":"Login exitoso","data":{"user":{...},"token":"..."}}
```

### **Errores comunes y soluciones:**

#### ❌ "Error de conexión"
```bash
# Verificar que la API esté corriendo:
curl http://localhost:3000/api/auth/login

# Para dispositivo físico, usar IP de tu PC:
# En Configuration.java cambiar:
private static final String DEV_BASE_URL = "http://192.168.1.XXX:3000/api/";
```

#### ❌ "java.net.ConnectException"
```bash
# Para emulador, usar:
private static final String DEV_BASE_URL = "http://10.0.2.2:3000/api/";
```

#### ❌ "Cleartext HTTP traffic not permitted"
```bash
# Ya está configurado en network_security_config.xml
# Verificar que AndroidManifest.xml tenga:
android:usesCleartextTraffic="true"
```

## 📱 Flujo de Login Esperado

1. **Usuario ingresa credenciales** → `LoginActivity`
2. **Validación local** → `LoginViewModel.validateInputs()`
3. **Llamada API** → `AuthRepository.login()`
4. **JWT guardado** → `ApiClient.setAuthToken()`
5. **Navegación** → `DashboardActivity`

## 🎯 Próximos Pasos Después del Login

Una vez que el login funcione:

1. **Implementar Dashboard completo**
2. **Agregar más repositorios** (ClientRepository, QuoteRepository, etc.)
3. **Implementar persistencia local** con SharedPreferences
4. **Agregar refresh token automático**
5. **Crear funcionalidad de logout**

## 🔐 Datos del Usuario Después del Login

El `LoginViewModel` proporciona métodos para acceder a los datos:

```java
// En cualquier Activity después del login:
LoginViewModel loginViewModel = new ViewModelProvider(this).get(LoginViewModel.class);

User user = loginViewModel.getCurrentUser();
String token = loginViewModel.getCurrentToken();
boolean isLoggedIn = loginViewModel.isLoginSuccessful();
```

## 📞 Soporte y Debug

Si hay problemas:

1. **Verifica logs** en Logcat
2. **Testea la API** con Postman/curl
3. **Revisa la conectividad** de red
4. **Confirma la URL** en Configuration.java

---

## 🎉 ¡Tu Login está listo para probarse!

Ejecuta la aplicación, ingresa credenciales válidas y deberías ver:
1. Loading mientras hace la llamada
2. Navegación automática al Dashboard
3. Token JWT guardado para futuras llamadas

---
*Configuración completada por Claude - ChancafeQ Android v1.0*
