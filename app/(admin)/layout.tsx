import AdminSidebar from '@/components/AdminSidebar'
import AdminHeader from '@/components/AdminHeader'

// Le middleware gère déjà la vérification du super-admin et la redirection
// Pas besoin de vérifier à nouveau ici pour éviter les conflits
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="flex pt-16">
        <AdminSidebar />
        <main className="flex-1 ml-0 lg:ml-64 p-4 lg:p-6 xl:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
