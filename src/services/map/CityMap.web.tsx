/**
 * CityMap.web.tsx — Web platform override
 * Metro bundler sẽ ưu tiên file này trên web, tránh bundle @rnmapbox/maps
 * vào web bundle (không có native renderer).
 */
import React, { forwardRef } from 'react';
import { CityMapProps, MapCameraControls } from './types';
import { InteractiveWebMapProvider } from './InteractiveWebMapProvider';

export const CityMap = forwardRef<MapCameraControls, CityMapProps>((props, ref) => {
  return <InteractiveWebMapProvider ref={ref} {...props} />;
});
