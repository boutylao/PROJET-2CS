export function GeographicMap() {
  return (
    <div className="relative h-[200px] bg-gradient-to-b from-blue-100 to-blue-200 rounded-lg overflow-hidden">
      {/* Simplified map representation */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 opacity-30"></div>

      {/* Well markers */}
      <div className="absolute top-8 left-12 w-3 h-3 bg-green-500 rounded-full"></div>
      <div className="absolute top-16 left-20 w-3 h-3 bg-orange-500 rounded-full"></div>
      <div className="absolute top-12 left-32 w-3 h-3 bg-green-500 rounded-full"></div>
      <div className="absolute top-24 left-16 w-3 h-3 bg-orange-500 rounded-full"></div>
      <div className="absolute top-32 left-28 w-3 h-3 bg-green-500 rounded-full"></div>
      <div className="absolute top-28 left-40 w-3 h-3 bg-red-500 rounded-full"></div>
      <div className="absolute top-40 left-24 w-3 h-3 bg-green-500 rounded-full"></div>
      <div className="absolute top-36 left-36 w-3 h-3 bg-orange-500 rounded-full"></div>

      {/* Country outline (simplified) */}
      <div className="absolute bottom-4 left-8 right-8 h-32 bg-gray-200 opacity-50 rounded-lg"></div>
    </div>
  )
}
