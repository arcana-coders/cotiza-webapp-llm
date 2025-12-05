'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Download, Eye, Loader2 } from 'lucide-react'

interface QuotationPreviewProps {
  html?: string
  jsonData?: any
  quotationId?: string
}

export function QuotationPreview({ html, jsonData, quotationId }: QuotationPreviewProps) {
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  useEffect(() => {
    if (html) {
      setPreviewHtml(html)
    } else if (jsonData) {
      // Generate HTML from jsonData
      generateHTMLPreview(jsonData)
    }
  }, [html, jsonData])

  const generateHTMLPreview = async (data: any) => {
    try {
      const response = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      })

      if (response.ok) {
        const { html } = await response.json()
        setPreviewHtml(html)
      }
    } catch (error) {
      console.error('Error generating preview:', error)
    }
  }

  const handleGeneratePDF = async () => {
    if (!quotationId) {
      alert('Primero debes guardar la cotización')
      return
    }

    setIsGeneratingPDF(true)
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          quotationId,
          quotationData: jsonData 
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error generating PDF')
      }

      // Response is a PDF blob
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cotizacion-${jsonData?.folio}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error al generar PDF: ' + (error as Error).message)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  if (!previewHtml && !jsonData) {
    return (
      <Card className="h-full gap-0 border border-slate-800/90 bg-slate-950/50 py-0 backdrop-blur">
        <CardHeader className="border-b border-slate-800/60 pb-4 pt-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-foreground/60">
              <Eye className="h-5 w-5 text-primary" />
              Preview
            </CardTitle>
            <Badge variant="outline" className="border-slate-700 text-foreground/60">
              En espera
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex h-[500px] flex-col items-center justify-center gap-3 text-foreground/60">
          <FileText className="mb-2 h-14 w-14 text-primary/60" />
          <p className="text-sm font-medium text-foreground/70">Sin preview aún</p>
          <p className="max-w-xs text-center text-xs text-foreground/50">
            El resultado aparecerá aquí cuando el asistente termine de generar la cotización.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex h-full flex-col gap-0 border border-slate-800/90 bg-slate-950/50 py-0 backdrop-blur">
      <CardHeader className="border-b border-slate-800/60 pb-4 pt-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-800/80 bg-secondary/40 text-primary">
              <Eye className="h-4 w-4" />
            </span>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">Preview</CardTitle>
              <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">Documento generado</p>
            </div>
            {jsonData && (
              <Badge variant="outline" className="border-slate-700 text-foreground/60">
                {jsonData.folio}
              </Badge>
            )}
          </div>
          <Button
            onClick={handleGeneratePDF}
            disabled={isGeneratingPDF || !quotationId}
            size="sm"
            variant="outline"
            className="border-slate-700 bg-secondary/40 text-foreground/80 hover:text-primary"
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Generar PDF
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden p-6 pb-8">
        {/* Preview iframe */}
        <div className="flex-1 overflow-hidden rounded-2xl border border-slate-800/80 bg-white">
          {previewHtml ? (
            <iframe
              srcDoc={previewHtml}
              className="h-full w-full"
              title="Quotation Preview"
              sandbox="allow-same-origin"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
            </div>
          )}
        </div>

        {/* Quotation summary */}
        {jsonData && (
          <div className="grid gap-4 rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4 text-sm text-foreground/80 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">Cliente</p>
              <p className="mt-1 font-medium text-foreground">{jsonData.cliente}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">Fecha</p>
              <p className="mt-1 font-medium text-foreground">{jsonData.fecha}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">Folio</p>
              <p className="mt-1 font-mono text-primary">{jsonData.folio}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
