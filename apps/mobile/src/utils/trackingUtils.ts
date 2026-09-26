import type { ResponseStatus } from '../api/contact';
import { COLORS } from '../constants/colors';

export type TrackingStep = {
  status: ResponseStatus;
  label: string;
  sub: string;
  icon: string;
  color: string;
};

export const TRACKING_STEPS: TrackingStep[] = [
  {
    status: 'WAITING',
    label: 'Waiting',
    sub: 'You have contacted or are about to contact a responder.',
    icon: 'time-outline',
    color: COLORS.textMuted,
  },
  {
    status: 'RESPONDER_CONTACTED',
    label: 'Responder Contacted',
    sub: 'You reached the responder and spoke to them.',
    icon: 'call-outline',
    color: '#0891B2',
  },
  {
    status: 'RESPONDER_ACCEPTED',
    label: 'Responder Accepted',
    sub: 'The responder confirmed they will attend.',
    icon: 'thumbs-up-outline',
    color: '#059669',
  },
  {
    status: 'IN_PROGRESS',
    label: 'In Progress',
    sub: 'The responder is on the way or handling the incident.',
    icon: 'car-outline',
    color: COLORS.warning,
  },
  {
    status: 'RESOLVED',
    label: 'Resolved',
    sub: 'The incident has been handled.',
    icon: 'shield-checkmark-outline',
    color: COLORS.primary,
  },
];

export const UNABLE_STEP: TrackingStep = {
  status: 'UNABLE_TO_REACH_RESPONDER',
  label: 'Unable to Reach',
  sub: 'You could not reach the responder.',
  icon: 'close-circle-outline',
  color: COLORS.error,
};

export const getStepIndex = (
  status: ResponseStatus
): number => {
  return TRACKING_STEPS.findIndex((s) => s.status === status);
};