'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Create auth user - el trigger creará automáticamente el perfil y settings
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      })

      if (signUpError) throw signUpError

      if (data.user) {
        // Check if email confirmation is required
        if (data.user.identities && data.user.identities.length === 0) {
          // Email confirmation required but user already exists
          setError('Este email ya está registrado. Por favor inicia sesión.')
        } else if (data.session) {
          // User is logged in immediately (email confirmation disabled)
          router.push('/dashboard')
          router.refresh()
        } else {
          // Email confirmation required
          setSuccess(true)
        }
      }
    } catch (error: any) {
      setError(error.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  // If registration was successful and email confirmation is required
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>¡Registro Exitoso!</CardTitle>
            <CardDescription>
              Revisa tu email para confirmar tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-800">
              <p className="font-medium mb-2">Te hemos enviado un email de confirmación</p>
              <p className="text-green-700">
                Por favor revisa tu bandeja de entrada (y spam) en <strong>{email}</strong> y
                haz click en el enlace de confirmación para activar tu cuenta.
              </p>
            </div>
            <div className="text-center">
              <Link href="/login" className="text-blue-600 hover:underline text-sm">
                Volver al inicio de sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Crear Cuenta</CardTitle>
          <CardDescription>
            Regístrate para comenzar a crear cotizaciones con IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nombre
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
            <p className="text-center text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                Inicia sesión
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
