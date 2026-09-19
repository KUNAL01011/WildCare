export interface DispatchPayload {
  incidentId: string;
  incidentType: string;
  urgency: string;
  destination: string; // e.g., email address, phone number, webhook URL
  description?: string;
  locationLink?: string;
}

export interface DispatchResult {
  success: boolean;
  providerMessageId?: string;
  error?: string;
}

export interface IDispatchProvider {
  send(payload: DispatchPayload): Promise<DispatchResult>;
}
