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

## PDF Generation with Puppeteer & Chromium

### Configuration for Vercel Serverless

The app uses **puppeteer-core** with **@sparticuz/chromium** for PDF generation in production. This setup is required for Vercel's serverless environment.

#### Important Requirements:

1. **Dependencies** (package.json):
   - `puppeteer-core@23.11.1` - Puppeteer without bundled Chromium
   - `@sparticuz/chromium@^141.0.0` - Chromium binary optimized for serverless
   - **Note**: Use `puppeteer-core` NOT `puppeteer` to avoid binary conflicts

2. **Runtime Configuration** (app/api/generate-pdf/route.ts):
   - Must have `export const runtime = 'nodejs'`
   - Ensures the function runs on Node.js runtime (Edge runtime doesn't support Chromium)

3. **Next.js Configuration** (next.config.ts):
   - `serverExternalPackages: ['@sparticuz/chromium']`
   - Prevents Next.js from bundling Chromium binaries incorrectly

#### Local Development

For local development, the code automatically detects Chrome in standard locations:
- **Windows**: `C:\Program Files\Google\Chrome\Application\chrome.exe`
- **macOS**: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
- **Linux**: `/usr/bin/google-chrome`

You can override with environment variable:
```bash
CHROME_EXECUTABLE_PATH=/path/to/chrome
```

#### Troubleshooting

If you encounter errors like "The input directory does not exist" or brotli-related errors:
1. Verify you're using `puppeteer-core` (not `puppeteer`)
2. Check version compatibility: puppeteer-core@23.11.x with @sparticuz/chromium@141.x
3. Ensure `serverExternalPackages` is configured in next.config.ts
4. Clear Vercel build cache and redeploy

## Rate Limits

- **Gemini API**: 10 RPM, 250K TPM (free tier)
- Monitor usage at Google Cloud Console
