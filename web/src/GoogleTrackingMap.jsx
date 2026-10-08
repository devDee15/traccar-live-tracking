import { useEffect, useRef, useState } from 'react';

let googleMapsPromise;

function loadGoogleMaps(apiKey) {
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (!googleMapsPromise) {
    googleMapsPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
        apiKey,
      )}&v=weekly`;
      script.async = true;
      script.onload = () => resolve(window.google.maps);
      script.onerror = () => reject(new Error('Google Maps failed to load'));
      document.head.append(script);
    });
  }
  return googleMapsPromise;
}

export function GoogleTrackingMap({ location, route }) {
  const elementRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const polylineRef = useRef(null);
  const [error, setError] = useState('');
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey || !location || !elementRef.current) return undefined;
    let active = true;

    loadGoogleMaps(apiKey)
      .then((maps) => {
        if (!active) return;
        const position = { lat: location.latitude, lng: location.longitude };
        if (!mapRef.current) {
          mapRef.current = new maps.Map(elementRef.current, {
            center: position,
            zoom: 16,
            mapTypeControl: false,
            streetViewControl: false,
          });
          markerRef.current = new maps.Marker({ map: mapRef.current, position });
          polylineRef.current = new maps.Polyline({
            map: mapRef.current,
            geodesic: true,
            strokeColor: '#e94f37',
            strokeOpacity: 0.95,
            strokeWeight: 5,
          });
        }
        markerRef.current.setPosition(position);
        polylineRef.current.setPath(
          route.map((point) => ({ lat: point.latitude, lng: point.longitude })),
        );
        mapRef.current.panTo(position);
      })
      .catch((loadError) => setError(loadError.message));

    return () => {
      active = false;
    };
  }, [apiKey, location, route]);

  if (!apiKey) {
    return (
      <div className="map-placeholder">
        <strong>Google Maps key not configured</strong>
        <span>Live coordinates and route events remain available below.</span>
      </div>
    );
  }

  return (
    <div className="map" ref={elementRef} role="img" aria-label={error || 'Live vehicle map'} />
  );
}
