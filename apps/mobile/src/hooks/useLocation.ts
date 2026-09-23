import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import {
  checkLocationPermission,
  showPermissionBlockedAlert,
} from '../utils/permissions';

export type CapturedLocation = {
  latitude: number;
  longitude: number;
};

export const useLocation = () => {
  const [location, setLocation] =
    useState<CapturedLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const captureLocation =
    useCallback(async (): Promise<CapturedLocation | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await checkLocationPermission();

        if (result === 'blocked') {
          showPermissionBlockedAlert('location');
          setIsLoading(false);
          return null;
        }

        if (result === 'denied') {
          setError('Location permission denied.');
          setIsLoading(false);
          return null;
        }

        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const captured: CapturedLocation = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };

        setLocation(captured);
        return captured;
      } catch (e) {
        setError('Could not get location. Please try again.');
        return null;
      } finally {
        setIsLoading(false);
      }
    }, []);

  return { location, isLoading, error, captureLocation };
};