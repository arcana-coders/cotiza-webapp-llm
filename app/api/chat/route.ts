import { streamText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { getAIModel } from '@/lib/ai/providers'
import { getSystemPrompt, buildUserPrompt } from '@/lib/ai/prompts'
import { CotizacionSchema } from '@/shared/schemas'
import { generateHTML } from '@/lib/pdf/generator'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const body = await req.json()
    let prompt = body.prompt
    const quotationId = body.quotationId

    // If prompt not in body, it might be sent differently
    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid or missing prompt' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Get user from session
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Get user settings for Gemini API Key
    const { data: settings } = await supabase
      .from('user_settings')
      .select('gemini_api_key')
      .eq('user_id', user.id)
      .single()

    // ENFORCE GEMINI PROVIDER
    const llmProvider = 'gemini';
    
    // Use user's key if available, otherwise fallback to env var
    const geminiKey = settings?.gemini_api_key || process.env.GEMINI_API_KEY;

    if (!geminiKey) {
        return new Response(JSON.stringify({ error: 'Gemini API Key not found. Please configure it in settings or environment.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Load existing quotation if editing
    let currentQuotation: any = null
    let conversationHistory = ''

    if (quotationId) {
      const { data: quotation } = await supabase
        .from('quotations')
        .select('json_data, conversation_history')
        .eq('id', quotationId)
        .eq('user_id', user.id)
        .single()

      if (quotation) {
        currentQuotation = quotation.json_data
        conversationHistory = quotation.conversation_history || ''
      }
    }

    // Use the prompt directly from useCompletion
    const userInput = prompt

    // Build the prompt
    const systemPrompt = getSystemPrompt()
    const userPrompt = buildUserPrompt(userInput, currentQuotation)

    // Get AI model (Gemini)
    const aiModel = getAIModel({
      provider: llmProvider,
      apiKey: geminiKey,
    }) as unknown as import('ai').LanguageModel

    // Stream the response
    const result = streamText({
      model: aiModel,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.3,
    })

    // Get the text stream response and return it directly.
    // Persistence and post-processing are handled client-side
    // via the /api/finalize endpoint once streaming completes.
    const response = result.toTextStreamResponse()
    return response
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Chat API error:', message)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
