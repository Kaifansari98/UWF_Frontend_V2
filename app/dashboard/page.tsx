"use client";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div className="h-full bg-[#f5f5f5] p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to your dashboard, brudaaa 🎉</p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
