import { apiClient } from './client';
import type { ReportSummary } from '../components/shared/ReportCard';

export type ReportDetail = {
  id: string;
  reportNumber: string;
  status: string;
  animal: { name: string; confidence: number } | null;
  condition: {
    ai: string | null;
    confidence: number | null;
    citizen: string | null;
  };
  severity: string | null;
  location: {
    latitude: number;
    longitude: number;
    city: string;
    state: string;
    postalCode: string;
  };
  images: { url: string; sortOrder: number }[];
  description?: string | null;
  createdAt: string;
  submittedAt?: string | null;
  resolvedAt?: string | null;
};

export type ReportEvent = {
  id: string;
  type: string;
  description: string | null;
  actorType: string | null;
  createdAt: string;
};

export type ContactAttempt = {
  id: string;
  bodyId: string;
  bodyName?: string;
  type: string;
  status: string;
  initiatedAt: string;
};

export type FullReportDetail = ReportDetail & {
  events?: ReportEvent[];
  contacts?: ContactAttempt[];
  feedback?: {
    id: string;
    overallRating: number;
    responseTimeRating: number;
    professionalismRating: number;
    outcome: string;
    comment: string | null;
    createdAt: string;
  } | null;
};

type ReportsListResponse = {
  reports: ReportSummary[];
  total: number;
  page: number;
};

export const reportsApi = {
  list: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ReportsListResponse> => {
    const res = await apiClient.get('/reports', { params });
    return res.data.data;
  },

  getById: async (reportId: string): Promise<ReportDetail> => {
    const res = await apiClient.get(`/reports/${reportId}`);
    return res.data.data;
  },

  // Full detail with events + contacts + feedback
  getFullById: async (
    reportId: string
  ): Promise<FullReportDetail> => {
    const res = await apiClient.get(`/reports/${reportId}`);
    return res.data.data;
  },

  patch: async (
    reportId: string,
    data: {
      animalName?: string;
      citizenCondition?: string;
      severity?: string;
      description?: string;
    }
  ) => {
    const res = await apiClient.patch(
      `/reports/${reportId}`,
      data
    );
    return res.data.data;
  },

  submit: async (reportId: string) => {
    const res = await apiClient.post(
      `/reports/${reportId}/submit`
    );
    return res.data.data;
  },
};


// Add to reportsApi object:
// reportsApi.getFullById