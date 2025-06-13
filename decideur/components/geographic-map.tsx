export function GeographicMap() {
  return (
    <div className="relative h-[200px] bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg overflow-hidden border">
      {/* Algeria country outline using SVG path */}
      <svg 
        className="absolute inset-0 w-full h-full" 
        viewBox="0 0 400 300" 
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Algeria simplified outline */}
        <path
          d="M50 80 L350 80 L350 90 L340 100 L350 110 L360 120 L360 140 L350 150 L340 160 L330 170 L320 180 L310 190 L300 200 L280 210 L260 220 L240 225 L220 230 L200 235 L180 240 L160 245 L140 250 L120 245 L100 240 L80 235 L60 225 L50 215 L40 200 L35 180 L40 160 L45 140 L50 120 L50 100 Z"
          fill="#e5e7eb"
          stroke="#9ca3af"
          strokeWidth="1"
          opacity="0.7"
        />
        
        {/* Sahara desert texture */}
        <circle cx="200" cy="180" r="80" fill="#f3f4f6" opacity="0.3" />
        <circle cx="250" cy="200" r="60" fill="#f3f4f6" opacity="0.2" />
        <circle cx="150" cy="160" r="70" fill="#f3f4f6" opacity="0.25" />
        
        {/* Mediterranean coastline detail */}
        <path
          d="M50 80 Q100 75 150 78 Q200 82 250 79 Q300 76 350 80"
          stroke="#3b82f6"
          strokeWidth="2"
          fill="none"
          opacity="0.6"
        />
        
        {/* Well markers with labels */}
        
        {/* Hassi Messaoud region */}
        <g>
          <circle cx="220" cy="140" r="4" fill="#22c55e" stroke="#16a34a" strokeWidth="1" />
          <circle cx="230" cy="135" r="4" fill="#22c55e" stroke="#16a34a" strokeWidth="1" />
          <circle cx="210" cy="150" r="4" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
          <text x="240" y="138" fontSize="12" fill="#374151" fontWeight="bold">Hassi Messaoud</text>
        </g>
        
        {/* Hassi R'Mel region */}
        <g>
          <circle cx="180" cy="120" r="4" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1" />
          <circle cx="175" cy="110" r="4" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1" />
          <text x="185" y="108" fontSize="12" fill="#374151" fontWeight="bold">Hassi R'Mel</text>
        </g>
        
        {/* In Amenas region */}
        <g>
          <circle cx="280" cy="110" r="4" fill="#22c55e" stroke="#16a34a" strokeWidth="1" />
          <circle cx="290" cy="115" r="4" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
          <text x="295" y="113" fontSize="12" fill="#374151" fontWeight="bold">In Amenas</text>
        </g>
        
        {/* Ouargla region */}
        <g>
          <circle cx="200" cy="160" r="4" fill="#22c55e" stroke="#16a34a" strokeWidth="1" />
          <circle cx="195" cy="170" r="4" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
          <circle cx="205" cy="175" r="4" fill="#ef4444" stroke="#dc2626" strokeWidth="1" />
          <text x="210" y="163" fontSize="12" fill="#374151" fontWeight="bold">Ouargla</text>
        </g>
        
        {/* Illizi region */}
        <g>
          <circle cx="320" cy="180" r="4" fill="#22c55e" stroke="#16a34a" strokeWidth="1" />
          <circle cx="310" cy="185" r="4" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
          <text x="325" y="178" fontSize="12" fill="#374151" fontWeight="bold">Illizi</text>
        </g>
        
        {/* Adrar region */}
        <g>
          <circle cx="120" cy="180" r="4" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1" />
          <text x="125" y="178" fontSize="12" fill="#374151" fontWeight="bold">Adrar</text>
        </g>
        
        {/* Tamanrasset region */}
        <g>
          <circle cx="180" cy="220" r="4" fill="#22c55e" stroke="#16a34a" strokeWidth="1" />
          <circle cx="190" cy="225" r="4" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
          <text x="195" y="223" fontSize="12" fill="#374151" fontWeight="bold">Tamanrasset</text>
        </g>
      </svg>
      
      {/* Legend */}
      {/* <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg p-3 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Légende</h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Puits de pétrole</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Puits de gaz</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Puits mixte</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Puits fermé</span>
          </div>
        </div>
      </div> */}
      
      {/* Title */}
   
    </div>
  )
}