interface BarChartProps {
  data: Array<{
    month: string
    actual: number
    budget: number
  }>
  title: string
  subtitle: string
}

export function BarChart({ data, title, subtitle }: BarChartProps) {
  const maxValue = Math.max(...data.flatMap((d) => [d.actual, d.budget]))

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end h-32">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center space-y-1">
            <div className="flex items-end space-x-1 h-24">
              <div
                className="w-4 bg-green-500 rounded-t"
                style={{ height: `${(item.actual / maxValue) * 100}%` }}
              ></div>
              <div className="w-4 bg-red-500 rounded-t" style={{ height: `${(item.budget / maxValue) * 100}%` }}></div>
            </div>
            <span className="text-xs text-gray-500">{item.month}</span>
          </div>
        ))}
      </div>

      <div className="text-center">
        <div className="text-2xl font-bold">{title}</div>
        <div className="text-sm text-gray-600">{subtitle}</div>
      </div>
    </div>
  )
}
