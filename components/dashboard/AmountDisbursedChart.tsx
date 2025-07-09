"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

type Props = {
  data: { year: string; amount: number }[];
};

export default function AmountDisbursedChart({ data }: Props) {
  const chartData = {
    labels: data.map((d) => d.year),
    datasets: [
      {
        label: "",
        data: data.map((d) => d.amount),
        fill: false,
        borderColor: "#10b981", // green
        backgroundColor: "#10b981",
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index" as const, intersect: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `₹${value.toLocaleString()}`
        }
      }
    }
  };

  return (
    <div className="mt-10 bg-white rounded-2xl p-6 shadow-sm border w-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 Amount Disbursed Per Year</h3>
      <div className="relative w-full h-[350px]">
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
}
