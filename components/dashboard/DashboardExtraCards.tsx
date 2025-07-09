"use client";

import { BarChart2, Ban, Clock4, FileCheck2, XCircle } from "lucide-react";

const extraCards = [
  {
    title: "Request Pending",
    icon: Clock4,
    color: "bg-orange-100 text-orange-600",
    key: "requestPending",
  },
  {
    title: "Request Rejected",
    icon: XCircle,
    color: "bg-red-100 text-red-600",
    key: "requestRejected",
  },
  {
    title: "Cases Disbursed",
    icon: FileCheck2,
    color: "bg-teal-100 text-teal-600",
    key: "casesDisbursed",
  },
  {
    title: "Cases Closed",
    icon: Ban,
    color: "bg-gray-100 text-gray-600",
    key: "casesClosed",
  },
];

type Props = {
  stats: any;
  filter: "currentYear" | "overall";
};

export default function DashboardExtraCards({ stats, filter }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-10">
      {extraCards.map((card) => (
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
              <h3 className="text-xl font-bold text-gray-800">
                {stats?.[card.key]?.[filter] ?? 0}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Total: <span className="font-medium">{stats?.[card.key]?.overall ?? 0}</span>
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
