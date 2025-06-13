"use client"
import { useState , useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { ArrowUpDown, Filter } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"

interface Well {
  puitId: string;
  name: string;
  location: string;
  status: string;
  phase?: string; // Ajout de la phase comme optionnelle
}

export function WellsList() {
  const [sortBy, setSortBy] = useState("date")
  // Initialize with a default phase from your actual phases, or an empty string for "All"
  const [filterPhase, setFilterPhase] = useState("All"); 
  const router = useRouter()
  const [selectedWell, setSelectedWell] = useState<string>("");
  const [wells, setWells] = useState<Well[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [kpiCounts, setKpiCounts] = useState<{[key: string]: number}>({});
  const [kpiLoading, setKpiLoading] = useState(true);
  const selectedWellInfo = wells.find(well => well.puitId === selectedWell);


  const fetchWellPhase = async (wellId: string): Promise<string> => {
    try {
      console.log(`Fetching phase for well ${wellId}`); 
      const response = await fetch(`http://localhost:8098/api/puits/${wellId}/current-phase`);
      
      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status} for well ${wellId}`);
        return "Erreur de récupération"; 
      }
  
      const data = await response.text(); 
      console.log(`Phase data for ${wellId}:`, data);
      
      return data || "N/A";
    } catch (error) {
      console.error(`Error fetching phase for well ${wellId}:`, error);
      return "Erreur";
    }
  };

  const loadKpiCounts = async () => {
    try {
      setKpiLoading(true);
      const response = await fetch("http://localhost:8098/api/puits/count-by-status");
      if (!response.ok) throw new Error("Erreur lors du chargement des KPI");
      const data = await response.json();
      setKpiCounts(data);
    } catch (error) {
      console.error("Erreur lors du chargement des KPI:", error);
    } finally {
      setKpiLoading(false);
    }
  };

  useEffect(() => {
    const fetchWellsAndKpis = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("http://localhost:8098/api/puits/ids");
        if (!res.ok) throw new Error("Erreur réseau lors du chargement des puits initiaux");
  
        const baseWells: Well[] = await res.json();
  
        const wellsWithPhase = await Promise.all(
          baseWells.map(async (well) => {
            const phase = await fetchWellPhase(well.puitId); 
            return {
              ...well,
              phase: phase, 
            };
          })
        );
  
        setWells(wellsWithPhase);
  
        if (wellsWithPhase.length > 0 && !selectedWell) {
          setSelectedWell(wellsWithPhase[0].puitId);
        }
  
      } catch (err) {
        console.error("Erreur lors du chargement des puits:", err);
      } finally {
        setIsLoading(false);
      }
      loadKpiCounts(); 
    };
  
    fetchWellsAndKpis();
  }, []); 
  
  // Fonction pour obtenir la valeur d'un KPI ou une valeur par défaut
  const getKpiValue = (key: string, defaultValue: string = "0"): string => {
    if (kpiLoading) return "...";
    return kpiCounts[key]?.toString() || defaultValue;
  };

  // Calculate total wells
  const getTotalWells = (): string => {
    if (kpiLoading) return "...";
    const total = Object.values(kpiCounts).reduce((sum, count) => sum + count, 0);
    return total.toString();
  };

  const kpiData = [
    {
      title: "Nombre de puits terminés",
      value: getKpiValue("terminé", "0"),
      icon: () => (
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 17L12 21L16 17" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 12V21" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path
              d="M20.88 18.09C21.7494 17.4786 22.4014 16.6061 22.7413 15.5991C23.0812 14.5921 23.0914 13.5014 22.7704 12.4875C22.4494 11.4735 21.8139 10.5877 20.9561 9.95806C20.0983 9.32846 19.0628 8.98284 18 8.98H16.74C16.4392 7.82809 15.8765 6.7393 15.0941 5.81614C14.3117 4.89297 13.3301 4.15758 12.2232 3.65967C11.1163 3.16176 9.91284 2.91237 8.70352 2.93208C7.4942 2.95179 6.30071 3.24 5.21 3.77C4.11929 4.29999 3.15758 5.0645 2.39379 6.00138C1.63001 6.93826 1.08546 8.02505 0.803846 9.18727C0.522231 10.3495 0.509729 11.5589 0.767127 12.7262C1.02453 13.8935 1.54577 14.9921 2.29 15.94"
              stroke="#2563EB"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ),
      color: "blue",
    },
    {
      title: "Nombre de puits en cours",
      value: getKpiValue("En cours", "0"),
      icon: () => (
        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8V12L15 15" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path
              d="M3.05078 11.0002C3.27441 8.80896 4.40466 6.7981 6.16388 5.44088C7.9231 4.08365 10.1421 3.50121 12.3249 3.8269C14.5077 4.15258 16.4463 5.35979 17.6885 7.14571C18.9307 8.93164 19.3656 11.1399 18.8832 13.2417C18.4008 15.3435 17.0469 17.1631 15.1342 18.2814C13.2215 19.3997 10.9085 19.7218 8.73211 19.1747C6.55569 18.6276 4.69252 17.2615 3.5235 15.3582C2.35447 13.4549 2.00231 11.1662 2.54078 9.00024"
              stroke="#F59E0B"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ),
      color: "yellow",
    },
    {
      title: "Délai moyen réel par puits",
      value: "123 jours",
      icon: () => (
        <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8V12L15 15" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="#EC4899"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ),
      color: "pink",
    },
    {
      title: "Coût moyen réel par puits",
      value: "50,000 $",
      icon: () => (
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2V6" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 18V22" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path
              d="M4.93 4.93L7.76 7.76"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16.24 16.24L19.07 19.07"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M2 12H6" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18 12H22" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path
              d="M4.93 19.07L7.76 16.24"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16.24 7.76L19.07 4.93"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="12"
              cy="12"
              r="3"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ),
      color: "green",
    },
  ]

  const handleViewDetails = (wellId: string) => {
    router.push(`/wells/${wellId}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Terminé":
        return "text-green-600"
      case "Retard":
        return "text-red-600"
      case "Suspendu":
        return "text-orange-600"
      case "En cours":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  // Filtered wells based on the selected phase
  const filteredWells = wells.filter(well => {
    // If "All" is selected, show all wells. Otherwise, match the phase.
    return filterPhase === "All" || well.phase === filterPhase;
  });

  return (
    <div className="w-5/6 ml-[250px] p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Liste Puits</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <Card key={index} className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                {kpi.icon()}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 mb-1">{kpi.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-xl font-semibold text-gray-800">Liste des Puits</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="w-64">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full">
              <div className="flex items-center">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <span>Trier Par: {sortBy === "date" ? "Date" : sortBy}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="cost">Coût</SelectItem>
              <SelectItem value="delay">Délai</SelectItem>
              <SelectItem value="status">État</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-64">
          <Select value={filterPhase} onValueChange={setFilterPhase}>
            <SelectTrigger className="w-full">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <span>Filtre: Phase={filterPhase === "All" ? "Toutes" : filterPhase}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              {/* Add an "All" option to show all wells */}
              <SelectItem value="All">Toutes les phases</SelectItem>
              {/* Use your provided phase values */}
              <SelectItem value="26'">Phase=&quot;26 &quot;</SelectItem>
              <SelectItem value="16'">Phase=&quot;16 &quot;</SelectItem>
              <SelectItem value="12'1/4">Phase=&quot;12 1/4&quot;</SelectItem>
              <SelectItem value="8'1/2">Phase=&quot;8 1/2&quot;</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Wells Table */}
      <div className="border rounded-md">
       <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>Puit</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Phase</TableHead>
              <TableHead>Etat</TableHead>
              <TableHead>Détail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Render filtered wells */}
            {filteredWells.map((well) => (
              <TableRow key={well.puitId}>
                <TableCell>{well.puitId}</TableCell>
                <TableCell>{well.name}</TableCell>
                <TableCell>{well.location}</TableCell>
                <TableCell>{well.phase }</TableCell>
                <TableCell className={getStatusColor(well.status)}>{well.status}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    className="border-orange-500 text-orange-500 hover:bg-orange-50"
                    onClick={() => handleViewDetails(well.puitId)}
                  >
                    Détail
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}