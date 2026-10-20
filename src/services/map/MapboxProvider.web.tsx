/**
 * MapboxProvider.web.tsx — Web stub for @rnmapbox/maps
 * Prevents Metro bundler from including native-only @rnmapbox/maps in web bundle.
 * On web, CityMap.web.tsx routes directly to InteractiveWebMapProvider,
 * so this file should never actually render — it's just a safety guard.
 */
import React, { forwardRef } from 'react';
import { CityMapProps, MapCameraControls } from './types';
import { InteractiveWebMapProvider } from './InteractiveWebMapProvider';

export const MapboxProvider = forwardRef<MapCameraControls, CityMapProps>((props, ref) => {
  return <InteractiveWebMapProvider ref={ref} {...props} />;
});
