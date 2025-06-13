"use client"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { Profile } from "@/components/profile"

export default function ProfilePage() {
  return (
    <LayoutWrapper activeRoute="profile">
      <div className="p-6">
        <Profile />
      </div>
    </LayoutWrapper>
  )
}
