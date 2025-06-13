import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, CheckCircle, Clock, XCircle, AlertCircle, MapPin } from "lucide-react"
import { KPICard } from "@/components/kpi-card"
import { GeographicMap } from "@/components/geographic-map"
import { BarChart } from "@/components/bar-chart"
import { LineChart } from "@/components/line-chart"
import { AlertsList } from "@/components/alerts-list"
import { FilesList } from "@/components/files-list"
import { useState, useEffect } from "react"

export function Dashboard() {
  const [selectedWell, setSelectedWell] = useState<string>("");
  const [wells, setWells] = useState<Well[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [kpiCounts, setKpiCounts] = useState<{[key: string]: number}>({});
  const [kpiLoading, setKpiLoading] = useState(true);

  interface Well {
    puitId: string;
    name: string;
    location: string;
    status: string;
  }

  // Fonction pour charger les compteurs KPI
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
    setIsLoading(true);
    fetch("http://localhost:8098/api/puits/ids")
      .then(res => {
        if (!res.ok) throw new Error("Erreur réseau");
        return res.json();
      })
      .then(data => {
        setWells(data);
        // Sélectionne le premier puits seulement si aucun n'est déjà sélectionné
        if (data.length > 0 && !selectedWell) {
          setSelectedWell(data[0].puitId);
        }
      })
      .catch(err => {
        console.error("Erreur:", err);
      })
      .finally(() => setIsLoading(false));

    // Charger les KPI
    loadKpiCounts();
  }, []);

  // Fonction pour obtenir la valeur d'un KPI ou une valeur par défaut
  const getKpiValue = (key: string, defaultValue: string = "0"): string => {
    if (kpiLoading) return "...";
    return kpiCounts[key]?.toString() || defaultValue;
  };

  // Calculer le nombre total de puits
  const getTotalWells = (): string => {
    if (kpiLoading) return "...";
    const total = Object.values(kpiCounts).reduce((sum, count) => sum + count, 0);
    return total.toString();
  };

  const kpiData: {
    title: string
    value: string
    icon: typeof CheckCircle | typeof Clock | typeof XCircle | typeof AlertCircle
    color: "blue" | "green" | "pink" | "yellow" | "red"
  }[] = [
    {
      title: "Nombre total de puits forés",
      value: getTotalWells(),
      icon: CheckCircle,
      color: "blue",
    },
    {
      title: "Nombre de puits terminés",
      value: getKpiValue("terminé", "0"), // Adapter selon votre structure de données
      icon: CheckCircle,
      color: "green",
    },
    {
      title: "Nombre de puits en cours",
      value: getKpiValue("En cours", "0"), // Adapter selon votre structure de données
      icon: Clock,
      color: "pink",
    },
    {
      title: "Nombre de puits en retard",
      value: getKpiValue("En retard", "0"), // Adapter selon votre structure de données
      icon: XCircle,
      color: "yellow",
    },
   
  ]

  const handleWellChange = (wellId: string) => {
    setSelectedWell(wellId);
    console.log("Puits sélectionné:", wellId);
  };

  const selectedWellInfo = wells.find(well => well.puitId === selectedWell);

  return (
    <div className="w-5/6 ml-[240px] p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-orange-600">Dashboard</h1>
        
        {/* Sélecteur de puits compact */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Puits :</span>
          <Select 
            value={selectedWell} 
            onValueChange={handleWellChange}
          >
            <SelectTrigger className="w-[200px] bg-white border-gray-300">
              <SelectValue placeholder={isLoading ? "Chargement..." : (wells.length > 0 ? "Sélectionner un puits" : "Aucun puits disponible")}>
                {selectedWellInfo && (
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{selectedWellInfo.name}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {wells.length === 0 ? (
                <SelectItem value="loading" disabled>
                  {isLoading ? "Chargement..." : "Aucun puits disponible"}
                </SelectItem>
              ) : (
                wells.map((well) => (
                  <SelectItem key={well.puitId} value={well.puitId}>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{well.name}</span>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {well.puitId} • {well.status}
                      </span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sélecteur de puits - Version simplifiée */}
      {selectedWellInfo && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">
                Dashboard du {selectedWellInfo.name}
              </span>
              <span className="text-blue-600">•</span>
              <span className="text-blue-600">
                {selectedWellInfo.location} - {selectedWellInfo.status}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards - Maintenant avec des valeurs dynamiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiData.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="h-[280px]">
          <CardHeader>
            <CardTitle>
              <p className="text-[16px]">Carte Géographique des Puits</p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GeographicMap />
          </CardContent>
        </Card>


        <Card className="h-[280px]">
          <CardHeader>
            <CardTitle> 
              <p className="text-[16px]">Coût global vs Budget Prévisionnel</p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={[
                { month: "Aug", actual: 5.5, budget: 6.2 },
                { month: "Sep", actual: 8.2, budget: 7.8 },
                { month: "Oct", actual: 6.8, budget: 7.2 },
                { month: "Nov", actual: 5.2, budget: 6.8 },
                { month: "Dec", actual: 7.8, budget: 8.2 },
                { month: "Jan", actual: 6.2, budget: 7.5 },
              ]}
              title="8,4 M DZD"
              subtitle="10 M DZD"
            />
          </CardContent>
        </Card>

        <Card className="h-[280px]">
          <CardHeader>
            <CardTitle>
              <p className="text-[16px]">Délai global vs Délai Prévisionnel</p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={[
                { month: "Aug", actual: 85, budget: 90 },
                { month: "Sep", actual: 123, budget: 95 },
                { month: "Oct", actual: 92, budget: 88 },
                { month: "Nov", actual: 78, budget: 85 },
                { month: "Dec", actual: 105, budget: 98 },
                { month: "Jan", actual: 88, budget: 92 },
              ]}
              title="325 Jours"
              subtitle="225 jours"
            />
          </CardContent>
        </Card>
      </div>

      {/* Delay Statistics */}
      <div className="grid grid-cols-1 bg-re-400 lg:grid-cols-2 gap-6">
        <Card className="h-[250px]"> 
          <CardHeader>
            <CardTitle>
              <p className="text-[18px] h-1/3">Dépassement moyen des délais</p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center h-2/3 ">
              <div className="text-3xl font-bold text-green-600 mb-2">+ 2,3 Jours</div>
              <div className="text-sm text-gray-600 mb-4">Délai moyen par puits terminés</div>
              <div className="text-2xl font-semibold">14,2 Jours</div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-[250px]">
          <CardHeader>
            <CardTitle>
              <p className="text-[18px]">Visualisation de l'avancement globale des phases</p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <p className="text-[18px]">Alertes & Notifications</p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AlertsList />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <p className="text-[18px]">Derniers Fichiers reçus / manquants</p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FilesList />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}