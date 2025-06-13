"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { ArrowUpDown, Filter } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface DelayItem {
  id: string
  phase: string
  operation: string
  activity: string
  plannedDelay: string
  actualDelay: string
}

const delayData: DelayItem[] = [
  {
    id: "1",
    phase: "01.",
    operation: "Opération 1",
    activity: "Activité 1",
    plannedDelay: "45j",
    actualDelay: "30j",
  },
  {
    id: "2",
    phase: "02.",
    operation: "Opération 1",
    activity: "Activité 1",
    plannedDelay: "45j",
    actualDelay: "52j",
  },
  {
    id: "3",
    phase: "03.",
    operation: "Opération 1",
    activity: "Activité 1",
    plannedDelay: "45j",
    actualDelay: "46j",
  },
  {
    id: "4",
    phase: "04.",
    operation: "Opération 1",
    activity: "Activité 1",
    plannedDelay: "45j",
    actualDelay: "41j",
  },
  {
    id: "5",
    phase: "05.",
    operation: "Opération 1",
    activity: "Activité 1",
    plannedDelay: "45j",
    actualDelay: "41j",
  },
  {
    id: "6",
    phase: "06.",
    operation: "Opération 1",
    activity: "Activité 1",
    plannedDelay: "45j",
    actualDelay: "41j",
  },
  {
    id: "7",
    phase: "07.",
    operation: "Opération 1",
    activity: "Activité 1",
    plannedDelay: "45j",
    actualDelay: "41j",
  },
  {
    id: "8",
    phase: "08.",
    operation: "Opération 1",
    activity: "Activité 1",
    plannedDelay: "45j",
    actualDelay: "41j",
  },
]

interface WellDelaySummaryProps {
  wellId: string
}

export function WellDelaySummary({ wellId }: WellDelaySummaryProps) {
  const [sortBy, setSortBy] = useState("date")
  const [filterOperation, setFilterOperation] = useState("operation1")

  const getDelayColor = (planned: string, actual: string) => {
    const plannedDays = Number.parseInt(planned.replace("j", ""))
    const actualDays = Number.parseInt(actual.replace("j", ""))

    if (actualDays < plannedDays) return "text-green-600"
    if (actualDays > plannedDays + 5) return "text-red-600"
    if (actualDays > plannedDays) return "text-orange-500"
    return "text-gray-900"
  }

  const calculateTotalDelay = (items: DelayItem[], isPlanned: boolean) => {
    let total = 0
    items.forEach((item) => {
      const days = Number.parseInt((isPlanned ? item.plannedDelay : item.actualDelay).replace("j", ""))
      total += days
    })
    return `${total}j`
  }

  const totalPlannedDelay = calculateTotalDelay(delayData, true)
  const totalActualDelay = calculateTotalDelay(delayData, false)

  const filteredData = delayData.filter((item) => {
    if (filterOperation === "all") return true
    if (filterOperation === "operation1") return item.operation === "Opération 1"
    return true
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Sommaire des délais du puit {wellId}</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="w-64">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full">
              <div className="flex items-center">
                <ArrowUpDown className="mr-2 h-4 w-4 text-orange-500" />
                <span>Trier Par: {sortBy === "date" ? "Date" : sortBy}</span>
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
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-gray-600 font-medium">Phase</TableHead>
                <TableHead className="text-gray-600 font-medium">Opération</TableHead>
                <TableHead className="text-gray-600 font-medium">Event/Activity</TableHead>
                <TableHead className="text-gray-600 font-medium">Délai Prévisionnel</TableHead>
                <TableHead className="text-gray-600 font-medium">Délai Réel</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{item.phase}</TableCell>
                  <TableCell>{item.operation}</TableCell>
                  <TableCell>{item.activity}</TableCell>
                  <TableCell>{item.plannedDelay}</TableCell>
                  <TableCell className={getDelayColor(item.plannedDelay, item.actualDelay)}>
                    {item.actualDelay}
                  </TableCell>
                </TableRow>
              ))}
              {/* Total Row */}
              <TableRow className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                <TableCell colSpan={3} className="text-right font-bold">
                  Total
                </TableCell>
                <TableCell className="font-bold">{totalPlannedDelay}</TableCell>
                <TableCell className={`font-bold ${getDelayColor(totalPlannedDelay, totalActualDelay)}`}>
                  {totalActualDelay}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
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
              {Number.parseInt(totalActualDelay.replace("j", "")) - Number.parseInt(totalPlannedDelay.replace("j", ""))}
              j
            </div>
            <div className="text-sm text-gray-500">
              {(
                ((Number.parseInt(totalActualDelay.replace("j", "")) -
                  Number.parseInt(totalPlannedDelay.replace("j", ""))) /
                  Number.parseInt(totalPlannedDelay.replace("j", ""))) *
                100
              ).toFixed(1)}
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
            {filteredData.map((item) => {
              const plannedDays = Number.parseInt(item.plannedDelay.replace("j", ""))
              const actualDays = Number.parseInt(item.actualDelay.replace("j", ""))
              const maxDays = Math.max(plannedDays, actualDays)
              const plannedWidth = (plannedDays / maxDays) * 100
              const actualWidth = (actualDays / maxDays) * 100

              return (
                <div key={item.id} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="font-medium">
                      {item.phase} {item.operation}
                    </div>
                    <div className="flex space-x-4">
                      <div className="text-gray-600">Prévu: {item.plannedDelay}</div>
                      <div className={getDelayColor(item.plannedDelay, item.actualDelay)}>Réel: {item.actualDelay}</div>
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
            {filteredData.map((item) => {
              const plannedDays = Number.parseInt(item.plannedDelay.replace("j", ""))
              const actualDays = Number.parseInt(item.actualDelay.replace("j", ""))
              const maxHeight = 200 // max height in pixels
              const plannedHeight = (plannedDays / 45) * maxHeight // 45 is the standard planned days
              const actualHeight = (actualDays / 45) * maxHeight

              return (
                <div key={item.id} className="flex flex-col items-center">
                  <div className="flex space-x-1 items-end">
                    <div className="w-8 bg-blue-200 rounded-t" style={{ height: `${plannedHeight}px` }}></div>
                    <div
                      className={`w-8 rounded-t ${actualDays > plannedDays ? "bg-red-500" : "bg-green-500"}`}
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
              <span className="text-sm">Réel (en avance)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500"></div>
              <span className="text-sm">Réel (en retard)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
