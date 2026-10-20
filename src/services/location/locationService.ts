import * as Location from 'expo-location';
import { Coordinates } from '@/types';
import { VIETNAM_CITY_PRESETS } from '@/constants/vietnam';

export interface LocationPermissionState {
  granted: boolean;
  canAskAgain: boolean;
  status: Location.PermissionStatus;
}

class LocationService {
  /**
   * Checks current permission status without prompting
   */
  async getPermissionStatus(): Promise<LocationPermissionState> {
    try {
      const response = await Location.getForegroundPermissionsAsync();
      return {
        granted: response.granted,
        canAskAgain: response.canAskAgain,
        status: response.status,
      };
    } catch (e) {
      return {
        granted: false,
        canAskAgain: false,
        status: Location.PermissionStatus.DENIED,
      };
    }
  }

  /**
   * Prompts user for foreground location permission
   */
  async requestPermission(): Promise<LocationPermissionState> {
    try {
      const response = await Location.requestForegroundPermissionsAsync();
      return {
        granted: response.granted,
        canAskAgain: response.canAskAgain,
        status: response.status,
      };
    } catch (e) {
      return {
        granted: false,
        canAskAgain: false,
        status: Location.PermissionStatus.DENIED,
      };
    }
  }

  /**
   * Obtains current device coordinates with accuracy reading
   */
  async getCurrentPosition(): Promise<{
    coords: Coordinates;
    isFallback: boolean;
  }> {
    try {
      const perm = await this.getPermissionStatus();
      if (!perm.granted) {
        const requested = await this.requestPermission();
        if (!requested.granted) {
          return {
            coords: this.getDefaultVietnamCoordinates(),
            isFallback: true,
          };
        }
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        coords: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        },
        isFallback: false,
      };
    } catch (err) {
      console.warn('[LocationService] Failed to read GPS position:', err);
      return {
        coords: this.getDefaultVietnamCoordinates(),
        isFallback: true,
      };
    }
  }

  /**
   * Default center for Vietnam (Hoàn Kiếm, Hà Nội or Landmark 81, TP.HCM)
   */
  getDefaultVietnamCoordinates(): Coordinates {
    const hanoi = VIETNAM_CITY_PRESETS[0];
    return {
      longitude: hanoi.coordinates[0],
      latitude: hanoi.coordinates[1],
      accuracy: 20,
    };
  }
}

export const locationService = new LocationService();
