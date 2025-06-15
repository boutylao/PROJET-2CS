"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { ArrowUpDown, Filter, Download } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ReportItem {
  id: string
  phase: string
  depth: string
  date: string
  drillingProgress: string
  day: string
  anomalies: string
  plannedOperation: string
}


interface WellReportsProps {
  wellId: string
}

export function WellReports({ wellId }: WellReportsProps) {
  const [sortBy, setSortBy] = useState("date")
  const [filterOperation, setFilterOperation] = useState("all")
  const [reportsData, setReportsData] = useState<ReportItem[]>([])

  useEffect(() => {
    fetch(`http://localhost:8098/api/reports/puit/${wellId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erreur lors du chargement des rapports")
        }
        return res.json()
      })
      .then((data) => {
        setReportsData(data)
      })
      .catch((error) => {
        console.error("Erreur :", error)
      })
  }, [wellId])

  const handleDownloadReport = async (reportId: string, operation: string) => {
    try {
      const response = await fetch(`http://localhost:8098/api/reports/${reportId}/download`, {
        method: "GET",
      })
  
      if (!response.ok) {
        throw new Error("Erreur lors du téléchargement du rapport")
      }
  
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `rapport_${operation}_${reportId}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Erreur lors du téléchargement :", error)
      alert("Échec du téléchargement du rapport.")
    }
  }
  
  const filteredData = reportsData.filter((item) => {
    if (filterOperation === "all") return true
    return item.plannedOperation.toLowerCase() === filterOperation.toLowerCase()
  })

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    }
    if (sortBy === "operation") {
      return a.plannedOperation.localeCompare(b.plannedOperation)
    }
    if (sortBy === "transaction") {
      return a.id.localeCompare(b.id)
    }
    if (sortBy === "site") {
      return a.phase.localeCompare(b.phase)
    }
    return 0
  })

  return (
    <div className="space-y-6">
      {/* <h1 className="text-2xl font-bold text-gray-900">Rapports Journaliers du puits {wellId}</h1> */}
    
            <div className="text-m text-gray-600 flex w-[200px]">  <p className="mr-4"> Total des rapports: </p>           <div className=" font-bold text-xl text-blue-600">{reportsData.length}</div>
          </div>
       

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="w-64">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full">
              <div className="flex items-center">
                <ArrowUpDown className="mr-2 h-4 w-4 text-orange-500" />
                <span>
                  Trier Par:{" "}
                  {sortBy === "date"
                    ? "Date"
                    : sortBy === "operation"
                    ? "Opération"
                    : sortBy === "transaction"
                    ? "Transaction ID"
                    : "Site de forage"}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="operation">Opération</SelectItem>
              <SelectItem value="transaction">Transaction ID</SelectItem>
              <SelectItem value="site">Site de forage</SelectItem>
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
                  {filterOperation === "all"
                    ? "Toutes"
                    : filterOperation.charAt(0).toUpperCase() + filterOperation.slice(1)}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="Forage">Forage</SelectItem>
              <SelectItem value="Logging">Logging</SelectItem>
              <SelectItem value="Mud logging">Mud Logging</SelectItem>
              <SelectItem value="Testing">Testing</SelectItem>
              <SelectItem value="VSP">VSP</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reports Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
              <TableHead className="text-gray-600 font-medium">ID</TableHead>

                <TableHead className="text-gray-600 font-medium">Opération</TableHead>
                <TableHead className="text-gray-600 font-medium">Date</TableHead>

                <TableHead className="text-gray-600 font-medium">Phase</TableHead>
                <TableHead className="text-gray-600 font-medium">Anomalies</TableHead>
                <TableHead className="text-gray-600 font-medium">Rapport</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50">
                  <TableCell className="text-blue-600">{item.id}</TableCell>
                  <TableCell className="font-medium">{item.plannedOperation}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.phase}</TableCell>
                  <TableCell>{item.anomalies}</TableCell>

                  <TableCell>
                    <Button
                      onClick={() => handleDownloadReport(item.id, item.plannedOperation)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cards Résumés */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{reportsData.length}</div>
            <div className="text-sm text-gray-600">Total des rapports</div>
          </CardContent>
        </Card>

        {["Forage", "Logging", "Mud logging", "Testing"].map((type, i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${i === 0 ? "text-green-600" : i === 1 ? "text-orange-600" : i === 2 ? "text-teal-600" : "text-purple-600"}`}>
                {reportsData.filter((r) => r.plannedOperation === type).length}
              </div>
              <div className="text-sm text-gray-600">Rapports de {type.toLowerCase()}</div>
            </CardContent>
          </Card>
        ))}
      </div> */}

      {/* Barres de progression */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Répartition des rapports par opération</h3>
          <div className="space-y-4">
            {["Forage", "Mud logging", "Logging", "Testing", "VSP"].map((operation) => {
              const count = reportsData.filter((r) => r.plannedOperation === operation).length
              const percentage = reportsData.length ? (count / reportsData.length) * 100 : 0

              return (
                <div key={operation} className="flex items-center space-x-4">
                  <div className="w-24 text-sm font-medium">{operation}</div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{count} rapports</span>
                      <span>{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="h-2 rounded-full bg-orange-500" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Chronologie des rapports récents</h3>
          <div className="space-y-4">
            {sortedData.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{item.phase}</div>
                      <div className="text-sm text-gray-600">{item.id} - {item.plannedOperation}</div>
                    </div>
                    <div className="text-sm text-gray-500">{item.date}, {item.day}</div>
                    
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownloadReport(item.id, item.plannedOperation)}
                  className="border-orange-500 text-orange-500 hover:bg-orange-50"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
