import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { DeliveryItem } from '../types';

interface Props {
  deliveries: DeliveryItem[];
}

export const DeliveryChart: React.FC<Props> = ({ deliveries }) => {
  const data = useMemo(() => {
    // Initialize hours map from 06:00 to 22:00
    const hoursMap = new Map<string, { time: string; total: number; arrived: number; pending: number }>();
    
    for (let i = 6; i <= 22; i++) {
      const hour = `${i.toString().padStart(2, '0')}:00`;
      hoursMap.set(hour, { time: hour, total: 0, arrived: 0, pending: 0 });
    }

    deliveries.forEach(item => {
      // Normalize time to hour bucket (assuming "HH:MM")
      const hour = item.time.split(':')[0] + ':00';
      if (hoursMap.has(hour)) {
        const entry = hoursMap.get(hour)!;
        entry.total += 1;
        if (item.isArrived) {
          entry.arrived += 1;
        } else {
          entry.pending += 1;
        }
      }
    });

    return Array.from(hoursMap.values());
  }, [deliveries]);

  if (deliveries.length === 0) {
    return <div className="h-full flex items-center justify-center text-gray-400 text-sm">Brak danych do wykresu</div>;
  }

  return (
    <div className="w-full h-[250px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: -20,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 11, fill: '#64748b' }} 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#64748b' }} 
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip 
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          {/* Stacked Bars with theme colors: Emerald (Success) for Arrived, Amber (Warning) for Pending */}
          <Bar dataKey="arrived" name="Na placu" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
          <Bar dataKey="pending" name="Oczekuje" stackId="a" fill="#fbbf24" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};