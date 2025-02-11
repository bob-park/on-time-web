'use client';

import { useEffect, useState } from 'react';

interface PositionAttribute {
  latitude: number;
  longitude: number;
}

export default function useGps() {
  const [isSupport, setIsSupport] = useState<boolean>(false);
  const [position, setPosition] = useState<PositionAttribute>();

  // useEffect
  useEffect(() => {
    const tempIsSupport = typeof window !== 'undefined' && !!navigator.geolocation;

    setIsSupport(tempIsSupport);

    if (tempIsSupport) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setPosition({
            latitude: coords.latitude,
            longitude: coords.longitude,
          });
        },
        (err) => {
          console.error(err);
          setIsSupport(false);
        },
        { enableHighAccuracy: true, timeout: 1_000 * 60, maximumAge: 1_000 * 3_600 * 24 },
      );
    }
  }, []);

  return { isSupport, position };
}
