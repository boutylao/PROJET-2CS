"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, DollarSign, Clock, FileText, Eye, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { WellCostSummary } from "@/components/well-cost-summary"
import { WellDelaySummary } from "@/components/well-delay-summary"
import { WellReports } from "@/components/well-reports"

// Define the structure of a Well as it comes from your Spring Boot API /api/puits/{id}
interface Well {
  puitId: string;
  puitName: string;
  location: string;
  totalDepth: number; // This would typically be the *planned* total depth
  status: string;
  currentPhase?: string;
  cost?: string;
  delay?: string;
  // plannedDays?: number; // REMOVED - no longer directly on Well
  actualDays?: number; // Total actual days spent so far (might be redundant with reports.day)
  sections?: { name: string; size: string; depth: number; plannedDays: number }[]; // Still useful for section-specific visualization if plannedDays per section is available.
  objectives?: string[];
  progress?: {
    cost: number;
    delay: number;
  };
  currentDay?: number; // Current actual day (might be redundant with latest report's day)
  coreInfo?: string;
}

// Interface for Report data from /api/reports/puit/{wellId}
interface ReportItem {
  id: string;
  phase: string;
  depth: string; // Assuming this comes as a string, parse it to number
  date: string;
  drillingProgress: string;
  day: string; // Assuming this comes as a string, parse it to number
  operationsDescriptions?: string[];
  plannedOperation: string;
  remarks?: string[];
}

// Interface pour les données de phase
interface PhaseItem {
  phaseName: string
  coutPrevu: number
  coutReel: number
  delaiPrevu: number // THIS IS THE PLANNED DURATION FOR THE PHASE
  depthPrevu: number // End depth of this phase
  depthReel: number // Actual end depth of this phase
  delaiReel: number
  depassementCout: boolean
  depassementDelai: boolean
  etatCout: string
  etatDelai: string
  couleurCout: string
  couleurDelai: string
}

interface WellDetailsProps {
  wellId: string;
}

// Composant pour le graphique d'avancement
const WellProgressChart = ({ well, reports, phaseData }: { well: Well, reports: ReportItem[], phaseData: PhaseItem[] }) => {

  // --- Planned Progress Points (from phaseData's delaiPrevu and depthPrevu) ---
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

  // Add a starting point for planned progress
  const plannedChartPoints = [
    { day: 0, depth: 0, type: 'planned', phase: 'Start' }, 
    ...plannedProgressPoints
  ];
  // The overall planned total depth is well.totalDepth
  // The overall planned total days is the last cumulativePlannedDays
  const overallPlannedDays = plannedProgressPoints.length > 0 ? plannedProgressPoints[plannedProgressPoints.length - 1].day : 0;


  // --- Actual Progress Points (from reports) ---
  const actualProgressPoints = reports
  .map(report => ({
    day: parseFloat(report.day), // Parse day string to number
    depth: parseFloat(report.depth), // Parse depth string to number
    type: 'actual',
    phase: report.phase
  }))
  .filter(point => !isNaN(point.day) && !isNaN(point.depth)) // Filter out invalid points
  .sort((a, b) => a.day - b.day); // Sort by day to ensure correct line drawing

  // Ensure actual progress starts from (0,0) if there are reports
  const actualChartPoints = actualProgressPoints.length > 0
  ? [{ day: 0, depth: 0, type: 'actual', phase: 'Actual Start' }, ...actualProgressPoints]
  : [];

    const combinedData: any[] | undefined = [];
  
    // Add all planned points
    plannedChartPoints.forEach(point => {
      combinedData.push({
        day: point.day,
        plannedDepth: point.depth,
        actualDepth: null,
        phase: point.phase
      });
    });
    actualChartPoints.forEach(point => {
      // Check if we already have a data point for this day
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

  // Determine max values for scaling, considering both planned and actual data
  const allXValues = [
    overallPlannedDays,
    ...reports.map(r => parseFloat(r.day)).filter(d => !isNaN(d))
  ];
  const allYValues = [
    well.totalDepth || 0,
    ...phaseData.map(p => p.depthPrevu),
    ...reports.map(r => parseFloat(r.depth)).filter(d => !isNaN(d))
  ];

  const currentDay = actualProgressPoints.length > 0 ? Math.max(...actualProgressPoints.map(p => p.day)) : 0;
  const currentDepth = actualProgressPoints.length > 0 ? Math.max(...actualProgressPoints.map(p => p.depth)) : 0;
  const maxDepth = Math.max(well.totalDepth || 0, ...phaseData.map(p => p.depthPrevu));
  const maxTime = Math.max(...allXValues, overallPlannedDays);
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

  // Custom dot for highlighting current position
  const CustomDot = (props: any) => {
    const { cx, cy, payload, dataKey } = props;
    
    // Only highlight the last actual point
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

  // Chart dimensions in pixels (relative to the container)
  const CHART_WIDTH = 320;
  const CHART_HEIGHT = 240;

  // Function to convert data coordinates to pixel coordinates
  const getPixelCoords = (x: number, y: number) => {
    const pixelX = (x / maxTime) * CHART_WIDTH;
    const pixelY = CHART_HEIGHT - (y / maxDepth) * CHART_HEIGHT; // SVG y-axis is inverted for depth
    return { x: pixelX, y: pixelY };
  };

  // const plannedPolylinePoints = plannedChartPoints.map(point => {
  //   const coords = getPixelCoords(point.x, point.y);
  //   return `${coords.x},${coords.y}`;
  // }).join(' ');

  // const actualPolylinePoints = actualChartPoints.map(point => {
  //   const coords = getPixelCoords(point.x, point.y);
  //   return `${coords.x},${coords.y}`;
  // }).join(' ');

  return (
    <Card className="w-[480px] shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
    <CardHeader className="pb-2">
      <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
        Visualisation de l'avancement global
      </CardTitle>
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          <span>Planifié: {overallPlannedDays} jours</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>TD: {well.totalDepth}ft</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Progression: {progressPercentage.toFixed(1)}%</span>
        </div>
      </div>
    </CardHeader>
    <CardContent className="pt-4">
      <div className="relative h-96 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 shadow-inner">
        
        {/* Current Status Indicator */}
        {actualChartPoints.length > 0 && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-gray-200 z-10">
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
        )}

        {/* Core Info */}
        {well.coreInfo && (
          <div className="absolute top-4 right-4 text-xs text-gray-600 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm border border-gray-200 z-10">
            {well.coreInfo}
          </div>
        )}

        {/* Recharts Graph */}
        <div className="h-80 mt-8">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={combinedData}
              margin={{
                top: 20,
                right: 30,
                left: 40,
                bottom: 60,
              }}
            >
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
              
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#e2e8f0" 
                strokeOpacity={0.6}
              />
              
              <XAxis 
                dataKey="day"
                type="number"
                scale="linear"
                domain={['dataMin', 'dataMax']}
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                tickLine={{ stroke: '#94a3b8' }}
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
              
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />

              {/* Planned Line */}
              <Line
                type="linear"
                dataKey="plannedDepth"
                stroke="#f97316"
                strokeWidth={3}
                dot={<CustomDot />}
                connectNulls={false}
                name="Planifié"
                fill="url(#plannedGradient)"
              />

              {/* Actual Line */}
              <Line
                type="linear"
                dataKey="actualDepth"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={<CustomDot />}
                connectNulls={false}
                name="Réel"
                fill="url(#actualGradient)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Axis Labels */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-sm font-semibold text-gray-700 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200">
          Temps (Jours)
        </div>
      </div>

      {/* Modern Legend */}
      <div className="flex justify-center gap-8 mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 shadow-sm"></div>
          <span className="text-sm font-medium text-gray-700">Planifié</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm"></div>
          <span className="text-sm font-medium text-gray-700">Réel</span>
        </div>
      </div>
    </CardContent>
  </Card>
  );
};

export function WellDetails({ wellId }: WellDetailsProps) {
  const [activeTab, setActiveTab] = useState("visualisation");
  const [well, setWell] = useState<Well | null>(null);
  const [reportsData, setReportsData] = useState<ReportItem[]>([]); // New state for reports
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phaseData, setPhaseData] = useState<PhaseItem[]>([]);
  const [phaseLoading, setPhaseLoading] = useState(true);

  // Fetch well details
  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:8098/api/puits/${wellId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError(`Puit avec l'ID "${wellId}" non trouvé.`);
          } else {
            setError(`Erreur lors du chargement des détails du puit: ${response.statusText}`);
          }
          setWell(null);
          return;
        }
        const data: Well = await response.json();
        setWell(data); // Set well data first

        // Fetch current phase in parallel if needed, not blocking main well data
        try {
          const phaseResponse = await fetch(`http://localhost:8098/api/puits/${wellId}/current-phase`);
          if (phaseResponse.ok) {
            const phaseText = await phaseResponse.text();
            setWell(prevWell => prevWell ? { ...prevWell, currentPhase: phaseText === "Aucune phase disponible" ? "N/A" : phaseText } : null);
          } else {
            console.warn(`Could not fetch current phase for ${wellId}: Status ${phaseResponse.status}`);
          }
        } catch (phaseError) {
          console.error(`Error fetching current phase for ${wellId}:`, phaseError);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Impossible de se connecter au serveur. Veuillez vérifier l'API.");
        setWell(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (wellId) {
      fetchDetails();
    }
  }, [wellId]);

  // Fetch reports data
  useEffect(() => {
    const fetchReports = async () => {
      if (!wellId) return;
      try {
        const reportsResponse = await fetch(`http://localhost:8098/api/reports/puit/${wellId}`);
        if (!reportsResponse.ok) {
          console.warn(`Could not fetch reports for ${wellId}: Status ${reportsResponse.status}`);
          setReportsData([]); // Set to empty array on error
          return;
        }
        const data: ReportItem[] = await reportsResponse.json();
        setReportsData(data);
      } catch (err) {
        console.error("Error fetching reports:", err);
        setReportsData([]); // Set to empty array on error
      }
    };

    if (wellId) {
      fetchReports();
    }
  }, [wellId]);


  // Fetch phase data (unchanged from your previous request)
  useEffect(() => {
    const fetchPhaseData = async () => {
      if (!wellId) return;

      setPhaseLoading(true);
      try {
        const phases = ['26"', '16"', '12"', '8"'];
        const phasePromises = phases.map(async (phaseName) => {
          try {
            const phaseUrl = `http://localhost:8098/previsions/etat-par-phase/${wellId}/${phaseName}`;
            const phaseResponse = await fetch(phaseUrl);
            if (!phaseResponse.ok) {
              console.warn(`Could not fetch phase data for ${phaseName}: Status ${phaseResponse.status}`);
              return null;
            }
            const phase: PhaseItem = await phaseResponse.json();
            return phase;
          } catch (e) {
            console.error(`Error fetching phase ${phaseName}:`, e);
            return null;
          }
        });

        const phaseResults = await Promise.all(phasePromises);
        const validPhases = phaseResults.filter((phase): phase is PhaseItem => phase !== null);
        setPhaseData(validPhases);
      } catch (err) {
        console.error("Error fetching phase data:", err);
      } finally {
        setPhaseLoading(false);
      }
    };

    fetchPhaseData();
  }, [wellId]);

  // Display loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
        <span className="text-lg text-gray-700">Chargement des détails du puit...</span>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-red-100 p-6 rounded-md shadow-md">
        <p className="text-xl text-red-700">{error}</p>
      </div>
    );
  }

  // If no well data after loading (e.g., ID was invalid or deleted)
  if (!well) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-yellow-100 p-6 rounded-md shadow-md">
        <p className="text-xl text-yellow-700">Aucune donnée de puit disponible pour l'ID "{wellId}".</p>
      </div>
    );
  }

  const sidebarItems = [
    { id: "visualisation", label: "Visualisation", icon: BarChart3 },
    { id: "cout", label: "Coût", icon: DollarSign },
    { id: "delai", label: "Délai", icon: Clock },
    { id: "rapport", label: "Rapport", icon: FileText },
  ]

  const renderVisualisationContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 w-[930px]">
        {/* Progress Chart - Pass reportsData and phaseData */}
        <WellProgressChart well={well} reports={reportsData} phaseData={phaseData} />

        {/* Well Architecture */}
        <Card className="w-[550px]">
          <CardHeader>
            <CardTitle className="text-lg">Architecture du sondage du puit {well.puitId}
              <div className="flex text-sm font-normal pt-4"> <p>Phase </p>
              <p className="pl-[45px]">Prévision </p>
              <p className="pl-[320px]">Réel </p></div>

            </CardTitle>
          </CardHeader>
          <CardContent>
            {phaseLoading ? (
              <div className="flex items-center justify-center h-[420px]">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                <span>Chargement des données de phase...</span>
              </div>
            ) : (
              <div className="flex justify-around items-start w-[500px] h-[420px]">
                <div className="flex flex-col items-start h-full pt-6 gap-[80px]">
                  <div className="flex flex-col items-center gap-[42px]">
                    {/* Dynamic Phases based on fetched data */}
                    {phaseData.map((phase, index) => (
                      <p key={index} className="font-semibold">{phase.phaseName}</p>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col ml-10 items-start h-full pt-6 gap-[80px]">
                  <div className="flex flex-col items-center gap-[42px]">
                    {/* Profondeurs prévues */}
                    {phaseData.map((phase, index) => (
                      <p key={index} className="font-semibold text-blue-600">
                        {phase.depthPrevu}m
                      </p>
                    ))}
                  </div>
                </div>

                <div className="h-[400px] w-[350px] flex items-start">
                  <div className="relative w-full h-[300px]">
                    {/* Parois vertes gauche */}
                    <div className="absolute left-[40px] w-[20px] h-[60px] top-0 bg-yellow-400 z-10" />
                    <div className="absolute left-[65px] w-[20px] h-[110px] top-0 bg-yellow-400 z-10" />
                    <div className="absolute left-[90px] w-[20px] h-[175px] top-0 bg-yellow-400 z-10" />

                    {/* Parois vertes droite */}
                    <div className="absolute right-[37px] w-[20px] h-[60px] top-0" style={{ backgroundColor: phaseData[0]?.depthReel < phaseData[0]?.depthPrevu ? 'red' : phaseData[0]?.depthReel > phaseData[0]?.depthPrevu ? 'green' : 'green', zIndex: 10 }} />
                    <div className="absolute right-[62px] w-[20px] h-[110px] top-0" style={{ backgroundColor: phaseData[1]?.depthReel < phaseData[1]?.depthPrevu ? 'red' : phaseData[1]?.depthReel > phaseData[1]?.depthPrevu ? 'green' : 'green', zIndex: 10 }} />
                    <div className="absolute right-[86px] w-[20px] h-[175px] top-0" style={{ backgroundColor: phaseData[2]?.depthReel < phaseData[2]?.depthPrevu ? 'red' : phaseData[2]?.depthReel > phaseData[2]?.depthPrevu ? 'green' : 'green', zIndex: 10 }} />

                    {/* Corps du puits */}
                    <div className="absolute right-[107px] top-[175px] w-1/4 h-[250px] bg-white border-2 border-black">
                      {/* R1 R2 R3 + barres jaunes */}
                      <div className="absolute top-[200px] left-1/2 -translate-x-1/2 text-sm">R1</div>
                      <div className="absolute top-[130px] left-1/2 -translate-x-1/2 text-sm">R2</div>
                      <div className="absolute top-[60px] left-1/2 -translate-x-1/2 text-sm">R3</div>

                      {[60, 130, 200].map((top, i) => (
                        <div key={i}>
                          <div className="absolute left-[-25px] w-[30px] h-[8px] bg-yellow-400" style={{ top: `${top}px` }} />
                          <div className="absolute right-[-25px] w-[30px] h-[8px] bg-yellow-400" style={{ top: `${top}px` }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col ml-10 items-start h-full pt-6 gap-[80px]">
                  <div className="flex flex-col items-center gap-[42px]">
                    {/* Profondeurs réelles */}
                    {phaseData.map((phase, index) => (
                      <p key={index} className={`font-semibold ${
                        phase.depthReel < phase.depthPrevu ? 'text-red-600' :
                        phase.depthReel > phase.depthPrevu ? 'text-green-600' :
                        'text-gray-600'
                      }`}>
                        {phase.depthReel > 0 ? `${phase.depthReel}m` : 'N/A'}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cost and Delay Summary */}
     {/* Cost and Delay Summary - MODIFIED TO USE PHASE DATA */}
     <Card>
          <CardHeader>
            <CardTitle className="text-lg">Délai & Coût du sondage global</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Cost */}
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">Coût</h3>
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="#f3f4f6" strokeWidth="12" fill="none" />
                    {/* Calculate cost progress based on phaseData */}
                    {(() => {
                      const totalCoutPrevu = phaseData.reduce((sum, phase) => sum + phase.coutPrevu, 0);
                      const totalCoutReel = phaseData.reduce((sum, phase) => sum + phase.coutReel, 0);
                      
                      let costProgress = 0;
                      if (totalCoutPrevu > 0) {
                        costProgress = (totalCoutReel / totalCoutPrevu) * 100;
                      } else if (totalCoutReel > 0) {
                          costProgress = 100; // If no planned cost but actual cost exists
                      }

                      // Clamp between 0 and 100 for display
                      const displayCostProgress = Math.min(100, Math.max(0, costProgress));
                      const strokeColor = costProgress > 100 ? '#ef4444' : '#f59e0b'; // Red if over budget, orange otherwise

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
                      {/* Display a simple percentage or actual vs planned */}
                      {(() => {
                          const totalCoutPrevu = phaseData.reduce((sum, phase) => sum + phase.coutPrevu, 0);
                          const totalCoutReel = phaseData.reduce((sum, phase) => sum + phase.coutReel, 0);
                          if (totalCoutPrevu === 0 && totalCoutReel === 0) return 'N/A';
                          return `${((totalCoutReel / (totalCoutPrevu || 1)) * 100).toFixed(0)}%`;
                      })()}
                    </span>
                  </div>
                </div>
                {/* You might want to add more specific cost comparison here, e.g., actual vs. planned */}
                <p className="text-sm text-gray-600">
                  Prévu: {phaseData.reduce((sum, p) => sum + p.coutPrevu, 0).toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
                </p>
                <p className="text-sm text-gray-600">
                  Réel: {phaseData.reduce((sum, p) => sum + p.coutReel, 0).toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
                </p>
              </div>

              {/* Delay */}
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">Délai</h3>
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="#f3f4f6" strokeWidth="12" fill="none" />
                    {/* Calculate delay progress based on phaseData */}
                    {(() => {
                      const totalDelaiPrevu = phaseData.reduce((sum, phase) => sum + phase.delaiPrevu, 0);
                      const totalDelaiReel = phaseData.reduce((sum, phase) => sum + phase.delaiReel, 0);
                      
                      let delayProgress = 0;
                      if (totalDelaiPrevu > 0) {
                        delayProgress = (totalDelaiReel / totalDelaiPrevu) * 100;
                      } else if (totalDelaiReel > 0) {
                          delayProgress = 100; // If no planned delay but actual delay exists
                      }

                      // Clamp between 0 and 100 for display
                      const displayDelayProgress = Math.min(100, Math.max(0, delayProgress));
                      const strokeColor = delayProgress > 100 ? '#ef4444' : '#10b981'; // Red if over delay, green otherwise

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
                      {/* Display a simple percentage or actual vs planned */}
                      {(() => {
                          const totalDelaiPrevu = phaseData.reduce((sum, p) => sum + p.delaiPrevu, 0);
                          const totalDelaiReel = phaseData.reduce((sum, p) => sum + p.delaiReel, 0);
                          if (totalDelaiPrevu === 0 && totalDelaiReel === 0) return 'N/A';
                          return `${((totalDelaiReel / (totalDelaiPrevu || 1)) * 100).toFixed(0)}%`;
                      })()}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Prévu: {phaseData.reduce((sum, p) => sum + p.delaiPrevu, 0)} jours
                </p>
                <p className="text-sm text-gray-600">
                  Réel: {phaseData.reduce((sum, p) => sum + p.delaiReel, 0)} jours
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Phase Summary Table */}
      {!phaseLoading && phaseData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Résumé des Phases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-4 font-medium text-gray-600 border-b">Phase</th>
                    <th className="text-left p-4 font-medium text-gray-600 border-b">Profondeur Prévue</th>
                    <th className="text-left p-4 font-medium text-gray-600 border-b">Profondeur Réelle</th>
                    <th className="text-left p-4 font-medium text-gray-600 border-b">Délai Prévu</th>
                    <th className="text-left p-4 font-medium text-gray-600 border-b">Délai Réel</th>
                    <th className="text-left p-4 font-medium text-gray-600 border-b">Statut Coût</th>
                    <th className="text-left p-4 font-medium text-gray-600 border-b">Statut Délai</th>
                  </tr>
                </thead>
                <tbody>
                  {phaseData.map((phase, index) => (
                    <tr key={index} className="hover:bg-gray-50 border-b">
                      <td className="p-4 font-medium text-sm">{phase.phaseName}</td>
                      <td className="p-4 text-blue-600 text-sm">{phase.depthPrevu}m</td>
                      <td className={`p-4 text-sm ${
                        phase.depthReel > phase.depthPrevu ? 'text-red-600' :
                        phase.depthReel < phase.depthPrevu ? 'text-green-600' :
                        'text-gray-600'
                      }`}>
                        {phase.depthReel > 0 ? `${phase.depthReel}m` : 'N/A'}
                      </td>
                      <td className="p-4 text-orange-600 text-sm">{phase.delaiPrevu}j</td>
                      <td className="p-4 text-sm">{phase.delaiReel}j</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          phase.etatCout === "DANGER" ? "bg-red-100 text-red-600" :
                          phase.etatCout === "NORMAL" ? "bg-green-100 text-green-800" :
                          phase.etatCout === "ATTENTION" ? "bg-yellow-100 text-yellow-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {phase.etatCout}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          phase.etatDelai === "DANGER" ? "bg-red-100 text-red-600" :
                          phase.etatDelai === "NORMAL" ? "bg-green-100 text-green-800" :
                          phase.etatDelai === "ATTENTION" ? "bg-yellow-100 text-yellow-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {phase.etatDelai}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case "visualisation":
        return renderVisualisationContent()
      case "cout":
        return <WellCostSummary wellId={well.puitId} />
      case "delai":
        return <WellDelaySummary wellId={well.puitId} />
      case "rapport":
        return <WellReports wellId={well.puitId} />
      default:
        return renderVisualisationContent()
    }
  }

  const getPageTitle = () => {
    switch (activeTab) {
      case "cout":
        return `Sommaire des coûts du puit ${well.puitName || well.puitId}`
      case "delai":
        return `Sommaire des délais du puit ${well.puitName || well.puitId}`
      case "rapport":
        return `Rapports du puit ${well.puitName || well.puitId}`
      default:
        return `Visualisation de l'avancement globale des phases du puit ${well.puitName || well.puitId}`
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className=" bg-gradient-to-b w-[220px] from-orange-600 to-orange-800 rounded-tr-3xl text-white">
        <nav className="mt-8">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center px-6 py-4 text-left hover:bg-orange-700 transition-colors",
                  activeTab === item.id && "bg-orange-700 border-r-4 border-white",
                )}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
        </div>
        <main className="flex-1 overflow-auto p-6">{renderTabContent()}</main>
      </div>
    </div>
  )
}