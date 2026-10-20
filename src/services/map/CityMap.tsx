import React, { forwardRef } from 'react';
import { Platform } from 'react-native';
import { CityMapProps, MapCameraControls } from './types';
import { MapboxProvider } from './MapboxProvider';
import { InteractiveWebMapProvider } from './InteractiveWebMapProvider';
import { isMapboxConfigured } from '@/lib/env';

export const CityMap = forwardRef<MapCameraControls, CityMapProps>((props, ref) => {
  const useNativeMapbox = Platform.OS !== 'web' && isMapboxConfigured;

  if (useNativeMapbox) {
    return <MapboxProvider ref={ref} {...props} />;
  }

  return <InteractiveWebMapProvider ref={ref} {...props} />;
});
