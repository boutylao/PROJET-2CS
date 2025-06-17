// src/components/line-chart.tsx

import React from 'react';

// Define the interface for LineChart's props
interface LineChartProps {
  data: { [key: string]: number | string }[]; // Data can have year/month (string) and value (number)
  xKey: string; // The key in 'data' for the x-axis values (e.g., 'year', 'month', 'date')
  yKey: string; // The key in 'data' for the y-axis values (e.g., 'value', 'cost', 'delay')
  lineColor: string; // The color for the line and points
}

export function LineChart({ data, xKey, yKey, lineColor }: LineChartProps) {
  // Ensure data is not empty to avoid division by zero
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500 p-4">No data available for the chart.</div>;
  }

  // Calculate the maximum value for scaling the y-axis
  // Ensure that the yKey actually points to a number
  const values = data.map((d) => {
    const value = d[yKey];
    return typeof value === 'number' ? value : parseFloat(value as string); // Handle cases where value might be a string number
  });
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values); // useful if you want to scale from min to max, otherwise 0 is fine.
  const yAxisScale = maxValue > 0 ? maxValue : 1; // Prevent division by zero if all values are 0

  // Hardcoded Y-axis labels for demonstration; you might want to make these dynamic too
  const yAxisLabels = [
    `$${Math.round(yAxisScale)}`,
    `$${Math.round(yAxisScale * 0.75)}`,
    `$${Math.round(yAxisScale * 0.5)}`,
    `$${Math.round(yAxisScale * 0.25)}`,
    `$0`,
  ];


  return (
    <div className="h-48 relative">
      <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-500">
        {/* Dynamic Y-axis labels */}
        {yAxisLabels.map((label, index) => (
          <span key={index}>{label}</span>
        ))}
      </div>

      <div className="ml-12 mr-4 h-40 relative">
        <svg className="w-full h-full">
          <polyline
            fill="none"
            stroke={lineColor} // Use prop
            strokeWidth="3"
            // Map data points to SVG coordinates
            points={data
              .map((point, index) => {
                const x = (index / (data.length - 1)) * 100; // X position as percentage
                const yValue = typeof point[yKey] === 'number' ? point[yKey] : parseFloat(point[yKey] as string);
                const y = 100 - (yValue / yAxisScale) * 100; // Y position as percentage (inverted for SVG)
                return `${x}%,${y}%`;
              })
              .join(" ")}
          />
          {data.map((point, index) => (
            <circle
              key={index}
              cx={`${(index / (data.length - 1)) * 100}%`}
              cy={`${100 - ((typeof point[yKey] === 'number' ? point[yKey] : parseFloat(point[yKey] as string)) / yAxisScale) * 100}%`}
              r="4"
              fill={lineColor} // Use prop
            />
          ))}
        </svg>
      </div>

      <div className="flex justify-between ml-12 mr-4 text-xs text-gray-500">
        {data.map((point, index) => (
          <span key={index}>{point[xKey]}</span>
        ))}
      </div>
    </div>
  );
}