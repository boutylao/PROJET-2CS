"use client"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { Settings } from "@/components/settings"

export default function SettingsPage() {
  return (
    <LayoutWrapper activeRoute="settings">
      <div className="p-6">
        <Settings />
      </div>
    </LayoutWrapper>
  )
}
