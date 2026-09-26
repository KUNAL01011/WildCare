import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import { VerificationBadge } from "./Bodies";

export function BodyDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-body", id],
    queryFn: async () => {
      const res = await api.get(`/admin/bodies/${id}`);
      return res.data.data;
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (status: string) => {
      await api.patch(`/admin/bodies/${id}/verification`, { verificationStatus: status });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-body", id] }),
  });

  if (isLoading) return <div className="text-gray-500">Loading...</div>;
  if (!data) return <div className="text-gray-500">Body not found</div>;

  return (
    <div>
      <Link to="/bodies" className="text-sm text-emerald-600 hover:underline mb-4 block">
        &larr; Back to Bodies
      </Link>

      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">{data.name}</h2>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          data.type === "GOVERNMENT" ? "bg-blue-100 text-blue-700" :
          data.type === "NGO" ? "bg-emerald-100 text-emerald-700" :
          "bg-purple-100 text-purple-700"
        }`}>
          {data.type}
        </span>
        <VerificationBadge status={data.verificationStatus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Field label="Phone" value={data.phone} />
              <Field label="Email" value={data.email} />
              <Field label="Website" value={data.website} />
              <Field label="Address" value={data.address} />
              <Field label="Location" value={[data.city, data.district, data.state].filter(Boolean).join(", ")} />
              <Field label="Postal Code" value={data.postalCode} />
              {data.description && (
                <div className="col-span-2">
                  <span className="text-gray-500">Description</span>
                  <p className="text-gray-900">{data.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Services */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Services</h3>
            {data.services?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.services.map((s: string) => (
                  <span key={s} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                    {s.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No services listed</p>
            )}
          </div>

          {/* Animal Types */}
          {data.animalTypes?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Animal Types Supported</h3>
              <div className="flex flex-wrap gap-2">
                {data.animalTypes.map((a: string) => (
                  <span key={a} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">{a}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Verification Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Verification</h3>
            <p className="text-sm text-gray-500 mb-3">
              Current: <VerificationBadge status={data.verificationStatus} />
            </p>
            <div className="flex flex-col gap-2">
              {data.verificationStatus !== "VERIFIED" && (
                <button
                  onClick={() => verifyMutation.mutate("VERIFIED")}
                  disabled={verifyMutation.isPending}
                  className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50"
                >
                  Verify
                </button>
              )}
              {data.verificationStatus !== "REJECTED" && (
                <button
                  onClick={() => verifyMutation.mutate("REJECTED")}
                  disabled={verifyMutation.isPending}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
                >
                  Reject
                </button>
              )}
              {data.verificationStatus === "VERIFIED" && (
                <button
                  onClick={() => verifyMutation.mutate("SUSPENDED")}
                  disabled={verifyMutation.isPending}
                  className="px-3 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 disabled:opacity-50"
                >
                  Suspend
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Feedback</span>
                <span className="font-medium">{data.stats?.feedbackCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Contacts</span>
                <span className="font-medium">{data.stats?.contactCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Matches</span>
                <span className="font-medium">{data.stats?.matchCount}</span>
              </div>
              {data.stats?.averageRating && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Avg Rating</span>
                  <span className="font-medium">{data.stats.averageRating}/5</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <span className="text-gray-500">{label}</span>
      <p className="font-medium text-gray-900">{value || "—"}</p>
    </div>
  );
}
