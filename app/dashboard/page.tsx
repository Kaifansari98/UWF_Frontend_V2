"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import Image from "next/image";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotificationBell from "@/components/NotificationBell";
import { useEffect, useState } from "react";
import apiClient from "@/utils/apiClient";
import {
  BarChart2,
  DollarSign,
  Users,
  CheckCircle,
  ChevronDown,
  Calendar,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import StudentsAidedChart from "@/components/dashboard/StudentsAidedChart";
import DashboardExtraCards from "@/components/dashboard/DashboardExtraCards";
import AmountDisbursedChart from "@/components/dashboard/AmountDisbursedChart";
import DashboardStatusTable from "@/components/dashboard/DashboardStatusTable";
import { getProfileImageSrc } from "@/utils/profileImage";

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
  studentsAidedPerFinancialYear: {
    key: string;
    label: string;
    students: number;
  }[];
  amountDisbursedPerFinancialYear: {
    key: string;
    label: string;
    amount: number;
  }[];
};

function formatRoleLabel(role?: string | null): string {
  if (!role) return "User";
  return role
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export default function Dashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [greeting, setGreeting] = useState("Hello");
  const [filter, setFilter] = useState<string>("overall");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("Good Morning");
    else if (hour >= 12 && hour < 17) setGreeting("Good Afternoon");
    else if (hour >= 17 && hour < 21) setGreeting("Good Evening");
    else setGreeting("Good Night");
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  function ordinal(n: number) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
  }

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
  const monthName = now.toLocaleDateString("en-US", { month: "long" });
  const dateStr = `${dayName}, ${ordinal(now.getDate())} ${monthName} ${now.getFullYear()}`;

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
      ? (stats?.studentsAidedPerFinancialYear ?? [])
      : (stats?.studentsAidedPerFinancialYear ?? []).filter(
          (item) => item.key === filter,
        );

  const amountChartData =
    filter === "overall"
      ? (stats?.amountDisbursedPerFinancialYear ?? [])
      : (stats?.amountDisbursedPerFinancialYear ?? []).filter(
          (item) => item.key === filter,
        );

  const cards = [
    {
      title: "Requests Received",
      value: selectedSummary?.requestsReceived ?? 0,
      total: stats?.summary.overall.requestsReceived ?? 0,
      icon: BarChart2,
      color:
        "bg-yellow-500/15 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-300",
    },
    {
      title: "Requests Accepted",
      value: selectedSummary?.requestAccepted ?? 0,
      total: stats?.summary.overall.requestAccepted ?? 0,
      icon: CheckCircle,
      color:
        "bg-fuchsia-500/15 text-fuchsia-600 dark:bg-fuchsia-500/20 dark:text-fuchsia-300",
    },
    {
      title: "Students Aided",
      value: selectedSummary?.studentsAided ?? 0,
      total: stats?.summary.overall.studentsAided ?? 0,
      icon: Users,
      color:
        "bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300",
    },
    {
      title: "Amount Disbursed",
      value: `₹${(selectedSummary?.amountDisbursed ?? 0).toLocaleString()}`,
      total: `₹${(stats?.summary.overall.amountDisbursed ?? 0).toLocaleString()}`,
      icon: DollarSign,
      color:
        "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300",
    },
  ];

  return (
    <ProtectedRoute>
      <div className="flex min-h-full flex-col bg-background text-foreground">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-2 pr-4">
            <AnimatedThemeToggler />
          </div>
        </header>

        <div className="min-h-screen rounded-2xl bg-background px-10 py-8">
          {/* Greeting Header */}
          <div className="flex items-center justify-between pb-6">
            <div className="flex items-center gap-6">
              <div className="relative w-14 h-14">
                <Image
                  src={getProfileImageSrc(user?.profile_pic, "/avatar.jpg")}
                  alt="Profile"
                  className="rounded-full border-2 border-border object-cover shadow-sm"
                  fill
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {greeting}, {user?.full_name?.split(" ")[0]} 👋
                </h1>
                <p className="text-sm text-muted-foreground">
                  {formatRoleLabel(user?.role)}
                </p>
              </div>
            </div>

            {/* Date & Time */}
            <div className="hidden sm:flex flex-col items-end gap-0.5 px-5 py-3">
              <div className="flex items-end gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Date &amp; Time
                </span>
                <span className="text-base font-semibold tabular-nums text-foreground">
                  {timeStr}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar size={14} className="shrink-0" />
                <span>{dateStr}</span>
              </div>
            </div>
          </div>

          {/* Stats Section Header */}
          <div className="flex items-center justify-between mt-10 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                📊 Dashboard Stats
              </h2>
              <p className="text-sm text-muted-foreground">
                Track your impact and form activity over time
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  {stats?.financialYearOptions.find(
                    (option) => option.key === filter,
                  )?.label ?? "Overall"}{" "}
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {stats?.financialYearOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.key}
                    onClick={() => setFilter(option.key)}
                  >
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
                className="rounded-2xl border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-full ${card.color}`}>
                    <card.icon size={24} />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {card.title}
                    </p>
                    <h3 className="text-xl font-bold text-foreground">
                      {card.value}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground/80">
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
      </div>
    </ProtectedRoute>
  );
}
