import Link from "next/link"
import { ArrowRight, FileText, ShieldCheck, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const highlights = [
  {
    title: "Genera cotizaciones impecables",
    description:
      "Convierte instrucciones coloquiales en documentos listos para enviar en cuestión de segundos.",
    icon: FileText,
  },
  {
    title: "Control sin fricciones",
    description:
      "Administra folios, versiones y PDFs desde un solo panel con trazabilidad completa.",
    icon: ShieldCheck,
  },
  {
    title: "IA que entiende procesos reales",
    description:
      "Entrenada con casos de manufactura y servicios industriales para respuestas precisas y serias.",
    icon: Sparkles,
  },
]

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background font-sans">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              C
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">Cotiza</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link href="/login" className="text-muted-foreground transition-colors hover:text-primary">
              Iniciar sesión
            </Link>
            <Button asChild size="sm">
              <Link href="/register" className="flex items-center gap-2">
                Empezar gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center gap-16 px-4 py-20 md:px-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl space-y-8">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <span className="mr-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Cotizaciones inteligentes 2.0
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">
              Cierra tratos más rápido con <span className="text-primary">propuestas perfectas</span>
            </h1>
            
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              Un asistente diseñado para equipos comerciales exigentes. Cotiza, ajusta y entrega PDFs profesionales en segundos, sin fricción.
            </p>
            
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-8 text-base">
                <Link href="/dashboard/nueva" className="flex items-center gap-2">
                  Crear cotización
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
                <Link href="/dashboard/cotizaciones">
                  Ver demo
                </Link>
              </Button>
            </div>
            
            <div className="grid gap-8 pt-8 sm:grid-cols-3 border-t border-border">
              <div>
                <p className="text-3xl font-bold text-primary">4.7 min</p>
                <p className="text-sm text-muted-foreground">Tiempo promedio</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">120+</p>
                <p className="text-sm text-muted-foreground">Empresas activas</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">92%</p>
                <p className="text-sm text-muted-foreground">Tasa de cierre</p>
              </div>
            </div>
          </div>

          <div className="w-full max-w-lg space-y-6 lg:pt-12">
            {highlights.map(({ title, description, icon: Icon }) => (
              <Card key={title} className="border-border bg-card shadow-sm transition-all hover:shadow-md">
                <CardContent className="flex items-start gap-4 p-6">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-t border-border bg-muted/30 py-20">
          <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 md:px-8 md:grid-cols-3">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Para equipos serios</h2>
              <p className="text-muted-foreground leading-relaxed">
                Mantén consistencia en precios, políticas y alcance sin sacrificar velocidad. Ideal para consultoras y manufactura.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground text-lg">Integridad total</h3>
              <p className="text-muted-foreground leading-relaxed">
                Historial de versiones automático, bloqueo de folios duplicados y plantillas listas para auditoría interna.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground text-lg">Entrega profesional</h3>
              <p className="text-muted-foreground leading-relaxed">
                PDFs en formato limpio y equilibrado, optimizados para impresión o lectura digital, sin necesidad de diseño manual.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
