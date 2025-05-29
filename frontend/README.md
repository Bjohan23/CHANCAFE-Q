# CHANCAFE Q - Aplicación Móvil para Asesores de Ventas

## 📱 Descripción del Proyecto

**CHANCAFE Q** es una aplicación móvil Android desarrollada en Java siguiendo la arquitectura MVVM, diseñada específicamente para asesores de ventas en el sector retail. La aplicación facilita la gestión de cotizaciones, clientes, productos y solicitudes de crédito de manera eficiente y profesional.

## 🚀 Características Principales

### ✅ **Funcionalidades Implementadas**
- **Sistema de Autenticación**: Login seguro con validación de credenciales
- **Dashboard Principal**: Panel intuitivo con acceso rápido a todas las funciones
- **Arquitectura MVVM**: Código limpio, mantenible y escalable
- **UI/UX Profesional**: Interfaz basada en Material Design con colores corporativos
- **Navegación Intuitiva**: Navegación inferior y cards interactivas

### 🔄 **Funcionalidades Preparadas para Futuro Desarrollo**
- **Nueva Cotización**: Crear cotizaciones personalizadas
- **Gestión de Cotizaciones**: Ver y administrar cotizaciones existentes
- **Administración de Clientes**: Base de datos de clientes
- **Catálogo de Productos**: Gestión de inventario y precios
- **Solicitudes de Crédito**: Procesar y seguir solicitudes
- **Agenda**: Programación de citas y seguimientos
- **Perfil de Usuario**: Gestión de información personal

## 🏗️ Arquitectura del Proyecto

### **Patrón MVVM (Model-View-ViewModel)**
```
📁 chancafe_q/
├── 📁 model/           # Modelos de datos
├── 📁 view/            # Activities y Layouts
├── 📁 viewmodel/       # Lógica de presentación
├── 📁 repository/      # Lógica de datos
├── 📁 data/
│   ├── 📁 local/       # Base de datos local (Room - futuro)
│   └── 📁 remote/      # API REST (Retrofit - futuro)
└── 📁 utils/          # Utilidades y constantes
```

### **Estructura de Paquetes**
```
com.example.chancafe_q/
├── ui/
│   ├── login/          # Pantalla de Login
│   └── dashboard/      # Pantalla Principal
├── viewmodel/          # ViewModels
├── model/              # Modelos de datos
├── repository/         # Repositorios
├── data/
│   ├── local/          # Preparado para Room
│   └── remote/         # Preparado para Retrofit
└── utils/              # Utilidades generales
```

## 🛠️ Tecnologías Utilizadas

### **Core**
- **Lenguaje**: Java
- **Platform**: Android (minSdk 25, targetSdk 35)
- **Build System**: Gradle con Kotlin DSL

### **Arquitectura y UI**
- **Patrón**: MVVM (Model-View-ViewModel)
- **UI Framework**: Material Design Components
- **View Binding**: Habilitado para vinculación de vistas
- **Lifecycle Components**: ViewModel, LiveData

### **Dependencias Principales**
```gradle
// Core Android
implementation 'androidx.appcompat:appcompat:1.7.0'
implementation 'com.google.android.material:material:1.12.0'
implementation 'androidx.constraintlayout:constraintlayout:2.2.1'

// Lifecycle (MVVM)
implementation 'androidx.lifecycle:lifecycle-viewmodel:2.8.3'
implementation 'androidx.lifecycle:lifecycle-livedata-ktx:2.8.3'
implementation 'androidx.lifecycle:lifecycle-runtime-ktx:2.8.3'

// Navigation
implementation 'androidx.navigation:navigation-fragment:2.7.7'
implementation 'androidx.navigation:navigation-ui:2.7.7'
```

### **Futuras Integraciones (Preparadas)**
```gradle
// Base de datos local
implementation 'androidx.room:room-runtime:2.6.1'
annotationProcessor 'androidx.room:room-compiler:2.6.1'

// Cliente HTTP
implementation 'com.squareup.retrofit2:retrofit:2.11.0'
implementation 'com.squareup.retrofit2:converter-gson:2.11.0'
implementation 'com.squareup.okhttp3:okhttp:4.12.0'
implementation 'com.squareup.okhttp3:logging-interceptor:4.12.0'
```

## 📋 Credenciales de Prueba

Para probar la aplicación, utiliza las siguientes credenciales:

```
Usuario: admin
Contraseña: 123456
```

> **Nota**: Estas son credenciales mock para pruebas. En producción se conectará con el sistema de autenticación real.

## 🎨 Diseño y UI

### **Paleta de Colores**
- **Rojo Principal**: `#E21E25` (Chancafe Red)
- **Amarillo Secundario**: `#FFC107` (Chancafe Yellow)
- **Rojo Oscuro**: `#B71C1C` (Para sombras y acentos)
- **Grises**: `#F5F5F5`, `#9E9E9E`, `#424242`

### **Tipografía**
- **Títulos**: Bold, 18-24sp
- **Subtítulos**: Medium, 14-16sp
- **Cuerpo**: Regular, 12-14sp

### **Componentes UI**
- **Botones**: Esquinas redondeadas (8dp)
- **Cards**: Elevación 4dp, esquinas 12dp
- **Inputs**: Bordes 1dp, esquinas 4dp

## 🚀 Instalación y Configuración

### **Prerrequisitos**
- Android Studio 2024.2.1 o superior
- JDK 11 o superior
- Android SDK 35
- Dispositivo Android con API level 25+ (Android 7.0) o emulador

### **Pasos de Instalación**

1. **Clonar el repositorio**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd CHANCAFEQ
   ```

2. **Abrir en Android Studio**
   - Abre Android Studio
   - Selecciona "Open an Existing Project"
   - Navega a la carpeta del proyecto y selecciónala

3. **Sincronizar dependencias**
   ```bash
   ./gradlew build
   ```

4. **Ejecutar la aplicación**
   - Conecta un dispositivo Android o inicia un emulador
   - Click en "Run" o presiona `Shift + F10`

## 📱 Uso de la Aplicación

### **1. Pantalla de Login**
- Ingresa tu código de asesor
- Introduce tu contraseña
- Presiona "Ingresar"
- Para pruebas usa: `admin` / `123456`

### **2. Dashboard Principal**
- **Nueva Cotización**: Acceso rápido para crear cotizaciones (destacado en amarillo)
- **Mis Cotizaciones**: Ver cotizaciones existentes
- **Clientes**: Gestionar base de datos de clientes
- **Productos**: Consultar catálogo de productos
- **Solicitudes de Crédito**: Procesar solicitudes

### **3. Navegación Inferior**
- **Inicio**: Regresa al dashboard principal
- **Agenda**: Acceso a calendario y citas
- **Perfil**: Gestión de perfil personal

## 🔮 Roadmap de Desarrollo

### **Fase 1 - Completada ✅**
- [x] Estructura base MVVM
- [x] Sistema de autenticación mock
- [x] UI/UX principal
- [x] Navegación básica

### **Fase 2 - En Planificación**
- [ ] Integración con Room Database
- [ ] Implementación de Retrofit para API
- [ ] Módulo de Nueva Cotización
- [ ] Gestión de Clientes

### **Fase 3 - Futuro**
- [ ] Catálogo de Productos
- [ ] Solicitudes de Crédito
- [ ] Sistema de Agenda
- [ ] Sincronización offline

## 🔧 Configuración para Desarrollo

### **Variables de Entorno**
Crear archivo `local.properties` con:
```properties
sdk.dir=C:\\Users\\[USERNAME]\\AppData\\Local\\Android\\Sdk
api.base.url=https://api.chancafe.com/
api.timeout=30
```

### **Configuración API (Futuro)**
En `Constants.java`:
```java
public static final String BASE_URL = "https://api.chancafe.com/";
public static final int TIMEOUT_SECONDS = 30;
```

## 🤝 Contribución

### **Estándares de Código**
- Seguir convenciones de nomenclatura Java
- Documentar métodos públicos con JavaDoc
- Mantener arquitectura MVVM
- Usar View Binding para vinculaciones
- Implementar manejo de errores apropiado

### **Git Workflow**
```bash
# Crear nueva feature
git checkout -b feature/nueva-funcionalidad

# Commitear cambios
git add .
git commit -m "feat: agregar nueva funcionalidad"

# Push y crear PR
git push origin feature/nueva-funcionalidad
```

## 📞 Soporte y Contacto

Para soporte técnico o consultas sobre el proyecto:

- **Desarrollador**: [Tu Nombre]
- **Email**: [tu.email@chancafe.com]
- **Documentación**: Ver carpeta `/docs` del proyecto

## 📄 Licencia

Este proyecto es propiedad de CHANCAFE y está destinado únicamente para uso interno. Todos los derechos reservados.

---

**Desarrollado con ❤️ para CHANCAFE**
*Versión 1.0.0 - Enero 2025*