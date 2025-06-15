"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { ArrowUpDown, Filter } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

interface ReportItem {
  id: string
  phase: string
  depth: string
  date: string
  drillingProgress: string
  day: string
  dailyCosts?: DailyCost  
  plannedOperation: string
  remarks?: string[]
}

interface DailyCost {
  id: number
  name: string
  mudLogging: number
  downwholeTools: number
  drillingMud: number
  solidControl: number
  electricServices: number
  bits: number
  casing: number
  accesoriesCasing: number
  casingTubing: number
  cementing: number
  rigSupervision: number
  communications: number
  waterSupply: number
  waterServices: number
  security: number
  dailyCost: number
  drillingRig: number
}

interface PhaseItem {
  phaseName: string
  coutPrevu: number
  coutReel: number
  delaiPrevu: number
  delaiReel: number
  depassementCout: boolean
  depassementDelai: boolean
  etatCout: string
  etatDelai: string
  couleurCout: string
  couleurDelai: string
}

interface CostItem {
  id: string
  phase: string
  operation: string
  activity: string
  plannedCost: number
  actualCost: number
  depth: string
  costStatus: string
}

interface WellCostSummaryProps {
  wellId: string
}

export function WellCostSummary({ wellId }: WellCostSummaryProps) {
  const [sortBy, setSortBy] = useState("date")
  const [filterOperation, setFilterOperation] = useState("all")
  const [costData, setCostData] = useState<CostItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [reportsData, setReportsData] = useState<ReportItem[]>([])

  const handleOpenDialog = (id: string) => {
    const report = reportsData.find(r => r.id === id)
    if (report) {
      setSelectedReport(report)
      setIsDialogOpen(true)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
  
        // 1. Récupérer les rapports du puits
        const reportsResponse = await fetch(`http://localhost:8098/api/reports/puit/${wellId}`)
        if (!reportsResponse.ok) {
          throw new Error(`Erreur lors de la récupération des rapports: ${reportsResponse.statusText}`)
        }
        const fetchedReportsData: ReportItem[] = await reportsResponse.json()
  
        // 2. Ajouter les coûts quotidiens pour chaque rapport
        const reportsWithCosts = await Promise.all(
          fetchedReportsData.map(async (report) => {
            try {
              const response = await fetch(`http://localhost:8098/api/reports/${report.id}/dailycost`)
              const dailyCosts = response.ok ? await response.json() : null
              return { ...report, dailyCosts: dailyCosts }
            } catch (e) {
              console.error(`Erreur lors du chargement des coûts du rapport ${report.id}`, e)
              return { ...report, dailyCosts: null }
            }
          })
        )
  
        setReportsData(reportsWithCosts)
  
        // 3. Construire les données combinées avec les prévisions par phase
        const combinedData: CostItem[] = await Promise.all(
          reportsWithCosts.map(async (report) => {
            try {
              let phaseName = report.phase.trim()
  
              if (phaseName.includes('26')) phaseName = '26"'
              else if (phaseName.includes('16')) phaseName = '16"'
              else if (phaseName.includes('12')) phaseName = '12"'
              else if (phaseName.includes('8')) phaseName = '8"'
  
              const phaseUrl = `http://localhost:8098/previsions/etat-par-phase/${wellId}/${phaseName}`
              const phaseResponse = await fetch(phaseUrl)
              if (!phaseResponse.ok) {
                return {
                  id: report.id,
                  phase: report.phase,
                  operation: report.plannedOperation || "Opération standard",
                  activity: report.depth || "Profondeur non spécifiée",
                  plannedCost: 0,
                  actualCost: report.dailyCosts?.dailyCost || 0,
                  depth: report.depth || "N/A",
                  costStatus: "Inconnu"
                }
              }
              const phase: PhaseItem = await phaseResponse.json()
  
              return {
                id: report.id,
                phase: report.phase,
                operation: report.plannedOperation || "Opération standard",
                activity: report.depth || "Profondeur non spécifiée",
                plannedCost: phase.coutPrevu,
                actualCost: report.dailyCosts?.dailyCost || 0,
                depth: report.depth || "N/A",
                costStatus: phase.etatCout
              }
            } catch (e) {
              return {
                id: report.id,
                phase: report.phase,
                operation: report.plannedOperation || "Opération standard",
                activity: report.depth || "Profondeur non spécifiée",
                plannedCost: 0,
                actualCost: report.dailyCosts?.dailyCost || 0,
                depth: report.depth || "N/A",
                costStatus: "Erreur"
              }
            }
          })
        )
  
        setCostData(combinedData)
  
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la récupération des données.')
      } finally {
        setLoading(false)
      }
    }
  
    fetchData()
  }, [wellId])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getCostColor = (planned: number, actual: number, status?: string) => {
    if (status) {
      switch (status) {
        case "DANGER": return "text-red-600"
        case "NORMAL": return "text-green-600"
        case "ATTENTION": return "text-orange-500"
        case "Inconnu": return "text-gray-500"
        case "Erreur": return "text-red-800"
        default: break
      }
    }

    if (actual === 0) return "text-gray-400"
    if (actual < planned) return "text-green-600"
    if (actual > planned * 1.1) return "text-red-600"
    if (actual > planned) return "text-orange-500"
    return "text-gray-900"
  }

  const filteredData = costData.filter((item) => {
    if (filterOperation === "all") return true
    if (filterOperation === "operation1") return item.operation.includes("Opération")
    return true
  })

  const sortedData = [...filteredData].sort((a, b) => {
    switch (sortBy) {
      case "phase":
        return a.phase.localeCompare(b.phase)
      case "cost":
        return b.actualCost - a.actualCost
      case "operation":
        return a.operation.localeCompare(b.operation)
      case "date":
        return 0
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement des données...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">Erreur: {error}</div>
      </div>
    )
  }

  const totalPlanned = costData.reduce((sum, item) => sum + item.plannedCost, 0)
  const totalActual = costData.reduce((sum, item) => sum + item.actualCost, 0)

  return (
    <div className="space-y-6 p-6">
      {/* <h1 className="text-2xl font-bold text-gray-900">Sommaire des coûts du puit {wellId}</h1> */}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="w-64">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full">
              <div className="flex items-center">
                <ArrowUpDown className="mr-2 h-4 w-4 text-orange-500" />
                <span>Trier Par: {sortBy === "date" ? "Date" : sortBy === "phase" ? "Phase" : sortBy === "cost" ? "Coût" : "Opération"}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="phase">Phase</SelectItem>
              <SelectItem value="cost">Coût</SelectItem>
              <SelectItem value="operation">Opération</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-64">
          <Select value={filterOperation} onValueChange={setFilterOperation}>
            <SelectTrigger className="w-full">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4 text-orange-500" />
                <span>
                  Filtre:{" "}
                  {filterOperation === "all" ? "Toutes" : filterOperation === "operation1" ? "Opération 1" : "Autre"}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="operation1">Opération 1</SelectItem>
              <SelectItem value="operation2">Opération 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cost Summary Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-600 border-b">Id</th>
                  <th className="text-left p-4 font-medium text-gray-600 border-b">Phase</th>
                  <th className="text-left p-4 font-medium text-gray-600 border-b">Opération</th>
                  <th className="text-left p-4 font-medium text-gray-600 border-b">Coût Actuel</th>
                  <th className="text-left p-4 font-medium text-gray-600 border-b">Coût Prévisionnel</th>
                  <th className="text-left p-4 font-medium text-gray-600 border-b">Statut</th>
                  <th className="text-left p-4 font-medium text-gray-600 border-b">Détail</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 border-b">
                     <td className="p-4 text-sm">{item.id}</td>
                    <td className="p-4 font-medium text-sm">{item.phase}</td>
                    <td className="p-4 text-sm">{item.operation}</td>
                    <td className={`p-4 ${getCostColor(item.plannedCost, item.actualCost, item.costStatus)}`}>
                      {formatCurrency(item.actualCost)}
                    </td>
                    <td className="p-4 text-orange-600">{formatCurrency(item.plannedCost)}</td>

                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.costStatus === "DANGER" ? "bg-red-100 text-red-600" :
                        item.costStatus === "NORMAL" ? "bg-green-100 text-green-800" :
                        item.costStatus === "ATTENTION" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {item.costStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleOpenDialog(item.id)}>
                        <ChevronRight className="w-4 h-4 text-gray-600 hover:text-black" />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Total Row */}
                <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                  <td colSpan={3} className="p-4 text-right font-bold">Total</td>
                  <td className="p-4 font-bold">{formatCurrency(totalPlanned)}</td>
                  <td className={`p-4 font-bold ${getCostColor(totalPlanned, totalActual)}`}>
                    {formatCurrency(totalActual)}
                  </td>
                  <td className="p-4"></td>
                  <td className="p-4"></td>
                </tr>
              </tbody>
            </table>

            {/* Dialog pour afficher les détails des coûts quotidiens */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-h-[70vh] flex flex-col max-w-2xl">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle>
                    <p className="text-orange-600 text-xl">Détails des coûts quotidiens</p>
                  </DialogTitle>
                </DialogHeader>
                
                <div className="flex-1 overflow-y-auto pr-3">
                  {selectedReport && selectedReport.dailyCosts && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><strong>ID du rapport :</strong> {selectedReport.id}</p>
                          <p><strong>Phase :</strong> {selectedReport.phase}</p>
                          <p><strong>Date :</strong> {selectedReport.date}</p>
                          <p><strong>Profondeur :</strong> {selectedReport.depth} ft</p>
                        </div>
                        <div>
                          <p><strong>Nom :</strong> {selectedReport.dailyCosts.name}</p>
                          <p><strong>Coût total quotidien :</strong> 
                            <span className="text-lg font-bold text-blue-600 ml-2">
                              {formatCurrency(selectedReport.dailyCosts.dailyCost)}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-orange-600 mb-3">Détail des coûts par catégorie :</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="space-y-2">
                          <p><strong>Drilling Mud :</strong> {formatCurrency(selectedReport.dailyCosts.drillingMud)}</p>

                            <p><strong>Mud Logging :</strong> {formatCurrency(selectedReport.dailyCosts.mudLogging)}</p>
                            <p><strong>Solid Control :</strong> {formatCurrency(selectedReport.dailyCosts.solidControl)}</p>
                            <p><strong>Rig Supervision :</strong> {formatCurrency(selectedReport.dailyCosts.rigSupervision)}</p>
                            <p><strong>Water Supply :</strong> {formatCurrency(selectedReport.dailyCosts.waterSupply)}</p>
                            <p><strong>Water Services :</strong> {formatCurrency(selectedReport.dailyCosts.waterServices)}</p>
                            <p><strong>Security :</strong> {formatCurrency(selectedReport.dailyCosts.security)}</p>
                            <p><strong>Downwhole Tools :</strong> {formatCurrency(selectedReport.dailyCosts.downwholeTools)}</p>

                          </div>
                          <div className="space-y-2">
                            <p><strong>Electric Services :</strong> {formatCurrency(selectedReport.dailyCosts.electricServices)}</p>
                            <p><strong>Bits :</strong> {formatCurrency(selectedReport.dailyCosts.bits)}</p>
                            <p><strong>Casing :</strong> {formatCurrency(selectedReport.dailyCosts.casing)}</p>
                            <p><strong>Accessories Casing :</strong> {formatCurrency(selectedReport.dailyCosts.accesoriesCasing)}</p>
                            <p><strong>Casing Tubing :</strong> {formatCurrency(selectedReport.dailyCosts.casingTubing)}</p>
                            <p><strong>Cementing :</strong> {formatCurrency(selectedReport.dailyCosts.cementing)}</p>
                            <p><strong>Communications :</strong> {formatCurrency(selectedReport.dailyCosts.communications)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedReport && !selectedReport.dailyCosts && (
                    <p className="text-gray-500">Aucun coût quotidien disponible pour ce rapport.</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Cost Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Coût Total Prévu</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalPlanned)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Coût Total Actuel</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className={`text-2xl font-bold ${getCostColor(totalPlanned, totalActual)}`}>
              {formatCurrency(totalActual)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Variance</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className={`text-2xl font-bold ${getCostColor(totalPlanned, totalActual)}`}>
              {totalActual > totalPlanned ? "+" : ""}
              {formatCurrency(totalActual - totalPlanned)}
            </div>
            <div className="text-sm text-gray-500">
              {totalPlanned !== 0 ? (((totalActual - totalPlanned) / totalPlanned) * 100).toFixed(1) : "0"}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition des Coûts par Phase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedData.map((item) => {
              const percentage = totalActual !== 0 ? (item.actualCost / totalActual) * 100 : 0
              return (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="w-16 text-sm font-medium">{item.phase}</div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.operation}</span>
                      <span className={getCostColor(item.plannedCost, item.actualCost, item.costStatus)}>
                        {formatCurrency(item.actualCost)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          item.actualCost > item.plannedCost ? "bg-red-500" : "bg-green-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-16 text-sm text-gray-500">{percentage.toFixed(1)}%</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Cost Timeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Comparaison Coûts Prévus vs Réels par Phase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {sortedData.map((item) => {
              const maxCost = Math.max(item.plannedCost, item.actualCost, 1)
              const plannedWidth = (item.plannedCost / maxCost) * 100
              const actualWidth = (item.actualCost / maxCost) * 100

              return (
                <div key={item.id} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="font-medium">
                      {item.phase} - {item.operation}
                    </div>
                    <div className="flex space-x-4">
                      <div className="text-gray-600">Prévu: {formatCurrency(item.plannedCost)}</div>
                      <div className={getCostColor(item.plannedCost, item.actualCost, item.costStatus)}>
                        Réel: {formatCurrency(item.actualCost)}
                      </div>
                    </div>
                  </div>
                  <div className="relative h-6">
                    {/* Planned Bar */}
                    <div
                      className="absolute top-0 left-0 h-3 bg-blue-200 rounded-full"
                      style={{ width: `${plannedWidth}%` }}
                    ></div>
                    {/* Actual Bar */}
                    <div
                      className={`absolute bottom-0 left-0 h-3 rounded-full ${
                        item.actualCost === 0 ? "bg-gray-300" :
                        item.actualCost > item.plannedCost ? "bg-red-500" : "bg-green-500"
                      }`}
                      style={{ width: `${actualWidth}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}