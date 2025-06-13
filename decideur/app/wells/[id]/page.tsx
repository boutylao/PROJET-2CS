"use client"

import { WellDetails } from "@/components/well-details"
import { GlobalHeader } from "@/components/global-header"
import { useParams } from "next/navigation"
import { useState } from "react"

export default function WellDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <div className="pt-20">
        <WellDetails wellId={id} />
      </div>
    </div>
  )
}
