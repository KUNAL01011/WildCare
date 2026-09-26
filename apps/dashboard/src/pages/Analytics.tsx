import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export function AnalyticsPage() {
  const { data: reportStats } = useQuery({
    queryKey: ["analytics-reports"],
    queryFn: async () => {
      const res = await api.get("/admin/analytics/reports");
      return res.data.data;
    },
  });

  const { data: bodyStats } = useQuery({
    queryKey: ["analytics-bodies"],
    queryFn: async () => {
      const res = await api.get("/admin/analytics/bodies");
      return res.data.data;
    },
  });

  const { data: feedbackStats } = useQuery({
    queryKey: ["analytics-feedback"],
    queryFn: async () => {
      const res = await api.get("/admin/analytics/feedback");
      return res.data.data;
    },
  });

  const { data: responseTime } = useQuery({
    queryKey: ["analytics-response-time"],
    queryFn: async () => {
      const res = await api.get("/admin/analytics/response-time");
      return res.data.data;
    },
  });

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports by Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Reports by Status</h3>
          <p className="text-sm text-gray-500 mb-4">Total: {reportStats?.total ?? 0}</p>
          <div className="space-y-2">
            {reportStats?.byStatus?.map((s: any) => (
              <div key={s.status} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{s.status.replace(/_/g, " ")}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${reportStats?.total ? (s.count / reportStats.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="font-medium w-8 text-right">{s.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reports by Animal */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top Animals Reported</h3>
          <div className="space-y-2">
            {reportStats?.byAnimal?.length > 0 ? (
              reportStats.byAnimal.map((a: any) => (
                <div key={a.animal} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 capitalize">{a.animal}</span>
                  <span className="font-medium">{a.count}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No data yet</p>
            )}
          </div>
        </div>

        {/* Bodies by Type */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Bodies by Type</h3>
          <div className="space-y-3">
            {bodyStats?.byType?.map((t: any) => (
              <div key={t.type} className="flex justify-between items-center text-sm">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  t.type === "GOVERNMENT" ? "bg-blue-100 text-blue-700" :
                  t.type === "NGO" ? "bg-emerald-100 text-emerald-700" :
                  "bg-purple-100 text-purple-700"
                }`}>
                  {t.type}
                </span>
                <span className="font-medium">{t.count}</span>
              </div>
            ))}
          </div>

          <h4 className="font-medium text-gray-900 mt-6 mb-3">By Verification</h4>
          <div className="space-y-2">
            {bodyStats?.byVerification?.map((v: any) => (
              <div key={v.status} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{v.status.replace(/_/g, " ")}</span>
                <span className="font-medium">{v.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback + Response Time */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Feedback Summary</h3>
            <p className="text-sm text-gray-500 mb-4">Total: {feedbackStats?.total ?? 0}</p>

            <h4 className="font-medium text-gray-900 mb-2">By Outcome</h4>
            <div className="space-y-2 mb-4">
              {feedbackStats?.byOutcome?.map((o: any) => (
                <div key={o.outcome} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{o.outcome.replace(/_/g, " ")}</span>
                  <span className="font-medium">{o.count}</span>
                </div>
              ))}
            </div>

            <h4 className="font-medium text-gray-900 mb-2">By Rating</h4>
            <div className="space-y-2">
              {feedbackStats?.byRating?.map((r: any) => (
                <div key={r.rating} className="flex justify-between items-center text-sm">
                  <span className="text-amber-500">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  <span className="font-medium">{r.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Response Time</h3>
            {responseTime?.averageMinutes != null ? (
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-600">
                  {responseTime.averageMinutes < 60
                    ? `${responseTime.averageMinutes} min`
                    : `${Math.round(responseTime.averageMinutes / 60)} hrs`}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Average resolution time ({responseTime.count} reports)
                </p>
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center">No resolved reports yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
