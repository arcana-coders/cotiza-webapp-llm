import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOllama } from 'ollama-ai-provider'

export type LLMProvider = 'ollama' | 'gemini'

export interface LLMConfig {
  provider: LLMProvider
  model?: string
  apiKey?: string
}

export function getAIModel(config: LLMConfig) {
  if (config.provider === 'gemini') {
    const apiKey = config.apiKey || process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('Gemini API key is required')
    }

    const google = createGoogleGenerativeAI({
      apiKey,
    })

    // Use gemini-2.5-flash - has good free tier quotas (10 RPM, 250K TPM)
    return google('gemini-2.5-flash')
  }

  // Ollama
  const baseURL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
  const ollama = createOllama({
    baseURL,
  })

  const model = config.model || 'llama3.1:8b'
  return ollama(model)
}

export async function getOllamaModels(): Promise<string[]> {
  try {
    const baseURL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
    const response = await fetch(`${baseURL}/api/tags`)

    if (!response.ok) {
      throw new Error('Failed to fetch Ollama models')
    }

    const data = await response.json()
    return data.models?.map((m: any) => m.name) || []
  } catch (error) {
    console.warn('Could not fetch Ollama models:', error)
    return []
  }
}
