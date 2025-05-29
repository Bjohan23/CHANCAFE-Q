# Configuración de Desarrollo - CHANCAFE Q

## 🔧 Configuración Local

### Credenciales de Prueba
```
Usuario: admin
Contraseña: 123456
```

### URLs de API (Placeholder)
```
BASE_URL=https://api.chancafe.com/
API_VERSION=v1
TIMEOUT=30s
```

### Base de Datos Local
```
DB_NAME=chancafe_q_database
DB_VERSION=1
```

## 🚀 Scripts de Desarrollo

### Limpiar y Compilar
```bash
./gradlew clean build
```

### Ejecutar Tests
```bash
./gradlew test
```

### Generar APK Debug
```bash
./gradlew assembleDebug
```

### Generar APK Release
```bash
./gradlew assembleRelease
```

## 📱 Dispositivos de Prueba Recomendados

### Mínimo
- Android 7.0 (API 25)
- RAM: 2GB
- Almacenamiento: 32GB

### Recomendado
- Android 12+ (API 31+)
- RAM: 4GB+
- Almacenamiento: 64GB+

## 🔐 Variables de Entorno

Crear archivo `app/src/main/assets/config.properties`:
```properties
# Desarrollo
debug.enabled=true
logging.level=verbose

# Producción
debug.enabled=false
logging.level=error
```

## 📋 Checklist Pre-Deploy

- [ ] Credenciales reales configuradas
- [ ] URLs de API actualizadas
- [ ] Certificados de seguridad instalados
- [ ] Base de datos Room implementada
- [ ] Cliente Retrofit configurado
- [ ] Tests unitarios ejecutados
- [ ] APK firmado generado