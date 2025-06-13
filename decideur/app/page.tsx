"use client"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { Dashboard } from "@/components/dashboard"

export default function App() {
  return (
    <LayoutWrapper activeRoute="dashboard">
      <div className="p-6">
        <Dashboard />
      </div>
    </LayoutWrapper>
  )
}
