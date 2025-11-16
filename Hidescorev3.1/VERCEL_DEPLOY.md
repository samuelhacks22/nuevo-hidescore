# Guía de Despliegue en Vercel

Esta guía explica cómo desplegar HideScore v3.1 en Vercel.

## Prerrequisitos

1. Cuenta en [Vercel](https://vercel.com)
2. Base de datos PostgreSQL (recomendado: [Neon](https://neon.tech))
3. Repositorio Git (GitHub, GitLab o Bitbucket)

## Pasos para Desplegar

### 1. Preparar el Repositorio

Asegúrate de que tu código esté en un repositorio Git y que todos los cambios estén commiteados:

```bash
git add .
git commit -m "Preparado para Vercel"
git push
```

### 2. Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en "Add New Project"
3. Importa tu repositorio
4. Vercel detectará automáticamente la configuración del proyecto

### 3. Configurar Variables de Entorno

**IMPORTANTE**: Este paso es crítico. Sin las variables de entorno correctas, la aplicación no podrá conectarse a la base de datos.

En la configuración del proyecto en Vercel:
1. Ve a **Settings** → **Environment Variables**
2. Añade las siguientes variables de entorno para **todos los ambientes** (Production, Preview, Development):

#### Variables Requeridas

- **`DATABASE_URL`**: Connection string de PostgreSQL
  ```
  postgresql://user:password@host:5432/database?sslmode=require
  ```
  Si usas Neon:
  - Ve a tu proyecto en Neon
  - Dashboard → Connection Details
  - Copia la connection string
  - Asegúrate de incluir `?sslmode=require` al final
  
  **⚠️ Importante**: Después de agregar/actualizar variables de entorno, necesitas hacer un nuevo deploy:
  - Ve a Deployments
  - Haz clic en los 3 puntos del último deployment
  - Selecciona "Redeploy"

#### Variables Opcionales

- **`GEMINI_API_KEY`**: Para recomendaciones con IA (opcional)
- **`NODE_ENV`**: Automáticamente configurado como `production` por Vercel

### 4. Configuración del Build

Vercel usará automáticamente:
- **Build Command**: `npm run build` (definido en `vercel.json`)
- **Output Directory**: `dist` (definido en `vercel.json`)
- **Install Command**: `npm install`

### 5. Desplegar

1. Haz clic en "Deploy"
2. Vercel construirá y desplegará tu aplicación
3. Una vez completado, recibirás una URL (ej: `tu-proyecto.vercel.app`)

## Estructura del Despliegue

### Frontend (SPA)
- Los archivos estáticos se sirven desde `dist/`
- Todas las rutas no-API se redirigen a `index.html` (SPA routing)

### Backend (Serverless Functions)
- Todas las rutas `/api/*` se manejan por `api/index.ts`
- Cada request ejecuta una función serverless
- El Express app se cachea entre invocaciones para mejor rendimiento

## Verificación Post-Despliegue

1. **Verifica la URL principal**: Debería mostrar la página de inicio
2. **Prueba una ruta API**: `https://tu-proyecto.vercel.app/api/movies`
3. **Verifica la base de datos**: Asegúrate de que las queries funcionen

## Problemas Comunes

### Error: "Cannot find module"

**Solución**: Asegúrate de que todas las dependencias estén en `dependencies` (no solo en `devDependencies`)

### Error: "Database connection failed" o "No se muestran los datos"

**Solución**: 
- **CRÍTICO**: Verifica que `DATABASE_URL` esté correctamente configurada en las Variables de Entorno de Vercel:
  1. Ve a tu proyecto en Vercel
  2. **Settings** → **Environment Variables**
  3. Busca `DATABASE_URL` en la lista
  4. **VERIFICA** que esté configurada para **Production, Preview Y Development** (marca las 3 casillas)
  5. El formato debe ser: `postgresql://user:password@host:5432/database?sslmode=require`
  6. Si no existe, **agrégala**:
     - Click en "Add New"
     - Key: `DATABASE_URL`
     - Value: Tu connection string completa
     - Marca **Production, Preview y Development**
     - Click en "Save"

- **PASO MÁS IMPORTANTE**: **Después de agregar/actualizar variables de entorno, DEBES hacer un nuevo deploy**:
  1. Ve a **Deployments**
  2. Haz click en los **3 puntos** del último deployment
  3. Selecciona **"Redeploy"**
  4. **NO** simplemente esperes, haz el redeploy manualmente

- **Verifica los logs**:
  1. Ve a **Functions** → **View Function Logs** en Vercel
  2. Busca mensajes que empiecen con `[DB]` o `[API]`
  3. Si ves `[DB] DATABASE_URL exists: false`, la variable no está configurada o no se hizo redeploy
  4. Si ves `[DB] DATABASE_URL exists: true`, entonces el problema es la conexión a la base de datos

- **Si `DATABASE_URL` existe pero aún falla**:
  - Verifica que la base de datos permita conexiones desde Vercel (whitelist de IPs si es necesario)
  - Para Neon, esto normalmente no es necesario, pero verifica que la conexión esté habilitada
  - Asegúrate de que la connection string sea correcta y tenga `?sslmode=require` al final

### Error: "Build failed"

**Solución**:
- Revisa los logs de build en Vercel
- Asegúrate de que `npm run build` funcione localmente
- Verifica que no haya errores de TypeScript (`npm run check`)

### La API responde pero no hay datos

**Solución**:
- Verifica los logs de la función serverless en Vercel
- Busca mensajes que empiecen con `[DB]` o `[API]` para ver qué está pasando
- Asegúrate de que la base de datos tenga datos (el seed NO se ejecuta automáticamente en producción)
- Prueba hacer una query directamente a la base de datos para verificar que tenga datos

### Las rutas de la SPA no funcionan

**Solución**: Verifica que `vercel.json` tenga la regla de rewrite correcta:
```json
{
  "source": "/(.*)",
  "destination": "/index.html"
}
```

## Actualizaciones

Para actualizar la aplicación:
1. Haz push de tus cambios al repositorio
2. Vercel detectará automáticamente los cambios y desplegará una nueva versión
3. O ve al dashboard de Vercel y haz clic en "Redeploy"

## Monitoreo

- **Logs**: Ve a tu proyecto en Vercel → "Functions" → "View Function Logs"
- **Analytics**: Vercel proporciona analytics básicos en el dashboard
- **Performance**: Usa Vercel Analytics para métricas detalladas

## Notas Importantes

1. **Seed de Base de Datos**: El seed NO se ejecuta automáticamente en producción. Si necesitas datos iniciales, ejecuta el script manualmente o usa el panel de administración.

2. **Cold Starts**: La primera request después de inactividad puede ser más lenta (cold start). Esto es normal en serverless.

3. **Límites de Tiempo**: Las funciones serverless tienen un timeout máximo (configurado a 30 segundos en `vercel.json`). Para operaciones largas, considera usar background jobs.

4. **Variables de Entorno**: Las variables de entorno se pueden configurar por ambiente (Production, Preview, Development).

## Soporte

Si encuentras problemas:
1. Revisa los logs en Vercel
2. Verifica la configuración de `vercel.json`
3. Asegúrate de que el build funcione localmente
4. Consulta la [documentación de Vercel](https://vercel.com/docs)

