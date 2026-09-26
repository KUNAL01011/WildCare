import { apiClient } from './client';

export type FeedbackOutcome =
  | 'SUCCESSFUL'
  | 'PARTIALLY_SUCCESSFUL'
  | 'UNSUCCESSFUL'
  | 'UNKNOWN';

export type FeedbackPayload = {
  bodyId: string;
  overallRating: number;
  responseTimeRating: number;
  professionalismRating: number;
  outcome: FeedbackOutcome;
  comment?: string;
};

export type FeedbackResult = {
  feedbackId: string;
};

export const feedbackApi = {
  submit: async (
    reportId: string,
    payload: FeedbackPayload
  ): Promise<FeedbackResult> => {
    const res = await apiClient.post(
      `/reports/${reportId}/feedback`,
      payload
    );
    return res.data.data;
  },
};