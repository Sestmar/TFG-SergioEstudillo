# Football Club Management System

Una aplicación completa de gestión de clubes de fútbol desarrollada con Ionic 7 y Angular 17, diseñada para ofrecer una experiencia inmersiva y profesional para jugadores, entrenadores, administradores y aficionados.

## 🏆 Características Principales

### 🎨 Diseño Inmersivo y Futbolero
- **Tema deportivo profesional** con elementos visuales futboleros
- **Animaciones de partículas** con balones de fútbol en el login
- **Diseño responsivo** optimizado para móviles y tablets
- **Paleta de colores** inspirada en equipos de fútbol profesionales

### 🔐 Sistema de Autenticación Avanzado
- **JWT Authentication** con refresco automático de tokens
- **Gestión multi-rol** (Admin, Entrenador, Jugador, Usuario)
- **Seguridad enterprise-grade** con guards e interceptores
- **Recordatorio de credenciales** y recuperación de contraseña

### 🎯 Vistas Diferenciadas por Rol

#### Panel de Administrador
- **Dashboard completo** con estadísticas del sistema
- **Gestión de usuarios** y equipos
- **Monitoreo del sistema** en tiempo real
- **Generación de reportes** y respaldos
- **Control total** sobre todos los módulos

#### Panel de Entrenador
- **Gestión de equipos** asignados
- **Control de jugadores** y convocatorias
- **Seguimiento de incidentes** y solicitudes
- **Herramientas de análisis** y estadísticas
- **Comunicación** con jugadores y staff

#### Panel de Jugador
- **Estadísticas personales** y rendimiento
- **Gestión de convocatorias** y disponibilidad
- **Comunicación con el equipo** técnico
- **Seguimiento de partidos** y entrenamientos
- **Perfil personal** y configuración

#### Panel de Usuario/Aficionado
- **Seguimiento de equipos** favoritos
- **Tabla de posiciones** y próximos partidos
- **Noticias del club** y actualizaciones
- **Estadísticas de equipos** y jugadores
- **Experiencia personalizada** según preferencias

### 📱 Arquitectura y Tecnología

#### Frontend
- **Ionic 7** con Angular 17
- **TypeScript** con modo estricto
- **RxJS** para programación reactiva
- **SCSS** con variables CSS personalizadas

#### Backend Integration
- **Spring Boot REST API** (integración completa)
- **JWT Authentication** con refresco automático
- **Manejo de errores** y notificaciones
- **Optimización de rendimiento** con lazy loading

#### Estado y Gestión
- **BehaviorSubject** para estado centralizado
- **Servicios modulares** para cada dominio
- **Interceptores HTTP** para autenticación
- **Guards de rutas** para seguridad

## 🚀 Instalación y Configuración

### Requisitos Previos
- Node.js 18+
- Ionic CLI 7+
- Angular CLI 17+

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone [url-del-repositorio]
   cd football-club-management
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar el entorno**
   - Copiar `src/environments/environment.example.ts`
   - Renombrar a `environment.ts`
   - Configurar las URLs de la API

4. **Ejecutar la aplicación**
   ```bash
   ionic serve
   ```

### Configuración de Producción

1. **Build de producción**
   ```bash
   ionic build --prod
   ```

2. **Configurar variables de entorno**
   - Actualizar `environment.prod.ts`
   - Configurar URL de API de producción

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── core/
│   │   ├── guards/          # Guards de autenticación y roles
│   │   ├── interceptors/    # Interceptores HTTP
│   │   ├── services/        # Servicios de negocio
│   │   └── utils/           # Utilidades y helpers
│   ├── modules/
│   │   ├── admin/           # Módulo de administración
│   │   ├── auth/            # Módulo de autenticación
│   │   ├── coach/           # Módulo de entrenadores
│   │   ├── players/         # Módulo de jugadores
│   │   ├── user/            # Módulo de usuarios/aficionados
│   │   └── ...              # Otros módulos
│   └── shared/
│       ├── models/          # Modelos de datos
│       └── components/      # Componentes compartidos
├── assets/                  # Recursos estáticos
└── environments/            # Configuraciones de entorno
```

## 🔧 Módulos y Funcionalidades

### Módulo de Autenticación (`auth/`)
- **Login temático** con animaciones futboleras
- **Registro de usuarios** con validación
- **Recuperación de contraseña**
- **Gestión de sesiones** y tokens

### Módulo de Administración (`admin/`)
- **Dashboard estadístico** completo
- **Gestión de usuarios** (CRUD)
- **Gestión de equipos** y jugadores
- **Monitoreo del sistema**
- **Generación de reportes**

### Módulo de Entrenadores (`coach/`)
- **Panel de control** personalizado
- **Gestión de equipos** asignados
- **Control de convocatorias**
- **Seguimiento de jugadores**
- **Gestión de incidentes**

### Módulo de Jugadores (`players/`)
- **Dashboard personal** con estadísticas
- **Gestión de disponibilidad**
- **Seguimiento de convocatorias**
- **Comunicación con el equipo**
- **Perfil y configuración**

### Módulo de Usuarios (`user/`)
- **Seguimiento de equipos** favoritos
- **Tabla de posiciones** en tiempo real
- **Próximos partidos** y resultados
- **Noticias y actualizaciones**
- **Estadísticas de equipos**

## 🎨 Características de Diseño

### Temática Futbolera
- **Paleta de colores** inspirada en equipos profesionales
- **Iconografía deportiva** personalizada
- **Animaciones fluidas** y transiciones suaves
- **Elementos visuales** relacionados con el fútbol

### Experiencia de Usuario
- **Navegación intuitiva** por roles
- **Carga optimizada** con lazy loading
- **Feedback visual** inmediato
- **Diseño accesible** y responsive

### Componentes Visuales
- **Partículas animadas** de balones de fútbol
- **Gráficos interactivos** con Chart.js
- **Tarjetas personalizadas** para cada tipo de contenido
- **Modales y popups** con diseño consistente

## 🔒 Seguridad y Rendimiento

### Seguridad
- **Autenticación JWT** con expiración
- **Refresco automático** de tokens
- **Validación de roles** en rutas
- **Protección contra** accesos no autorizados
- **Encriptación de** datos sensibles

### Rendimiento
- **Lazy loading** de módulos
- **Optimización de** imágenes y recursos
- **Caché de** datos frecuentes
- **Compresión de** assets estáticos
- **Minificación de** código en producción

## 📊 Análisis y Estadísticas

### Para Administradores
- **Estadísticas del sistema** en tiempo real
- **Crecimiento de usuarios** y actividad
- **Rendimiento del sistema** y recursos
- **Reportes personalizados** y exportables

### Para Entrenadores
- **Estadísticas de equipos** y jugadores
- **Rendimiento en partidos** y entrenamientos
- **Análisis de convocatorias** y disponibilidad
- **Seguimiento de** incidentes y sanciones

### Para Jugadores
- **Estadísticas personales** y rendimiento
- **Historial de convocatorias** y partidos
- **Progreso y** métricas de rendimiento
- **Comparación con** otros jugadores

### Para Usuarios
- **Tabla de posiciones** actualizada
- **Estadísticas de equipos** y jugadores
- **Resultados y** próximos partidos
- **Noticias y** actualizaciones del club

## 🚀 Despliegue

### Opciones de Despliegue
- **Servidores tradicionales** (Apache, Nginx)
- **Servicios en la nube** (AWS, Azure, Google Cloud)
- **Plataformas estáticas** (Netlify, Vercel)
- **Contenedores Docker** para escalabilidad

### Configuración de Producción
1. **Variables de entorno** para configuración
2. **Optimización de** assets y recursos
3. **Configuración de** HTTPS y seguridad
4. **Monitoreo y** logging de errores
5. **Backup y** recuperación de datos

## 🤝 Contribuciones

### Cómo Contribuir
1. **Fork del proyecto**
2. **Crear una rama** para tu feature
3. **Desarrollar y** testear los cambios
4. **Crear un Pull Request** con descripción detallada

### Guías de Desarrollo
- **Código limpio** y bien documentado
- **Tests unitarios** para nuevas funcionalidades
- **Commits descriptivos** y organizados
- **Respetar el** estilo de código existente

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Equipo de Desarrollo

- **Arquitecto Frontend** - Diseño y estructura
- **Desarrolladores** - Implementación y mantenimiento
- **Diseñadores UX/UI** - Experiencia y visualización
- **QA Engineers** - Testing y calidad

## 📞 Soporte

Para soporte técnico o preguntas:
- **Email:** support@footballclub.com
- **Documentación:** [docs.footballclub.com](https://docs.footballclub.com)
- **Issues:** [GitHub Issues](https://github.com/footballclub/management/issues)

---

**⚽ ¡Vive la pasión del fútbol con tecnología de vanguardia! 🏆**