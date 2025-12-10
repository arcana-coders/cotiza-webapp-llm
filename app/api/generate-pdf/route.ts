import { createClient } from '@/lib/supabase/server';
import { generatePDFBuffer } from '@/lib/pdf/generator';
import { CotizacionSchema } from '@/shared/schemas';

export const runtime = 'nodejs'; // Puppeteer requires Node runtime
export const maxDuration = 60; // Allow enough time for Chromium startup on serverless

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { quotationData } = body;

    if (!quotationData) {
      return Response.json({
        success: false,
        error: 'quotationData is required'
      }, { status: 400 });
    }

    // Validate data with Zod
    const validated = CotizacionSchema.parse(quotationData);

    const LOGTAG = '[PDF-ROUTE]';
    const serviceUrl = process.env.PDF_SERVICE_URL;
    const serviceToken = process.env.PDF_SERVICE_TOKEN;

    if (!serviceUrl || !serviceToken) {
      console.error(`${LOGTAG} Missing PDF_SERVICE_URL or PDF_SERVICE_TOKEN env vars.`);
      throw new Error('Server configuration error: PDF service not linked');
    }

    console.log(`${LOGTAG} Calling microservice at ${serviceUrl}...`);

    // Call Microservice
    const response = await fetch(serviceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-PDF-SERVICE-TOKEN': serviceToken,
      },
      body: JSON.stringify({ quotationData: validated }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${LOGTAG} Microservice error: ${response.status} - ${errorText}`);
      throw new Error(`PDF Service failed: ${response.statusText}`);
    }

    const pdfArrayBuffer = await response.arrayBuffer();

    // Clean filename: remove special chars
    const safeClient = validated.cliente.replace(/[^a-z0-9]/gi, '_');
    const fileName = `${validated.folio || 'cotizacion'}_${safeClient}.pdf`;

    return new Response(pdfArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('PDF generation error:', message);
    return Response.json({
      success: false,
      error: message || 'Unknown error'
    }, { status: 500 });
  }
}
