'use client'

import { useCompletion } from '@ai-sdk/react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Send, User, Bot, Sparkles } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'

interface ChatInterfaceProps {
  quotationId?: string
  onQuotationUpdate?: (html: string, jsonData: any, newQuotationId?: string) => void
}

export function ChatInterface({ quotationId, onQuotationUpdate }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; content: string }>>([])
  const [lastProcessedCompletion, setLastProcessedCompletion] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, lastProcessedCompletion])

  // Destructure values from useCompletion
  const { completion, input, handleInputChange, complete, isLoading, error, setInput } = useCompletion({
    api: '/api/chat',
    streamProtocol: 'text',
    body: {
      quotationId,
    },
    onError: (error) => {
      console.error('Chat API Error:', error)
      alert('Error al conectar con el asistente: ' + error.message)
    }
  })

  // Process completion when done
  useEffect(() => {
    if (!isLoading && completion && completion !== lastProcessedCompletion && completion.trim().length > 0) {
      // Mark as processed
      setLastProcessedCompletion(completion)
      
      // Remove metadata from display
      const displayText = completion.replace(/__QUOTATION_ID__:.+?__/, '').trim()
      
      // Add assistant message
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'assistant', content: displayText }
      ])
      
      if (onQuotationUpdate) {
        try {
          // Parse the completed text
          const cleanedText = displayText.replace(/```json/g, '').replace(/```/g, '').trim()
          if (cleanedText) {
            const jsonData = JSON.parse(cleanedText)
            
            // Call finalize endpoint to save quotation and get ID
            fetch('/api/finalize', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ jsonData, quotationId }),
            })
              .then(res => res.json())
              .then(finalizeData => {
                if (finalizeData.success) {
                  const newQuotationId = finalizeData.quotationId
                  onQuotationUpdate('', jsonData, newQuotationId)
                } else {
                  console.error('Finalize failed:', finalizeData.error)
                  
                  // Show user-friendly error message
                  if (finalizeData.suggestedFolio) {
                    alert(`❌ ${finalizeData.error}\n\n💡 Pídele a la IA que use el folio: ${finalizeData.suggestedFolio}`)
                  } else {
                    alert(`Error: ${finalizeData.error}`)
                  }
                  
                  onQuotationUpdate('', jsonData)
                }
              })
              .catch(error => {
                console.error('Error calling finalize:', error)
                onQuotationUpdate('', jsonData)
              })
          }
        } catch (error) {
          console.error('Error processing completion:', error)
        }
      }
    }
  }, [isLoading, completion, lastProcessedCompletion, onQuotationUpdate, quotationId])

  // Handle form submission to capture user messages
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim()) {
      const userInput = input
      // Clear input immediately for better UX
      setInput('')
      
      // Add user message
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'user', content: userInput }
      ])
      // Call complete with the input prompt
      complete(userInput)
    }
  }

  // Safely check if input has content
  const hasInput = input && input.trim().length > 0

  return (
    <Card className="flex h-full flex-col border-none bg-background shadow-none">
      <CardHeader className="border-b px-6 py-4">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <Sparkles className="h-5 w-5 text-primary" />
          Asistente de Cotizaciones
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-secondary/20">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-80">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">¡Hola! ¿Qué cotizamos hoy?</h3>
              <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
                Describe los detalles de tu servicio o producto. Por ejemplo:
                <br />
                <span className="italic block mt-2 text-foreground/80">"Cliente: TechCorp · Servicio: Consultoría de Software, 10 horas a $80 USD/hora · Validez: 30 días"</span>
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex w-full gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}

              <div
                className={cn(
                  "relative max-w-[85%] rounded-2xl px-5 py-3 text-sm shadow-sm leading-relaxed",
                  message.role === 'user'
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-card border border-border text-foreground rounded-tl-none"
                )}
              >
                {message.role === 'assistant' ? (
                  <div className="space-y-2">
                    <Badge variant="secondary" className="mb-1 text-[10px] uppercase tracking-wider font-medium opacity-70">
                      Respuesta Generada
                    </Badge>
                    <pre className="max-h-60 overflow-auto rounded-lg bg-muted/50 p-3 font-mono text-xs text-muted-foreground border border-border/50">
                      {message.content}
                    </pre>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
              </div>

              {message.role === 'user' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {/* Streaming Indicator */}
          {isLoading && completion && (
            <div className="flex gap-3 w-full">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="relative max-w-[85%] rounded-2xl rounded-tl-none border border-border bg-card px-5 py-3 text-sm shadow-sm">
                 <div className="flex items-center gap-2 mb-2 text-primary font-medium text-xs uppercase tracking-wider">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Escribiendo...
                 </div>
                 <p className="text-muted-foreground font-mono text-xs leading-relaxed whitespace-pre-wrap">
                    {completion}
                 </p>
              </div>
            </div>
          )}
           <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-background border-t border-border">
          <form onSubmit={handleFormSubmit} className="relative flex gap-2">
            <Textarea
              value={input}
              onChange={handleInputChange}
              placeholder="Escribe los detalles de la cotización..."
              className="min-h-[60px] max-h-[150px] w-full resize-none rounded-xl border-border bg-secondary/30 focus:bg-background focus:ring-primary/20 pr-12 py-3 text-sm shadow-sm transition-all"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleFormSubmit(e as any)
                }
              }}
            />
            <Button
              type="submit"
              disabled={isLoading || !hasInput}
              size="icon"
              className="absolute right-2 bottom-2 h-9 w-9 rounded-lg shadow-sm transition-all hover:scale-105"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Enviar</span>
            </Button>
          </form>
          <div className="mt-2 text-center">
             <p className="text-xs text-muted-foreground/60">
               Presiona <kbd className="font-sans font-semibold text-foreground/80">Enter</kbd> para enviar.
             </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
