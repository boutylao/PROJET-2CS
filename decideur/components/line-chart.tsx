export function LineChart() {
  const data = [
    { year: 2016, value: 5000 },
    { year: 2017, value: 20000 },
    { year: 2018, value: 15000 },
    { year: 2019, value: 35000 },
    { year: 2020, value: 25000 },
    { year: 2021, value: 30000 },
  ]

  const maxValue = Math.max(...data.map((d) => d.value))

  return (
    <div className="h-48 relative">
      <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-500">
        <span>$40,000</span>
        <span>$30,000</span>
        <span>$20,000</span>
        <span>$10,000</span>
        <span>$0</span>
      </div>

      <div className="ml-12 mr-4 h-40 relative">
        <svg className="w-full h-full">
          <polyline
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
            points={data
              .map((point, index) => `${(index / (data.length - 1)) * 100}%,${100 - (point.value / maxValue) * 100}%`)
              .join(" ")}
          />
          {data.map((point, index) => (
            <circle
              key={index}
              cx={`${(index / (data.length - 1)) * 100}%`}
              cy={`${100 - (point.value / maxValue) * 100}%`}
              r="4"
              fill="#f59e0b"
            />
          ))}
        </svg>
      </div>

      <div className="flex justify-between ml-12 mr-4 text-xs text-gray-500">
        {data.map((point) => (
          <span key={point.year}>{point.year}</span>
        ))}
      </div>
    </div>
  )
}
