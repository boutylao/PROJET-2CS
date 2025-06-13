"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { ArrowUpDown, Filter } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface CostItem {
  id: string
  phase: string
  operation: string
  eventActivity: string
  plannedCost: number
  actualCost: number
}

const costData: CostItem[] = [
  {
    id: "1",
    phase: "01.",
    operation: "Opération 1",
    eventActivity: "$40,500",
    plannedCost: 40500,
    actualCost: 30100,
  },
  {
    id: "2",
    phase: "02.",
    operation: "Opération 1",
    eventActivity: "$250,000",
    plannedCost: 40500,
    actualCost: 52300,
  },
  {
    id: "3",
    phase: "03.",
    operation: "Opération 1",
    eventActivity: "$40,500",
    plannedCost: 40500,
    actualCost: 41500,
  },
  {
    id: "4",
    phase: "04.",
    operation: "Opération 1",
    eventActivity: "$40,500",
    plannedCost: 40500,
    actualCost: 40500,
  },
  {
    id: "5",
    phase: "05.",
    operation: "Opération 1",
    eventActivity: "$40,500",
    plannedCost: 40500,
    actualCost: 40500,
  },
  {
    id: "6",
    phase: "06.",
    operation: "Opération 1",
    eventActivity: "$25,500",
    plannedCost: 40500,
    actualCost: 40500,
  },
  {
    id: "7",
    phase: "07.",
    operation: "Opération 1",
    eventActivity: "$5,500",
    plannedCost: 40500,
    actualCost: 40500,
  },
  {
    id: "8",
    phase: "08.",
    operation: "Opération 1",
    eventActivity: "$100,800",
    plannedCost: 40500,
    actualCost: 40500,
  },
]

interface WellCostSummaryProps {
  wellId: string
}

export function WellCostSummary({ wellId }: WellCostSummaryProps) {
  const [sortBy, setSortBy] = useState("date")
  const [filterOperation, setFilterOperation] = useState("operation1")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getCostColor = (planned: number, actual: number) => {
    if (actual < planned) return "text-green-600"
    if (actual > planned) return "text-red-600"
    return "text-gray-900"
  }

  const totalPlanned = costData.reduce((sum, item) => sum + item.plannedCost, 0)
  const totalActual = costData.reduce((sum, item) => sum + item.actualCost, 0)

  const filteredData = costData.filter((item) => {
    if (filterOperation === "all") return true
    if (filterOperation === "operation1") return item.operation === "Opération 1"
    return true
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Sommaire des coûts du puit {wellId}</h1>

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
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-gray-600 font-medium">Phase</TableHead>
                <TableHead className="text-gray-600 font-medium">Opération</TableHead>
                <TableHead className="text-gray-600 font-medium">Event/Activity</TableHead>
                <TableHead className="text-gray-600 font-medium">Coût Prévisionnel</TableHead>
                <TableHead className="text-gray-600 font-medium">Coût Actuel</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{item.phase}</TableCell>
                  <TableCell>{item.operation}</TableCell>
                  <TableCell>{item.eventActivity}</TableCell>
                  <TableCell>{formatCurrency(item.plannedCost)}</TableCell>
                  <TableCell className={getCostColor(item.plannedCost, item.actualCost)}>
                    {formatCurrency(item.actualCost)}
                  </TableCell>
                </TableRow>
              ))}
              {/* Total Row */}
              <TableRow className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                <TableCell colSpan={3} className="text-right font-bold">
                  Total
                </TableCell>
                <TableCell className="font-bold">{formatCurrency(totalPlanned)}</TableCell>
                <TableCell className={`font-bold ${getCostColor(totalPlanned, totalActual)}`}>
                  {formatCurrency(totalActual)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
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
              {(((totalActual - totalPlanned) / totalPlanned) * 100).toFixed(1)}%
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
            {filteredData.map((item) => {
              const percentage = (item.actualCost / totalActual) * 100
              return (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="w-16 text-sm font-medium">{item.phase}</div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.operation}</span>
                      <span className={getCostColor(item.plannedCost, item.actualCost)}>
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
    </div>
  )
}
