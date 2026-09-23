import { apiClient } from './client';

export type ResponderService =
  | 'WILDLIFE_RESCUE'
  | 'INJURED_ANIMAL'
  | 'TRAPPED_ANIMAL'
  | 'DEAD_ANIMAL'
  | 'VETERINARY_SUPPORT'
  | 'EMERGENCY_RESPONSE';

export type BodyType = 'GOVERNMENT' | 'NGO' | 'PRIVATE';

export type ResponderMatch = {
  id: string;
  name: string;
  type: BodyType;
  verified: boolean;
  distanceKm: number;
  services: ResponderService[];
  phone: string;
  averageResponseTimeMinutes: number | null;
};

export type ResponderDetail = {
  id: string;
  name: string;
  type: BodyType;
  description: string | null;
  verified: boolean;
  phone: string | null;
  email: string | null;
  location: {
    state: string;
    district: string;
    city: string;
  };
  services: ResponderService[];
};

export type ContactAttemptResult = {
  contactAttemptId: string;
  status: string;
};

export const respondersApi = {
  // Matched responders for a specific report
  getMatches: async (
    reportId: string,
    limit = 5
  ): Promise<ResponderMatch[]> => {
    const res = await apiClient.get(
      `/reports/${reportId}/responders`,
      { params: { limit } }
    );
    return res.data.data;
  },

  // Public responder profile
  getById: async (bodyId: string): Promise<ResponderDetail> => {
    const res = await apiClient.get(`/responders/${bodyId}`);
    return res.data.data;
  },

  // Record a contact attempt
  recordContact: async (
    reportId: string,
    bodyId: string,
    type: 'PHONE' = 'PHONE'
  ): Promise<ContactAttemptResult> => {
    const res = await apiClient.post(
      `/reports/${reportId}/contact`,
      { bodyId, type }
    );
    return res.data.data;
  },
};