'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Building2, 
  Users, 
  Settings,
  Home,
  Gift
} from 'lucide-react'

const menuItems = [
  { href: '/companies', label: 'Entreprises', icon: Building2 },
  { href: '/users', label: 'Utilisateurs', icon: Users },
  { href: '/rewards', label: 'Récompenses', icon: Gift },
  { href: '/app-config', label: 'Config Globale', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:block w-64 bg-surface border-r border-border min-h-[calc(100vh-4rem)] fixed left-0 top-16">
      <nav className="p-4 space-y-2">
        <Link
          href="/stats"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            pathname === '/stats'
              ? 'bg-primary/10 text-primary font-semibold'
              : 'text-text-secondary hover:bg-gray-50'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>
        
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-text-secondary hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
