import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import { StatusBadge } from "./Dashboard";

export function CitizenDetailPage() {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["citizen", id],
    queryFn: async () => {
      const res = await api.get(`/admin/citizens/${id}`);
      return res.data.data;
    },
  });

  if (isLoading) return <div className="text-gray-500">Loading...</div>;
  if (!data) return <div className="text-gray-500">Citizen not found</div>;

  return (
    <div>
      <Link to="/citizens" className="text-sm text-emerald-600 hover:underline mb-4 block">
        &larr; Back to Citizens
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          {data.profileImage && (
            <img src={data.profileImage} alt="" className="w-14 h-14 rounded-full" />
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900">{data.name}</h2>
            <p className="text-gray-500">{data.email}</p>
            <p className="text-xs text-gray-400 mt-1">
              Joined {new Date(data.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <h3 className="font-semibold text-gray-900 mb-3">Reports ({data.reports?.length ?? 0})</h3>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="px-6 py-3 font-medium">Report #</th>
              <th className="px-6 py-3 font-medium">Animal</th>
              <th className="px-6 py-3 font-medium">Location</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.reports?.map((r: any) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-3">
                  <Link to={`/reports/${r.id}`} className="text-emerald-600 hover:underline font-mono text-xs">
                    {r.reportNumber}
                  </Link>
                </td>
                <td className="px-6 py-3">{r.animalName ?? "Unknown"}</td>
                <td className="px-6 py-3 text-gray-500">
                  {[r.city, r.state].filter(Boolean).join(", ") || "—"}
                </td>
                <td className="px-6 py-3"><StatusBadge status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
