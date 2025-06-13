import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function Profile() {
  return (
    <div className="w-5/6 ml-[240px] p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profil</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informations utilisateur</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Cette section affichera les informations du profil utilisateur.</p>
        </CardContent>
      </Card>
    </div>
  )
}
