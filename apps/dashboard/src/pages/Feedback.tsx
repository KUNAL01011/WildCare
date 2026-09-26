import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export function FeedbackPage() {
  const [page, setPage] = useState(1);
  const [rating, setRating] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-feedback", rating, page],
    queryFn: async () => {
      const res = await api.get("/admin/feedback", {
        params: {
          rating: rating || undefined,
          page,
          limit: 10,
        },
      });
      return res.data.data;
    },
  });

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Feedback</h2>

      <div className="flex gap-3 mb-4">
        <select
          value={rating}
          onChange={(e) => { setRating(e.target.value); setPage(1); }}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All ratings</option>
          {[1, 2, 3, 4, 5].map((r) => (
            <option key={r} value={r}>{r} star{r > 1 ? "s" : ""}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="px-6 py-3 font-medium">Report</th>
              <th className="px-6 py-3 font-medium">Body</th>
              <th className="px-6 py-3 font-medium">Citizen</th>
              <th className="px-6 py-3 font-medium">Overall</th>
              <th className="px-6 py-3 font-medium">Response</th>
              <th className="px-6 py-3 font-medium">Outcome</th>
              <th className="px-6 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : data?.feedback?.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">No feedback found</td></tr>
            ) : (
              data?.feedback?.map((f: any) => (
                <tr key={f.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-3 font-mono text-xs">{f.reportNumber}</td>
                  <td className="px-6 py-3">{f.bodyName}</td>
                  <td className="px-6 py-3 text-gray-600">{f.citizenName}</td>
                  <td className="px-6 py-3">
                    <Stars count={f.overallRating} />
                  </td>
                  <td className="px-6 py-3">
                    <Stars count={f.responseTimeRating} />
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      f.outcome === "SUCCESSFUL" ? "bg-emerald-100 text-emerald-700" :
                      f.outcome === "PARTIALLY_SUCCESSFUL" ? "bg-amber-100 text-amber-700" :
                      f.outcome === "UNSUCCESSFUL" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {f.outcome?.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500">{new Date(f.createdAt).toLocaleDateString()}</td>
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

function Stars({ count }: { count: number }) {
  return (
    <span className="text-amber-500 text-xs">
      {"★".repeat(count)}{"☆".repeat(5 - count)}
    </span>
  );
}
