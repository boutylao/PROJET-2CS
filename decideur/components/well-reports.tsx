"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { ArrowUpDown, Filter, Download } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ReportItem {
  id: string
  operation: string
  transactionId: string
  drillingSite: string
  date: string
  time: string
  reportType: string
}

const reportsData: ReportItem[] = [
  {
    id: "1",
    operation: "Forage",
    transactionId: "#12548796",
    drillingSite: "Forage A",
    date: "28 Jan",
    time: "12.30 AM",
    reportType: "daily",
  },
  {
    id: "2",
    operation: "Mud logging",
    transactionId: "#12548796",
    drillingSite: "Forage A",
    date: "25 Jan",
    time: "10.40 PM",
    reportType: "daily",
  },
  {
    id: "3",
    operation: "Logging",
    transactionId: "#12548796",
    drillingSite: "Forage A",
    date: "20 Jan",
    time: "10.40 PM",
    reportType: "daily",
  },
  {
    id: "4",
    operation: "Testing",
    transactionId: "#12548796",
    drillingSite: "Forage A",
    date: "15 Jan",
    time: "03.29 PM",
    reportType: "daily",
  },
  {
    id: "5",
    operation: "VSP",
    transactionId: "#12548796",
    drillingSite: "Forage A",
    date: "14 Jan",
    time: "10.40 PM",
    reportType: "daily",
  },
  {
    id: "6",
    operation: "Mud logging",
    transactionId: "#12548796",
    drillingSite: "Forage A",
    date: "25 Jan",
    time: "10.40 PM",
    reportType: "daily",
  },
  {
    id: "7",
    operation: "Logging",
    transactionId: "#12548796",
    drillingSite: "Forage A",
    date: "20 Jan",
    time: "10.40 PM",
    reportType: "daily",
  },
  {
    id: "8",
    operation: "Testing",
    transactionId: "#12548796",
    drillingSite: "Forage A",
    date: "15 Jan",
    time: "03.29 PM",
    reportType: "daily",
  },
]

interface WellReportsProps {
  wellId: string
}

export function WellReports({ wellId }: WellReportsProps) {
  const [sortBy, setSortBy] = useState("date")
  const [filterOperation, setFilterOperation] = useState("operation1")

  const handleDownloadReport = (reportId: string, operation: string) => {
    // Simulate report download
    console.log(`Downloading report ${reportId} for operation: ${operation}`)
    // In a real application, this would trigger a file download
    alert(`Téléchargement du rapport ${operation} en cours...`)
  }

  const filteredData = reportsData.filter((item) => {
    if (filterOperation === "all") return true
    if (filterOperation === "operation1") return true // Show all for now
    return true
  })

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.date + " 2025").getTime() - new Date(a.date + " 2025").getTime()
    }
    if (sortBy === "operation") {
      return a.operation.localeCompare(b.operation)
    }
    return 0
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Rapport Journaliers du puit {wellId}</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="w-64">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full">
              <div className="flex items-center">
                <ArrowUpDown className="mr-2 h-4 w-4 text-orange-500" />
                <span>Trier Par: {sortBy === "date" ? "Date" : sortBy === "operation" ? "Opération" : sortBy}</span>
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
                  {filterOperation === "all" ? "Toutes" : filterOperation === "operation1" ? "Opération 1" : "Autre"}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="operation1">Opération 1</SelectItem>
              <SelectItem value="forage">Forage</SelectItem>
              <SelectItem value="logging">Logging</SelectItem>
              <SelectItem value="testing">Testing</SelectItem>
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
                <TableHead className="text-gray-600 font-medium">Opération</TableHead>
                <TableHead className="text-gray-600 font-medium">Transaction ID</TableHead>
                <TableHead className="text-gray-600 font-medium">Site de forage</TableHead>
                <TableHead className="text-gray-600 font-medium">Date</TableHead>
                <TableHead className="text-gray-600 font-medium">Rapport</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{item.operation}</TableCell>
                  <TableCell className="text-blue-600">{item.transactionId}</TableCell>
                  <TableCell>{item.drillingSite}</TableCell>
                  <TableCell>
                    {item.date}, {item.time}
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleDownloadReport(item.id, item.operation)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Telecharger
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reports Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{reportsData.length}</div>
              <div className="text-sm text-gray-600">Total des rapports</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {reportsData.filter((r) => r.operation === "Forage").length}
              </div>
              <div className="text-sm text-gray-600">Rapports de forage</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {reportsData.filter((r) => r.operation.includes("logging")).length}
              </div>
              <div className="text-sm text-gray-600">Rapports de logging</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {reportsData.filter((r) => r.operation === "Testing").length}
              </div>
              <div className="text-sm text-gray-600">Rapports de test</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports by Operation Type */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Répartition des rapports par opération</h3>
          <div className="space-y-4">
            {["Forage", "Mud logging", "Logging", "Testing", "VSP"].map((operation) => {
              const count = reportsData.filter((r) => r.operation === operation).length
              const percentage = (count / reportsData.length) * 100

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

      {/* Recent Activity Timeline */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Chronologie des rapports récents</h3>
          <div className="space-y-4">
            {sortedData.slice(0, 5).map((item, index) => (
              <div key={item.id} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{item.operation}</div>
                      <div className="text-sm text-gray-600">
                        {item.transactionId} - {item.drillingSite}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.date}, {item.time}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownloadReport(item.id, item.operation)}
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
