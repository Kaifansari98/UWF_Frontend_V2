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

export default function Dashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [greeting, setGreeting] = useState("Hello");
  const [filter, setFilter] = useState<"currentYear" | "overall">("currentYear");

  const [stats, setStats] = useState<{
    studentsAided: { overall: number; currentYear: number };
    amountDisbursed: { overall: number; currentYear: number };
    requestsReceived: { overall: number; currentYear: number };
    requestAccepted: { overall: number; currentYear: number };
    studentsAidedPerYear: { year: string; students: number }[];
    requestPending: { overall: number; currentYear: number };
    requestRejected: { overall: number; currentYear: number };
    casesDisbursed: { overall: number; currentYear: number };
    casesClosed: { overall: number; currentYear: number };
    amountDisbursedPerYear: { year: string; amount: number }[];
  } | null>(null);

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
        setStats({
          studentsAided: res.data.studentsAided,
          amountDisbursed: res.data.amountDisbursed,
          requestsReceived: res.data.requestsReceived,
          requestAccepted: res.data.requestAccepted,
          studentsAidedPerYear: res.data.studentsAidedPerYear,
          requestPending: res.data.requestPending,
          requestRejected: res.data.requestRejected,
          casesDisbursed: res.data.casesDisbursed,
          casesClosed: res.data.casesClosed,
          amountDisbursedPerYear: res.data.amountDisbursedPerYear,
        });
      } catch (error) {
        console.error("Dashboard stats fetch failed:", error);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      title: "Students Aided",
      value: stats?.studentsAided[filter] ?? 0,
      total: stats?.studentsAided.overall ?? 0,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Amount Disbursed",
      value: `₹${(stats?.amountDisbursed[filter] ?? 0).toLocaleString()}`,
      total: `₹${(stats?.amountDisbursed.overall ?? 0).toLocaleString()}`,
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Requests Received",
      value: stats?.requestsReceived[filter] ?? 0,
      total: stats?.requestsReceived.overall ?? 0,
      icon: BarChart2,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "Requests Accepted",
      value: stats?.requestAccepted[filter] ?? 0,
      total: stats?.requestAccepted.overall ?? 0,
      icon: CheckCircle,
      color: "bg-purple-100 text-purple-600",
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
              src={user?.profile_pic || "/avatar.jpg"}
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
                {filter === "currentYear" ? "Current Year" : "Overall"} <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilter("currentYear")}>
                Current Year
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("overall")}>
                Overall
              </DropdownMenuItem>
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
          <DashboardStatusTable />
        </div>

        {/* Line Chart */}
        {stats?.studentsAidedPerYear && stats.studentsAidedPerYear.length > 0 && (
          <StudentsAidedChart data={stats.studentsAidedPerYear} />
        )}
        

        {stats?.amountDisbursedPerYear && stats.amountDisbursedPerYear.length > 0 && (
          <AmountDisbursedChart data={stats.amountDisbursedPerYear} />
        )}

      </div>
    </ProtectedRoute>
  );
}
