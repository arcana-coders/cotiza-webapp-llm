# Vercel Deployment Configuration

## Environment Variables Required for Production

You need to set these environment variables in your Vercel project dashboard:

### Required for Supabase (Database & Auth)
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Required for Gemini AI
- `GEMINI_API_KEY` - Your Google Gemini API key

### Database
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (for server-side operations)

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

The app now uses a dedicated microservice for PDF generation to avoid Vercel Serverless Function size limits (50MB).

- **Architecture**: Next.js app calls `POST /generate-pdf` on an external Node.js service (hosted on Render.com).
- **Service**: `cotiza-pdf-service` (Repo: `arcana-coders/cotiza-pdf-service`)
- **Authentication**: Shared secret token via `X-PDF-SERVICE-TOKEN` header.

### Required Environment Variables

Add these to your Vercel project settings:

- `PDF_SERVICE_URL` - The URL of the microservice (e.g., `https://cotiza-pdf-service.onrender.com/generate-pdf`)
- `PDF_SERVICE_TOKEN` - The secure token shared between Vercel and the microservice.

### Why this change?
We moved from `@sparticuz/chromium` (Serverless Chromium) to a dedicated `puppeteer` service because:
1. **Size Limits**: Vercel has strict 50MB limits for Serverless Functions. Including Chromium binaries often breaks deployments.
2. **Reliability**: A dedicated service with full Puppeteer/Chrome is more reliable for consistent rendering than the stripped-down serverless binaries.
3. **Speed**: "Warm" instances on Render can render PDFs faster than cold-booting serverless functions.

## Rate Limits

- **Gemini API**: 10 RPM, 250K TPM (free tier)
- Monitor usage at Google Cloud Console

