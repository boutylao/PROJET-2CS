"use client"

import { Search, Settings, Bell } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface GlobalHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function GlobalHeader({ searchQuery, onSearchChange }: GlobalHeaderProps) {
  return (
    <header className="fixed top-0 left-0  z-index: 1000 right-0 z-500 bg-white  px-6 py-4">
      <div className="flex items-center justify-between max-w-full">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm"></div>
          </div>
          <span className="text-xl font-semibold text-gray-900">sonatrach</span>
        </div>

        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="fixed left-3 top-1/2 transform -translate-y-1/2 z-50 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search for something"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></span>
          </Button>

          <Avatar>
            <AvatarImage src="/placeholder.svg?height=32&width=32" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
