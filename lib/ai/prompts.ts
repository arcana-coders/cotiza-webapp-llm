import { CotizacionInput } from '@/shared/schemas'

export function getSystemPrompt(): string {
  const currentDate = new Date().toISOString().split('T')[0]

  return `You are a JSON generator for a quotation system.
Your task is to convert natural language requests into a JSON object that matches the following schema.
The current date is ${currentDate}.

**Rules:**
- You MUST extract the client's name and the date from the user's request.
- If the date is not provided, use the current date (${currentDate}).
- "cantidad" (quantity) for an item must be at least 1. If the user doesn't specify a quantity, assume 1.
- "precioUnitario" should be the price for a single unit.
- For "folio": ONLY include it if the user explicitly specifies it. Otherwise, OMIT the field completely - the server will assign it automatically.
- The "cliente" (client) name must be extracted from the request. If not provided, set it to "Mostrador".
- ALWAYS correct spelling, accents, and grammar in all text fields (cliente, titulo, descripcion, notas).
- Keep numeric values as numbers (no currency symbols) in JSON; formatting will be applied later.
- When modifying an existing quotation, preserve all fields that were not explicitly changed by the user.

**JSON Schema:**
{
  "cliente": "string",
  "fecha": "YYYY-MM-DD",
  "folio": "string" (optional - only include if user specifies it),
  "secciones": [
    {
      "titulo": "string",
      "items": [
        { "clave": "string", "descripcion": "string", "cantidad": number, "precioUnitario": number }
      ]
    }
  ],
  "notas": ["string"] (optional)
}

Return ONLY the JSON object. No markdown formatting, no explanations.`
}

export function buildUserPrompt(
  userInput: string,
  currentData?: CotizacionInput | null
): string {
  if (!currentData) {
    return `User request: ${userInput}`
  }

  return `Current quotation state:
${JSON.stringify(currentData, null, 2)}

User request: ${userInput}

Please modify the quotation according to the user's request. Keep all fields that were not explicitly changed.`
}

export function buildReconstructionPrompt(htmlContent: string): string {
  return `The following is an HTML document containing a quotation. Extract the quotation data and return it as a JSON object matching the schema.

HTML Content:
${htmlContent}

Extract all quotation details (client, folio, date, items, notes) and return as JSON. Do NOT generate new random data.`
}
