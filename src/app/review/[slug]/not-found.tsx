export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">404</h1>
        <p className="text-gray-600">Restaurant non trouvé</p>
        <p className="text-sm text-gray-500">
          Ce restaurant n'existe pas ou a été supprimé.
        </p>
      </div>
    </div>
  )
}

