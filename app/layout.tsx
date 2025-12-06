import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Cotiza | Asistente de Cotizaciones Inteligente",
  description:
    "Cotiza y gestiona propuestas profesionales con un asistente serio, veloz y diseñado para equipos comerciales exigentes.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const currentYear = new Date().getFullYear()

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body
        suppressHydrationWarning
        className="antialiased bg-background text-foreground font-['Inter',sans-serif]"
      >
        <div className="flex min-h-screen flex-col bg-background">
          <div className="flex-1">
            {children}
          </div>
          <footer className="border-t border-border bg-muted/20">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <p className="text-center sm:text-left">
                © {currentYear} Cotiza. Todos los derechos reservados.
              </p>
              <p className="flex items-center justify-center gap-1 text-center sm:justify-end">
                Desarrollada con <span aria-hidden="true" className="text-primary">♥</span> por
                <a
                  href="https://tecnomata.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary hover:text-primary/80"
                >
                  Tecnómata
                </a>
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
