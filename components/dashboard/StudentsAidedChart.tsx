"use client";

import { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

type Props = {
  data: { label: string; students: number }[];
};

export default function StudentsAidedChart({ data }: Props) {
  const [chartColors, setChartColors] = useState({
    foreground: "#111827",
    muted: "#6b7280",
    border: "rgba(15, 23, 42, 0.14)",
    tooltipBg: "rgba(17, 24, 39, 0.92)",
    tooltipText: "#ffffff",
  });

  useEffect(() => {
    const updateColors = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setChartColors({
        foreground: isDark ? "#f4f4f5" : "#111827",
        muted: isDark ? "#a1a1aa" : "#6b7280",
        border: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(15, 23, 42, 0.14)",
        tooltipBg: isDark ? "rgba(24, 24, 27, 0.92)" : "rgba(17, 24, 39, 0.92)",
        tooltipText: "#ffffff",
      });
    };

    updateColors();
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const chartData = useMemo(() => ({
    labels: data.map((d) => d.label),
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
  }), [data]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false, // ✅ allow full width + fixed height
    plugins: {
      legend: { display: false }, // ✅ hide blue box
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: chartColors.tooltipBg,
        titleColor: chartColors.tooltipText,
        bodyColor: chartColors.tooltipText,
        borderColor: chartColors.border,
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: chartColors.muted },
        grid: { color: chartColors.border },
        border: { color: chartColors.border },
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: chartColors.muted },
        grid: { color: chartColors.border },
        border: { color: chartColors.border },
      },
    },
  }), [chartColors]);

  return (
    <div className="mt-10 w-full rounded-2xl border bg-card p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-foreground">📈 Students Aided Per Year</h3>
      <div className="relative w-full h-[350px]">
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
}
