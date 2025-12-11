import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminUserPlanForm } from './admin-user-plan-form'

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin (you can customize this logic)
  // For now, we'll allow any authenticated user to access this page
  // In production, you should add an 'is_admin' field to profiles table

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          <span className="text-[#2C2C2C]">Administration</span>
        </h1>
        <p className="text-lg text-gray-600">
          Gérer les plans des utilisateurs
        </p>
      </div>

      <Card className="border border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#2C2C2C]">
            Changer le plan d'un utilisateur
          </CardTitle>
          <CardDescription className="text-base">
            Entrez l'email de l'utilisateur et sélectionnez le nouveau plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminUserPlanForm />
        </CardContent>
      </Card>
    </div>
  )
}

