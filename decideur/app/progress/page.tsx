"use client"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { ProgressStatus } from "@/components/progress-status"

export default function ProgressPage() {
  return (
    <LayoutWrapper activeRoute="progress-status">
      <div className="p-6">
        <ProgressStatus />
      </div>
    </LayoutWrapper>
  )
}
