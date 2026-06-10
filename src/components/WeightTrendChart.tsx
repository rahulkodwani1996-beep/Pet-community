import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface WeightTrendChartProps {
  data: { date: string; weight: number }[];
}

export default function WeightTrendChart({ data }: WeightTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-[#D3D1C7] rounded-3xl p-5 shadow-xs flex flex-col items-center justify-center text-center">
        <p className="text-xs font-bold text-[#888780] mb-2">No Weight Data Available</p>
        <p className="text-[10px] text-[#2C2C2A] max-w-[200px] leading-relaxed">
          Log your pet's weight periodically to watch their growth or diet progress.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#D3D1C7] rounded-3xl p-5 shadow-xs">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="font-sans font-extrabold text-[#3D405B] text-sm">Weight Tracker</h4>
          <p className="font-body text-[10px] text-[#888780]">Long-term health monitoring</p>
        </div>
      </div>
      
      <div className="h-44 w-full text-[10px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#888780'}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#888780'}} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: '1px solid #D3D1C7', fontSize: '11px', fontWeight: 'bold', color: '#3D405B' }}
              itemStyle={{ color: '#E07A5F' }}
            />
            <Line 
              type="monotone" 
              dataKey="weight" 
              name="Weight (kg)"
              stroke="#E07A5F" 
              strokeWidth={3} 
              dot={{ fill: '#E07A5F', strokeWidth: 2, r: 4 }} 
              activeDot={{ r: 6, fill: '#81B29A', stroke: 'white', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
