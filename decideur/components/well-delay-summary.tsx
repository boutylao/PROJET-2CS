"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { ArrowUpDown, Filter, Loader2, Clock, CheckCircle, AlertTriangle } from "lucide-react" // Added icons
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
  operationsDescriptions?: string[] 
  plannedOperation: string
  remarks?: string[]
}

interface PhaseItem {
  phaseName: string
  coutPrevu: number
  coutReel: number
  delaiPrevu: number
  depthPrevu: number
  depthReel: number
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
  const [phaseData, setPhaseData] = useState<PhaseItem[]>([]) // NEW: State for phase data
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

        // 1. Fetch reports for the well
        const reportsResponse = await fetch(`http://localhost:8098/api/reports/puit/${wellId}`)
        if (!reportsResponse.ok) {
          throw new Error(`Erreur lors de la récupération des rapports: ${reportsResponse.statusText}`)
        }
        const fetchedReportsData: ReportItem[] = await reportsResponse.json()

        // 2. Add operation descriptions to each report
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
        setReportsData(reportsWithDescriptions)

        // 3. Fetch phase data for global summary and phase-specific charts
        const phases = ['26"', '16"', '12"', '8"']
        const phasePromises = phases.map(async (phaseName) => {
          try {
            const phaseUrl = `http://localhost:8098/previsions/etat-par-phase/${wellId}/${phaseName}`
            const phaseResponse = await fetch(phaseUrl)
            if (!phaseResponse.ok) {
              console.warn(`Could not fetch phase data for ${phaseName}: Status ${phaseResponse.status}`)
              return null
            }
            const phase: PhaseItem = await phaseResponse.json()
            return phase
          } catch (e) {
            console.error(`Error fetching phase ${phaseName}:`, e)
            return null
          }
        })

        const fetchedPhaseData = (await Promise.all(phasePromises)).filter((phase): phase is PhaseItem => phase !== null);
        setPhaseData(fetchedPhaseData); // Set the phase data state

        // 4. Build combined delay data using reports and fetched phase data
        const combinedData: DelayItem[] = await Promise.all(
          reportsWithDescriptions.map(async (report) => {
            let phaseNameNormalized = report.phase.trim();
            if (phaseNameNormalized.includes('26')) phaseNameNormalized = '26"';
            else if (phaseNameNormalized.includes('16')) phaseNameNormalized = '16"';
            else if (phaseNameNormalized.includes('12')) phaseNameNormalized = '12"';
            else if (phaseNameNormalized.includes('8')) phaseNameNormalized = '8"';

            // Find the corresponding phase data from the already fetched phaseData
            const phase = fetchedPhaseData.find(p => p.phaseName === phaseNameNormalized);

            const plannedDelayValue = phase ? `${phase.delaiPrevu}j` : "N/A";
            const actualDelayValue = `${report.day}j`; // Using report.day for actual delay as per your logic
            const delayStatusValue = phase ? phase.etatDelai : "Inconnu";

            return {
              id: report.id,
              phase: report.phase,
              operation: report.plannedOperation || "Opération standard",
              activity: report.depth || "Profondeur non spécifiée",
              plannedDelay: plannedDelayValue,
              actualDelay: actualDelayValue,
              depth: report.depth || "N/A",
              delayStatus: delayStatusValue
            };
          })
        );
        setDelayData(combinedData)

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la récupération des données.')
      } finally {
        setLoading(false)
      }
    }

    if (wellId) {
      fetchData()
    }
  }, [wellId])


  const getDelayColor = (planned: string, actual: string, status?: string) => {
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

    const plannedDays = Number.parseInt(planned.replace("j", ""))
    const actualDays = Number.parseInt(actual.replace("j", ""))

    if (isNaN(plannedDays) || isNaN(actualDays)) return "text-gray-500"

    if (actualDays === 0) return "text-gray-400"
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
      if (!isNaN(days)) {
        total += days;
      }
    })
    return `${total}j`
  }

  const filteredData = delayData.filter((item) => {
    if (filterOperation === "all") return true
    if (filterOperation === "operation1") return item.operation.includes("Opération")
    return true
  })

  const sortedData = [...filteredData].sort((a, b) => {
    switch (sortBy) {
      case "phase":
        return a.phase.localeCompare(b.phase)
      case "delay":
        const aDelay = Number.parseInt(a.actualDelay.replace("j", "") || "0");
        const bDelay = Number.parseInt(b.actualDelay.replace("j", "") || "0");
        return bDelay - aDelay
      case "operation":
        return a.operation.localeCompare(b.operation)
      case "date":
        // To sort by date, you'd need the date in DelayItem or join with reportsData
        // For now, no specific sorting for 'date' if not available in DelayItem
        return 0;
      default:
        return 0
    }
  })

  // Calculate global cost and delay from phaseData
  const totalCoutPrevu = phaseData.reduce((sum, phase) => sum + phase.coutPrevu, 0);
  const totalCoutReel = phaseData.reduce((sum, phase) => sum + phase.coutReel, 0);

  const globalDelaiPrevu = phaseData.reduce((sum, phase) => sum + phase.delaiPrevu, 0);
  const globalDelaiReel = phaseData.reduce((sum, phase) => sum + phase.delaiReel, 0);

  // For the Cost and Delay Summary Card's progress circles
  let costProgress = 0;
  if (totalCoutPrevu > 0) {
    costProgress = (totalCoutReel / totalCoutPrevu) * 100;
  } else if (totalCoutReel > 0) {
    costProgress = 100;
  }

  let delayProgress = 0;
  if (globalDelaiPrevu > 0) {
    delayProgress = (globalDelaiReel / globalDelaiPrevu) * 100;
  } else if (globalDelaiReel > 0) {
    delayProgress = 100;
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
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
    <div className="space-y-6 p-6 w-[900px]">

      {/* NEW: Global Survey Delay & Cost Card */}
     


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
              <SelectItem value="operation2">Opération 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Delay Summary Table */}
      <Card className="w-[990px]">
        <CardContent className="p-0 ">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-4 font-medium text-gray-600 border-b">Phase</th>
                  <th className="text-left p-4 font-medium text-gray-600 border-b">Opération</th>
                  <th className="text-left p-4 font-medium text-gray-600 border-b">Depth</th>
                  <th className="text-left p-4 font-medium text-gray-600 border-b">Délai Prévu</th>
                  <th className="text-left p-4 font-medium text-gray-600 border-b">Délai Réel</th>
                  <th className="text-left p-4 font-medium text-gray-600 border-b">Statut</th>
                  <th className="text-left p-4 font-medium text-gray-600 border-b">Détail</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 border-b">
                    <td className="p-4 font-medium text-sm">{item.phase}</td>
                    <td className="p-4 text-sm">{item.operation}</td>
                    <td className="p-4 text-sm">{item.depth}</td>
                    <td className="p-4 text-orange-600 text-sm">{item.plannedDelay}</td>
                    <td className={`text-sm p-4 ${getDelayColor(item.plannedDelay, item.actualDelay, item.delayStatus)}`}>
                      {item.actualDelay}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.delayStatus === "DANGER" ? "bg-red-100 text-red-600" :
                        item.delayStatus === "NORMAL" ? "bg-green-100 text-green-800" :
                        item.delayStatus === "ATTENTION" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {item.delayStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleOpenDialog(item.id)}>
                        <ChevronRight className="w-4 h-4 text-gray-600 hover:text-black" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} >
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

      {/* Delay Summary Cards (Total Planned, Total Actual, Variance) */}
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

      {/* Delay Timeline Chart (by Report Item) */}
      <Card>
        <CardHeader>
          <CardTitle>Chronologie des Délais par Phase (Rapports)</CardTitle> {/* Clarified title */}
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

      {/* Delay Distribution Chart (by Phase) */}
      <Card>
        <CardHeader>
          <CardTitle>Distribution des Délais par Phase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto pb-4">
            <div className="h-64 flex items-end space-x-6 justify-center min-w-max">
              {phaseData.map((phase) => { // Using phaseData directly here
                const plannedDays = phase.delaiPrevu;
                const actualDays = phase.delaiReel;
                const maxHeight = 200;

                const maxDays = Math.max(
                  ...phaseData.map(p => Math.max(p.delaiPrevu, p.delaiReel)),
                  1
                );

                const plannedHeight = (plannedDays / maxDays) * maxHeight;
                const actualHeight = (actualDays / maxDays) * maxHeight;

                return (
                  <div key={phase.phaseName} className="flex flex-col items-center">
                    <div className="flex space-x-1 items-end">
                      <div className="w-8 bg-yellow-400 rounded-t" style={{ height: `${plannedHeight}px` }}></div>
                      <div
                        className={`w-8 rounded-t ${
                          actualDays === 0 && plannedDays > 0 ? "bg-orange-300" :
                          actualDays > plannedDays ? "bg-red-500" : "bg-green-500"
                        }`}
                        style={{ height: `${actualHeight}px` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-xs font-medium">{phase.phaseName}</div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="flex justify-center mt-4 space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-400"></div>
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
              <div className="w-4 h-4 bg-orange-300"></div>
              <span className="text-sm">Non commencé</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}