"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { href: '/dashboard', label: 'Resumen' },
  { href: '/dashboard/nueva', label: 'Nueva cotización' },
  { href: '/dashboard/cotizaciones', label: 'Historial' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleMenu = () => setMenuOpen((prev) => !prev)
  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <nav className="relative border-b border-slate-800/80 bg-slate-900/70 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4">
          <Link href="/dashboard" className="text-lg font-semibold text-foreground">
            Cotiza
          </Link>
          <div className="flex items-center gap-3 text-sm text-foreground/70">
            <span className="rounded-full bg-primary/15 px-3 py-1 text-primary">Activa</span>
            <Button variant="outline" size="sm" className="border-slate-700 bg-secondary/40 text-foreground">
              Salir
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
              aria-controls="dashboard-hamburger-menu"
              className="border border-slate-800/70 bg-secondary/40 text-foreground/70 hover:text-primary"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Hamburger Menu Overlay */}
        {menuOpen && (
          <button
            type="button"
            onClick={closeMenu}
            className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300"
            aria-hidden="true"
          />
        )}

        {/* Hamburger Menu Sidebar */}
        <div
          id="dashboard-hamburger-menu"
          className={cn(
            "fixed right-0 top-0 z-50 h-screen w-full max-w-sm transform transition-transform duration-300 ease-in-out bg-slate-950/95 backdrop-blur border-l border-slate-800/80 flex flex-col overflow-y-auto",
            menuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b border-slate-800/60 px-6 py-4 flex-shrink-0">
            <span className="text-lg font-semibold text-foreground">Menú</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeMenu}
              aria-label="Cerrar menú"
              className="border border-slate-800/70 bg-secondary/40 text-foreground/70 hover:text-primary"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-6">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={cn(
                  "block rounded-lg px-4 py-3 text-sm font-medium uppercase tracking-[0.2em] transition-colors",
                  pathname?.startsWith(item.href)
                    ? "bg-primary/20 text-primary"
                    : "text-foreground/60 hover:bg-secondary/40 hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t border-slate-800/60 space-y-3 px-6 py-6 flex-shrink-0">
            <div className="rounded-full bg-primary/15 px-3 py-2 text-center text-sm text-primary">
              Activa
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-slate-700 bg-secondary/40 text-foreground hover:text-primary"
              onClick={closeMenu}
            >
              Salir
            </Button>
          </div>
        </div>
      </nav>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
