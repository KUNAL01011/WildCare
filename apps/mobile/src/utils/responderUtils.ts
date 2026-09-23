import type {
  ResponderService,
  BodyType,
} from '../api/responders';
import { COLORS } from '../constants/colors';

export const SERVICE_LABELS: Record<ResponderService, string> = {
  WILDLIFE_RESCUE:    'Wildlife Rescue',
  INJURED_ANIMAL:     'Injured Animal',
  TRAPPED_ANIMAL:     'Trapped Animal',
  DEAD_ANIMAL:        'Dead Animal',
  VETERINARY_SUPPORT: 'Veterinary Support',
  EMERGENCY_RESPONSE: 'Emergency Response',
};

export const BODY_TYPE_CONFIG: Record<
  BodyType,
  { label: string; color: string; bg: string; emoji: string }
> = {
  GOVERNMENT: {
    label: 'Government',
    color: '#1D4ED8',
    bg: '#EFF6FF',
    emoji: '🏛️',
  },
  NGO: {
    label: 'NGO',
    color: '#059669',
    bg: '#ECFDF5',
    emoji: '🤝',
  },
  PRIVATE: {
    label: 'Private',
    color: '#7C3AED',
    bg: '#F5F3FF',
    emoji: '🏢',
  },
};

export const formatDistance = (km: number): string => {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
};

export const formatResponseTime = (
  minutes: number | null
): string => {
  if (!minutes) return 'Unknown';
  if (minutes < 60) return `~${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `~${h}h ${m}m` : `~${h}h`;
};