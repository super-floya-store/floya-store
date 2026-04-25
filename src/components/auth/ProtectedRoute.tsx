import { useAuth } from '@/hooks/useAuth'
import { redirect } from 'next/navigation'

export function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) {
    redirect('/login')
    return null
  }

  if (requireAdmin && !['admin', 'super_admin'].includes(user.role)) {
    redirect('/')
    return null
  }

  return <>{children}</>
}
