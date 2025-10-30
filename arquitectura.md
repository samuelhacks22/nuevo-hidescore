# HideScore v3.1

## Descripción General
HideScore es una plataforma web para descubrir, calificar y comentar películas y series. Los usuarios pueden explorar contenido, dejar reseñas con calificaciones de estrellas, y gestionar sus perfiles.

## Estructura del Proyecto

### Tecnologías Principales
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Base de Datos**: PostgreSQL (Neon) con Drizzle ORM
- **Autenticación**: Firebase Authentication
- **UI**: Tailwind CSS + shadcn/ui components
- **Enrutamiento**: Wouter

### Arquitectura
El proyecto es una aplicación full-stack TypeScript con:
- **Cliente**: `client/` - Aplicación React con Vite
- **Servidor**: `server/` - API Express.js que sirve tanto el backend como el frontend
- **Compartido**: `shared/` - Schemas y tipos compartidos entre cliente y servidor

## Configuración del Entorno

### Variables de Entorno Requeridas
- `DATABASE_URL`: Cadena de conexión a PostgreSQL (configurada)
- `VITE_FIREBASE_API_KEY`: Clave API de Firebase (configurada)
- `VITE_FIREBASE_PROJECT_ID`: ID del proyecto Firebase (configurada)
- `VITE_FIREBASE_APP_ID`: ID de la aplicación Firebase (configurada)

### Scripts Disponibles
```bash
npm run dev      # Inicia el servidor de desarrollo
npm run build    # Construye para producción
npm run start    # Inicia el servidor de producción
npm run db:push  # Sincroniza el schema con la base de datos
```

## Estructura de la Base de Datos

### Tablas Principales
1. **users**: Usuarios registrados (integrados con Firebase)
2. **movies**: Catálogo de películas
3. **series**: Catálogo de series
4. **ratings**: Calificaciones de usuarios (para películas y series)
5. **comments**: Comentarios de usuarios (para películas y series)

## Funcionalidades Principales
- ✅ Autenticación con Google (Firebase)
- ✅ Exploración de películas y series
- ✅ Sistema de calificaciones (0-5 estrellas)
- ✅ Comentarios y reseñas
- ✅ Panel de administrador
- ✅ Perfiles de usuario
- ✅ Búsqueda de contenido
- ✅ Diseño responsive

## Estado Actual del Proyecto
- Base de datos PostgreSQL configurada y sincronizada
- Firebase Authentication configurado
- Servidor de desarrollo funcionando en puerto 5000
- Frontend y backend integrados
- Datos de muestra sembrados en la base de datos

## Cambios Recientes (Octubre 25, 2025)
1. Configuración inicial del proyecto en Replit
2. Instalación de dependencias de Node.js
3. Creación de base de datos PostgreSQL y sincronización de schema
4. Configuración de Vite para compatibilidad con proxy de Replit
5. Corrección de errores de enlaces anidados en el componente Navbar
6. Solución de problemas con DATABASE_URL (limpieza de comillas y caracteres escapados)
7. Movimiento de ContentCard.tsx a la carpeta ui/

## Notas Técnicas Importantes

### Problema Resuelto: DATABASE_URL
El proyecto incluye una función de limpieza en `server/db.ts` y `drizzle.config.ts` que elimina comillas y caracteres HTML escapados de la variable DATABASE_URL. Esto fue necesario porque Replit Secrets a veces agrega formato adicional.

### Configuración de Vite
El archivo `vite.config.ts` está configurado para:
- Servir en `0.0.0.0:5173` (compatible con Replit)
- HMR configurado para puerto 443 (proxy de Replit)
- Aliases de importación: `@` para src, `@shared` para shared, `@assets` para attached_assets

## Próximos Pasos Sugeridos
- Configurar deployment para producción
- Agregar más contenido de muestra
- Implementar búsqueda avanzada
- Mejorar sistema de recomendaciones
- Agregar soporte para múltiples idiomas
