"use client"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { WellsList } from "@/components/wells-list"

export default function WellsPage() {
  return (
    <LayoutWrapper activeRoute="wells-list">
      <div className="p-6">
        <WellsList />
      </div>
    </LayoutWrapper>
  )
}
