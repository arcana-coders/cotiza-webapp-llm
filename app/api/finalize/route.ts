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

    // Helper to compute next folio based on latest
    const computeNextFolio = (lastFolio?: string) => {
      if (!lastFolio) return 'CIC-00001'
      const match = lastFolio.match(/(\d+)$/)
      if (!match || match.index === undefined) return 'CIC-00001'
      const currentNumber = parseInt(match[1])
      const prefix = lastFolio.substring(0, match.index)
      return `${prefix}${String(currentNumber + 1).padStart(match[1].length, '0')}`
    }

    // Get latest folio for the user to derive the next available
    const { data: latestQuotation } = await supabase
      .from('quotations')
      .select('folio')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // Use provided folio if available and not empty, otherwise compute next
    let finalFolio = validated.folio?.trim() || ''
    if (!finalFolio) {
      finalFolio = computeNextFolio(latestQuotation?.folio)
    }

    let result
    if (quotationId) {
      // Update existing by ID (editing from dashboard)
      // When updating, preserve existing folio if not provided
      const updateFolio = validated.folio?.trim() || finalFolio
      const finalizedData = { ...validated, folio: updateFolio }
      const html = await generateHTML(finalizedData)
      
      result = await supabase
        .from('quotations')
        .update({
          folio: updateFolio,
          json_data: finalizedData,
          html,
          cliente: finalizedData.cliente,
          fecha: finalizedData.fecha,
          updated_at: new Date().toISOString(),
        })
        .eq('id', quotationId)
        .eq('user_id', user.id)
        .select('id')
        .single()
      
      finalFolio = finalizedData.folio
    } else {
      // Creating new - ensure folio is unique, keep trying until we find available one
      let attempts = 0
      const maxAttempts = 100
      let isUnique = false

      while (!isUnique && attempts < maxAttempts) {
        const { data: existing } = await supabase
          .from('quotations')
          .select('folio')
          .eq('user_id', user.id)
          .eq('folio', finalFolio)
          .maybeSingle()

        if (existing) {
          // Folio exists, try the next one
          finalFolio = computeNextFolio(finalFolio)
          attempts++
        } else {
          isUnique = true
        }
      }

      if (!isUnique) {
        throw new Error('No se pudo encontrar un folio disponible después de 100 intentos')
      }

      // Always use the resolved folio for everything
      const finalizedData = { ...validated, folio: finalFolio }
      const html = await generateHTML(finalizedData)

      // Create new quotation
      result = await supabase
        .from('quotations')
        .insert({
          user_id: user.id,
          folio: finalFolio,
          cliente: finalizedData.cliente,
          fecha: finalizedData.fecha,
          json_data: finalizedData,
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
      folio: finalFolio,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = error instanceof Error ? error.stack : JSON.stringify(error)
    console.error('Finalize error:', message)
    console.error('Error details:', errorDetails)
    return Response.json(
      {
        success: false,
        error: message || 'Error finalizing quotation',
      },
      { status: 500 }
    )
  }
}
