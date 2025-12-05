import { createClient } from '@/lib/supabase/server';
import { generatePDFBuffer } from '@/lib/pdf/generator';
import { CotizacionSchema } from '@/shared/schemas';

export const runtime = 'nodejs'; // Puppeteer requires Node runtime

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { quotationId, quotationData } = body;

    if (!quotationData) {
      return Response.json({
        success: false,
        error: 'quotationData is required'
      }, { status: 400 });
    }

    // Validate data with Zod
    const validated = CotizacionSchema.parse(quotationData);

    // Generate PDF (Puppeteer) - already returns Uint8Array
    const pdfBuffer = await generatePDFBuffer(validated);

    // Clean filename: remove special chars
    const safeClient = validated.cliente.replace(/[^a-z0-9]/gi, '_');
    const fileName = `${validated.folio}_${safeClient}.pdf`;

    // Return PDF as downloadable file: convert to ArrayBuffer for Response
    const pdfArrayBuffer = pdfBuffer.buffer.slice(
      pdfBuffer.byteOffset,
      pdfBuffer.byteOffset + pdfBuffer.byteLength,
    ) as ArrayBuffer

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
