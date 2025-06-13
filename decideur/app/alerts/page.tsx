"use client"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { AlertsNotifications } from "@/components/alerts-notifications"

export default function AlertsPage() {
  return (
    <LayoutWrapper activeRoute="alerts-notifications">
      <div className="p-6">
        <AlertsNotifications />
      </div>
    </LayoutWrapper>
  )
}
