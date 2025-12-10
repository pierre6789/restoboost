import { LoginForm } from '@/components/login-form'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Logo } from '@/components/logo'
import { Suspense } from 'react'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
      <Navbar />
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-5rem)]">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-10 space-y-6 border border-gray-100">
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-4">
                <Logo href={undefined} width={200} height={80} />
              </div>
              <h1 className="text-3xl font-bold text-[#2C2C2C]">Connexion</h1>
              <p className="text-gray-600">Accédez à votre tableau de bord</p>
            </div>

          <Suspense fallback={<div className="text-center py-4">Chargement...</div>}>
            <LoginForm />
          </Suspense>

          <div className="text-center text-sm">
            <span className="text-gray-600">Pas encore de compte ? </span>
            <Link
              href="/signup"
              className="text-[#FF6B35] hover:text-[#E55A2B] font-medium"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

