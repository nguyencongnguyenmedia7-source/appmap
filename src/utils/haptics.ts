import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * CITYVERSE Safe Micro-Haptics Helper
 * Provides crisp physical feedback on iOS/Android devices with safe fallback on Web.
 */
export const triggerHaptic = async (
  type: 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' = 'light'
) => {
  try {
    if (Platform.OS === 'web') {
      // Optional subtle web vibration if browser allows
      if (typeof window !== 'undefined' && 'navigator' in window && window.navigator.vibrate) {
        if (type === 'light' || type === 'selection') {
          window.navigator.vibrate(12);
        } else if (type === 'medium') {
          window.navigator.vibrate(20);
        } else if (type === 'heavy' || type === 'success') {
          window.navigator.vibrate([25, 40, 25]);
        }
      }
      return;
    }

    switch (type) {
      case 'selection':
        await Haptics.selectionAsync();
        break;
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      default:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch {
    // Graceful degradation when haptics hardware or permissions are unavailable
  }
};
