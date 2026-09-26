import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "../api/reports";

export const REPORTS_KEY = "reports";

export const useReports = (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: [REPORTS_KEY, params],
    queryFn: () => reportsApi.list(params),
  });
};

export const useReport = (reportId: string) => {
  return useQuery({
    queryKey: [REPORTS_KEY, reportId],
    queryFn: () => reportsApi.getById(reportId),
    enabled: !!reportId,
  });
};

export const useFullReport = (reportId: string) => {
  return useQuery({
    queryKey: [REPORTS_KEY, reportId, "full"],
    queryFn: () => reportsApi.getFullById(reportId),
    enabled: !!reportId,
  });
};
