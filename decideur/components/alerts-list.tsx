import { CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react"

const alerts = [
  {
    type: "success",
    message: "Le fichier de coût du puit A a été soumis avec succès",
    icon: CheckCircle,
  },
  {
    type: "warning",
    message: "Retard détecté sur puit B : +2 Jours",
    icon: AlertTriangle,
  },
  {
    type: "error",
    message: "Aucune mise à jour depuis 7 jours sur le puit C",
    icon: AlertCircle,
  },
  {
    type: "info",
    message: "Le rapport journalier du puits RCH-4 n'a pas été déposé.",
    icon: Info,
  },
  {
    type: "success",
    message: "Le fichier de coût du puit A a été soumis avec succès",
    icon: CheckCircle,
  },
  {
    type: "warning",
    message: "Retard détecté sur puit B : +2 Jours",
    icon: AlertTriangle,
  },
  {
    type: "error",
    message: "Aucune mise à jour depuis 7 jours sur le puit C",
    icon: AlertCircle,
  },
]

const typeColors = {
  success: "text-green-600 bg-green-100",
  warning: "text-yellow-600 bg-yellow-100",
  error: "text-red-600 bg-red-100",
  info: "text-blue-600 bg-blue-100",
}

export function AlertsList() {
  return (
    <div className="space-y-3 max-h-64 overflow-y-auto">
      {alerts.map((alert, index) => {
        const Icon = alert.icon
        return (
          <div key={index} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50">
            <div className={`p-1 rounded ${typeColors[alert.type as keyof typeof typeColors]}`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-sm text-gray-700 flex-1">{alert.message}</p>
          </div>
        )
      })}
    </div>
  )
}
