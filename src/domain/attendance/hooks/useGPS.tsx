'use client';

import { useEffect, useState } from 'react';

interface PositionAttribute {
  latitude: number;
  longitude: number;
}

export default function useGPS() {
  const isSupport = !!navigator.geolocation;

  const [position, setPosition] = useState<PositionAttribute>();

  // useEffect
  useEffect(() => {
    if (isSupport) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setPosition({
            latitude: coords.latitude,
            longitude: coords.longitude,
          });
        },
        (err) => {
          console.error(err);
        },
        { enableHighAccuracy: true, timeout: 1_000 * 60, maximumAge: 1_000 * 3_600 * 24 },
      );
    }
  }, [isSupport]);

  return { isSupport, position };
}
