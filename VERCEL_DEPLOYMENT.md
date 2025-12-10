# Vercel Deployment Configuration

## Environment Variables Required for Production

You need to set these environment variables in your Vercel project dashboard:

### Required for Supabase (Database & Auth)
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (for server-side operations)

### Required for Gemini AI
- `GEMINI_API_KEY` - Your Google Gemini API key

### Required for PDF Service (Microservice on Render)
- `PDF_SERVICE_URL` - URL del microservicio (e.g., `https://cotiza-pdf-service.onrender.com/generate-pdf`)
- `PDF_SERVICE_TOKEN` - Token compartido para autenticación entre Vercel y el microservicio

## Setup Steps

1. **Create Vercel Project**
   ```bash
   vercel link
   ```

2. **Add Environment Variables**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add all variables listed above for Production

3. **Configure Custom Domain/Subdomain**
   - Go to Vercel Dashboard → Settings → Domains
   - Add your custom domain (e.g., cotiza.yourdomain.com)

4. **Deploy**
   ```bash
   git push origin main
   ```
   (Vercel auto-deploys on push to main)

## Important Notes

- `.env.local` files are NEVER uploaded to Vercel (in .gitignore)
- Only set variables in Vercel dashboard for production
- Each environment (Preview, Production) can have different variables
- Node.js runtime is required (Puppeteer for PDF generation)

## PDF Generation (External Microservice)

La aplicación usa un microservicio dedicado para generar PDFs, evitando las limitaciones de Vercel Serverless Functions.

### Arquitectura

```
┌─────────────┐      API Request       ┌──────────────────┐
│             │ ───────────────────────>│                  │
│   Vercel    │  POST /api/generate-pdf │  Render.com      │
│  (Next.js)  │  + PDF_SERVICE_TOKEN    │  (Microservice)  │
│             │ <───────────────────────│  + Puppeteer     │
└─────────────┘      PDF Binary         └──────────────────┘
```

### Componentes

- **Proyecto principal**: `cotiza-web` (Este repo) - Desplegado en Vercel
- **Microservicio**: `cotiza-pdf-service` (Repo: `arcana-coders/cotiza-pdf-service`) - Desplegado en Render.com
- **Autenticación**: Token compartido vía header `X-PDF-SERVICE-TOKEN`
- **Keep-Alive**: Cron job en cron-job.org mantiene el servicio despierto (gratis)

### Variables de Entorno Requeridas en Vercel

```bash
PDF_SERVICE_URL=https://cotiza-pdf-service.onrender.com/generate-pdf
PDF_SERVICE_TOKEN=<tu-token-seguro>
```

### Por qué un Microservicio Externo?

Intentamos usar `@sparticuz/chromium` en Vercel pero encontramos problemas:
1. **Dependencias del Sistema**: Error `libnss3.so: cannot open shared object file` - Vercel serverless no tiene todas las librerías que Chrome necesita
2. **Límites de Tamaño**: Vercel tiene límite de 50MB para funciones serverless
3. **Complejidad**: Chromium para serverless es una versión reducida que puede tener inconsistencias

Con el microservicio en Render:
- ✅ Chrome completo con todas las dependencias
- ✅ Renderizado consistente y confiable
- ✅ Sin límites de tamaño
- ✅ 100% gratis con plan Free de Render + cron job para keep-alive

## Rate Limits

- **Gemini API**: 10 RPM, 250K TPM (free tier)
- Monitor usage at Google Cloud Console

