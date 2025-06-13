"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { ArrowUpDown, Filter, Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Nouvelles interfaces selon vos spécifications
interface DelayItem {
  id: string
  phaseName: string
  delaiPrevu: string
  depassementDelai: string
}

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

interface WellDelaySummaryProps {
  wellId: string
}

export function WellDelaySummary({ wellId }: WellDelaySummaryProps) {
  const [sortBy, setSortBy] = useState("phase")
  const [filterPhase, setFilterPhase] = useState("all")
  const [delayData, setDelayData] = useState<DelayItem[]>([])
  const [reportData, setReportData] = useState<ReportItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fonction pour récupérer les données de délais
  const fetchDelayData = async (): Promise<DelayItem[]> => {
    const response = await fetch(`http://localhost:8098/previsions`);
    if (!response.ok) {
      throw new Error(`Erreur lors du chargement des délais: ${response.statusText}`);
    }
    return response.json();
  };

  // Fonction pour récupérer les données de rapport
  const fetchReportData = async (): Promise<ReportItem[]> => {
    const response = await fetch(`http://localhost:8098/api/reports/puit/${wellId}`);
    if (!response.ok) {
      throw new Error(`Erreur lors du chargement des rapports: ${response.statusText}`);
    }
    return response.json();
  };

  // Effet pour charger toutes les données
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Appel parallèle des deux endpoints
        const [delayResponse, reportResponse] = await Promise.all([
          fetchDelayData(),
          fetchReportData()
        ]);

        setDelayData(delayResponse);
        setReportData(reportResponse);
      } catch (err: any) {
        console.error("Erreur lors du chargement des données:", err);
        setError(err.message || "Une erreur inconnue est survenue lors du chargement des données.");
      } finally {
        setIsLoading(false);
      }
    };

    if (wellId) {
      fetchAllData();
    }
  }, [wellId])

  // Fonction pour déterminer la couleur du délai
  const getDelayColor = (delaiPrevu: string, depassementDelai: string) => {
    const depassement = Number.parseInt(depassementDelai.replace(/[^\d-]/g, "")) || 0;
    
    if (depassement < 0) return "text-green-600"; // En avance
    if (depassement > 5) return "text-red-600"; // Retard important
    if (depassement > 0) return "text-orange-500"; // Léger retard
    return "text-gray-900"; // À l'heure
  }

  // Calculer le total des délais
  const calculateTotalDelay = (items: DelayItem[], type: 'prevu' | 'depassement') => {
    let total = 0;
    items.forEach((item) => {
      const value = type === 'prevu' 
        ? Number.parseInt(item.delaiPrevu.replace(/[^\d]/g, "")) || 0
        : Number.parseInt(item.depassementDelai.replace(/[^\d-]/g, "")) || 0;
      total += value;
    });
    return total;
  }

  // Filtrer les données par phase
  const filteredDelayData = delayData.filter((item) => {
    if (filterPhase === "all") return true;
    return item.phaseName.toLowerCase().includes(filterPhase.toLowerCase());
  });

  // Obtenir les phases uniques pour le filtre
  const uniquePhases = Array.from(new Set(delayData.map(item => item.phaseName)));

  // Calculer les totaux
  const totalDelaiPrevu = calculateTotalDelay(filteredDelayData, 'prevu');
  const totalDepassement = calculateTotalDelay(filteredDelayData, 'depassement');

  // Trier les données
  const sortedDelayData = [...filteredDelayData].sort((a, b) => {
    if (sortBy === "phase") {
      return a.phaseName.localeCompare(b.phaseName);
    }
    if (sortBy === "delaiPrevu") {
      const aValue = Number.parseInt(a.delaiPrevu.replace(/[^\d]/g, "")) || 0;
      const bValue = Number.parseInt(b.delaiPrevu.replace(/[^\d]/g, "")) || 0;
      return aValue - bValue;
    }
    if (sortBy === "depassement") {
      const aValue = Number.parseInt(a.depassementDelai.replace(/[^\d-]/g, "")) || 0;
      const bValue = Number.parseInt(b.depassementDelai.replace(/[^\d-]/g, "")) || 0;
      return bValue - aValue; // Tri décroissant pour les dépassements
    }
    return 0;
  });

  // Trier les données de rapport par date
  const sortedReportData = [...reportData].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full bg-gray-50 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500 mr-2" />
        <span className="text-lg text-gray-700">Chargement des données...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full bg-red-100 p-6 rounded-md shadow-md">
        <p className="text-xl text-red-700">{error}</p>
      </div>
    );
  }

  if (delayData.length === 0 && reportData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full bg-yellow-100 p-6 rounded-md shadow-md">
        <p className="text-xl text-yellow-700">Aucune donnée trouvée pour le puits {wellId}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tableau de bord du puits {wellId}</h1>

      {/* Cartes de résumé des délais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Délai Total Prévu</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-blue-600">{totalDelaiPrevu}j</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Dépassement Total</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className={`text-2xl font-bold ${totalDepassement > 0 ? 'text-red-600' : totalDepassement < 0 ? 'text-green-600' : 'text-gray-900'}`}>
              {totalDepassement > 0 ? '+' : ''}{totalDepassement}j
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Nombre de Phases</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900">{delayData.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et tri */}
      <div className="flex flex-wrap gap-4">
        <div className="w-64">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full">
              <div className="flex items-center">
                <ArrowUpDown className="mr-2 h-4 w-4 text-orange-500" />
                <span>Trier Par: {
                  sortBy === "phase" ? "Phase" :
                  sortBy === "delaiPrevu" ? "Délai Prévu" :
                  sortBy === "depassement" ? "Dépassement" : "Phase"
                }</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="phase">Phase</SelectItem>
              <SelectItem value="delaiPrevu">Délai Prévu</SelectItem>
              <SelectItem value="depassement">Dépassement</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-64">
          <Select value={filterPhase} onValueChange={setFilterPhase}>
            <SelectTrigger className="w-full">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4 text-orange-500" />
                <span>
                  Filtre: {filterPhase === "all" ? "Toutes les phases" : filterPhase}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les phases</SelectItem>
              {uniquePhases.map((phase) => (
                <SelectItem key={phase} value={phase}>{phase}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table des délais */}
      {delayData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Analyse des Délais par Phase</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-gray-600 font-medium">ID</TableHead>
                  <TableHead className="text-gray-600 font-medium">Phase</TableHead>
                  <TableHead className="text-gray-600 font-medium">Délai Prévu</TableHead>
                  <TableHead className="text-gray-600 font-medium">Dépassement</TableHead>
                  <TableHead className="text-gray-600 font-medium">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDelayData.map((item) => {
                  const depassement = Number.parseInt(item.depassementDelai.replace(/[^\d-]/g, "")) || 0;
                  return (
                    <TableRow key={item.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell className="font-medium">{item.phaseName}</TableCell>
                      <TableCell>{item.delaiPrevu}</TableCell>
                      <TableCell className={getDelayColor(item.delaiPrevu, item.depassementDelai)}>
                        {item.depassementDelai}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          depassement < 0 ? 'bg-green-100 text-green-800' :
                          depassement > 5 ? 'bg-red-100 text-red-800' :
                          depassement > 0 ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {depassement < 0 ? 'En avance' :
                           depassement > 5 ? 'Retard important' :
                           depassement > 0 ? 'Léger retard' : 'À l\'heure'}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                  <TableCell colSpan={2} className="text-right font-bold">Total</TableCell>
                  <TableCell className="font-bold">{totalDelaiPrevu}j</TableCell>
                  <TableCell className={`font-bold ${totalDepassement > 0 ? 'text-red-600' : totalDepassement < 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {totalDepassement > 0 ? '+' : ''}{totalDepassement}j
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Table des rapports */}
      {reportData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rapports de Forage</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-gray-600 font-medium">ID</TableHead>
                  <TableHead className="text-gray-600 font-medium">Date</TableHead>
                  <TableHead className="text-gray-600 font-medium">Jour</TableHead>
                  <TableHead className="text-gray-600 font-medium">Phase</TableHead>
                  <TableHead className="text-gray-600 font-medium">Profondeur</TableHead>
                  <TableHead className="text-gray-600 font-medium">Progression</TableHead>
                  <TableHead className="text-gray-600 font-medium">Opération Prévue</TableHead>
                  <TableHead className="text-gray-600 font-medium">Anomalies</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedReportData.slice(0, 10).map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{new Date(item.date).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>{item.day}</TableCell>
                    <TableCell className="font-medium">{item.phase}</TableCell>
                    <TableCell>{item.depth}</TableCell>
                    <TableCell>{item.drillingProgress}</TableCell>
                    <TableCell>{item.plannedOperation}</TableCell>
                    <TableCell>
                      {item.anomalies ? (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                          {item.anomalies}
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          Aucune
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {reportData.length > 10 && (
              <div className="p-4 text-center text-gray-500 text-sm">
                ... et {reportData.length - 10} autres rapports
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Graphique de progression des délais */}
      {delayData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Visualisation des Délais par Phase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {sortedDelayData.map((item) => {
                const delaiPrevu = Number.parseInt(item.delaiPrevu.replace(/[^\d]/g, "")) || 0;
                const depassement = Number.parseInt(item.depassementDelai.replace(/[^\d-]/g, "")) || 0;
                const delaiReel = delaiPrevu + depassement;
                const maxDelai = Math.max(delaiPrevu, delaiReel, 1);
                const prevuWidth = (delaiPrevu / maxDelai) * 100;
                const reelWidth = (delaiReel / maxDelai) * 100;

                return (
                  <div key={item.id} className="space-y-2">
                    <div className="flex justify-between">
                      <div className="font-medium">{item.phaseName}</div>
                      <div className="flex space-x-4">
                        <div className="text-gray-600">Prévu: {item.delaiPrevu}</div>
                        <div className={getDelayColor(item.delaiPrevu, item.depassementDelai)}>
                          Réel: {delaiReel}j
                        </div>
                      </div>
                    </div>
                    <div className="relative h-6">
                      {/* Barre prévue */}
                      <div
                        className="absolute top-0 left-0 h-3 bg-blue-200 rounded-full"
                        style={{ width: `${prevuWidth}%` }}
                      ></div>
                      {/* Barre réelle */}
                      <div
                        className={`absolute bottom-0 left-0 h-3 rounded-full ${
                          depassement > 0 ? "bg-red-500" : depassement < 0 ? "bg-green-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${reelWidth}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center mt-6 space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-200"></div>
                <span className="text-sm">Délai Prévu</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500"></div>
                <span className="text-sm">En avance</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500"></div>
                <span className="text-sm">À l'heure</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500"></div>
                <span className="text-sm">En retard</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}