import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

import { vehicleLocationUpdateSchema } from '@traccar-live-tracking/contracts';

const MAX_ROUTE_POINTS = 500;

export function useTracking() {
  const [connection, setConnection] = useState('disconnected');
  const [latestByVehicle, setLatestByVehicle] = useState({});
  const [routesByVehicle, setRoutesByVehicle] = useState({});
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const socket = io('/tracking', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => setConnection('connected'));
    socket.on('disconnect', () => setConnection('disconnected'));
    socket.on('connect_error', () => setConnection('error'));
    socket.on('vehicle-location-update', (payload) => {
      const parsed = vehicleLocationUpdateSchema.safeParse(payload);
      if (!parsed.success) return;
      const event = parsed.data;
      setLatestByVehicle((current) => ({ ...current, [event.vehicleId]: event }));
      setRoutesByVehicle((current) => ({
        ...current,
        [event.vehicleId]: [...(current[event.vehicleId] || []), event].slice(-MAX_ROUTE_POINTS),
      }));
      setEvents((current) => [event, ...current].slice(0, 20));
    });

    return () => socket.disconnect();
  }, []);

  function seedLocation(event) {
    if (!event) return;
    setLatestByVehicle((current) => ({ ...current, [event.vehicleId]: event }));
    setRoutesByVehicle((current) => ({
      ...current,
      [event.vehicleId]: current[event.vehicleId]?.length ? current[event.vehicleId] : [event],
    }));
  }

  return { connection, latestByVehicle, routesByVehicle, events, seedLocation };
}
