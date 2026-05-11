"use client";

import { useEffect, useMemo, useState } from "react";
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
  data: { label: string; amount: number }[];
};

export default function AmountDisbursedChart({ data }: Props) {
  const [chartColors, setChartColors] = useState({
    muted: "#6b7280",
    border: "rgba(15, 23, 42, 0.14)",
    tooltipBg: "rgba(17, 24, 39, 0.92)",
    tooltipText: "#ffffff",
  });

  useEffect(() => {
    const updateColors = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setChartColors({
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
        data: data.map((d) => d.amount),
        fill: false,
        borderColor: "#10b981", // green
        backgroundColor: "#10b981",
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  }), [data]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: chartColors.tooltipBg,
        titleColor: chartColors.tooltipText,
        bodyColor: chartColors.tooltipText,
        borderColor: chartColors.border,
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        ticks: { color: chartColors.muted },
        grid: { color: chartColors.border },
        border: { color: chartColors.border },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: chartColors.muted,
          callback: (value: any) => `₹${value.toLocaleString()}`
        },
        grid: { color: chartColors.border },
        border: { color: chartColors.border },
      }
    }
  }), [chartColors]);

  return (
    <div className="mt-10 w-full rounded-2xl border bg-card p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-foreground">💰 Amount Disbursed Per Year</h3>
      <div className="relative w-full h-[350px]">
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
}
