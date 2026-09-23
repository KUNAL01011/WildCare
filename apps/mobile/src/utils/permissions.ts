import { Alert, Linking, Platform } from 'react-native';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';

export type PermissionResult =
  | 'granted'
  | 'denied'
  | 'blocked';

export const checkCameraPermission =
  async (): Promise<PermissionResult> => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === 'granted') return 'granted';
    if (status === 'denied') return 'denied';
    return 'blocked';
  };

export const checkLocationPermission =
  async (): Promise<PermissionResult> => {
    const { status } =
      await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') return 'granted';
    if (status === 'denied') return 'denied';
    return 'blocked';
  };

export const showPermissionBlockedAlert = (
  type: 'camera' | 'location'
) => {
  const config = {
    camera: {
      title: 'Camera Access Required',
      message:
        'WildCare needs camera access to capture wildlife incident photos. Please enable it in Settings.',
    },
    location: {
      title: 'Location Access Required',
      message:
        'WildCare needs your location to record where the incident happened. Please enable it in Settings.',
    },
  };

  const { title, message } = config[type];

  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Open Settings',
      onPress: () => Linking.openSettings(),
    },
  ]);
};