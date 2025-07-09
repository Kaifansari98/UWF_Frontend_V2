"use client";

import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

type Props = {
  data: { year: string; students: number }[];
};

export default function StudentsAidedChart({ data }: Props) {
  const chartData = {
    labels: data.map((d) => d.year),
    datasets: [
      {
        label: "",
        data: data.map((d) => d.students),
        fill: false,
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f6",
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // ✅ allow full width + fixed height
    plugins: {
      legend: { display: false }, // ✅ hide blue box
      tooltip: { mode: "index" as const, intersect: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  return (
    <div className="mt-10 bg-white rounded-2xl p-6 shadow-sm border w-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Students Aided Per Year</h3>
      <div className="relative w-full h-[350px]">
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
}
