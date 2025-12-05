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

  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [menuOpen])

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-8">
          
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-90">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
              C
            </div>
            <span className="text-xl font-bold tracking-tight">Cotiza</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
             <div className="h-4 w-px bg-border mx-2" />
             <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Salir
             </Button>
          </nav>

          {/* Mobile Hamburger Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </header>

      {/* Mobile Full Screen Overlay Menu */}
      <div
        className={cn(
            "fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm transition-all duration-300 lg:hidden",
            menuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}
      >
        {/* Close Button */}
        <div className="flex justify-end p-4">
             <Button variant="ghost" size="icon" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú">
                <X className="h-8 w-8" />
             </Button>
        </div>

        {/* Menu Links */}
        <nav className="flex flex-1 flex-col items-center justify-center gap-8 p-6">
             {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-3xl font-bold tracking-tight transition-colors hover:text-primary",
                  pathname === item.href ? "text-primary" : "text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
             <div className="h-px w-20 bg-border my-4" />
             <Button variant="outline" size="lg" className="w-full max-w-xs" onClick={() => setMenuOpen(false)}>
                Salir de la sesión
             </Button>
        </nav>
      </div>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-8 md:py-12">
        {children}
      </main>
    </div>
  )
}
