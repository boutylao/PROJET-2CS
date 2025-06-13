import { CheckCircle, AlertTriangle } from "lucide-react"

const files = [
  {
    type: "received",
    message: "Rapport journalier du puit D : Reçu",
    icon: CheckCircle,
  },
  {
    type: "missing",
    message: "Rapport des coûts du puit E : Manquant",
    icon: AlertTriangle,
  },
  {
    type: "received",
    message: "Rapport Technique du puit F : Reçu",
    icon: CheckCircle,
  },
  {
    type: "received",
    message: "Rapport journalier du puit D : Reçu",
    icon: CheckCircle,
  },
  {
    type: "missing",
    message: "Rapport des coûts du puit E : Manquant",
    icon: AlertTriangle,
  },
  {
    type: "received",
    message: "Rapport Technique du puit F : Reçu",
    icon: CheckCircle,
  },
]

export function FilesList() {
  return (
    <div className="space-y-3 max-h-64 overflow-y-auto">
      {files.map((file, index) => {
        const Icon = file.icon
        const isReceived = file.type === "received"
        return (
          <div key={index} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50">
            <div
              className={`p-1 rounded ${isReceived ? "text-green-600 bg-green-100" : "text-yellow-600 bg-yellow-100"}`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-sm text-gray-700 flex-1">{file.message}</p>
          </div>
        )
      })}
    </div>
  )
}
