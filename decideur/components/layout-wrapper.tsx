"use client"

import type React from "react"

import { useState } from "react"
import { GlobalHeader } from "@/components/global-header"
import { Sidebar } from "@/components/sidebar"

interface LayoutWrapperProps {
  children: React.ReactNode
  activeRoute: string
  showSidebar?: boolean
}

export function LayoutWrapper({ children, activeRoute, showSidebar = true }: LayoutWrapperProps) {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <div className="pt-20 flex">
        {showSidebar && <Sidebar activeRoute={activeRoute} onRouteChange={() => {}} />}
        <main className={`flex-1 ${showSidebar ? "" : "ml-0"}`}>{children}</main>
      </div>
    </div>
  )
}
