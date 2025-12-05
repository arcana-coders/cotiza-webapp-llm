'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Eye, Edit2, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Quotation {
  id: string
  folio: string
  cliente: string
  fecha: string
  status: string
  created_at: string
}

export default function AllQuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQuotations()
  }, [])

  const loadQuotations = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('quotations')
        .select('id, folio, cliente, fecha, status, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error
      setQuotations(data || [])
    } catch (error) {
      console.error('Error loading quotations:', error)
      alert('Error al cargar las cotizaciones')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="border border-slate-800/70 bg-secondary/40 text-foreground/70 hover:text-primary">
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Todas las cotizaciones</h1>
          <p className="text-sm text-foreground/60">
            {quotations.length} cotización{quotations.length !== 1 ? 'es' : ''} registrada{quotations.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {quotations.length === 0 ? (
        <Card className="border-slate-800/80">
          <CardContent className="p-12 text-center">
            <p className="mb-4 text-sm text-foreground/70">No hay cotizaciones registradas</p>
            <Button asChild size="lg">
              <Link href="/dashboard/nueva">Crear Nueva Cotización</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {quotations.map((quotation) => (
            <Card
              key={quotation.id}
              className="border-slate-800/80 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(4,10,20,0.45)]"
            >
              <CardContent className="p-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-foreground">
                        {quotation.folio}
                      </h3>
                      <Badge 
                        variant={quotation.status === 'draft' ? 'secondary' : 'default'}
                      >
                        {quotation.status === 'draft' ? 'Borrador' : 'Enviada'}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground/70">
                      Cliente: <span className="font-semibold text-foreground">{quotation.cliente}</span>
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.35em] text-foreground/50">
                      Fecha {new Date(quotation.fecha).toLocaleDateString('es-ES')}
                    </p>
                    <p className="mt-1 text-xs text-foreground/40">
                      Creada {new Date(quotation.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2 md:ml-4">
                    <Button variant="outline" size="sm" asChild className="border-slate-700">
                      <Link href={`/dashboard/cotizaciones/${quotation.id}`}>
                        <Eye className="mr-1 h-4 w-4" />
                        Ver
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="border-slate-700">
                      <Link href={`/dashboard/cotizaciones/${quotation.id}/editar`}>
                        <Edit2 className="mr-1 h-4 w-4" />
                        Editar
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
