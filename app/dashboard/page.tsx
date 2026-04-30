"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import Image from "next/image";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import apiClient from "@/utils/apiClient";
import { BarChart2, DollarSign, Users, CheckCircle, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import StudentsAidedChart from "@/components/dashboard/StudentsAidedChart";
import DashboardExtraCards from "@/components/dashboard/DashboardExtraCards";
import AmountDisbursedChart from "@/components/dashboard/AmountDisbursedChart";
import DashboardStatusTable from "@/components/dashboard/DashboardStatusTable";

type FinancialYearOption = {
  key: string;
  label: string;
};

type DashboardSummary = {
  studentsAided: number;
  amountDisbursed: number;
  requestsReceived: number;
  requestAccepted: number;
  requestPending: number;
  requestRejected: number;
  casesDisbursed: number;
  casesClosed: number;
};

type DashboardStats = {
  financialYearOptions: FinancialYearOption[];
  summary: {
    overall: DashboardSummary;
    byFinancialYear: Record<string, DashboardSummary>;
  };
  studentsAidedPerFinancialYear: { key: string; label: string; students: number }[];
  amountDisbursedPerFinancialYear: { key: string; label: string; amount: number }[];
};

export default function Dashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [greeting, setGreeting] = useState("Hello");
  const [filter, setFilter] = useState<string>("overall");
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("Good Morning");
    else if (hour >= 12 && hour < 17) setGreeting("Good Afternoon");
    else if (hour >= 17 && hour < 21) setGreeting("Good Evening");
    else setGreeting("Good Night");
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient.get("/dashboard/stats");
        setStats(res.data);
        setFilter("overall");
      } catch (error) {
        console.error("Dashboard stats fetch failed:", error);
      }
    };

    fetchStats();
  }, []);

  const selectedSummary =
    filter === "overall"
      ? stats?.summary.overall
      : stats?.summary.byFinancialYear[filter];

  const studentsChartData =
    filter === "overall"
      ? stats?.studentsAidedPerFinancialYear ?? []
      : (stats?.studentsAidedPerFinancialYear ?? []).filter((item) => item.key === filter);

  const amountChartData =
    filter === "overall"
      ? stats?.amountDisbursedPerFinancialYear ?? []
      : (stats?.amountDisbursedPerFinancialYear ?? []).filter((item) => item.key === filter);

  const cards = [
    {
      title: "Requests Received",
      value: selectedSummary?.requestsReceived ?? 0,
      total: stats?.summary.overall.requestsReceived ?? 0,
      icon: BarChart2,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "Requests Accepted",
      value: selectedSummary?.requestAccepted ?? 0,
      total: stats?.summary.overall.requestAccepted ?? 0,
      icon: CheckCircle,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Students Aided",
      value: selectedSummary?.studentsAided ?? 0,
      total: stats?.summary.overall.studentsAided ?? 0,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Amount Disbursed",
      value: `₹${(selectedSummary?.amountDisbursed ?? 0).toLocaleString()}`,
      total: `₹${(stats?.summary.overall.amountDisbursed ?? 0).toLocaleString()}`,
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
    },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f9fafb] px-10 py-8 rounded-2xl">
        {/* Greeting Header */}
        <div className="flex items-center justify-between border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
              {greeting}, {user?.full_name?.split(" ")[0]} 👋
            </h1>
            <p className="text-gray-500 mt-1 text-sm capitalize">{user?.role}</p>
          </div>

          <div className="relative w-14 h-14">
            <Image
              src={
                user?.profile_pic
                  ? user.profile_pic.includes("localhost")
                    ? user.profile_pic.replace("http://localhost:5000", "https://unitedwelfarefoundation.com")
                    : user.profile_pic.replace(/^http:\/\//i, "https://")
                  : "/avatar.jpg"
              }
              alt="Profile"
              className="rounded-full object-cover border-2 border-gray-300 shadow-sm"
              fill
            />
          </div>
        </div>

        {/* Stats Section Header */}
        <div className="flex items-center justify-between mt-10 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">📊 Dashboard Stats</h2>
            <p className="text-sm text-gray-500">Track your impact and form activity over time</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                {stats?.financialYearOptions.find((option) => option.key === filter)?.label ?? "Overall"} <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {stats?.financialYearOptions.map((option) => (
                <DropdownMenuItem key={option.key} onClick={() => setFilter(option.key)}>
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {cards.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-2xl shadow-sm p-6 border hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-full ${card.color}`}>
                  <card.icon size={24} />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <h3 className="text-xl font-bold text-gray-800">{card.value}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Total: <span className="font-medium">{card.total}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {stats && <DashboardExtraCards stats={stats} filter={filter} />}

        <div className="w-full mt-10 rounded-xl py-4">
          <DashboardStatusTable filter={filter} />
        </div>

        {/* Line Chart */}
        {studentsChartData.length > 0 && (
          <StudentsAidedChart data={studentsChartData} />
        )}
        

        {amountChartData.length > 0 && (
          <AmountDisbursedChart data={amountChartData} />
        )}

      </div>
    </ProtectedRoute>
  );
}
