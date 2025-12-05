import { createClient } from '@/lib/supabase/server'
import { generateHTML } from '@/lib/pdf/generator'
import { CotizacionSchema } from '@/shared/schemas'

export async function POST(req: Request) {
  try {
    const { jsonData, quotationId } = await req.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Validate with Zod
    const validated = CotizacionSchema.parse(jsonData)

    // Generate HTML preview
    const html = await generateHTML(validated)

    let result
    if (quotationId) {
      // Update existing by ID (editing from dashboard)
      result = await supabase
        .from('quotations')
        .update({
          json_data: validated,
          html,
          cliente: validated.cliente,
          fecha: validated.fecha,
          updated_at: new Date().toISOString(),
        })
        .eq('id', quotationId)
        .eq('user_id', user.id)
        .select('id')
        .single()
    } else {
      // Creating new - check if folio already exists
      const { data: existing } = await supabase
        .from('quotations')
        .select('folio')
        .eq('user_id', user.id)
        .eq('folio', validated.folio)
        .maybeSingle()

      if (existing) {
        // Folio already exists - get next available folio
        const { data: latestQuotation } = await supabase
          .from('quotations')
          .select('folio')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        let nextFolio = validated.folio
        if (latestQuotation?.folio) {
          // Extract number from folio format (e.g., "CIC-00123" -> 123)
          const match = latestQuotation.folio.match(/(\d+)$/)
          if (match) {
            const currentNumber = parseInt(match[1])
            const prefix = latestQuotation.folio.substring(0, match.index)
            nextFolio = `${prefix}${String(currentNumber + 1).padStart(match[1].length, '0')}`
          }
        }

        return Response.json(
          {
            success: false,
            error: `El folio ${validated.folio} ya existe. El siguiente folio disponible es: ${nextFolio}`,
            suggestedFolio: nextFolio,
          },
          { status: 409 }
        )
      }

      // Create new quotation
      result = await supabase
        .from('quotations')
        .insert({
          user_id: user.id,
          folio: validated.folio,
          cliente: validated.cliente,
          fecha: validated.fecha,
          json_data: validated,
          html,
          status: 'draft',
        })
        .select('id')
        .single()
    }

    if (result.error) {
      throw result.error
    }

    return Response.json({
      success: true,
      quotationId: result.data?.id,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Finalize error:', message)
    return Response.json(
      {
        success: false,
        error: message || 'Error finalizing quotation',
      },
      { status: 500 }
    )
  }
}
