'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { QuotationPreview } from '@/components/chat/QuotationPreview'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import type { CotizacionData } from '@/shared/types'

type Quotation = {
  id: string
  folio: string
  cliente: string
  fecha: string
  status: string
  html: string | null
  json_data: CotizacionData
}

export default function EditQuotationPage() {
  const params = useParams()
  const quotationId = params.id as string
  
  const [quotation, setQuotation] = useState<Quotation | null>(null)
  const [loading, setLoading] = useState(true)
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [quotationData, setQuotationData] = useState<CotizacionData | null>(null)

  const loadQuotation = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .eq('id', quotationId)
        .single()

      if (error) throw error
      
      setQuotation(data)
      setPreviewHtml(data.html || '')
      setQuotationData(data.json_data)
    } catch (error) {
      console.error('Error loading quotation:', error)
      alert('Error al cargar la cotización')
    } finally {
      setLoading(false)
    }
  }, [quotationId])

  useEffect(() => {
    loadQuotation()
  }, [loadQuotation])

  const handleQuotationUpdate = (html: string, jsonData: CotizacionData, newQuotationId?: string) => {
    if (html) {
      setPreviewHtml(html)
    }
    if (jsonData) {
      setQuotationData(jsonData)
    }
    // Reload quotation data after update
    if (newQuotationId === quotationId) {
      loadQuotation()
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!quotation) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-4 text-center">
          <p className="text-sm text-foreground/70">Cotización no encontrada</p>
          <Button asChild size="lg">
            <Link href="/dashboard">Volver al Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="border border-slate-800/70 bg-secondary/40 text-foreground/70 hover:text-primary">
          <Link href={`/dashboard/cotizaciones/${quotationId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-[0.4em] text-foreground/50">Edición asistida</span>
          <h1 className="text-3xl font-semibold text-foreground">Cotización {quotation.folio}</h1>
          <p className="text-sm text-foreground/60">
            Describe con precisión los ajustes y deja que el asistente los integre sin perder consistencia.
          </p>
        </div>
      </div>

      <div className="grid h-[calc(100vh-220px)] grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chat Interface */}
        <div className="h-full rounded-3xl border border-slate-800/80 bg-slate-900/30 p-2">
          <ChatInterface
            quotationId={quotationId}
            onQuotationUpdate={handleQuotationUpdate}
          />
        </div>

        {/* Preview */}
        <div className="h-full">
          <QuotationPreview
            html={previewHtml}
            jsonData={quotationData}
            quotationId={quotationId}
          />
        </div>
      </div>
    </div>
  )
}
