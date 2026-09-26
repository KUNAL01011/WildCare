import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Link } from "react-router-dom";
import { Users, FileText, Building2, MessageSquare } from "lucide-react";

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await api.get("/admin/dashboard");
      return res.data.data;
    },
  });

  if (isLoading) return <div className="text-gray-500">Loading dashboard...</div>;

  const stats = data;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Users size={20} />}
          label="Total Citizens"
          value={stats?.citizens?.total ?? 0}
          color="blue"
        />
        <StatCard
          icon={<FileText size={20} />}
          label="Total Reports"
          value={stats?.reports?.total ?? 0}
          sub={`${stats?.reports?.active ?? 0} active`}
          color="emerald"
        />
        <StatCard
          icon={<Building2 size={20} />}
          label="Responder Bodies"
          value={stats?.bodies?.total ?? 0}
          color="purple"
        />
        <StatCard
          icon={<MessageSquare size={20} />}
          label="Feedback"
          value={stats?.feedback?.total ?? 0}
          color="amber"
        />
      </div>

      {/* Body Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Bodies by Type
          </h3>
          <div className="space-y-3">
            <BarItem label="Government" value={stats?.bodies?.government ?? 0} total={stats?.bodies?.total || 1} color="bg-blue-500" />
            <BarItem label="NGO" value={stats?.bodies?.ngo ?? 0} total={stats?.bodies?.total || 1} color="bg-emerald-500" />
            <BarItem label="Private" value={stats?.bodies?.private ?? 0} total={stats?.bodies?.total || 1} color="bg-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Reports Overview</h3>
          <div className="space-y-3">
            <BarItem label="Active" value={stats?.reports?.active ?? 0} total={stats?.reports?.total || 1} color="bg-amber-500" />
            <BarItem label="Resolved" value={stats?.reports?.resolved ?? 0} total={stats?.reports?.total || 1} color="bg-emerald-500" />
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Reports</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3 font-medium">Report #</th>
                <th className="pb-3 font-medium">Animal</th>
                <th className="pb-3 font-medium">Location</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Citizen</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentReports?.map((r: any) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="py-3">
                    <Link
                      to={`/reports/${r.id}`}
                      className="text-emerald-600 hover:underline font-mono text-xs"
                    >
                      {r.reportNumber}
                    </Link>
                  </td>
                  <td className="py-3">{r.animalName ?? "Unknown"}</td>
                  <td className="py-3 text-gray-500">
                    {[r.city, r.state].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="py-3 text-gray-600">{r.citizenName}</td>
                </tr>
              ))}
              {(!stats?.recentReports || stats.recentReports.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No reports yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>{icon}</div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

function BarItem({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    ANALYZING: "bg-blue-100 text-blue-700",
    READY_FOR_REVIEW: "bg-amber-100 text-amber-700",
    SUBMITTED: "bg-indigo-100 text-indigo-700",
    RESPONDER_CONTACTED: "bg-cyan-100 text-cyan-700",
    RESPONDER_ACCEPTED: "bg-teal-100 text-teal-700",
    IN_PROGRESS: "bg-orange-100 text-orange-700",
    RESOLVED: "bg-emerald-100 text-emerald-700",
    UNABLE_TO_REACH_RESPONDER: "bg-red-100 text-red-700",
    CANCELLED: "bg-gray-100 text-gray-500",
  };

  const display = status.replace(/_/g, " ");
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colorMap[status] ?? "bg-gray-100 text-gray-700"}`}
    >
      {display}
    </span>
  );
}
