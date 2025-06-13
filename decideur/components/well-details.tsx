"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, DollarSign, Clock, FileText, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { WellCostSummary } from "@/components/well-cost-summary"
import { WellDelaySummary } from "@/components/well-delay-summary"
import { WellReports } from "@/components/well-reports"

interface WellDetailsProps {
  wellId: string
}

const wellData = {
  "1": {
    id: "0145 R1",
    name: "Puit 0145 R1",
    region: "R1",
    phase: '26"',
    cost: "3800 $",
    delay: "69 Jours",
    status: "En cours",
    plannedDays: 69,
    actualDays: 69,
    sections: [
      { name: "1st Section", size: "1st 36 Casing @ 350M", depth: 350 },
      { name: '12"1/4 Section', size: '9"5/8 Casing @ 6250M', depth: 6250 },
    ],
    objectives: ["Dv3", "Dv2", "Dv1", "Ord2", "Ord1"],
    progress: {
      cost: 75,
      delay: 85,
    },
  },
}

export function WellDetails({ wellId }: WellDetailsProps) {
  const [activeTab, setActiveTab] = useState("visualisation")

  const well = wellData[wellId as keyof typeof wellData] || wellData["1"]

  const sidebarItems = [
    { id: "visualisation", label: "Visualisation", icon: BarChart3 },
    { id: "cout", label: "Coût", icon: DollarSign },
    { id: "delai", label: "Délai", icon: Clock },
    { id: "rapport", label: "Rapport", icon: FileText },
  ]

  const renderVisualisationContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Visualisation de l'avancement globale des ph</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-80 bg-yellow-50 rounded-lg p-4">
              {/* Chart Grid */}
              <div className="absolute inset-4 grid grid-cols-8 grid-rows-6 gap-1">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div key={i} className="border border-yellow-200"></div>
                ))}
              </div>

              {/* Chart Line */}
              <svg className="absolute inset-4 w-full h-full">
                <polyline
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="3"
                  points="0,20 60,80 120,120 180,160 240,200 300,240"
                />
                {/* Data Points */}
                <circle cx="60" cy="80" r="4" fill="#dc2626" />
                <circle cx="120" cy="120" r="4" fill="#dc2626" />
                <circle cx="180" cy="160" r="4" fill="#dc2626" />
                <circle cx="240" cy="200" r="4" fill="#dc2626" />
                <circle cx="300" cy="240" r="4" fill="#dc2626" />
              </svg>

              {/* Labels */}
              <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded text-sm font-medium">
                Planned : 69 Days
              </div>

              <div className="absolute left-4 top-1/4 text-sm text-gray-600 transform -rotate-90 origin-center">
                Profondeur (m)
              </div>

              <div className="absolute bottom-8 left-8 text-xs text-gray-600">
                1st Section
                <br />
                1st 36 Casing @ 350M
              </div>

              <div className="absolute bottom-8 left-32 text-xs text-gray-600">
                12"1/4 Section
                <br />
                9"5/8 Casing @ 6250M
              </div>

              <div className="absolute bottom-4 right-8 text-xs text-gray-600">
                -06 Cores will be cut in
                <br />
                the Devonian and Ordovician
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Well Architecture */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Architecture du sondage du puit {well.id}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-around items-start h-[400px] ">
              <div className="flex flex-col items-start h-full top-10 w-1/6 gap-[80px]">
               <div className="flex flex-col items-center gap-[42px]">
              <p className="font-semibold">26’’</p>
              <p className="font-semibold"> 16’’</p>
              <p className="font-semibold"> 12’’1/4 </p>
              </div>
              <p className="font-semibold">8’’1/2 </p></div>
    <div className=" h-[400px]   w-4/6 flex items-start ">
      <div className="relative w-full h-[300px] ">
        {/* Parois verticales noires */}
        {/* <div className="absolute left-1/3 w-[4px] h-full bg-black" />
        <div className="absolute right-1/3 w-[4px] h-full bg-black" /> */}

        {/* Parois vertes - les extérieures sont plus petites */}
{/* Parois vertes gauche */}
<div className="absolute left-[67px] w-[20px]  h-[60px] top-0 bg-green-600 z-10" />
<div className="absolute left-[91px] w-[20px] h-[105px] top-0 bg-green-600 z-10" />
<div className="absolute left-[115px] w-[20px] h-[150px] top-0 bg-green-600 z-10" />


{/* Parois vertes droite */}
<div className="absolute right-0 w-[20px]  h-[60px] top-0 bg-green-600 z-10" />
<div className="absolute right-[24px] w-[20px] h-[105px] top-0 bg-green-600 z-10" />
<div className="absolute right-[48px] w-[20px] h-[150px] top-0 bg-green-600 z-10" />


        {/* Flèches noires */}
        {/* <div className="absolute left-1 top-[100px] w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[20px] border-t-black rotate-90" />
        <div className="absolute right-1 top-[100px] w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[20px] border-t-black -rotate-90" /> */}

        {/* Corps du puits */}
        <div className="absolute right-[70px] top-[150px] w-1/4 h-[250px] bg-white border-2 border-black">
          {/* R1 R2 R3 + barres jaunes */}
          <div className="absolute top-[200px] left-1/2 -translate-x-1/2 text-sm">R1</div>
          <div className="absolute top-[130px] left-1/2 -translate-x-1/2 text-sm">R2</div>
          <div className="absolute top-[60px] left-1/2 -translate-x-1/2 text-sm">R3</div>

          {[60, 130, 200].map((top, i) => (
            <div key={i}>
              <div className="absolute left-[-25px] w-[30px] h-[8px] bg-yellow-400" style={{ top: `${top}px` }} />
              <div className="absolute right-[-25px] w-[30px] h-[8px] bg-yellow-400" style={{ top: `${top}px` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>

 

          </CardContent>
        </Card>
      </div>

      {/* Cost and Delay Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Délai & Coût du sondage global</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Cost */}
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Coût</h3>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="#f3f4f6" strokeWidth="12" fill="none" />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#f59e0b"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${well.progress.cost * 3.51} 351`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{well.cost}</span>
                </div>
              </div>
              <Button variant="link" className="text-blue-600">
                <Eye className="w-4 h-4 mr-1" />
                View details
              </Button>
            </div>

            {/* Delay */}
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Délai</h3>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="#f3f4f6" strokeWidth="12" fill="none" />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#10b981"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${well.progress.delay * 3.51} 351`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{well.delay}</span>
                </div>
              </div>
              <Button variant="link" className="text-blue-600">
                <Eye className="w-4 h-4 mr-1" />
                View details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case "visualisation":
        return renderVisualisationContent()
      case "cout":
        return <WellCostSummary wellId={well.id} />
      case "delai":
        return <WellDelaySummary wellId={well.id} />
      case "rapport":
        return <WellReports wellId={well.id} />
      default:
        return renderVisualisationContent()
    }
  }

  const getPageTitle = () => {
    switch (activeTab) {
      case "cout":
        return `Sommaire des coûts du puit ${well.id}`
      case "delai":
        return `Sommaire des délais du puit ${well.id}`
      case "rapport":
        return `Rapports du puit ${well.id}`
      default:
        return `Visualisation de l'avancement globale des phases du puit ${well.id}`
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-orange-600 to-orange-800 rounded-tr-3xl text-white">
        <nav className="mt-8">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center px-6 py-4 text-left hover:bg-orange-700 transition-colors",
                  activeTab === item.id && "bg-orange-700 border-r-4 border-white",
                )}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
        </div>
        <main className="flex-1 overflow-auto p-6">{renderTabContent()}</main>
      </div>
    </div>
  )
}
