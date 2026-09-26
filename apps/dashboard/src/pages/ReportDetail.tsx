import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import { StatusBadge } from "./Dashboard";

export function ReportDetailPage() {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-report", id],
    queryFn: async () => {
      const res = await api.get(`/admin/reports/${id}`);
      return res.data.data;
    },
  });

  if (isLoading) return <div className="text-gray-500">Loading...</div>;
  if (!data) return <div className="text-gray-500">Report not found</div>;

  return (
    <div>
      <Link to="/reports" className="text-sm text-emerald-600 hover:underline mb-4 block">
        &larr; Back to Reports
      </Link>

      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">{data.reportNumber}</h2>
        <StatusBadge status={data.status} />
        {data.severity && (
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            data.severity === "high" ? "bg-red-100 text-red-700" :
            data.severity === "medium" ? "bg-amber-100 text-amber-700" :
            "bg-green-100 text-green-700"
          }`}>
            {data.severity} severity
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {data.images?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Images</h3>
              <div className="flex gap-3 overflow-x-auto">
                {data.images.map((img: any) => (
                  <img
                    key={img.id}
                    src={img.url}
                    alt="Report"
                    className="w-40 h-40 object-cover rounded-lg border"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Field label="Animal" value={data.animalName} />
              <Field label="AI Condition" value={data.aiCondition} />
              <Field label="Citizen Condition" value={data.citizenCondition} />
              <Field label="Description" value={data.description} />
              <Field label="Incident Date" value={data.incidentOccurredAt ? new Date(data.incidentOccurredAt).toLocaleString() : null} />
              <Field label="Submitted" value={data.submittedAt ? new Date(data.submittedAt).toLocaleString() : null} />
              <Field label="Resolved" value={data.resolvedAt ? new Date(data.resolvedAt).toLocaleString() : null} />
            </div>
          </div>

          {/* AI Analysis */}
          {data.aiAnalyses?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">AI Analysis</h3>
              {data.aiAnalyses.map((ai: any) => (
                <div key={ai.id} className="grid grid-cols-2 gap-4 text-sm">
                  <Field label="Animal" value={`${ai.animalName} (${Math.round((ai.animalConfidence ?? 0) * 100)}%)`} />
                  <Field label="Condition" value={`${ai.condition} (${Math.round((ai.conditionConfidence ?? 0) * 100)}%)`} />
                  <Field label="Severity" value={ai.severity} />
                  <Field label="Model" value={ai.model} />
                  <Field label="Status" value={ai.status} />
                </div>
              ))}
            </div>
          )}

          {/* Timeline */}
          {data.events?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Timeline</h3>
              <div className="space-y-3">
                {data.events.map((e: any) => (
                  <div key={e.id} className="flex gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{e.type.replace(/_/g, " ")}</p>
                      {e.description && <p className="text-gray-500">{e.description}</p>}
                      <p className="text-xs text-gray-400">{new Date(e.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Citizen */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Citizen</h3>
            {data.citizen && (
              <div className="text-sm">
                <Link to={`/citizens/${data.citizen.id}`} className="text-emerald-600 hover:underline font-medium">
                  {data.citizen.name}
                </Link>
                <p className="text-gray-500">{data.citizen.email}</p>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
            <div className="text-sm space-y-1">
              <p>{data.location?.address}</p>
              <p>{[data.location?.city, data.location?.district, data.location?.state].filter(Boolean).join(", ")}</p>
              <p className="text-gray-400">{data.location?.postalCode}</p>
              <p className="text-xs text-gray-400 mt-2">
                {data.location?.latitude}, {data.location?.longitude}
              </p>
            </div>
          </div>

          {/* Contacts */}
          {data.contacts?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Contact Attempts</h3>
              <div className="space-y-2 text-sm">
                {data.contacts.map((c: any) => (
                  <div key={c.id} className="p-2 bg-gray-50 rounded">
                    <p className="font-medium">{c.bodyName}</p>
                    <p className="text-gray-500 text-xs">{c.type} - {c.status}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          {data.feedback?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Feedback</h3>
              {data.feedback.map((f: any) => (
                <div key={f.id} className="text-sm space-y-1">
                  <p>Overall: {"★".repeat(f.overallRating)}{"☆".repeat(5 - f.overallRating)}</p>
                  <p>Response Time: {"★".repeat(f.responseTimeRating)}{"☆".repeat(5 - f.responseTimeRating)}</p>
                  <p>Professionalism: {"★".repeat(f.professionalismRating)}{"☆".repeat(5 - f.professionalismRating)}</p>
                  <p className="text-gray-500">Outcome: {f.outcome?.replace(/_/g, " ")}</p>
                  {f.comment && <p className="text-gray-500 italic">"{f.comment}"</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <span className="text-gray-500">{label}</span>
      <p className="font-medium text-gray-900">{value ?? "—"}</p>
    </div>
  );
}
