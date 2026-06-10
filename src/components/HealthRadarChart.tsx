import React from "react";
import { motion } from "motion/react";

interface HealthRadarChartProps {
  metrics: {
    activity: number;
    nutrition: number;
    mood: number;
    hydration: number;
    sleep: number;
  };
}

// 5 vertices for Activity, Nutrition, Mood, Hydration, Sleep
const METRIC_KEYS = ["activity", "nutrition", "mood", "hydration", "sleep"] as const;

const LABELS: Record<string, { label: string; icon: string; xOff: number; yOff: number }> = {
  activity: { label: "Activity", icon: "🏃", xOff: 0, yOff: -14 },
  nutrition: { label: "Nutrition", icon: "🍗", xOff: 18, yOff: 4 },
  mood: { label: "Mood", icon: "🐾", xOff: 10, yOff: 14 },
  hydration: { label: "Hydration", icon: "💧", xOff: -10, yOff: 14 },
  sleep: { label: "Sleep", icon: "🌙", xOff: -18, yOff: 4 },
};

export default function HealthRadarChart({ metrics }: HealthRadarChartProps) {
  const center = 110;
  const maxRadius = 75;

  // Compute pentagon coordinates for standard backgrounds (ratios 0.2, 0.4, 0.6, 0.8, 1.0)
  const getPentagonPoints = (radius: number) => {
    return Array.from({ length: 5 })
      .map((_, i) => {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  };

  // Compute active metrics coordinates
  const activePoints = METRIC_KEYS.map((key, i) => {
    const val = metrics[key] || 5; // Default half-scale
    const r = (val / 10) * maxRadius;
    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, val, key };
  });

  const activePolygonString = activePoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  return (
    <div className="flex flex-col items-center justify-center p-3.5 bg-[#FDFAF6] border border-[#D3D1C7]/50 rounded-3xl relative overflow-hidden shadow-xs hover:border-[#E07A5F]/20 transition-colors">
      <div className="absolute top-2 left-2 bg-[#E07A5F]/10 text-[#E07A5F] text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
        Active Health Metric Radar
      </div>

      <svg viewBox="0 0 220 220" className="w-[200px] h-[200px] drop-shadow-xs select-none">
        {/* Concentric pentagonal grid rings */}
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((ratio, index) => (
          <polygon
            key={index}
            points={getPentagonPoints(maxRadius * ratio)}
            fill="none"
            stroke="#D3D1C7"
            strokeWidth={index === 4 ? "1.2" : "0.6"}
            strokeDasharray={index < 4 ? "2,2" : undefined}
            opacity={0.4 + ratio * 0.4}
          />
        ))}

        {/* Diagonal axis rays */}
        {Array.from({ length: 5 }).map((_, i) => {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const targetX = center + maxRadius * Math.cos(angle);
          const targetY = center + maxRadius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={targetX}
              y2={targetY}
              stroke="#D3D1C7"
              strokeWidth="0.8"
              opacity="0.65"
            />
          );
        })}

        {/* Active metrics glowing shaded polygon */}
        <polygon
          points={activePolygonString}
          fill="url(#radarGradient)"
          stroke="#E07A5F"
          strokeWidth="2"
          strokeLinejoin="round"
          className="transition-all duration-700 ease-out"
        />

        {/* Data points at vertices */}
        {activePoints.map((pt, i) => (
          <circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r="3.5"
            className="fill-white stroke-[#E07A5F] stroke-2 transition-all duration-700 ease-out"
          />
        ))}

        {/* Text/emoji labels positioned neatly near each coordinate */}
        {METRIC_KEYS.map((key, i) => {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const lRadius = maxRadius + 14;
          const x = center + lRadius * Math.cos(angle) + LABELS[key].xOff;
          const y = center + lRadius * Math.sin(angle) + LABELS[key].yOff;

          return (
            <g key={key} className="font-sans font-bold text-[9px] text-[#3D405B]">
              <text
                x={x}
                y={y}
                textAnchor="middle"
                className="fill-[#3D405B]"
              >
                {LABELS[key].icon} {LABELS[key].label}
              </text>
              <text
                x={x}
                y={y + 8}
                textAnchor="middle"
                className="fill-[#E07A5F] text-[8px] font-extrabold"
              >
                {metrics[key]}/10
              </text>
            </g>
          );
        })}

        {/* Gradient Definition */}
        <defs>
          <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E07A5F" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#E07A5F" stopOpacity="0.4" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
