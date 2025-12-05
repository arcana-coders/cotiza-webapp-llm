import { generateHTML } from '@/lib/pdf/generator'
import { CotizacionSchema } from '@/shared/schemas'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { data } = await req.json()

    // Validate the data
    const validated = CotizacionSchema.parse(data)

    // Generate HTML
    const html = await generateHTML(validated)

    return NextResponse.json({ html })
  } catch (error: any) {
    console.error('Preview generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
