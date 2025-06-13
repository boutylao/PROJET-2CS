"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { ArrowUpDown, Filter, CheckCircle, AlertTriangle, AlertCircle, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Notification {
  id: string
  type: "info" | "warning" | "critical" | "action"
  category: string
  title: string
  description: string
  timestamp: string
  isRead: boolean
  wellId?: string
}

const notificationsData: Notification[] = [
  {
    id: "1",
    type: "info",
    category: "Info / Statut",
    title: "Puits terminé",
    description: "Le puits BRK-12 a été terminé avec succès.",
    timestamp: "29 Jan 2025 at 09:30 AM",
    isRead: false,
    wellId: "BRK-12",
  },
  {
    id: "2",
    type: "warning",
    category: "Retard / Dépassement",
    title: "Dépassement de budget",
    description: "Le coût actuel du puits GHT-6 dépasse le budget prévu de +12%.",
    timestamp: "29 Jan 2025 at 09:30 AM",
    isRead: false,
    wellId: "GHT-6",
  },
  {
    id: "3",
    type: "critical",
    category: "Critique / Urgence",
    title: "Phase bloquée",
    description: "La phase cimentation du puits VUL-2 est suspendue pour cause technique.",
    timestamp: "29 Jan 2025 at 09:30 AM",
    isRead: false,
    wellId: "VUL-2",
  },
  {
    id: "4",
    type: "action",
    category: "Demande ou Action requise",
    title: "Fichier manquant",
    description: "Le rapport journalier du puits RCH-4 n'a pas été déposé.",
    timestamp: "29 Jan 2025 at 09:30 AM",
    isRead: false,
    wellId: "RCH-4",
  },
  {
    id: "5",
    type: "info",
    category: "Info / Statut",
    title: "Nouvelle analyse disponible",
    description: "Les données du puits TRZ-5 ont été traitées.",
    timestamp: "29 Jan 2025 at 09:30 AM",
    isRead: false,
    wellId: "TRZ-5",
  },
  {
    id: "6",
    type: "info",
    category: "Info / Statut",
    title: "Fichier bien reçu",
    description: "Le fichier de coût pour le puits DLF-7 a été soumis avec succès.",
    timestamp: "29 Jan 2025 at 09:30 AM",
    isRead: false,
    wellId: "DLF-7",
  },
]

export function AlertsNotifications() {
  const [sortBy, setSortBy] = useState("date")
  const [filterType, setFilterType] = useState("all")
  const [notifications, setNotifications] = useState(notificationsData)

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId ? { ...notification, isRead: true } : notification,
      ),
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (filterType === "all") return true
    if (filterType === "retard") return notification.type === "warning"
    if (filterType === "critique") return notification.type === "critical"
    if (filterType === "info") return notification.type === "info"
    if (filterType === "action") return notification.type === "action"
    if (filterType === "unread") return !notification.isRead
    return true
  })

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "info":
        return <CheckCircle className="w-4 h-4" />
      case "warning":
        return <AlertTriangle className="w-4 h-4" />
      case "critical":
        return <AlertCircle className="w-4 h-4" />
      case "action":
        return <FileText className="w-4 h-4" />
      default:
        return <CheckCircle className="w-4 h-4" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "info":
        return "bg-green-500 text-white"
      case "warning":
        return "bg-yellow-500 text-white"
      case "critical":
        return "bg-red-500 text-white"
      case "action":
        return "bg-blue-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="w-5/6 ml-[240px] p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Notification</h1>
        {unreadCount > 0 && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{unreadCount} notifications non lues</span>
            <button onClick={handleMarkAllAsRead} className="text-sm text-blue-600 hover:text-blue-800 underline">
              Marquer tout comme lu
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
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
              <SelectItem value="type">Type</SelectItem>
              <SelectItem value="priority">Priorité</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-64">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4 text-orange-500" />
                <span>
                  Filtre:{" "}
                  {filterType === "all"
                    ? "Tous"
                    : filterType === "retard"
                      ? "Retard"
                      : filterType === "critique"
                        ? "Critique"
                        : filterType === "info"
                          ? "Info"
                          : filterType === "action"
                            ? "Action"
                            : "Non lues"}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="retard">Retard</SelectItem>
              <SelectItem value="critique">Critique</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="action">Action</SelectItem>
              <SelectItem value="unread">Non lues</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Aucune notification trouvée.</p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                !notification.isRead ? "border-l-4 border-blue-500 bg-blue-50" : "bg-white"
              }`}
              onClick={() => handleMarkAsRead(notification.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={`${getNotificationColor(notification.type)} px-3 py-1`}>
                        <div className="flex items-center gap-1">
                          {getNotificationIcon(notification.type)}
                          <span className="text-xs font-medium">{notification.category}</span>
                        </div>
                      </Badge>
                      {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-1">{notification.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{notification.description}</p>

                    {notification.wellId && (
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Puits:</span> {notification.wellId}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-500">{notification.timestamp}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{notifications.length}</div>
              <div className="text-sm text-gray-600">Total notifications</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {notifications.filter((n) => n.type === "info").length}
              </div>
              <div className="text-sm text-gray-600">Info / Statut</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {notifications.filter((n) => n.type === "critical").length}
              </div>
              <div className="text-sm text-gray-600">Critiques</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{unreadCount}</div>
              <div className="text-sm text-gray-600">Non lues</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
