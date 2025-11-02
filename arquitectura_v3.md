# Arquitectura — HideScore v3.1

Este documento describe la arquitectura de HideScore v3.1, explicando qué hace cada pieza, cómo fluye la información entre componentes y cómo desplegar/iterar sobre el proyecto.

## Resumen rápido
- Aplicación full-stack escrita en TypeScript.
- Frontend: React + Vite (SPA).
- Backend: Express + Drizzle ORM (Postgres / Neon).
- Tipos y esquemas compartidos en `shared/` para mantener sincronía entre cliente y servidor.

Ruta de alto nivel:
- Usuario (navegador) ↔ Frontend (React) ↔ API (Express) ↔ Storage (Postgres via Drizzle)

## Carpetas principales
- `client/` — Aplicación React (Vite). Contiene la UI, páginas, componentes y hooks.
- `server/` — API Express + lógica de negocio, endpoints, y bootstrap del servidor.
- `shared/` — Drizzle table definitions y Zod schemas; tipos compartidos (User, Movie, Series, Rating, Comment).
- `scripts/` — Scripts de mantenimiento (migraciones, población de datos, utilidades).

## Frontend (client/)

Estructura relevante:
- `src/main.tsx` — Entrypoint, monta React.
- `src/App.tsx` — Rutas principales y proveedor de contexto.
- `src/pages/` — Páginas: `HomePage`, `ContentDetailPage`, `AdminPage`, `SearchPage`, etc.
- `src/components/` — Componentes reutilizables y subcarpetas para `admin/` y `ui/`.
- `src/contexts/` — `AuthContext` que maneja sesión guardando el usuario en `localStorage`.
- `src/lib/queryClient.ts` — Wrapper de React Query + helper `apiRequest()` que inyecta `x-user-id` desde `localStorage`.

Flujo de interacción:
- Las páginas usan React Query para consumir endpoints (`/api/...`).
- `apiRequest` añade `x-user-id` a las peticiones si el usuario está logueado — el backend usa ese header para autorización simple.

UX y acciones críticas:
- Comentarios y calificaciones se publican a través de POST `/api/comments` y `/api/ratings`.
- El `ContentDetailPage` muestra las calificaciones y comentarios y ahora permite editar/borrar los propios (PUT/DELETE endpoints añadidos).

## Backend (server/)

Componentes principales:
- `server/index.ts` / `server/app.ts` — Inicialización del servidor Express.
- `server/routes.ts` — Registro de rutas públicas y administrativas.
- `server/storage.ts` — Implementación de `IStorage` con Drizzle + Pool. Aquí están las funciones CRUD reales que interactúan con la base de datos.
- `server/db.ts` — Inicializa conexión a Postgres (Neon) y limpia `DATABASE_URL` para evitar comillas/escape.

Patrones y responsabilidades:
- Rutas públicas: obtención de películas/series, detalle, listados, búsqueda.
- Rutas de contenido: `/api/movies/:id/ratings`, `/api/movies/:id/comments` (GET), y creación con POST genérico (`/api/ratings`, `/api/comments`).
- Rutas de administración: restringidas mediante `requireAdmin()` (comprueba `x-user-id` y el `rank` del usuario). Incluyen creación/actualización/eliminación de contenido.
- Validaciones con Zod usando los schemas expuestos desde `shared/`.

Autorización
- El sistema actual usa un mecanismo simple: el cliente guarda el objeto `user` en `localStorage` (desde `AuthContext`) y `apiRequest()` añade `x-user-id` automáticamente. El servidor valida la identidad y permisos para acciones sensibles (admin + propietarios).

## Shared (schemas + tipos)

- `shared/schema.ts` contiene las definiciones Drizzle para tablas y `createInsertSchema` (drizzle-zod) para generar validadores Zod.
- Tablas clave:
  - `users` (id, email, displayName, password_hash, rank)
  - `movies`, `series` (arrays de `genre`, `platform`, `platform_links`, datos técnicos)
  - `ratings` (rating, review, userId, movieId/seriesId) — check constraint: solo movieId o seriesId
  - `comments` (content, userId, movieId/seriesId)

Esto permite compartir tipos y validaciones entre cliente y servidor y reduce bugs por tipos inconsistentes.

## Data flow: crear/editar comentario o rating (ejemplo)
1. Usuario escribe comentario/selecciona estrellas en la UI.
2. El cliente llama a `apiRequest("POST", "/api/comments", { userId, movieId, content })`.
3. `server/routes.ts` valida el body con `insertCommentSchema` y delega a `storage.createComment`.
4. `storage` ejecuta `db.insert(comments)` via Drizzle.
5. El cliente invalida queries de React Query para recargar comentarios y calificaciones.

Para editar/borrar: el cliente llama PUT/DELETE a `/api/comments/:id` o `/api/ratings/:id` añadiendo `x-user-id`. El servidor comprueba que `existing.userId === userId` antes de proceder.

## Base de datos y migraciones

- Drizzle es usado para definir tablas en TypeScript en `shared/schema.ts`.
- Uso de `drizzle-kit` en scripts (`npm run db:push`) para sincronizar esquema con Neon.
- Se añadieron columnas `platform_links` como `text[]` paralelos a `platform`.

## Scripts y utilidades

- `scripts/populate_platform_links.ts` — heurísticamente genera enlaces por plataforma para contenido existente.
- `scripts/test_save_platform_links.ts` — script de verificación que inserta contenido de prueba con `platformLinks`.
- `scripts/apply_platform_links.ts` — utilitario para ejecutar ALTER TABLE y ajustes si es necesario.

## Autenticación y usuarios

- El backend actual implementa registro/login con bcrypt y Zod validators. Las contraseñas se almacenan como `password_hash`.
- `AuthContext` en el cliente guarda el usuario (sin `passwordHash`) en `localStorage` y lo expone a la app.


## API (resumen útil)

- Public:
  - GET /api/movies
  - GET /api/movies/:id
  - GET /api/series
  - GET /api/series/:id
  - POST /api/ratings
  - POST /api/comments

- Authenticated (owner):
  - PUT /api/ratings/:id
  - DELETE /api/ratings/:id
  - PUT /api/comments/:id
  - DELETE /api/comments/:id

- Admin (requireAdmin):
  - GET /api/admin/*
  - POST /api/admin/movies
  - PUT/DELETE /api/admin/movies/:id
  - POST /api/admin/series
  - PUT/DELETE /api/admin/series/:id

## Desarrollo local y despliegue

- Variables de entorno importantes:
  - DATABASE_URL — conexión Postgres (Neon)

- Comandos útiles:
```powershell
npm run dev      # desarrolla (servidor + client)
npm run build    # build producción
npm run db:push  # aplicar cambios de schema
```

- Recomendación de despliegue: usar una plataforma que soporte Node (Vercel/Render/Neon + Vercel/Netlify). Para Vercel se incluye una entrada `api/index.ts` que facilita integrarlo como serverless function.

## Pruebas y validación

- No hay suite de tests completa; sugerido:
  - Integración: endpoints CRUD para ratings/comments
  - Unit: utilidades de normalización de URLs y validadores Zod

## Siguientes pasos recomendados

1. Reforzar la autenticación: usar JWT/HttpOnly cookies, middleware de sesión y CSRF.
2. Añadir protección contra duplicados en `createRating` (o hacer POST idempotente: actualizar si ya existe la valoración del usuario para el contenido).
3. Añadir validación/normalización en servidor para `platformLinks` (garantizar URLs válidas).
4. Añadir tests automáticos para endpoints críticos.
5. Mejorar UI de administración (bulk edits, export/import CSV).

---

Si quieres, puedo:
- Añadir diagramas (ASCII o imágenes) que describan el flujo de datos.
- Generar un README técnico con comandos de despliegue más detallados.
- Añadir ejemplos de payloads para cada endpoint.
