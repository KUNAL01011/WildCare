import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Link } from "react-router-dom";
import { StatusBadge } from "./Dashboard";

const STATUS_OPTIONS = [
  "",
  "DRAFT",
  "ANALYZING",
  "READY_FOR_REVIEW",
  "SUBMITTED",
  "RESPONDER_CONTACTED",
  "RESPONDER_ACCEPTED",
  "IN_PROGRESS",
  "RESOLVED",
  "UNABLE_TO_REACH_RESPONDER",
  "CANCELLED",
];

export function ReportsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reports", search, status, page],
    queryFn: async () => {
      const res = await api.get("/admin/reports", {
        params: {
          search: search || undefined,
          status: status || undefined,
          page,
          limit: 10,
        },
      });
      return res.data.data;
    },
  });

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Reports</h2>

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by report # or animal..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.filter(Boolean).map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="px-6 py-3 font-medium">Report #</th>
              <th className="px-6 py-3 font-medium">Animal</th>
              <th className="px-6 py-3 font-medium">Severity</th>
              <th className="px-6 py-3 font-medium">Location</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Citizen</th>
              <th className="px-6 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : data?.reports?.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">No reports found</td></tr>
            ) : (
              data?.reports?.map((r: any) => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <Link to={`/reports/${r.id}`} className="text-emerald-600 hover:underline font-mono text-xs">
                      {r.reportNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-3">{r.animalName ?? "Unknown"}</td>
                  <td className="px-6 py-3">
                    {r.severity && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        r.severity === "high" ? "bg-red-100 text-red-700" :
                        r.severity === "medium" ? "bg-amber-100 text-amber-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {r.severity}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {[r.location?.city, r.location?.state].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="px-6 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-6 py-3 text-gray-600">{r.citizenName}</td>
                  <td className="px-6 py-3 text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {data && data.total > 10 && (
          <div className="px-6 py-3 border-t flex items-center justify-between text-sm">
            <span className="text-gray-500">Page {page} of {Math.ceil(data.total / 10)}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">Previous</button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page * 10 >= data.total} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
