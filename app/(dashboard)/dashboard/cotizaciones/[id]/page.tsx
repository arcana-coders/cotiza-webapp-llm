'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, Loader2 } from 'lucide-react'
import Link from 'next/link'

type Quotation = {
  id: string
  folio: string
  cliente: string
  fecha: string
  status: string
  html: string | null
  json_data: unknown
}

export default function QuotationDetailPage() {
  const params = useParams()
  const quotationId = params.id as string
  
  const [quotation, setQuotation] = useState<Quotation | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

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

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true)
    try {
      if (!quotation?.json_data) {
        alert('Datos de cotización incompletos')
        return
      }

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          quotationId,
          quotationData: quotation.json_data,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error generating PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cotizacion-${quotation.folio}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert(`Error al generar el PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setIsGeneratingPDF(false)
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
        <Card className="border-slate-800/80">
          <CardContent className="space-y-4 p-10 text-center">
            <p className="text-sm text-foreground/70">Cotización no encontrada</p>
            <Button asChild size="lg">
              <Link href="/dashboard">Volver al Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="border border-slate-800/70 bg-secondary/40 text-foreground/70 hover:text-primary">
            <Link href="/dashboard/cotizaciones">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-[0.4em] text-foreground/50">Folio</span>
            <h1 className="text-3xl font-semibold text-foreground">{quotation.folio}</h1>
            <p className="text-sm text-foreground/60">Cliente {quotation.cliente}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Badge variant={quotation.status === 'draft' ? 'secondary' : 'default'}>
            {quotation.status === 'draft' ? 'Borrador' : 'Enviada'}
          </Badge>
          <Button variant="outline" asChild className="border-slate-700 bg-secondary/40">
            <Link href={`/dashboard/cotizaciones/${quotationId}/editar`}>
              Ajustar detalles
            </Link>
          </Button>
          <Button 
            onClick={handleGeneratePDF}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Descargar PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Preview */}
      <Card className="border-slate-800/80">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Vista previa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex w-full justify-center overflow-auto">
            <div className="w-[816px] max-w-full overflow-hidden rounded-2xl border border-slate-800/60 bg-white shadow-[0_24px_60px_rgba(4,10,20,0.35)]">
              <iframe
                srcDoc={quotation.html ?? undefined}
                className="h-[1056px] w-full border-0"
                title="Vista previa de la cotización"
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* JSON Data */}
      <Card className="border-slate-800/80">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Datos JSON</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="max-h-96 overflow-auto rounded-xl border border-slate-800/60 bg-slate-900/50 p-4 text-xs text-foreground/70">
            {JSON.stringify(quotation.json_data, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
