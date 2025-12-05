import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get stats
  const { count: totalQuotations } = await supabase
    .from('quotations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id)

  const { data: latestQuotation } = await supabase
    .from('quotations')
    .select('cliente, folio, created_at')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-[0.4em] text-primary/70">Resumen ejecutivo</span>
        <h1 className="text-4xl font-semibold text-foreground">Estado general de tu operación</h1>
        <p className="max-w-2xl text-sm text-foreground/70">
          Mantén a tu equipo alineado: folios, clientes y documentos en un panel diseñado para decisiones rápidas.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-slate-800/80">
          <CardHeader>
            <CardTitle className="text-xs uppercase tracking-[0.35em] text-foreground/60">
              Total de cotizaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-semibold text-primary">{totalQuotations || 0}</div>
            <p className="mt-2 text-sm text-foreground/60">Documentos registrados durante todo el ciclo.</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800/80">
          <CardHeader>
            <CardTitle className="text-xs uppercase tracking-[0.35em] text-foreground/60">
              Última actualización
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestQuotation ? (
              <div className="space-y-1">
                <div className="text-lg font-semibold text-foreground">{latestQuotation.cliente}</div>
                <div className="text-sm font-mono text-foreground/60">{latestQuotation.folio}</div>
                <p className="text-xs text-foreground/50">Actualizada el {new Date(latestQuotation.created_at).toLocaleDateString()}</p>
              </div>
            ) : (
              <div className="text-sm text-foreground/50">Sin cotizaciones aún</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-800/80">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Generar una nueva cotización</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-foreground/70">
              Usa el asistente conversacional para capturar condiciones, precios y políticas. Obtendrás un documento coherente, listo para revisión o envío.
            </p>
            <Link href="/dashboard/nueva">
              <Button size="lg" className="w-full sm:w-auto">
                Crear nueva cotización
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-slate-800/80">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Revisar historial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-foreground/70">
              Consulta PDFs, versiones previas y estado de cada folio. Actualiza sólo lo necesario y mantiene el contexto siempre disponible.
            </p>
            <Link href="/dashboard/cotizaciones">
              <Button variant="outline" size="lg" className="w-full border-slate-700 sm:w-auto">
                Ver todas las cotizaciones
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
