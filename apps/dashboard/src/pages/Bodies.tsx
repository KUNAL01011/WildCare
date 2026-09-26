import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Link } from "react-router-dom";

const TYPE_OPTIONS = ["", "GOVERNMENT", "NGO", "PRIVATE"];
const VERIFICATION_OPTIONS = ["", "PENDING", "UNDER_REVIEW", "VERIFIED", "REJECTED", "SUSPENDED"];

export function BodiesPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [verification, setVerification] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-bodies", search, type, verification, page],
    queryFn: async () => {
      const res = await api.get("/admin/bodies", {
        params: {
          search: search || undefined,
          type: type || undefined,
          verificationStatus: verification || undefined,
          page,
          limit: 10,
        },
      });
      return res.data.data;
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Responder Bodies</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
        >
          {showCreate ? "Cancel" : "+ Create Body"}
        </button>
      </div>

      {showCreate && (
        <CreateBodyForm
          onCreated={() => {
            setShowCreate(false);
            queryClient.invalidateQueries({ queryKey: ["admin-bodies"] });
          }}
        />
      )}

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 max-w-sm px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg">
          <option value="">All types</option>
          {TYPE_OPTIONS.filter(Boolean).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select value={verification} onChange={(e) => { setVerification(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg">
          <option value="">All statuses</option>
          {VERIFICATION_OPTIONS.filter(Boolean).map((v) => (
            <option key={v} value={v}>{v.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 font-medium">Location</th>
              <th className="px-6 py-3 font-medium">Verification</th>
              <th className="px-6 py-3 font-medium">Services</th>
              <th className="px-6 py-3 font-medium">Contacts</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : data?.bodies?.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No bodies found</td></tr>
            ) : (
              data?.bodies?.map((b: any) => (
                <tr key={b.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <Link to={`/bodies/${b.id}`} className="text-emerald-600 hover:underline font-medium">
                      {b.name}
                    </Link>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      b.type === "GOVERNMENT" ? "bg-blue-100 text-blue-700" :
                      b.type === "NGO" ? "bg-emerald-100 text-emerald-700" :
                      "bg-purple-100 text-purple-700"
                    }`}>
                      {b.type}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {[b.city, b.state].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="px-6 py-3">
                    <VerificationBadge status={b.verificationStatus} />
                  </td>
                  <td className="px-6 py-3 text-gray-500 text-xs">
                    {b.services?.join(", ") || "—"}
                  </td>
                  <td className="px-6 py-3">{b.contactCount}</td>
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

function CreateBodyForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({
    name: "",
    type: "NGO" as string,
    phone: "",
    email: "",
    state: "",
    district: "",
    city: "",
    description: "",
  });
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/admin/bodies", form);
      return res.data.data;
    },
    onSuccess: () => onCreated(),
    onError: (err: any) => setError(err.response?.data?.error?.message || "Failed to create"),
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <h3 className="font-semibold text-gray-900 mb-4">Create New Body</h3>
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <input placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 border rounded-lg" />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="px-3 py-2 border rounded-lg">
          <option value="GOVERNMENT">Government</option>
          <option value="NGO">NGO</option>
          <option value="PRIVATE">Private</option>
        </select>
        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="px-3 py-2 border rounded-lg" />
        <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="px-3 py-2 border rounded-lg" />
        <input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="px-3 py-2 border rounded-lg" />
        <input placeholder="District" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className="px-3 py-2 border rounded-lg" />
        <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="px-3 py-2 border rounded-lg" />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="px-3 py-2 border rounded-lg md:col-span-2" />
      </div>
      <button
        onClick={() => mutation.mutate()}
        disabled={!form.name || mutation.isPending}
        className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
      >
        {mutation.isPending ? "Creating..." : "Create Body"}
      </button>
    </div>
  );
}

export function VerificationBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    PENDING: "bg-gray-100 text-gray-700",
    UNDER_REVIEW: "bg-amber-100 text-amber-700",
    VERIFIED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-red-100 text-red-700",
    SUSPENDED: "bg-orange-100 text-orange-700",
  };

  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colorMap[status] ?? "bg-gray-100 text-gray-700"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
