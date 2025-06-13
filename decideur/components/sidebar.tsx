"use client"

import { cn } from "@/lib/utils"
import { LayoutDashboard, List, TrendingUp, Bell, User, Settings } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

interface SidebarProps {
  activeRoute: string
  onRouteChange: (route: string) => void
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { id: "wells-list", label: "Liste Puits", icon: List, path: "/wells" },
  { id: "progress-status", label: "Etat d'avancement", icon: TrendingUp, path: "/progress" },
  { id: "alerts-notifications", label: "Alertes et Notifications", icon: Bell, path: "/alerts" },
  { id: "profile", label: "Profil", icon: User, path: "/profile" },
]

export function Sidebar({ activeRoute, onRouteChange }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleNavigation = (route: string, path: string) => {
    onRouteChange(route)
    router.push(path)
  }

  const getActiveRoute = () => {
    switch (pathname) {
      case "/":
        return "dashboard"
      case "/wells":
        return "wells-list"
      case "/progress":
        return "progress-status"
      case "/alerts":
        return "alerts-notifications"
      case "/profile":
        return "profile"
      case "/settings":
        return "settings"
      default:
        return activeRoute
    }
  }

  const currentActiveRoute = getActiveRoute()

  return (
    <div className="w-[260px] bg-slate-800 z-50  h-screen fixed text-white rounded-tr-3xl">
      <nav className="mt-8">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id, item.path)}
              className={cn(
                "w-full flex items-center px-6 py-3 text-left hover:bg-slate-700 transition-colors",
                currentActiveRoute === item.id && "bg-slate-700 border-r-2 border-blue-400",
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
