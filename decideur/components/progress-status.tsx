"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { ArrowUpDown, Filter, Play, Edit, X } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Image from "next/image"

interface ProgressItem {
  id: string
  type: string
  well: string
  number: number
  name: string
  phase: string
  delay: string
  cost: string
  problem: string
  coordinates?: {
    x: number
    y: number
  }
  location?: string
  startDate?: string
  endDate?: string
  status?: string
}

const progressData: ProgressItem[] = [
  {
    id: "1",
    type: "Exploration",
    well: "Wildcat",
    number: 5,
    name: "BBB-1",
    phase: '26"',
    delay: "69j",
    cost: "38,000$",
    problem: "Perte de boue",
    coordinates: { x: 382.677717, y: 97.4418 },
    location: "Hassi Messaoud",
    startDate: "2024-01-15",
    endDate: "2024-03-25",
    status: "En cours",
  },
  {
    id: "2",
    type: "Exploration",
    well: "Wildcat",
    number: 5,
    name: "BBB-1",
    phase: '26"',
    delay: "69j",
    cost: "38,000$",
    problem: "Perte de boue",
    coordinates: { x: 382.677717, y: 97.4418 },
    location: "Hassi Messaoud",
    startDate: "2024-01-15",
    endDate: "2024-03-25",
    status: "En cours",
  },
  {
    id: "3",
    type: "Exploration",
    well: "Wildcat",
    number: 5,
    name: "BBB-1",
    phase: '26"',
    delay: "69j",
    cost: "38,000$",
    problem: "Perte de boue",
    coordinates: { x: 382.677717, y: 97.4418 },
    location: "Hassi Messaoud",
    startDate: "2024-01-15",
    endDate: "2024-03-25",
    status: "En cours",
  },
  {
    id: "4",
    type: "Exploration",
    well: "Wildcat",
    number: 5,
    name: "BBB-1",
    phase: '26"',
    delay: "69j",
    cost: "38,000$",
    problem: "Perte de boue",
    coordinates: { x: 382.677717, y: 97.4418 },
    location: "Hassi Messaoud",
    startDate: "2024-01-15",
    endDate: "2024-03-25",
    status: "En cours",
  },
  {
    id: "5",
    type: "Exploration",
    well: "Wildcat",
    number: 5,
    name: "BBB-1",
    phase: '26"',
    delay: "69j",
    cost: "38,000$",
    problem: "Perte de boue",
    coordinates: { x: 382.677717, y: 97.4418 },
    location: "Hassi Messaoud",
    startDate: "2024-01-15",
    endDate: "2024-03-25",
    status: "En cours",
  },
  {
    id: "6",
    type: "Exploration",
    well: "Wildcat",
    number: 5,
    name: "BBB-1",
    phase: '26"',
    delay: "69j",
    cost: "38,000$",
    problem: "Perte de boue",
    coordinates: { x: 382.677717, y: 97.4418 },
    location: "Hassi Messaoud",
    startDate: "2024-01-15",
    endDate: "2024-03-25",
    status: "En cours",
  },
  {
    id: "7",
    type: "Exploration",
    well: "Wildcat",
    number: 5,
    name: "BBB-1",
    phase: '26"',
    delay: "69j",
    cost: "38,000$",
    problem: "Perte de boue",
    coordinates: { x: 382.677717, y: 97.4418 },
    location: "Hassi Messaoud",
    startDate: "2024-01-15",
    endDate: "2024-03-25",
    status: "En cours",
  },
  {
    id: "8",
    type: "Exploration",
    well: "Wildcat",
    number: 5,
    name: "BBB-1",
    phase: '26"',
    delay: "69j",
    cost: "38,000$",
    problem: "Perte de boue",
    coordinates: { x: 382.677717, y: 97.4418 },
    location: "Hassi Messaoud",
    startDate: "2024-01-15",
    endDate: "2024-03-25",
    status: "En cours",
  },
]

export function ProgressStatus() {
  const [sortBy, setSortBy] = useState("date")
  const [filterName, setFilterName] = useState("BBB-1")
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [selectedItemDetails, setSelectedItemDetails] = useState<ProgressItem | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const handleViewLocation = (itemId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    console.log(`View location for item ${itemId}`)
  }

  const handleEditSolution = (itemId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    console.log(`Edit solution for item ${itemId}`)
  }

  const handleRowClick = (item: ProgressItem) => {
    setSelectedItem(item.id)
    setSelectedItemDetails(item)
    setShowDetails(true)
  }

  const handleCloseDetails = () => {
    setShowDetails(false)
    setSelectedItem(null)
    setSelectedItemDetails(null)
  }

  const filteredData = progressData.filter((item) => {
    if (filterName === "all") return true
    return item.name === filterName
  })

  return (
    <div className="w-5/6 ml-[240px] p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Etat d'avancement des puits</h1>

      <div className="flex gap-6">
        {/* Main Content */}
        <div className={`transition-all duration-300 ${showDetails ? "w-2/3" : "w-full"}`}>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
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
                  <SelectItem value="cost">Coût</SelectItem>
                  <SelectItem value="delay">Délai</SelectItem>
                  <SelectItem value="phase">Phase</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-64">
              <Select value={filterName} onValueChange={setFilterName}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4 text-orange-500" />
                    <span>Filtre: {filterName}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="BBB-1">BBB-1</SelectItem>
                  <SelectItem value="BBB-2">BBB-2</SelectItem>
                  <SelectItem value="BBB-3">BBB-3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Progress Table */}
          <div className="border rounded-md bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-gray-600 font-medium">Type</TableHead>
                  <TableHead className="text-gray-600 font-medium">Puit</TableHead>
                  <TableHead className="text-gray-600 font-medium">Nbr</TableHead>
                  <TableHead className="text-gray-600 font-medium">Nom</TableHead>
                  <TableHead className="text-gray-600 font-medium">Localisation</TableHead>
                  <TableHead className="text-gray-600 font-medium">Phase</TableHead>
                  <TableHead className="text-gray-600 font-medium">Délai</TableHead>
                  {showDetails && <TableHead className="text-gray-600 font-medium">Détails</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow
                    key={item.id}
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedItem === item.id ? "bg-blue-50 border-l-4 border-blue-500" : ""
                    }`}
                    onClick={() => handleRowClick(item)}
                  >
                    <TableCell className="text-gray-700">{item.type}</TableCell>
                    <TableCell className="text-gray-700">{item.well}</TableCell>
                    <TableCell className="text-gray-700">{item.number}</TableCell>
                    <TableCell className="text-gray-700 font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleViewLocation(item.id, e)}
                        className="p-1 h-8 w-8 hover:bg-gray-100"
                      >
                        <Play className="w-4 h-4 text-gray-600" />
                      </Button>
                    </TableCell>
                    <TableCell className="text-gray-700">{item.phase}</TableCell>
                    <TableCell className="text-green-600 font-medium">{item.delay}</TableCell>
                    {showDetails && <TableCell className="text-red-600 font-medium">{item.cost}</TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Summary Statistics */}
          {!showDetails && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{filteredData.length}</div>
                    <div className="text-sm text-gray-600">Total des puits en cours</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">69j</div>
                    <div className="text-sm text-gray-600">Délai moyen</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">38,000$</div>
                    <div className="text-sm text-gray-600">Coût moyen</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Details Panel */}
        {showDetails && selectedItemDetails && (
          <div className="w-1/3 bg-white border rounded-lg p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Détails</h2>
              <Button variant="ghost" size="sm" onClick={handleCloseDetails} className="p-1 h-8 w-8 hover:bg-gray-100">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="font-medium text-gray-700">Type :</span>
                <span className="ml-2 text-gray-600">{selectedItemDetails.type}</span>
              </div>

              <div>
                <span className="font-medium text-gray-700">Puit :</span>
                <span className="ml-2 text-gray-600">{selectedItemDetails.well}</span>
              </div>

              <div>
                <span className="font-medium text-gray-700">Nbr :</span>
                <span className="ml-2 text-gray-600">{selectedItemDetails.number}</span>
              </div>

              <div>
                <span className="font-medium text-gray-700">Nom :</span>
                <span className="ml-2 text-gray-600">{selectedItemDetails.name}</span>
              </div>

              <div>
                <span className="font-medium text-gray-700">Localisation:</span>
                <div className="mt-2">
                  <Image
                    src="/images/geological-map.png"
                    alt="Geological Map"
                    width={300}
                    height={200}
                    className="rounded-lg border"
                  />
                </div>
              </div>

              <div>
                <span className="font-medium text-gray-700">Phase :</span>
                <span className="ml-2 text-gray-600">{selectedItemDetails.phase}</span>
              </div>

              <div>
                <span className="font-medium text-gray-700">Délai :</span>
                <span className="ml-2 text-green-600 font-medium">
                  {selectedItemDetails.delay.replace("j", " jours")}
                </span>
              </div>

              <div>
                <span className="font-medium text-gray-700">Coût :</span>
                <span className="ml-2 text-red-600 font-medium">{selectedItemDetails.cost}</span>
              </div>

              {selectedItemDetails.problem && (
                <div>
                  <span className="font-medium text-gray-700">Problème :</span>
                  <span className="ml-2 text-gray-600">{selectedItemDetails.problem}</span>
                </div>
              )}

              {selectedItemDetails.location && (
                <div>
                  <span className="font-medium text-gray-700">Région :</span>
                  <span className="ml-2 text-gray-600">{selectedItemDetails.location}</span>
                </div>
              )}

              {selectedItemDetails.status && (
                <div>
                  <span className="font-medium text-gray-700">Statut :</span>
                  <span className="ml-2 text-blue-600 font-medium">{selectedItemDetails.status}</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t">
              <Button
                onClick={(e) => handleEditSolution(selectedItemDetails.id, e)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier la solution
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
