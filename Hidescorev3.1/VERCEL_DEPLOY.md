# Guía de Despliegue en Vercel

Esta guía explica cómo desplegar HideScore v3.1 en Vercel.

## ⚠️ IMPORTANTE: Cambios Recientes para Deployment

La app ha sido actualizada para funcionar correctamente en Vercel. Los cambios incluyen:
- **vite.config.ts**: Build output corregido para `dist/` (no `dist/public/`)
- **package.json**: Script build actualizado sin paso `move-public-to-dist.cjs`
- **vercel.json**: Rewrites optimizados para Vercel

**Estos cambios son CRÍTICOS para que la app funcione en producción.**

## Prerrequisitos

1. Cuenta en [Vercel](https://vercel.com)
2. Base de datos PostgreSQL (recomendado: [Neon](https://neon.tech))
3. Repositorio Git (GitHub, GitLab o Bitbucket)

## ✅ Quick Start (Pasos Rápidos)

1. `git add . && git commit -m "Deploy fixes" && git push`
2. Ve a [vercel.com](https://vercel.com) e importa tu repositorio
3. En Settings → Environment Variables, agrega:
   - `DATABASE_URL`: Tu connection string PostgreSQL
4. Haz clic en Deploy
5. **IMPORTANTE**: Después de Deploy, haz **Redeploy** manual para aplicar env vars
6. Prueba: `https://tu-proyecto.vercel.app/api/movies`

## Pasos Detallados para Desplegar

### 1. Preparar el Repositorio

Asegúrate de que tu código esté en un repositorio Git con los cambios de deployment:

```bash
cd Hidescorev3.1
git add .
git commit -m "Fixes de deployment para Vercel"
git push
```

### 2. Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en "Add New Project"
3. Importa tu repositorio Git
4. Vercel detectará automáticamente la configuración

### 3. Configurar Variables de Entorno ⭐ CRÍTICO

**Sin esto, tu app NO funcionará en Vercel.**

En Vercel:
1. Ve a **Settings** → **Environment Variables**
2. Agrega esta variable:

**DATABASE_URL** (Requerido)
```
postgresql://user:password@host:5432/database?sslmode=require
```

Para obtener tu connection string:

**Opción A: Si usas Neon** (recomendado)
- Ve a [neon.tech](https://neon.tech) y crea un proyecto
- En tu proyecto, haz clic en **Connection** (arriba a la derecha)
- Copia el **URI** completo
- Asegúrate de que tenga `?sslmode=require` al final
- Pega en Vercel como el valor de `DATABASE_URL`

**Opción B: Otro proveedor PostgreSQL**
- En tu proveedor, obtén la connection string
- Formato: `postgresql://username:password@hostname:5432/database`
- Agrega `?sslmode=require` al final
- Pega en Vercel

**PASO CRÍTICO**: Para la variable `DATABASE_URL`:
- Marca las 3 casillas: **Production**, **Preview**, **Development**
- Haz clic en **Save**

**Opcional**: Si tienes Gemini API Key:
- Agrega `GEMINI_API_KEY` con tu clave

### 4. Deploy

1. Haz clic en **Deploy**
2. Espera a que termine (1-3 minutos)
3. Una vez completado, recibirás una URL como `mi-app.vercel.app`

### 5. ⭐ REDEPLOY MANUAL (MÁS IMPORTANTE)

**DEBES hacer esto después de agregar variables de entorno:**

1. Ve a **Deployments**
2. En el último deployment, haz clic en los **3 puntos** ⋯
3. Selecciona **"Redeploy"**
4. Espera a que termine

**Sin este paso, las variables de entorno NO se aplicarán.**

### 6. Verificación

Abre tu app en el navegador:
1. `https://tu-proyecto.vercel.app` → Debería mostrar la página principal
2. `https://tu-proyecto.vercel.app/api/movies` → Debería devolver JSON
3. Si la API devuelve datos vacíos, es normal (aún sin contenido en BD)

Si ves error de BD, ve a la sección de Problemas abajo.

## Problemas Comunes y Soluciones

### ❌ "Cannot GET /" o Página Blanca

**Causa**: Frontend no se compiló correctamente

**Solución**:
```bash
npm run build  # Ejecuta localmente
npm run check  # Revisa errores TypeScript
```

Si hay errores, corrígelos, luego:
```bash
git add .
git commit -m "Fix errors"
git push
```

En Vercel, haz **Redeploy**.

### ❌ "Cannot find module" durante Build

**Causa**: Falta instalar dependencias

**Solución**:
```bash
npm install
git add package-lock.json
git commit -m "Add package-lock"
git push
```

En Vercel, haz **Redeploy**.

### ❌ "Database connection failed" o Datos Vacíos

**PRIMER PASO**: Verifica que DATABASE_URL está correctamente configurada:

1. En Vercel, ve a **Settings** → **Environment Variables**
2. Busca `DATABASE_URL` en la lista
3. Si NO está, agrégala ahora (ver sección 3 arriba)
4. Si SÍ está:
   - Verifica que el valor sea correcto: `postgresql://...?sslmode=require`
   - Marca las 3 casillas: Production, Preview, Development
   - Haz clic en **Save**

**SEGUNDO PASO**: Haz REDEPLOY

1. Ve a **Deployments**
2. Último deployment → **3 puntos** → **Redeploy**
3. Espera a que termine

**TERCER PASO**: Verifica en los logs

1. Ve a **Deployments** → Último deployment
2. Haz clic en **View Function Logs**
3. Busca líneas que empiecen con `[DB]`

**Lo que debería ver**:
```
[DB] DATABASE_URL exists: true
[DB] ✅ Database connection successful
```

**Si ve**:
```
[DB] DATABASE_URL exists: false
```
→ La variable NO está configurada. Repite los pasos de configuración y redeploy.

**Si ve**:
```
[DB] ❌ Database connection failed
```
→ La connection string es incorrecta. Verifica en tu proveedor de BD.

### ❌ Las rutas SPA no funcionan (404 en `/movies`, `/admin`, etc.)

**Causa**: Rewrite de Vercel no está configurado correctamente

**Solución**:
- Verifica `vercel.json` tiene exactamente esto:

```json
"rewrites": [
  {
    "source": "/api/(.*)",
    "destination": "/api"
  },
  {
    "source": "/(.*)",
    "destination": "/index.html"
  }
]
```

Si no, reemplaza el archivo completo.

### ❌ Errores CORS en Console del Navegador

**Síntoma**: `Access-Control-Allow-Origin` error en red

**Solución**:
- Verifica que `vercel.json` tiene la sección `headers` con CORS
- El archivo ya debería estar correcto, pero revisa que no le falte la sección

### ❌ "Build failed" en Vercel

**Solución**:
1. Ve a **Build Logs** en Vercel
2. Lee el error (generalmente cerca del final)
3. Corrige localmente:
   ```bash
   npm run build
   npm run check
   ```
4. Si hay error, corrígelo
5. `git add . && git commit -m "Fix build" && git push`
6. En Vercel, haz **Redeploy**

## Estructura del Proyecto en Vercel

### Frontend
- Compilado por Vite a `dist/` (archivos estáticos)
- Vercel sirve estos archivos automáticamente
- Todas las rutas que NO son `/api` se redirigen a `index.html`

### Backend
- API Express compilada a `dist/server/app.js`
- Expuesto como función serverless en `api/index.ts`
- Se cachea entre requests para mejor performance
- Database: Conexión Neon PostgreSQL con SSL

## Actualizar la App

Para actualizar después de cambios:

```bash
# 1. Hace cambios localmente
# 2. Commit
git add .
git commit -m "Describe your changes"
git push
```

Vercel detectará cambios y desplegará automáticamente.

Si cambias **variables de entorno**, **siempre** haz redeploy manual después:
1. Ve a **Deployments**
2. Último deployment → **Redeploy**

## Monitoreo

**Logs de la API**:
- Ve a tu proyecto en Vercel
- **Deployments** → Último deployment
- **View Function Logs**
- Busca `[DB]` o `[API]` para ver qué está pasando

**Analytics**:
- Vercel muestra hits, latencia y errores en el dashboard

## Datos Iniciales (Seed)

El comando `npm run db:push` NO se ejecuta automáticamente en Vercel.

Opciones para agregar datos:
1. **Usar el Panel Admin** (recomendado):
   - Registra usuario admin
   - Ve a `/admin`
   - Crea películas y series manualmente

2. **Ejecutar seed localmente** (si tienes acceso a BD de producción):
   ```bash
   DATABASE_URL="postgresql://..." npm run db:push
   ```

## Límites y Consideraciones

- **Timeout**: 30 segundos máximo por request
- **Cold Starts**: Primer request después de inactividad puede tardar 1-2 seg
- **Database**: Neon permite muchas conexiones, pero evita dejar cientos abiertas

## Checklist Final

- [ ] Código en Git
- [ ] DATABASE_URL agregada a Vercel (Production, Preview, Development)
- [ ] Deploy completado sin errores
- [ ] Redeploy manual hecho
- [ ] App abre en navegador
- [ ] `/api/movies` devuelve JSON (vacío o con datos)
- [ ] Logs muestran `[DB] DATABASE_URL exists: true`
- [ ] Logs muestran `[DB] ✅ Database connection successful`

## ¿Necesitas Ayuda?

1. Revisa los **Logs** en Vercel (siempre aquí está la respuesta)
2. Asegúrate de que `DATABASE_URL` esté configurada y hayas hecho **Redeploy**
3. Verifica que la connection string sea: `postgresql://...?sslmode=require`
4. Lee la [Documentación oficial de Vercel](https://vercel.com/docs)

