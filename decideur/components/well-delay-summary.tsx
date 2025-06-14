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
  operationsDescriptions?: string[]  // <-- nouveau champ
  plannedOperation: string
  remarks?: string[]
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

interface DelayItem {
  id: string
  phase: string
  operation: string
  activity: string
  plannedDelay: string
  actualDelay: string
  depth: string
  delayStatus: string
}

interface WellDelaySummaryProps {
  wellId: string
}

export function WellDelaySummary({ wellId }: WellDelaySummaryProps) {
  const [sortBy, setSortBy] = useState("date")
  const [filterOperation, setFilterOperation] = useState("all")
  const [delayData, setDelayData] = useState<DelayItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [reportsData, setReportsData] = useState<ReportItem[]>([]) // State pour stocker les rapports originaux

  const handleOpenDialog = (id: string) => {
    // console.log("handleOpenDialog appelé avec ID:", id); // Pour le débogage
    const report = reportsData.find(r => r.id === id)
    // console.log("reportsData actuel:", reportsData); // Pour le débogage
    // console.log("Rapport trouvé pour l'ID", id, ":", report); // Pour le débogage

    if (report) {
      setSelectedReport(report)
      setIsDialogOpen(true)
    } else {
      // console.warn("Aucun rapport trouvé pour l'ID:", id, "dans reportsData."); // Pour le débogage
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null) // Réinitialiser l'erreur à chaque nouvelle tentative
  
        // 1. Récupérer les rapports du puits
        const reportsResponse = await fetch(`http://localhost:8098/api/reports/puit/${wellId}`)
        if (!reportsResponse.ok) {
          throw new Error(`Erreur lors de la récupération des rapports: ${reportsResponse.statusText}`)
        }
        const fetchedReportsData: ReportItem[] = await reportsResponse.json()
  
        // 2. Ajouter les descriptions d’opérations pour chaque rapport
        const reportsWithDescriptions = await Promise.all(
          fetchedReportsData.map(async (report) => {
            try {
              const response = await fetch(`http://localhost:8098/api/reports/${report.id}/operations`)
              const descriptions = response.ok ? await response.json() : []
              return { ...report, operationsDescriptions: descriptions }
            } catch (e) {
              console.error(`Erreur lors du chargement des opérations du rapport ${report.id}`, e)
              return { ...report, operationsDescriptions: [] }
            }
          })
        )
  
        setReportsData(reportsWithDescriptions) // Stocker les rapports enrichis avec les descriptions
  
        // 3. Construire les données combinées avec les prévisions par phase
        const combinedData: DelayItem[] = await Promise.all(
          reportsWithDescriptions.map(async (report) => {
            try {
              let phaseName = report.phase.trim()
  
              if (phaseName.includes('26')) phaseName = '26"'
              else if (phaseName.includes('16')) phaseName = '16"'
              else if (phaseName.includes('12')) phaseName = '12"1/4'
              else if (phaseName.includes('8')) phaseName = '8"1/2'
  
              const phaseUrl = `http://localhost:8098/previsions/etat-par-phase/${wellId}/${phaseName}`
              const phaseResponse = await fetch(phaseUrl)
              if (!phaseResponse.ok) {
                return {
                  id: report.id,
                  phase: report.phase,
                  operation: report.plannedOperation || "Opération standard",
                  activity: report.depth || "Profondeur non spécifiée",
                  plannedDelay: "N/A",
                  actualDelay: "N/A",
                  depth: report.depth || "N/A",
                  delayStatus: "Inconnu"
                }
              }
              const phase: PhaseItem = await phaseResponse.json()
  
              return {
                id: report.id,
                phase: report.phase,
                operation: report.plannedOperation || "Opération standard",
                activity: report.depth || "Profondeur non spécifiée",
                plannedDelay: `${phase.delaiPrevu}j`,
                actualDelay: `${phase.delaiReel}j`,
                depth: report.depth || "N/A",
                delayStatus: phase.etatDelai
              }
            } catch (e) {
              return {
                id: report.id,
                phase: report.phase,
                operation: report.plannedOperation || "Opération standard",
                activity: report.depth || "Profondeur non spécifiée",
                plannedDelay: "N/A",
                actualDelay: "N/A",
                depth: report.depth || "N/A",
                delayStatus: "Erreur"
              }
            }
          })
        )
  
        setDelayData(combinedData)
  
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la récupération des données.')
      } finally {
        setLoading(false)
      }
    }
  
    fetchData()
  }, [wellId])
  

  const getDelayColor = (planned: string, actual: string, status?: string) => {
    if (status) {
      switch (status) {
        case "DANGER": return "text-red-600"
        case "NORMAL": return "text-green-600"
        case "ATTENTION": return "text-orange-500"
        case "Inconnu": return "text-gray-500" // Pour les cas où les données sont N/A
        case "Erreur": return "text-red-800"
        default: break
      }
    }

    const plannedDays = Number.parseInt(planned.replace("j", ""))
    const actualDays = Number.parseInt(actual.replace("j", ""))

    // Gérer les cas où planned ou actual sont "N/A"
    if (isNaN(plannedDays) || isNaN(actualDays)) return "text-gray-500"

    if (actualDays === 0) return "text-gray-400" // Not started
    if (actualDays < plannedDays) return "text-green-600"
    if (actualDays > plannedDays + 5) return "text-red-400"
    if (actualDays > plannedDays) return "text-orange-500"
    return "text-gray-900"
  }

  const calculateTotalDelay = (items: DelayItem[], isPlanned: boolean) => {
    let total = 0
    items.forEach((item) => {
      const delayValue = isPlanned ? item.plannedDelay : item.actualDelay;
      const days = Number.parseInt(delayValue.replace("j", ""));
      if (!isNaN(days)) { // S'assurer que c'est un nombre valide
        total += days;
      }
    })
    return `${total}j`
  }

  const filteredData = delayData.filter((item) => {
    if (filterOperation === "all") return true
    // Note: "Opération 1" est un filtre générique. Vous devrez l'ajuster
    // pour correspondre aux noms d'opérations réels de votre API.
    if (filterOperation === "operation1") return item.operation.includes("Opération")
    // Ajoutez d'autres conditions de filtre si nécessaire
    // if (filterOperation === "forage") return item.operation.includes("Forage");
    return true
  })

  const sortedData = [...filteredData].sort((a, b) => {
    switch (sortBy) {
      case "phase":
        return a.phase.localeCompare(b.phase)
      case "delay":
        // Conversion sécurisée en nombre pour le tri
        const aDelay = Number.parseInt(a.actualDelay.replace("j", "") || "0");
        const bDelay = Number.parseInt(b.actualDelay.replace("j", "") || "0");
        return bDelay - aDelay
      case "operation":
        return a.operation.localeCompare(b.operation)
      case "date": // Assurez-vous que les ReportItem ont une date pour trier
        // Vous devrez potentiellement trier sur la date du rapport original,
        // qui n'est pas directement dans DelayItem. Pour l'instant, cela ne fera rien.
        // Si vous voulez trier par date, vous devrez ajuster DelayItem pour inclure la date
        // et/ou trier reportsData avant de construire delayData.
        return 0; // Pas de tri par défaut pour l'instant si la date n'est pas dans DelayItem
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

  const totalPlannedDelay = calculateTotalDelay(delayData, true)
  const totalActualDelay = calculateTotalDelay(delayData, false)

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-900">Sommaire des délais du puit {wellId}</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="w-64">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full">
              <div className="flex items-center">
                <ArrowUpDown className="mr-2 h-4 w-4 text-orange-500" />
                <span>Trier Par: {sortBy === "date" ? "Date" : sortBy === "phase" ? "Phase" : sortBy === "delay" ? "Délai" : "Opération"}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="phase">Phase</SelectItem>
              <SelectItem value="delay">Délai</SelectItem>
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
              {/* Ajoutez plus d'options de filtre basées sur vos opérations réelles */}
              <SelectItem value="operation2">Opération 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Delay Summary Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-4 font-medium text-gray-600 border-b">Phase</th>
                  <th className="text-left p-4 font-medium text-gray-600 border-b">Opération</th>
                  <th className="text-left p-4 font-medium text-gray-600 border-b">Profondeur</th>
                  <th className="text-left p-4 font-medium text-gray-600 border-b">Délai Prévisionnel</th>
                  <th className="text-left p-4 font-medium text-gray-600 border-b">Délai Réel</th>
                  <th className="text-left p-4 font-medium text-gray-600 border-b">Statut</th>
                  <th className="text-left p-4 font-medium text-gray-600 border-b">Détail</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 border-b">
                    <td className="p-4 font-medium">{item.phase}</td>
                    <td className="p-4">{item.operation}</td>
                    <td className="p-4">{item.depth}</td>
                    <td className="p-4 text-orange-600">{item.plannedDelay}</td>
                    <td className={`p-4 ${getDelayColor(item.plannedDelay, item.actualDelay, item.delayStatus)}`}>
                      {item.actualDelay}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.delayStatus === "DANGER" ? "bg-red-100 text-red-600" :
                        item.delayStatus === "NORMAL" ? "bg-green-100 text-green-800" :
                        item.delayStatus === "ATTENTION" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800" // Pour "Inconnu" ou "Erreur"
                      }`}>
                        {item.delayStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {/* Correction ici: pas besoin de split, item.id est maintenant l'ID original du rapport */}
                      <button onClick={() => handleOpenDialog(item.id)}>
                        <ChevronRight className="w-4 h-4 text-gray-600 hover:text-black" />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Total Row */}
                <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                  <td colSpan={3} className="p-4 text-right font-bold">
                    Total
                  </td>
                  <td className="p-4 font-bold">{totalPlannedDelay}</td>
                  <td className={`p-4 font-bold ${getDelayColor(totalPlannedDelay, totalActualDelay)}`}>
                    {totalActualDelay}
                  </td>
                  <td className="p-4"></td>
                  <td className="p-4"></td> {/* Ajout d'une colonne vide pour le bouton détail */}
                </tr>
              </tbody>
            </table>
            {/* Dialog placé en dehors du map */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} cl>
  <DialogContent className="max-h-[70vh] flex flex-col">
    <DialogHeader className="flex-shrink-0">
      <DialogTitle>
        <p className="text-orange-600 text-xl">Détails du rapport</p>
      </DialogTitle>
    </DialogHeader>
    
    <div className="flex-1 overflow-y-auto pr-3 ">
      {selectedReport && (
        <div className="space-y-2 text-sm">
          <p><strong>ID :</strong> {selectedReport.id}</p>
          <p><strong>Phase :</strong> {selectedReport.phase}</p>
          
          <div>
            <p><strong>Opérations :</strong></p>
            <ul className="list-disc list-inside ml-4">
              {selectedReport.operationsDescriptions && selectedReport.operationsDescriptions.length > 0 ? (
                selectedReport.operationsDescriptions.map((desc: any, index: number) => (
                  <li key={index}>
                    {typeof desc === 'string' ? desc : desc.description}
                  </li>
                ))
              ) : (
                <li>Aucune opération enregistrée</li>
              )}
            </ul>
          </div>
          
          <p><strong>Date :</strong> {selectedReport.date}</p>
          <p><strong>Jour :</strong> {selectedReport.day}</p>
          <p><strong>Depth :</strong> {selectedReport.depth} ft</p>
          <p><strong>Drilling Progress :</strong> {selectedReport.drillingProgress}</p>
          
          <div>
            <p><strong>Remarques :</strong></p>
            <ul className="list-disc list-inside ml-4">
              {selectedReport.remarks && selectedReport.remarks.length > 0 ? (
                selectedReport.remarks.map((desc: any, index: number) => (
                  <li key={index}>
                    {typeof desc === 'string' ? desc : desc.description}
                  </li>
                ))
              ) : (
                <li>Aucune remarque enregistrée</li>
              )}
            </ul>
          </div>
          
          <p><strong>Opération prévue :</strong> {selectedReport.plannedOperation}</p>
        </div>
      )}
    </div>
  </DialogContent>
</Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Delay Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Délai Total Prévu</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-blue-600">{totalPlannedDelay}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Délai Total Réel</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className={`text-2xl font-bold ${getDelayColor(totalPlannedDelay, totalActualDelay)}`}>
              {totalActualDelay}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Variance</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className={`text-2xl font-bold ${getDelayColor(totalPlannedDelay, totalActualDelay)}`}>
              {/* Calcul sécurisé de la variance */}
              {isNaN(Number.parseInt(totalActualDelay.replace("j", ""))) || isNaN(Number.parseInt(totalPlannedDelay.replace("j", "")))
                ? "N/A"
                : Number.parseInt(totalActualDelay.replace("j", "")) - Number.parseInt(totalPlannedDelay.replace("j", ""))}
              j
            </div>
            <div className="text-sm text-gray-500">
              {totalPlannedDelay !== "0j" && !isNaN(Number.parseInt(totalPlannedDelay.replace("j", ""))) && Number.parseInt(totalPlannedDelay.replace("j", "")) !== 0 ? (
                ((Number.parseInt(totalActualDelay.replace("j", "")) -
                  Number.parseInt(totalPlannedDelay.replace("j", ""))) /
                  Number.parseInt(totalPlannedDelay.replace("j", ""))) *
                100
              ).toFixed(1) : "0"}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delay Timeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Chronologie des Délais par Phase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {sortedData.map((item) => {
              const plannedDays = Number.parseInt(item.plannedDelay.replace("j", "") || "0");
              const actualDays = Number.parseInt(item.actualDelay.replace("j", "") || "0");
              const maxDays = Math.max(plannedDays, actualDays, 1);
              const plannedWidth = (plannedDays / maxDays) * 100;
              const actualWidth = (actualDays / maxDays) * 100;

              return (
                <div key={item.id} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="font-medium">
                      {item.phase} - {item.operation}
                    </div>
                    <div className="flex space-x-4">
                      <div className="text-gray-600">Prévu: {item.plannedDelay}</div>
                      <div className={getDelayColor(item.plannedDelay, item.actualDelay, item.delayStatus)}>
                        Réel: {item.actualDelay}
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
                        actualDays === 0 ? "bg-gray-300" :
                        actualDays > plannedDays ? "bg-red-500" : "bg-green-500"
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

      {/* Delay Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Distribution des Délais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end space-x-6 justify-center">
            {sortedData.map((item) => {
              const plannedDays = Number.parseInt(item.plannedDelay.replace("j", "") || "0");
              const actualDays = Number.parseInt(item.actualDelay.replace("j", "") || "0");
              const maxHeight = 200;
              const maxDays = Math.max(...sortedData.map(d =>
                Math.max(
                  Number.parseInt(d.plannedDelay.replace("j", "") || "0"),
                  Number.parseInt(d.actualDelay.replace("j", "") || "0")
                )
              ), 1); // Assurez-vous que maxDays est au moins 1 pour éviter la division par zéro
              const plannedHeight = (plannedDays / maxDays) * maxHeight;
              const actualHeight = (actualDays / maxDays) * maxHeight;

              return (
                <div key={item.id} className="flex flex-col items-center">
                  <div className="flex space-x-1 items-end">
                    <div className="w-8 bg-blue-200 rounded-t" style={{ height: `${plannedHeight}px` }}></div>
                    <div
                      className={`w-8 rounded-t ${
                        actualDays === 0 ? "bg-gray-300" :
                        actualDays > plannedDays ? "bg-red-500" : "bg-green-500"
                      }`}
                      style={{ height: `${actualHeight}px` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-xs font-medium">{item.phase}</div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-center mt-4 space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-200"></div>
              <span className="text-sm">Prévu</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500"></div>
              <span className="text-sm">Réel (en avance/à temps)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500"></div>
              <span className="text-sm">Réel (en retard)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-300"></div>
              <span className="text-sm">Non commencé</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}