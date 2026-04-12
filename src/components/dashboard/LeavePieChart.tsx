"use client";

import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { PolarArea } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

interface LeaveData {
  name: string;
  value: number;
}

const COLORS = [
  'rgba(16, 185, 129, 0.65)', 
  'rgba(245, 158, 11, 0.65)', 
  'rgba(59, 130, 246, 0.65)', 
  'rgba(239, 68, 68, 0.65)', 
  'rgba(139, 92, 246, 0.65)',
  'rgba(14, 165, 233, 0.65)'
];

const BORDER_COLORS = [
  'rgb(16, 185, 129)', 
  'rgb(245, 158, 11)', 
  'rgb(59, 130, 246)', 
  'rgb(239, 68, 68)', 
  'rgb(139, 92, 246)',
  'rgb(14, 165, 233)'
];

export function LeavePieChart({ data }: { data: LeaveData[] }) {
  const hasData = data.some(d => d.value > 0);

  if (!hasData) {
    return (
      <div className="h-[300px] flex items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-slate-100 border-dashed m-4">
        <p className="text-sm font-medium">No leave data available for visualization</p>
      </div>
    );
  }

  const chartData = {
    labels: data.map(d => d.name),
    datasets: [
      {
        label: ' Days Used',
        data: data.map(d => d.value),
        backgroundColor: COLORS.slice(0, data.length),
        borderColor: BORDER_COLORS.slice(0, data.length),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        pointLabels: {
          display: false,
        },
        ticks: {
          display: false, // Hide the concentric circle numbers
          backdropColor: 'transparent'
        },
        grid: {
          color: '#f1f5f9'
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 13,
            family: "ui-sans-serif, system-ui, sans-serif",
            weight: 500 as const
          },
          color: '#475569'
        }
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#0f172a',
        bodyColor: '#334155',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        boxPadding: 4,
        usePointStyle: true,
        bodyFont: {
          size: 13,
          weight: 500 as const
        }
      }
    }
  };

  return (
    <div className="h-[230px] w-full p-0 relative">
      <PolarArea data={chartData} options={options} />
    </div>
  );
}
