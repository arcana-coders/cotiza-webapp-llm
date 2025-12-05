import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email')
    .eq('id', user.id)
    .single()

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                Cotiza
              </Link>
              <div className="flex gap-4">
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/nueva"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Nueva Cotización
                </Link>
                <Link
                  href="/dashboard/cotizaciones"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Cotizaciones
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Configuración
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {profile?.name || profile?.email}
              </span>
              <form action={handleSignOut}>
                <Button variant="outline" size="sm" type="submit">
                  Salir
                </Button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
