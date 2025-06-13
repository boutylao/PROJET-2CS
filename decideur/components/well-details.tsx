"use client"
import { useState, useEffect } from "react" // Import useEffect
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, DollarSign, Clock, FileText, Eye, Loader2 } from "lucide-react" // Add Loader2 for loading indicator
import { cn } from "@/lib/utils"
import { WellCostSummary } from "@/components/well-cost-summary"
import { WellDelaySummary } from "@/components/well-delay-summary"
import { WellReports } from "@/components/well-reports"

// Define the structure of a Well as it comes from your Spring Boot API /api/puits/{id}
interface Well {
  puitId: string;
  puitName: string; // Adjusted to match your backend Puit model field name
  location: string;
  totalDepth: number;
  status: string;
  currentPhase?: string; // This might be fetched separately or included directly
  // Add other properties from your Puit model as needed for display
  cost?: string; // Assuming these might come from the main well object or be calculated
  delay?: string;
  plannedDays?: number;
  actualDays?: number;
  sections?: { name: string; size: string; depth: number }[];
  objectives?: string[];
  progress?: {
    cost: number;
    delay: number;
  };
}

interface WellDetailsProps {
  wellId: string; // This is the ID passed from the dynamic route
}

export function WellDetails({ wellId }: WellDetailsProps) {
  const [activeTab, setActiveTab] = useState("visualisation");
  const [well, setWell] = useState<Well | null>(null); // State to store the fetched well data
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  // Fetch well details when the component mounts or wellId changes
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

        // Optionally fetch the current phase if it's a separate endpoint and not in the main Puit object
        let fetchedPhase: string | undefined;
        try {
          const phaseResponse = await fetch(`http://localhost:8098/api/puits/${wellId}/current-phase`);
          if (phaseResponse.ok) {
            const phaseText = await phaseResponse.text();
            fetchedPhase = phaseText === "Aucune phase disponible" ? "N/A" : phaseText;
          } else {
            console.warn(`Could not fetch current phase for ${wellId}: Status ${phaseResponse.status}`);
          }
        } catch (phaseError) {
          console.error(`Error fetching current phase for ${wellId}:`, phaseError);
        }

        setWell({ ...data, currentPhase: fetchedPhase }); // Combine data and fetched phase
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
  }, [wellId]); // Re-run effect if wellId changes

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Visualisation de l'avancement globale des phases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-80 bg-yellow-50 rounded-lg p-4">
              {/* Chart Grid */}
              <div className="absolute inset-4 grid grid-cols-8 grid-rows-6 gap-1">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div key={i} className="border border-yellow-200"></div>
                ))}
              </div>

              {/* Chart Line */}
              <svg className="absolute inset-4 w-full h-full">
                <polyline
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="3"
                  points="0,20 60,80 120,120 180,160 240,200 300,240" // These points are static, consider making them dynamic based on well progress
                />
                {/* Data Points */}
                <circle cx="60" cy="80" r="4" fill="#dc2626" />
                <circle cx="120" cy="120" r="4" fill="#dc2626" />
                <circle cx="180" cy="160" r="4" fill="#dc2626" />
                <circle cx="240" cy="200" r="4" fill="#dc2626" />
                <circle cx="300" cy="240" r="4" fill="#dc2626" />
              </svg>

              {/* Labels */}
              <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded text-sm font-medium">
                Planned : {well.plannedDays || 'N/A'} Days
              </div>

              <div className="absolute left-4 top-1/4 text-sm text-gray-600 transform -rotate-90 origin-center">
                Profondeur (m)
              </div>

              {/* Dynamic sections based on well.sections */}
              {well.sections && well.sections.map((section, i) => (
                <div key={i} className={`absolute bottom-8 text-xs text-gray-600`} style={{ left: `${8 + i * 24}%` }}>
                  {section.name}
                  <br />
                  {section.size} @ {section.depth}M
                </div>
              ))}

              <div className="absolute bottom-4 right-8 text-xs text-gray-600">
                -06 Cores will be cut in
                <br />
                the Devonian and Ordovician
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Well Architecture */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Architecture du sondage du puit {well.puitId}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-around items-start h-[400px]">
              <div className="flex flex-col items-start h-full top-10 w-1/6 gap-[80px]">
                <div className="flex flex-col items-center gap-[42px]">
                  {/* These phases should ideally come from well.currentPhase or a list of phases */}
                  <p className="font-semibold">26’’</p>
                  <p className="font-semibold">16’’</p>
                  <p className="font-semibold">12’’1/4</p>
                </div>
                <p className="font-semibold">8’’1/2</p>
              </div>
              <div className="h-[400px] w-4/6 flex items-start">
                <div className="relative w-full h-[300px]">
                  {/* Parois vertes gauche */}
                  <div className="absolute left-[67px] w-[20px] h-[60px] top-0 bg-green-600 z-10" />
                  <div className="absolute left-[91px] w-[20px] h-[105px] top-0 bg-green-600 z-10" />
                  <div className="absolute left-[115px] w-[20px] h-[150px] top-0 bg-green-600 z-10" />

                  {/* Parois vertes droite */}
                  <div className="absolute right-0 w-[20px] h-[60px] top-0 bg-green-600 z-10" />
                  <div className="absolute right-[24px] w-[20px] h-[105px] top-0 bg-green-600 z-10" />
                  <div className="absolute right-[48px] w-[20px] h-[150px] top-0 bg-green-600 z-10" />

                  {/* Corps du puits */}
                  <div className="absolute right-[70px] top-[150px] w-1/4 h-[250px] bg-white border-2 border-black">
                    {/* R1 R2 R3 + barres jaunes */}
                    {/* These labels and bars should ideally be dynamic based on well.objectives or similar */}
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
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost and Delay Summary */}
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
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#f59e0b"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(well.progress?.cost || 0) * 3.51} 351`} // Use optional chaining for progress
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{well.cost || 'N/A'}</span>
                </div>
              </div>
              <Button variant="link" className="text-blue-600">
                <Eye className="w-4 h-4 mr-1" />
                View details
              </Button>
            </div>

            {/* Delay */}
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Délai</h3>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="#f3f4f6" strokeWidth="12" fill="none" />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#10b981"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(well.progress?.delay || 0) * 3.51} 351`} // Use optional chaining for progress
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{well.delay || 'N/A'}</span>
                </div>
              </div>
              <Button variant="link" className="text-blue-600">
                <Eye className="w-4 h-4 mr-1" />
                View details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case "visualisation":
        return renderVisualisationContent()
      case "cout":
        // Pass the actual wellId to the child components
        return <WellCostSummary wellId={well.puitId} />
      case "delai":
        // Pass the actual wellId to the child components
        return <WellDelaySummary wellId={well.puitId} />
      case "rapport":
        // Pass the actual wellId to the child components
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
      <div className="w-64 bg-gradient-to-b from-orange-600 to-orange-800 rounded-tr-3xl text-white">
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
