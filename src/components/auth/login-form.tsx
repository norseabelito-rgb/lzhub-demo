'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'

import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email-ul este obligatoriu')
    .email('Adresa de email nu este valida'),
  password: z
    .string()
    .min(1, 'Parola este obligatorie')
    .min(6, 'Parola trebuie sa aiba cel putin 6 caractere'),
})

type LoginFormData = z.infer<typeof loginSchema>

// Test accounts for development
const testAccounts = [
  { email: 'manager@laserzone.ro', password: 'manager123', label: 'Manager' },
  { email: 'angajat@laserzone.ro', password: 'angajat123', label: 'Angajat' },
  { email: 'nou@laserzone.ro', password: 'nou123', label: 'Angajat Nou' },
]

export function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setError(null)

    const result = await login(data)

    if (result.success) {
      router.push('/')
    } else {
      setError(result.error || 'A aparut o eroare la autentificare')
    }
  }

  const fillTestAccount = (email: string, password: string) => {
    setValue('email', email)
    setValue('password', password)
    setError(null)
  }

  return (
    <Card className="w-full max-w-md border-glow hover:glow-primary transition-all duration-300">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-display text-primary">Autentificare</CardTitle>
        <CardDescription>
          Introduceti datele de autentificare pentru a continua
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="exemplu@laserzone.ro"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <Label htmlFor="password">Parola</Label>
            <Input
              id="password"
              type="password"
              placeholder="Introduceti parola"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Submit button */}
          <Button type="submit" variant="glow" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                Se autentifica...
              </>
            ) : (
              'Autentificare'
            )}
          </Button>
        </form>

        {/* Dev helper - test accounts */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 border-t pt-4">
            <p className="mb-3 text-center text-xs text-muted-foreground">
              Conturi de test (doar in dezvoltare)
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {testAccounts.map((account) => (
                <Button
                  key={account.email}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillTestAccount(account.email, account.password)}
                >
                  {account.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
