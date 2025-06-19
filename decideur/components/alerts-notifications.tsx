"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { ArrowUpDown, Filter, CheckCircle, AlertTriangle, AlertCircle, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Notification {
  id: number
  type: "INFO" | "WARNING" | "CRITICAL" | "ACTION"
  category: string
  title: string
  description: string
  timestamp: string
  read: boolean
  puit?: {
    puitName: string
  }
  reportId?: number
}

export function AlertsNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [sortBy, setSortBy] = useState("date")
  const [filterType, setFilterType] = useState("all")

  useEffect(() => {
    fetch("http://localhost:8098/api/notifications")
      .then((res) => res.json())
      .then((data) => setNotifications(data))
      .catch((err) => console.error("Erreur chargement notifications:", err))
  }, [])

  const handleMarkAsRead = async (id: number) => {
    try {
      await fetch(`http://localhost:8098/api/notifications/mark-as-read/${id}`, {
        method: "POST",
      })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
    } catch (error) {
      console.error("Erreur marquage individuel:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await fetch(`http://localhost:8098/api/notifications/mark-all-as-read`, {
        method: "POST",
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (error) {
      console.error("Erreur marquage global:", error)
    }
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === "all") return true
    if (filterType === "info") return n.type === "INFO"
    if (filterType === "warning") return n.type === "WARNING"
    if (filterType === "critical") return n.type === "CRITICAL"
    if (filterType === "action") return n.type === "ACTION"
    if (filterType === "unread") return !n.read
    return true
  })

  const getIcon = (type: string) => {
    switch (type) {
      case "INFO": return <CheckCircle className="w-4 h-4" />
      case "WARNING": return <AlertTriangle className="w-4 h-4" />
      case "CRITICAL": return <AlertCircle className="w-4 h-4" />
      case "ACTION": return <FileText className="w-4 h-4" />
      default: return <CheckCircle className="w-4 h-4" />
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case "INFO": return "bg-green-500 text-white"
      case "WARNING": return "bg-yellow-500 text-white"
      case "CRITICAL": return "bg-red-500 text-white"
      case "ACTION": return "bg-blue-500 text-white"
      default: return "bg-gray-500 text-white"
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

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

      {/* Filtres */}
      <div className="flex gap-4">
        <div className="w-64">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full">
              <ArrowUpDown className="mr-2 h-4 w-4 text-orange-500" />
              Trier par: {sortBy}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="type">Type</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-64">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full">
              <Filter className="mr-2 h-4 w-4 text-orange-500" />
              Filtre: {filterType}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Retard</SelectItem>
              <SelectItem value="critical">Critique</SelectItem>
              <SelectItem value="action">Action</SelectItem>
              <SelectItem value="unread">Non lues</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Liste des notifications */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">Aucune notification trouvée.</CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                !notification.read ? "border-l-4 border-blue-500 bg-blue-50" : "bg-white"
              }`}
              onClick={() => handleMarkAsRead(notification.id)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between">
                  <div>
                    <div className="flex gap-3 mb-2">
                      <Badge className={`${getColor(notification.type)} px-3 py-1`}>
                        <div className="flex items-center gap-1">
                          {getIcon(notification.type)}
                          <span className="text-xs font-medium">{notification.category}</span>
                        </div>
                      </Badge>
                      {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                    </div>
                    <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                    <p className="text-sm text-gray-600">{notification.description}</p>
                    {notification.puit?.puitName && (
                      <p className="text-xs text-gray-500 mt-1">
                        <strong>Puits :</strong> {notification.puit.puitName}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    {new Date(notification.timestamp).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
