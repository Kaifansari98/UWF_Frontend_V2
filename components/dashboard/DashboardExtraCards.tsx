"use client";

import { BarChart2, Ban, Clock4, FileCheck2, XCircle } from "lucide-react";

const extraCards = [
  {
    title: "Request Pending",
    icon: Clock4,
    color: "bg-orange-500/15 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300",
    key: "requestPending",
  },
  {
    title: "Request Rejected",
    icon: XCircle,
    color: "bg-red-500/15 text-red-600 dark:bg-red-500/20 dark:text-red-300",
    key: "requestRejected",
  },
  {
    title: "Cases Disbursed",
    icon: FileCheck2,
    color: "bg-teal-500/15 text-teal-600 dark:bg-teal-500/20 dark:text-teal-300",
    key: "casesDisbursed",
  },
  {
    title: "Cases Closed",
    icon: Ban,
    color: "bg-zinc-500/15 text-zinc-600 dark:bg-zinc-500/20 dark:text-zinc-300",
    key: "casesClosed",
  },
];

type Props = {
  stats: any;
  filter: string;
};

export default function DashboardExtraCards({ stats, filter }: Props) {
  const selectedSummary =
    filter === "overall"
      ? stats?.summary?.overall
      : stats?.summary?.byFinancialYear?.[filter];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-10">
      {extraCards.map((card) => (
        <div
          key={card.title}
          className="rounded-2xl border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className={`p-3 rounded-full ${card.color}`}>
              <card.icon size={24} />
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{card.title}</p>
              <h3 className="text-xl font-bold text-foreground">
                {selectedSummary?.[card.key] ?? 0}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground/80">
                Total: <span className="font-medium">{stats?.summary?.overall?.[card.key] ?? 0}</span>
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
