import { apiClient } from './client';

export type ResponseStatus =
  | 'WAITING'
  | 'RESPONDER_CONTACTED'
  | 'RESPONDER_ACCEPTED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'UNABLE_TO_REACH_RESPONDER';

export const contactApi = {
  updateResponse: async (
    reportId: string,
    status: ResponseStatus
  ) => {
    const res = await apiClient.post(
      `/reports/${reportId}/response`,
      { status }
    );
    return res.data.data;
  },
};