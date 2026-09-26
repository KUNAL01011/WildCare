import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Link } from "react-router-dom";

export function CitizensPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["citizens", search, page],
    queryFn: async () => {
      const res = await api.get("/admin/citizens", {
        params: { search: search || undefined, page, limit: 10 },
      });
      return res.data.data;
    },
  });

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Citizens</h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Reports</th>
              <th className="px-6 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : data?.citizens?.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No citizens found</td></tr>
            ) : (
              data?.citizens?.map((c: any) => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <Link to={`/citizens/${c.id}`} className="text-emerald-600 hover:underline font-medium">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-gray-500">{c.email}</td>
                  <td className="px-6 py-3">{c.reportCount}</td>
                  <td className="px-6 py-3 text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {data && data.total > 10 && (
          <div className="px-6 py-3 border-t flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Page {page} of {Math.ceil(data.total / 10)}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * 10 >= data.total}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
