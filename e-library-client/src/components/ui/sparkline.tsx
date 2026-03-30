import { cn } from "@/lib/utils";

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function Sparkline({ 
  data, 
  color = "#3b82f6", 
  width = 80, 
  height = 28,
  className 
}: SparklineProps) {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(" L ")}`;

  return (
    <svg 
      width={width} 
      height={height} 
      className={cn("overflow-visible", className)}
      viewBox={`0 0 ${width} ${height}`}
    >
      <path 
        d={pathData} 
        fill="none" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      {/* Optional last point dot for emphasis */}
      <circle 
        cx={points[points.length - 1].split(',')[0]} 
        cy={points[points.length - 1].split(',')[1]} 
        r="1.5" 
        fill={color} 
      />
    </svg>
  );
}