"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
      x: cumulativePlannedDays,
      y: phase.depthPrevu,
      label: `${phase.phaseName}\n@ ${phase.depthPrevu}m (${phase.delaiPrevu} days)`
    };
  });

  // Add a starting point for planned progress
  const plannedChartPoints = [{ x: 0, y: 0, label: "Start" }, ...plannedProgressPoints];

  // The overall planned total depth is well.totalDepth
  // The overall planned total days is the last cumulativePlannedDays
  const overallPlannedDays = plannedProgressPoints.length > 0 ? plannedProgressPoints[plannedProgressPoints.length - 1].x : 0;


  // --- Actual Progress Points (from reports) ---
  const actualProgressPoints = reports
    .map(report => ({
      x: parseFloat(report.day), // Parse day string to number
      y: parseFloat(report.depth), // Parse depth string to number
      label: `Report Day ${report.day}: ${report.depth}ft`
    }))
    .filter(point => !isNaN(point.x) && !isNaN(point.y)) // Filter out invalid points
    .sort((a, b) => a.x - b.x); // Sort by day to ensure correct line drawing

  // Ensure actual progress starts from (0,0) if there are reports
  const actualChartPoints = actualProgressPoints.length > 0
    ? [{ x: 0, y: 0, label: "Actual Start" }, ...actualProgressPoints]
    : [];

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

  const maxTime = Math.max(1, ...allXValues);
  const maxDepth = Math.max(1, ...allYValues);

  // Chart dimensions in pixels (relative to the container)
  const CHART_WIDTH = 320;
  const CHART_HEIGHT = 240;

  // Function to convert data coordinates to pixel coordinates
  const getPixelCoords = (x: number, y: number) => {
    const pixelX = (x / maxTime) * CHART_WIDTH;
    const pixelY = CHART_HEIGHT - (y / maxDepth) * CHART_HEIGHT; // SVG y-axis is inverted for depth
    return { x: pixelX, y: pixelY };
  };

  // Create points for the planned polyline
  const plannedPolylinePoints = plannedChartPoints.map(point => {
    const coords = getPixelCoords(point.x, point.y);
    return `${coords.x},${coords.y}`;
  }).join(' ');

  // Create points for the actual polyline
  const actualPolylinePoints = actualChartPoints.map(point => {
    const coords = getPixelCoords(point.x, point.y);
    return `${coords.x},${coords.y}`;
  }).join(' ');

  return (
    <Card className="w-[450px]">
      <CardHeader>
        <CardTitle className="text-lg mb-8">Visualisation de l'avancement globale des phases</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-80 bg-yellow-50 rounded-lg overflow-hidden p-4">
          {/* Background Grid */}
          <div className="absolute inset-4">
            {/* Vertical Lines (Time Axis) */}
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={`v-${i}`}
                className="absolute top-0 bottom-0 border-l border-yellow-200"
                style={{ left: `${(i / 8) * 100}%` }}
              />
            ))}
            {/* Horizontal Lines (Depth Axis) */}
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={`h-${i}`}
                className="absolute left-0 right-0 border-t border-yellow-200"
                style={{ top: `${(i / 6) * 100}%` }}
              />
            ))}
          </div>

          {/* Axes and Labels */}
          {/* Y-Axis - Profondeur */}
          <div className="absolute left-2 top-4 bottom-4 flex flex-col justify-between text-xs text-gray-600">
            {Array.from({ length: 6 }).map((_, i) => { // 0, 20%, 40%, 60%, 80%, 100%
              const depthValue = Math.round((maxDepth * (5 - i)) / 5); // Inverted for display
              return <span key={i}>{depthValue}</span>;
            })}
          </div>

          {/* X-Axis - Temps */}
          <div className="absolute bottom-2 left-12 right-4 flex justify-between text-xs text-gray-600">
            {Array.from({ length: 5 }).map((_, i) => { // 0, 25%, 50%, 75%, 100%
              const timeValue = Math.round((maxTime * i) / 4);
              return <span key={i}>{timeValue}</span>;
            })}
          </div>

          {/* Chart Area */}
          <div className="absolute left-12 top-8  right-4 bottom-8">
            <svg className="w-full h-full">
              {/* Planned Line (Red) */}
              <polyline
                fill="none"
                stroke="#dc2626"
                strokeWidth="3"
                points={plannedPolylinePoints}
              />

              {/* Planned Data Points (Red) */}
              {plannedChartPoints.map((point, i) => {
                const coords = getPixelCoords(point.x, point.y);
                return (
                  <circle
                    key={`planned-${i}`}
                    cx={coords.x}
                    cy={coords.y}
                    r="4"
                    fill="#dc2626"
                  />
                );
              })}

              {/* Actual Line (Blue) */}
              {actualChartPoints.length > 1 && ( // Only draw if there's more than just the start point
                <polyline
                  fill="none"
                  stroke="#3b82f6" // Blue color for actual
                  strokeWidth="3"
                  points={actualPolylinePoints}
                />
              )}

              {/* Actual Data Points (Blue) */}
              {actualChartPoints.map((point, i) => {
                const coords = getPixelCoords(point.x, point.y);
                return (
                  <circle
                    key={`actual-${i}`}
                    cx={coords.x}
                    cy={coords.y}
                    r="4"
                    fill="#3b82f6" // Blue color for actual
                  />
                );
              })}
            </svg>
          </div>

          {/* Labels for Planned points */}
          {/* {plannedChartPoints.map((point, i) => {
            if (point.label === "Start") return null;
            const coords = getPixelCoords(point.x, point.y);
            return (
              <div
                key={`label-planned-${i}`}
                className="absolute text-[10px] text-gray-700 px-1 py-0.5 rounded shadow-sm whitespace-pre-wrap text-center"
                style={{
                  left: `calc(12px + ${(coords.x / CHART_WIDTH) * (360-12)}px)`,
                  top: `calc(8px + ${(coords.y / CHART_HEIGHT) * (264-8)}px)`,
                  transform: 'translate(-50%, -110%)'
                }}
              >
                {point.label}
              </div>
            );
          })} */}

         

          

          {/* Core Info - if available in data */}
          {well.coreInfo && (
            <div className="absolut e bottom-4 right-8 text-xs text-gray-600 bg-white px-1 rounded">
              {well.coreInfo}
            </div>
          )}

          {/* Axis Titles */}
         
        

          {/* Legend */}
          
        </div>
      </CardContent>
      <div className="absolute top-[630px]  left-1/2 text-xs text-gray-600 transform -translate-x-1/2">
            Time/Day
          </div>
          <div className="absolute left-[265px] top-[286px] text-xs text-gray-600 transform  origin-center">
            Depth/Feet
          </div>
          <div className="  ml-[40px] flex text-xs gap-4">
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 bg-red-600 rounded-full mr-1"></span>
              <span>Planned</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 bg-blue-600 rounded-full mr-1"></span>
              <span>Actual</span>
            </div>
          </div>
          <div className="flex mt-3 gap-10 ml-10">
            {/* Box "Planned" - now uses overallPlannedDays */}
          <div className=" ml-6 flex  text-black px-3 py-1 rounded text-sm font-medium">
            <p className="text-orange-600 mr-1"> Planned :</p>
             {overallPlannedDays} Days
          </div>

          {/* Box TD */}
          {well.totalDepth && (
            <div className=" bottom-12 flex mr-1  ml-6  text-black px-3 py-1 rounded text-sm mb-4 font-medium">
             <p className=" text-orange-600 mr-1">TD : </p> {well.totalDepth}ft
            </div>
          )}
          </div>
          

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
                    <div className="absolute right-[37px] w-[20px] h-[60px] top-0" style={{ backgroundColor: phaseData[0]?.depthReel > phaseData[0]?.depthPrevu ? 'red' : phaseData[0]?.depthReel < phaseData[0]?.depthPrevu ? 'green' : 'green', zIndex: 10 }} />
                    <div className="absolute right-[62px] w-[20px] h-[110px] top-0" style={{ backgroundColor: phaseData[1]?.depthReel > phaseData[1]?.depthPrevu ? 'red' : phaseData[1]?.depthReel < phaseData[1]?.depthPrevu ? 'green' : 'green', zIndex: 10 }} />
                    <div className="absolute right-[86px] w-[20px] h-[175px] top-0" style={{ backgroundColor: phaseData[2]?.depthReel > phaseData[2]?.depthPrevu ? 'red' : phaseData[2]?.depthReel < phaseData[2]?.depthPrevu ? 'green' : 'green', zIndex: 10 }} />

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
                        phase.depthReel > phase.depthPrevu ? 'text-red-600' :
                        phase.depthReel < phase.depthPrevu ? 'text-green-600' :
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