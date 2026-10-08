import { useEffect, useState } from 'react';

import { api } from './api.js';
import { GoogleTrackingMap } from './GoogleTrackingMap.jsx';
import { useTracking } from './useTracking.js';

export function App() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [error, setError] = useState('');
  const tracking = useTracking();

  useEffect(() => {
    api
      .vehicles()
      .then(({ items }) => {
        setVehicles(items);
        setSelectedVehicleId((current) => current || items[0]?._id || '');
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  useEffect(() => {
    if (!selectedVehicleId) return;
    api
      .latest(selectedVehicleId)
      .then(({ location }) => tracking.seedLocation(location))
      .catch(() => {});
  }, [selectedVehicleId]);

  const selectedVehicle = vehicles.find((vehicle) => vehicle._id === selectedVehicleId);
  const selectedLocation = tracking.latestByVehicle[selectedVehicleId];
  const selectedRoute = tracking.routesByVehicle[selectedVehicleId] || [];
  const coordinateLabel = selectedLocation
    ? `${selectedLocation.latitude.toFixed(6)}, ${selectedLocation.longitude.toFixed(6)}`
    : 'Waiting for position';

  return (
    <main>
      <header className="app-header">
        <div>
          <span className="eyebrow">Fleet operations</span>
          <h1>Live Tracking</h1>
        </div>
        <span className={`connection ${tracking.connection}`}>{tracking.connection}</span>
      </header>
      <div className="workspace">
        <aside>
          <label>
            Vehicle
            <select
              value={selectedVehicleId}
              onChange={(event) => setSelectedVehicleId(event.target.value)}
            >
              {vehicles.map((vehicle) => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.vehicleNumber}
                </option>
              ))}
            </select>
          </label>
          <div className="vehicle-readout">
            <strong>{selectedVehicle?.vehicleNumber || 'No vehicle registered'}</strong>
            <span>{coordinateLabel}</span>
            <span>
              {selectedLocation
                ? `${selectedLocation.speed} ${selectedLocation.speedUnit || 'km/h'}`
                : 'No speed'}
            </span>
            <span>
              {selectedLocation ? new Date(selectedLocation.timestamp).toLocaleString() : ''}
            </span>
          </div>
          {error && <p className="error">{error}</p>}
          <div className="route-count">{selectedRoute.length} live route points</div>
        </aside>
        <section className="tracking-panel" aria-label="Live tracking">
          <GoogleTrackingMap location={selectedLocation} route={selectedRoute} />
        </section>
      </div>
      <section className="event-feed" aria-label="Recent location events">
        <h2>Recent events</h2>
        {tracking.events.length === 0 ? (
          <p>Waiting for live device events.</p>
        ) : (
          tracking.events.map((event) => (
            <div className="event-row" key={event.eventId}>
              <strong>{event.imei}</strong>
              <span>
                {event.latitude.toFixed(5)}, {event.longitude.toFixed(5)}
              </span>
              <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
