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

## Puppeteer Configuration

The app uses Puppeteer for PDF generation. Make sure:
- `app/api/generate-pdf/route.ts` has `export const runtime = 'nodejs'`
- This ensures the function runs on Node.js runtime (Chromium available)

## Rate Limits

- **Gemini API**: 10 RPM, 250K TPM (free tier)
- Monitor usage at Google Cloud Console
