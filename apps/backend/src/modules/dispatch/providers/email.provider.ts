import {
  IDispatchProvider,
  DispatchPayload,
  DispatchResult,
} from "./dispatch.provider.js";
import { resend } from "../../../lib/resend.js"; // Assuming resend client is initialized here
import { env } from "../../../config/env.js";

export class EmailDispatchProvider implements IDispatchProvider {
  async send(payload: DispatchPayload): Promise<DispatchResult> {
    try {
      const { data, error } = await resend.emails.send({
        from: env.EMAIL_FROM || "alerts@wildcare.in",
        to: payload.destination,
        subject: `[URGENT] WildCare Incident Alert: ${payload.incidentId}`,
        html: `
          <h2>New Wildlife Incident Assigned</h2>
          <p><strong>Incident ID:</strong> ${payload.incidentId}</p>
          <p><strong>Type:</strong> ${payload.incidentType}</p>
          <p><strong>Urgency:</strong> ${payload.urgency}</p>
          <p><strong>Description:</strong> ${payload.description || "N/A"}</p>
          <a href="${payload.locationLink}">View Incident Details</a>
        `,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, providerMessageId: data?.id };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }
}
