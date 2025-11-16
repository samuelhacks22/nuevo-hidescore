# Explicación Detallada de HideScore v3.1

## Resumen General

**HideScore** es una aplicación web full-stack para descubrir, calificar y reseñar películas y series. Los usuarios pueden explorar contenido, dejar calificaciones con estrellas, escribir comentarios y obtener recomendaciones. Los administradores pueden gestionar el catálogo de contenido y usuarios.

---

##  Arquitectura General

### Stack Tecnológico

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Base de Datos**: PostgreSQL (Neon) con Drizzle ORM
- **Estado**: React Query (TanStack Query) para gestión de datos del servidor
- **Routing**: Wouter (router ligero para React)
- **UI**: Radix UI + Tailwind CSS + shadcn/ui components
- **Validación**: Zod para schemas y validación
- **Autenticación**: Sistema simple basado en localStorage + headers HTTP

### Flujo de Datos

```
Usuario (Navegador)
    ↓
Frontend React (Vite)
    ↓ (HTTP requests con x-user-id header)
API Express (server/)
    ↓ (Drizzle ORM)
PostgreSQL (Neon)
```

---

## Estructura del Proyecto

### Carpetas Principales

```
Hidescorev3.1/
├── client/          # Frontend React
│   ├── src/
│   │   ├── pages/       # Páginas principales
│   │   ├── components/  # Componentes reutilizables
│   │   ├── contexts/    # Context API (AuthContext)
│   │   ├── hooks/       # Custom hooks
│   │   └── lib/         # Utilidades (queryClient, apiRequest)
│   └── index.html
│
├── server/          # Backend Express
│   ├── app.ts       # Configuración Express
│   ├── routes.ts    # Definición de endpoints
│   ├── storage.ts   # Lógica de acceso a BD (IStorage)
│   ├── db.ts        # Conexión a PostgreSQL
│   └── index.ts     # Punto de entrada del servidor
│
├── shared/          # Código compartido
│   └── schema.ts    # Definiciones Drizzle + Zod schemas
│
└── scripts/         # Scripts de mantenimiento
```

---

##  Base de Datos

### Tablas Principales

#### 1. **users**
- `id` (UUID, PK)
- `email` (text, único)
- `displayName` (text)
- `passwordHash` (text, bcrypt)
- `rank` (text: "user" | "admin")
- `createdAt` (timestamp)

#### 2. **movies**
- `id` (UUID, PK)
- `title`, `description`, `posterUrl`
- `releaseYear` (integer)
- `genre` (text[]) - Array de géneros
- `platform` (text[]) - Array de plataformas (Netflix, HBO, etc.)
- `platformLinks` (text[]) - URLs paralelas a `platform`
- `director`, `cast` (text[]), `runtime`
- `budget`, `revenue` (decimal)
- `language`, `country`
- `averageRating` (real) - Calculado automáticamente
- `ratingCount` (integer) - Calculado automáticamente
- `createdAt`, `updatedAt`

#### 3. **series**
- Similar a `movies`, pero con:
  - `endYear` (integer, opcional)
  - `creator` (en lugar de director)
  - `seasons`, `episodes` (integer)

#### 4. **ratings**
- `id` (UUID, PK)
- `userId` (FK → users)
- `movieId` (FK → movies, nullable)
- `seriesId` (FK → series, nullable)
- `rating` (real, 0-5)
- `review` (text, opcional)
- `createdAt`, `updatedAt`
- **Constraint**: Solo `movieId` O `seriesId` puede estar presente (no ambos)

#### 5. **comments**
- `id` (UUID, PK)
- `userId` (FK → users)
- `movieId` (FK → movies, nullable)
- `seriesId` (FK → series, nullable)
- `content` (text)
- `createdAt`, `updatedAt`
- **Constraint**: Solo `movieId` O `seriesId` puede estar presente

### Relaciones

- Un usuario puede tener muchas calificaciones y comentarios
- Una película/serie puede tener muchas calificaciones y comentarios
- Las calificaciones y comentarios pertenecen a un usuario y a un contenido

---

## Autenticación y Autorización

### Sistema Actual (Simple)

1. **Registro/Login**:
   - El usuario se registra con email, nombre y contraseña
   - La contraseña se hashea con bcrypt antes de guardarse
   - Al hacer login, el servidor devuelve el objeto `user` (sin `passwordHash`)

2. **Almacenamiento en Cliente**:
   - El objeto `user` se guarda en `localStorage` mediante `AuthContext`
   - Se persiste entre sesiones del navegador

3. **Identificación en Requests**:
   - `apiRequest()` (en `queryClient.ts`) lee `localStorage` y añade el header `x-user-id` a todas las peticiones HTTP
   - El servidor usa este header para identificar al usuario

4. **Autorización**:
   - **Rutas públicas**: Cualquiera puede ver películas/series, calificaciones, comentarios
   - **Rutas autenticadas**: Requieren `x-user-id` válido
     - Crear/editar/eliminar calificaciones y comentarios (solo el propietario)
   - **Rutas admin**: Requieren `x-user-id` + `rank === "admin"`
     - Gestión de contenido (CRUD de películas/series)
     - Gestión de usuarios

### Limitaciones del Sistema Actual

- No usa JWT ni cookies HttpOnly (menos seguro)
- El `x-user-id` puede ser manipulado (aunque el servidor valida)
- No hay expiración de sesión
- **Recomendación futura**: Migrar a JWT o cookies HttpOnly con sesiones

---

##  Flujos de Datos Principales

### 1. Flujo de Calificación

```
Usuario selecciona estrellas en ContentDetailPage
    ↓
handleSubmitRating() llama a ratingMutation
    ↓
apiRequest("POST", "/api/ratings", { userId, movieId, rating, review })
    ↓ (con header x-user-id)
server/routes.ts: POST /api/ratings
    ↓
Valida con insertRatingSchema (Zod)
    ↓
storage.createRating()
    ↓
db.insert(ratings) + actualiza averageRating/ratingCount del contenido
    ↓
React Query invalida queries relacionadas
    ↓
UI se actualiza automáticamente
```

### 2. Flujo de Comentario

Similar al de calificación, pero:
- Endpoint: `POST /api/comments`
- No actualiza promedios, solo inserta el comentario
- Los comentarios se muestran ordenados por fecha (más recientes primero)

### 3. Flujo de Edición/Eliminación

Para editar o eliminar una calificación/comentario:

```
Usuario hace clic en "Editar" o "Eliminar"
    ↓
PUT /api/ratings/:id o DELETE /api/ratings/:id
    ↓
Servidor verifica: existing.userId === userId del header
    ↓
Si coincide: permite la operación
Si no: 403 Forbidden
```

### 4. Flujo de Búsqueda y Filtrado

```
Usuario navega a /movies o /series
    ↓
MoviesPage/SeriesPage hace useQuery con queryKey: ["/api/movies", { genre, platform, ... }]
    ↓
GET /api/movies?genre=Action&platform=Netflix&sortBy=rating
    ↓
storage.getAllMovies(filters)
    ↓
Drizzle construye query con condiciones WHERE y ORDER BY
    ↓
Devuelve array filtrado y ordenado
    ↓
React Query cachea el resultado
    ↓
UI muestra grid de ContentCard
```

---

##  Páginas Principales

### 1. **HomePage** (`/`)
- Hero section con call-to-action
- Sección "Películas en Tendencia" (top 12 por popularidad)
- Sección "Series en Tendencia"
- Sección "Recomendado para Ti" (endpoint `/api/recommendations`)

### 2. **MoviesPage** (`/movies`)
- Grid de todas las películas
- Filtros: género, plataforma, año, calificación
- Ordenamiento: rating, año, reciente, popularidad

### 3. **SeriesPage** (`/series`)
- Similar a MoviesPage pero para series

### 4. **ContentDetailPage** (`/movie/:id` o `/series/:id`)
- **Información principal**: Título, descripción, año, géneros, plataformas
- **Poster**: Imagen o placeholder
- **Calificación promedio**: Estrellas + contador
- **Enlaces a plataformas**: Botones "Ver en Netflix", etc. (usa `platformLinks`)
- **Sección de calificación**: Si el usuario está logueado, puede calificar
- **Sección de comentarios**: Lista de comentarios + formulario para nuevo comentario
- **Contenido similar**: Películas/series del mismo género

### 5. **SearchPage** (`/search`)
- Búsqueda por texto en títulos y descripciones
- Resultados combinados (películas + series)

### 6. **DiscoverPage** (`/discover`)
- Exploración avanzada con múltiples filtros

### 7. **AdminPage** (`/admin`)
- **Solo accesible para admins**
- Estadísticas: totales de películas, series, usuarios, calificaciones
- Tabs para gestionar:
  - Películas (crear, editar, eliminar)
  - Series (crear, editar, eliminar)
  - Usuarios (crear, editar, eliminar)
- Dialogs modales para formularios de creación/edición

### 8. **LoginPage** (`/login`) y **RegisterPage** (`/register`)
- Formularios de autenticación
- Usan `AuthContext.login()` y `AuthContext.register()`

### 9. **ProfilePage** (`/profile`)
- Perfil del usuario logueado

---

## API Endpoints

### Públicos (sin autenticación)

#### Películas
- `GET /api/movies` - Lista todas (con filtros opcionales)
- `GET /api/movies/trending` - Top 12 por popularidad
- `GET /api/movies/:id` - Detalle de una película
- `GET /api/movies/:id/ratings` - Calificaciones de una película
- `GET /api/movies/:id/comments` - Comentarios de una película
- `GET /api/movies/:id/similar` - Películas similares (por género)

#### Series
- `GET /api/series` - Lista todas (con filtros)
- `GET /api/series/trending` - Top 12
- `GET /api/series/:id` - Detalle
- `GET /api/series/:id/ratings` - Calificaciones
- `GET /api/series/:id/comments` - Comentarios
- `GET /api/series/:id/similar` - Series similares

#### Recomendaciones
- `GET /api/recommendations` - Contenido recomendado (actualmente devuelve trending)

### Autenticados (requieren `x-user-id`)

#### Calificaciones
- `POST /api/ratings` - Crear calificación
  ```json
  {
    "userId": "uuid",
    "movieId": "uuid" | null,
    "seriesId": "uuid" | null,
    "rating": 4.5,
    "review": "Muy buena película" (opcional)
  }
  ```
- `PUT /api/ratings/:id` - Actualizar (solo propietario)
- `DELETE /api/ratings/:id` - Eliminar (solo propietario)

#### Comentarios
- `POST /api/comments` - Crear comentario
  ```json
  {
    "userId": "uuid",
    "movieId": "uuid" | null,
    "seriesId": "uuid" | null,
    "content": "Texto del comentario"
  }
  ```
- `PUT /api/comments/:id` - Actualizar (solo propietario)
- `DELETE /api/comments/:id` - Eliminar (solo propietario)

#### Autenticación
- `POST /api/auth/login`
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- `POST /api/auth/register`
  ```json
  {
    "email": "user@example.com",
    "displayName": "Nombre Usuario",
    "password": "password123",
    "rank": "user" (opcional, default: "user")
  }
  ```

### Admin (requieren `x-user-id` + `rank === "admin"`)

#### Estadísticas
- `GET /api/admin/stats` - Totales de contenido y usuarios

#### Películas
- `GET /api/admin/movies` - Lista todas (para admin)
- `POST /api/admin/movies` - Crear película
- `PUT /api/admin/movies/:id` - Actualizar película
- `DELETE /api/admin/movies/:id` - Eliminar película

#### Series
- `GET /api/admin/series` - Lista todas
- `POST /api/admin/series` - Crear serie
- `PUT /api/admin/series/:id` - Actualizar serie
- `DELETE /api/admin/series/:id` - Eliminar serie

#### Usuarios
- `GET /api/admin/users` - Lista todos los usuarios
- `POST /api/admin/users` - Crear usuario (sin contraseña, se genera)
- `PUT /api/admin/users/:id` - Actualizar usuario
- `DELETE /api/admin/users/:id` - Eliminar usuario

---

##  Componentes Clave

### Frontend

#### `AuthContext` (`contexts/AuthContext.tsx`)
- Maneja el estado del usuario logueado
- Persiste en `localStorage`
- Expone: `user`, `login()`, `register()`, `signOut()`, `isAdmin`

#### `apiRequest()` (`lib/queryClient.ts`)
- Helper para hacer requests HTTP
- Añade automáticamente `x-user-id` desde `localStorage`
- Maneja errores y lanza excepciones si la respuesta no es OK

#### `ContentCard` (`components/ui/ContentCard.tsx`)
- Tarjeta reutilizable para mostrar película/serie
- Muestra poster, título, año, calificación promedio
- Link a la página de detalle

#### `StarRating` (`components/StarRating.tsx`)
- Componente de estrellas interactivo
- Modo visualización o modo edición

#### `Navbar` (`components/Navbar.tsx`)
- Barra de navegación superior
- Links a páginas principales
- Botones de login/logout según estado de autenticación

### Backend

#### `storage.ts` (Implementación de `IStorage`)
- Clase `DatabaseStorage` que implementa todas las operaciones CRUD
- Métodos clave:
  - `createRating()`: Crea rating y actualiza `averageRating`/`ratingCount` del contenido
  - `updateMovieRatings()` / `updateSeriesRatings()`: Recalcula promedios
  - `getAllMovies(filters)`: Construye queries dinámicas con Drizzle según filtros

#### `routes.ts`
- Registra todos los endpoints
- `requireAdmin()`: Middleware helper para verificar permisos de admin
- Validación con Zod antes de procesar requests

---

##  Funcionalidades Especiales

### 1. **Cálculo Automático de Calificaciones**
Cuando se crea/actualiza/elimina una calificación:
1. Se inserta/actualiza/elimina el registro en `ratings`
2. Se recalculan todos los ratings del contenido
3. Se actualiza `averageRating` y `ratingCount` en la tabla `movies` o `series`

### 2. **Enlaces a Plataformas**
- Cada película/serie tiene un array `platform` (ej: ["Netflix", "HBO"])
- Paralelamente, `platformLinks` contiene URLs (ej: ["https://netflix.com/...", "https://hbo.com/..."])
- En `ContentDetailPage`, si existe un link, el botón abre la URL; si no, navega a la página filtrada por plataforma

### 3. **Filtrado Avanzado**
- Los endpoints `/api/movies` y `/api/series` aceptan query params:
  - `genre`, `platform`, `yearFrom`, `yearTo`, `ratingFrom`, `ratingTo`, `sortBy`
- Drizzle construye queries SQL dinámicas con `WHERE` y `ORDER BY`

### 4. **React Query (Caché)**
- Todas las peticiones pasan por React Query
- Los datos se cachean automáticamente
- `invalidateQueries()` refresca datos después de mutaciones
- Configuración: `staleTime: Infinity` (los datos no se consideran obsoletos automáticamente)

---

##  Desarrollo y Despliegue

### Comandos Principales

```bash
# Desarrollo (servidor + cliente con hot reload)
npm run dev

# Build de producción
npm run build

# Aplicar cambios de schema a la BD
npm run db:push

# Verificar tipos TypeScript
npm run check
```

### Variables de Entorno

- `DATABASE_URL`: Connection string de PostgreSQL (Neon)
- `GEMINI_API_KEY` (opcional): Para recomendaciones con IA (actualmente no implementado completamente)

### Despliegue

- **Frontend**: Puede desplegarse en Vercel/Netlify como SPA
- **Backend**: Express puede correr en Vercel (serverless functions), Render, Railway, etc.
- **Base de Datos**: Neon PostgreSQL (serverless Postgres)

---

##  Mejoras Futuras Recomendadas

1. **Autenticación más robusta**: JWT o cookies HttpOnly
2. **Prevención de duplicados**: Un usuario solo puede tener una calificación por contenido (o hacer POST idempotente)
3. **Validación de URLs**: Validar que `platformLinks` sean URLs válidas
4. **Tests**: Suite de tests para endpoints críticos
5. **Recomendaciones con IA**: Implementar realmente el endpoint `/api/recommendations` con Gemini
6. **Paginación**: Para listas grandes de contenido
7. **Búsqueda full-text**: Mejorar búsqueda con índices de texto completo
8. **Imágenes**: Sistema de upload de posters
9. **Notificaciones**: Cuando alguien comenta en tu comentario (si se añade sistema de replies)

---

## Resumen de Flujos de Usuario

### Usuario No Autenticado
1. Navega por películas/series
2. Ve calificaciones y comentarios
3. No puede calificar ni comentar
4. Puede registrarse o hacer login

### Usuario Autenticado
1. Puede calificar películas/series (0-5 estrellas + reseña opcional)
2. Puede comentar
3. Puede editar/eliminar sus propias calificaciones y comentarios
4. Ve recomendaciones personalizadas (si hay calificaciones previas)

### Administrador
1. Todo lo anterior +
2. Acceso a `/admin`
3. Puede crear/editar/eliminar películas y series
4. Puede gestionar usuarios
5. Ve estadísticas del sistema

---

Este documento cubre los aspectos principales de HideScore v3.1. Para más detalles técnicos, consulta el código fuente y los comentarios en los archivos.

