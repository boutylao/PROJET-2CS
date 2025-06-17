import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, CheckCircle, Clock, XCircle, AlertCircle, MapPin, BarChart3, DollarSign, FileText, Eye, Loader2 } from "lucide-react"
import { KPICard } from "@/components/kpi-card"
import { GeographicMap } from "@/components/geographic-map"
import { BarChart } from "@/components/bar-chart"
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { AlertsList } from "@/components/alerts-list"
import { FilesList } from "@/components/files-list"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface Well {
  puitId: string;
  puitName: string;
  name?: string;
  location: string;
  totalDepth: number;
  status: string;
  currentPhase?: string;
  cost?: string;
  delay?: string;
  delaiReel: number;
  actualDays?: number;
  sections?: { name: string; size: string; depth: number; plannedDays: number }[];
  objectives?: string[];
  progress?: {
    cost: number;
    delay: number;
  };
  currentDay?: number;
  coreInfo?: string;
}

interface ReportItem {
  id: string;
  phase: string;
  depth: string;
  date: string;
  drillingProgress: string;
  day: string;
  operationsDescriptions?: string[];
  plannedOperation: string;
  remarks?: string[];
}

interface PhaseItem {
  phaseName: string;
  coutPrevu: number;
  coutReel: number;
  delaiPrevu: number;
  depthPrevu: number;
  depthReel: number;
  delaiReel: number;
  depassementCout: boolean;
  depassementDelai: boolean;
  etatCout: string;
  etatDelai: string;
  couleurCout: string;
  couleurDelai: string;
}

const WellProgressChart = ({ well, reports, phaseData }: { well: Well, reports: ReportItem[], phaseData: PhaseItem[] }) => {
  let cumulativePlannedDays = 0;
  const plannedProgressPoints = phaseData.map((phase) => {
    cumulativePlannedDays += phase.delaiPrevu;
    return {
      day: cumulativePlannedDays,
      depth: phase.depthPrevu,
      type: 'planned',
      phase: phase.phaseName
    };
  });

  const plannedChartPoints = [
    { day: 0, depth: 0, type: 'planned', phase: 'Start' },
    ...plannedProgressPoints
  ];

  const overallPlannedDays = plannedProgressPoints.length > 0 ? plannedProgressPoints[plannedProgressPoints.length - 1].day : 0;

  const actualProgressPoints = reports
    .map(report => ({
      day: parseFloat(report.day),
      depth: parseFloat(report.depth),
      type: 'actual',
      phase: report.phase
    }))
    .filter(point => !isNaN(point.day) && !isNaN(point.depth))
    .sort((a, b) => a.day - b.day);

  const actualChartPoints = actualProgressPoints.length > 0
    ? [{ day: 0, depth: 0, type: 'actual', phase: 'Actual Start' }, ...actualProgressPoints]
    : [];

  const combinedData: any[] = [];
  
  plannedChartPoints.forEach(point => {
    combinedData.push({
      day: point.day,
      plannedDepth: point.depth,
      actualDepth: null,
      phase: point.phase
    });
  });
  
  actualChartPoints.forEach(point => {
    const existingPoint = combinedData.find(p => p.day === point.day);
    if (existingPoint) {
      existingPoint.actualDepth = point.depth;
    } else {
      combinedData.push({
        day: point.day,
        plannedDepth: null,
        actualDepth: point.depth,
        phase: point.phase
      });
    }
  });

  combinedData.sort((a, b) => a.day - b.day);

  const currentDay = actualProgressPoints.length > 0 ? Math.max(...actualProgressPoints.map(p => p.day)) : 0;
  const currentDepth = actualProgressPoints.length > 0 ? Math.max(...actualProgressPoints.map(p => p.depth)) : 0;
  const maxDepth = Math.max(well.totalDepth || 0, ...phaseData.map(p => p.depthPrevu));
  const progressPercentage = maxDepth > 0 ? (currentDepth / maxDepth) * 100 : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{`Jour ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey === 'plannedDepth' ? 'Planifié' : 'Réel'}: {entry.value}ft
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload, dataKey } = props;
    
    if (payload[dataKey] === null || payload[dataKey] === undefined) {
      return null;
    }

    if (dataKey === 'actualDepth' && payload.actualDepth === currentDepth && payload.day === currentDay) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={8} fill="#3b82f6" stroke="white" strokeWidth={3} />
          <circle cx={cx} cy={cy} r={12} fill="none" stroke="#3b82f6" strokeWidth={2} strokeOpacity={0.3}>
            <animate attributeName="r" values="12;18;12" dur="2s" repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
          </circle>
        </g>
      );
    }
    
    return <circle cx={cx} cy={cy} r={4} fill={dataKey === 'plannedDepth' ? '#f97316' : '#3b82f6'} />;
  };

  return (
    <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
          Visualisation de l'avancement global
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-[13px]">Planifié: {overallPlannedDays} jours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-[13px]">TD: {well.totalDepth}ft</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-[13px]">Progression: {progressPercentage.toFixed(1)}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="relative h-96 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 shadow-inner">
          {well.coreInfo && (
            <div className="absolute top-4 right-4 text-xs text-gray-600 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm border border-gray-200 z-10">
              {well.coreInfo}
            </div>
          )}

          <div className="h-[350px] w-full mt-8 pr-6">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart
                data={combinedData}
                margin={{ right: 30 }}>
                <defs>
                  <linearGradient id="plannedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                
                <XAxis
                  dataKey="day"
                  type="number"
                  scale="linear"
                  domain={['dataMin', 'dataMax']}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                  tickLine={{ stroke: '#94a3b8' }}
                  label={{
                    value: 'Temps (Jours)',
                    position: 'bottom',
                    offset: 0,
                    style: { textAnchor: 'middle', fill: '#64748b', fontSize: '12px', fontWeight: 'bold' }
                  }}
                />
                
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                  tickLine={{ stroke: '#94a3b8' }}
                  label={{
                    value: 'Profondeur (Pieds)',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: '#64748b', fontSize: '12px', fontWeight: 'bold' }
                  }}
                />
                
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="line" />

                <Line
                  type="linear"
                  dataKey="actualDepth"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={<CustomDot />}
                  connectNulls={true}
                  name="Profondeur actuelle en ft"
                  fill="url(#actualGradient)"
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>

          {/* {actualChartPoints.length > 0 && (
            <div className="top-4 left-4 mt-10 p-3 z-10">
              <div className="text-xs font-semibold text-gray-700 mb-1">Statut Actuel</div>
              <div className="text-sm font-bold text-blue-600">
                Jour {currentDay} - {currentDepth.toFixed(0)}ft
              </div>
              <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, progressPercentage)}%` }}
                ></div>
              </div>
            </div>
          )} */}
        </div>
      </CardContent>
    </Card>
  );
};

export function Dashboard() {
  const [selectedWell, setSelectedWell] = useState<string>("");
  const [wells, setWells] = useState<Well[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [kpiCounts, setKpiCounts] = useState<{[key: string]: number}>({});
  const [kpiLoading, setKpiLoading] = useState(true);
  const [reportsData, setReportsData] = useState<ReportItem[]>([]);
  const [phaseData, setPhaseData] = useState<PhaseItem[]>([]);
  const [phaseLoading, setPhaseLoading] = useState(true);
  const [totalPlannedDaysFinal, setTotalPlannedDaysFinal] = useState(0);
const [totalActualDaysFinal, setTotalActualDaysFinal] = useState(0);

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

  // Charger les données du puits sélectionné
  const loadSelectedWellData = async (wellId: string) => {
    if (!wellId) return;

    try {
      // Charger les rapports
      const reportsResponse = await fetch(`http://localhost:8098/api/reports/puit/${wellId}`);
      if (!reportsResponse.ok) {
        console.warn(`Could not fetch reports for ${wellId}: Status ${reportsResponse.status}`);
        setReportsData([]);
      } else {
        const reportsData: ReportItem[] = await reportsResponse.json();
        setReportsData(reportsData);
      }

      const loadSelectedWellData = async (wellId: string) => {
        if (!wellId) return;
      
        try {
          // Charger les rapports
          const reportsResponse = await fetch(`http://localhost:8098/api/reports/puit/${wellId}`);
          if (!reportsResponse.ok) {
            console.warn(`Could not fetch reports for ${wellId}: Status ${reportsResponse.status}`);
            setReportsData([]);
          } else {
            const reportsData: ReportItem[] = await reportsResponse.json();
            setReportsData(reportsData);
          }
      
          // Charger les données de phase
          setPhaseLoading(true);
          const phases = ['26"', '16"', '12"', '8"'];
          const phasePromises = phases.map(async (phaseName) => {
            try {
              const phaseUrl = `http://localhost:8098/previsions/etat-par-phase/${wellId}/${phaseName}`;
              const phaseResponse = await fetch(phaseUrl);
              if (!phaseResponse.ok) {
                console.warn(`Could not fetch phase data for ${phaseName}: Status ${phaseResponse.status}`);
                return null;
              }
              return await phaseResponse.json();
            } catch (e) {
              console.error(`Error fetching phase ${phaseName}:`, e);
              return null;
            }
          });
      
          const phaseResults = await Promise.all(phasePromises);
          const validPhases = phaseResults.filter((phase): phase is PhaseItem => phase !== null);
          setPhaseData(validPhases);
      
          // Calculer les totaux de jours
          if (validPhases.length > 0) {
            const lastPhase = validPhases[validPhases.length - 1];
            setTotalPlannedDaysFinal(lastPhase.delaiPrevu);
            setTotalActualDaysFinal(lastPhase.delaiReel);
          }
        } catch (err) {
          console.error("Error fetching well data:", err);
        } finally {
          setPhaseLoading(false);
        }
      };
      
      // Charger les données de phase
      setPhaseLoading(true);
      const phases = ['26"', '16"', '12"', '8"'];
      const phasePromises = phases.map(async (phaseName) => {
        try {
          const phaseUrl = `http://localhost:8098/previsions/etat-par-phase/${wellId}/${phaseName}`;
          const phaseResponse = await fetch(phaseUrl);
          if (!phaseResponse.ok) {
            console.warn(`Could not fetch phase data for ${phaseName}: Status ${phaseResponse.status}`);
            return null;
          }
          return await phaseResponse.json();
        } catch (e) {
          console.error(`Error fetching phase ${phaseName}:`, e);
          return null;
        }
      });

      const phaseResults = await Promise.all(phasePromises);
      setPhaseData(phaseResults.filter((phase): phase is PhaseItem => phase !== null));
    } catch (err) {
      console.error("Error fetching well data:", err);
    } finally {
      setPhaseLoading(false);
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
        if (data.length > 0 && !selectedWell) {
          setSelectedWell(data[0].puitId);
          loadSelectedWellData(data[0].puitId);
        }
      })
      .catch(err => {
        console.error("Erreur:", err);
      })
      .finally(() => setIsLoading(false));

    loadKpiCounts();
  }, []);

  const handleWellChange = (wellId: string) => {
    setSelectedWell(wellId);
    loadSelectedWellData(wellId);
  };

  const getKpiValue = (key: string, defaultValue: string = "0"): string => {
    if (kpiLoading) return "...";
    return kpiCounts[key]?.toString() || defaultValue;
  };

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
      value: getKpiValue("terminé", "0"),
      icon: CheckCircle,
      color: "green",
    },
    {
      title: "Nombre de puits en cours",
      value: getKpiValue("En cours", "0"),
      icon: Clock,
      color: "pink",
    },
    {
      title: "Nombre de puits en retard",
      value: getKpiValue("En retard", "0"),
      icon: XCircle,
      color: "yellow",
    },
  ]

  const selectedWellInfo = wells.find(well => well.puitId === selectedWell);

  return (
    <div className="w-5/6 ml-[240px] p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-orange-600">Dashboard</h1>
       
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Puits :</span>
          <Select value={selectedWell} onValueChange={handleWellChange}>
            <SelectTrigger className="w-[200px] bg-white border-gray-300">
              <SelectValue placeholder={isLoading ? "Chargement..." : (wells.length > 0 ? "Sélectionner un puits" : "Aucun puits disponible")}>
                {selectedWellInfo && (
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{selectedWellInfo.puitName || selectedWellInfo.name}</span>
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
                      <span className="font-medium text-sm">{well.puitName || well.name}</span>
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

      {selectedWellInfo && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">
                Dashboard du {selectedWellInfo.puitName || selectedWellInfo.name}
              </span>
              <span className="text-blue-600">•</span>
              <span className="text-blue-600">
                {selectedWellInfo.location} - {selectedWellInfo.status}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiData.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Section avec le graphique d'avancement */}
      {selectedWell && (
        <div className="grid grid-cols-1 gap-6">
          {phaseLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
              <span className="text-lg text-gray-700">Chargement des données du puits...</span>
            </div>
          ) : (
            <WellProgressChart 
              well={selectedWellInfo!} 
              reports={reportsData} 
              phaseData={phaseData} 
            />
          )}
        </div>
      )}
{selectedWell && !phaseLoading && (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Délai & Coût du sondage global</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Coût */}
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Coût</h3>
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="56" stroke="#f3f4f6" strokeWidth="12" fill="none" />
              {(() => {
                const totalCoutPrevu = phaseData.reduce((sum, phase) => sum + phase.coutPrevu, 0);
                const totalCoutReel = phaseData.reduce((sum, phase) => sum + phase.coutReel, 0);
                
                let costProgress = 0;
                if (totalCoutPrevu > 0) {
                  costProgress = (totalCoutReel / totalCoutPrevu) * 100;
                } else if (totalCoutReel > 0) {
                  costProgress = 100;
                }

                const displayCostProgress = Math.min(100, Math.max(0, costProgress));
                const strokeColor = costProgress > 100 ? '#ef4444' : '#10b981';

                return (
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke={strokeColor}
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${displayCostProgress * 3.51} 351`}
                    strokeLinecap="round"
                  />
                );
              })()}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">
                {(() => {
                  const totalCoutPrevu = phaseData.reduce((sum, phase) => sum + phase.coutPrevu, 0);
                  const totalCoutReel = phaseData.reduce((sum, phase) => sum + phase.coutReel, 0);
                  if (totalCoutPrevu === 0 && totalCoutReel === 0) return 'N/A';
                  return `${((totalCoutReel / (totalCoutPrevu || 1)) * 100).toFixed(0)}%`;
                })()}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Prévu: {phaseData.reduce((sum, p) => sum + p.coutPrevu, 0).toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
          </p>
          <p className="text-sm text-gray-600">
            Réel: {phaseData.reduce((sum, p) => sum + p.coutReel, 0).toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
          </p>
        </div>

        {/* Délai */}
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Délai</h3>
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="56" stroke="#f3f4f6" strokeWidth="12" fill="none" />
              {(() => {
                const totalDelaiPrevu = phaseData.reduce((sum, phase) => sum + phase.delaiPrevu, 0);
                const totalDelaiReel = phaseData.reduce((sum, phase) => sum + phase.delaiReel, 0);
                
                let delayProgress = 0;
                if (totalActualDaysFinal > 0) {
                  delayProgress = (totalActualDaysFinal / totalPlannedDaysFinal) * 100;
                } else if (totalActualDaysFinal > 0) {
                  delayProgress = 100;
                }

                const displayDelayProgress = Math.min(100, Math.max(0, delayProgress));
                const strokeColor = delayProgress > 100 ? '#ef4444' : '#10b981';

                return (
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke={strokeColor}
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${displayDelayProgress * 3.51} 351`}
                    strokeLinecap="round"
                  />
                );
              })()}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">
                {(() => {
                  if (totalPlannedDaysFinal === 0 && totalActualDaysFinal === 0) return 'N/A';
                  return `${((totalActualDaysFinal / (totalPlannedDaysFinal || 1)) * 100).toFixed(0)}%`;
                })()}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Prévu: {totalPlannedDaysFinal} jours
          </p>
          <p className="text-sm text-gray-600">
            Réel: {totalActualDaysFinal} jours
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
)}
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
      </div>

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
  );
}