# Architecture Validation

Validated on 2026-09-26 against the local Docker Compose environment.

## Required Flow

```text
Physical GPS device
  -> Traccar protocol listener
  -> Traccar decoded PositionData
  -> Kafka: traccar-positions
  -> Node.js normalizer
  -> Kafka: gps-location-topic (IMEI key)
  -> MongoDB history + Redis latest + Socket.IO
  -> React live coordinates and route points
  -> Google Maps marker/polyline when an API key is configured
```

## Validation Result

| Segment                               | Status                              | Evidence                                                                              |
| ------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------- |
| Traccar protocol listeners            | Ready, physical packet pending      | GT06 `5023`, ITS/AIS-140 `5179`, and Teltonika `5027` are published by Compose        |
| Traccar decoding and Kafka forwarding | Configured, physical packet pending | Traccar 6.15.3 initializes a Kafka producer for `traccar-positions`                   |
| Raw Kafka normalization               | Proven                              | A Traccar-shaped `PositionData` message was validated and mapped by `device.uniqueId` |
| Canonical ordering                    | Proven                              | `gps-location-topic` records use IMEI as the Kafka key                                |
| MongoDB history                       | Proven                              | Unique events persisted with two-year expiry and ordered vehicle/timestamp index      |
| Redis latest state                    | Proven                              | Newest event stored under `vehicle:{imei}` with 300-second TTL                        |
| Socket.IO broadcast                   | Proven                              | `/tracking` client received `vehicle-location-update` without login                   |
| Frontend live update                  | Proven                              | Browser coordinates, km/h speed, route count, and event feed changed without refresh  |
| Google Maps rendering                 | Configuration pending               | Adapter is implemented; set `VITE_GOOGLE_MAPS_API_KEY` and rebuild web                |

## Proven Runtime Checks

- All Compose services healthy: web, API, MongoDB, Redis, Zookeeper, Kafka, and Traccar.
- Required Kafka topics exist: `traccar-positions`, `gps-location-topic`, and `gps-location-dead-letter`.
- API readiness reports MongoDB, Redis, and Kafka healthy.
- Tracking API and Socket.IO updates work without login for this personal POC.
- Injecting a raw Traccar-shaped event creates one canonical event, updates Redis, persists MongoDB history, and updates the open browser through Socket.IO without refresh.
- Incoming Traccar speed is converted from knots to km/h in the canonical event.
- Duplicate raw delivery produced one MongoDB history record.
- An older event delivered after a newer event did not replace Redis latest state.
- An unknown IMEI was written to `gps-location-dead-letter` with source and error context.
- GT06 TCP port `5023`, ITS/AIS-140 TCP port `5179`, and Teltonika TCP port `5027` are published by Compose.

## Physical Device Acceptance Still Required

The decoder edge cannot be claimed as physically validated without the actual tracker or a protocol simulator. The current Traccar configuration permits unknown devices to register; the application still requires a matching vehicle record for the tracker IMEI before it will process coordinates.

1. Configure the tracker APN, public host, protocol, and protocol port.
2. Confirm Traccar recognizes the device IMEI and receives a decoded position.
3. Create the matching vehicle in this application using the same IMEI.
4. Confirm `traccar-positions` receives the forwarded record.
5. Confirm the browser updates without refresh.

This is an operational acceptance step, not an architecture change.

## Feasibility Conclusion

The architecture can achieve the required basic live-tracking flow. All application-controlled stages after protocol decoding have been demonstrated end to end. Once a correctly configured and registered physical tracker reaches Traccar, its decoded position follows the same proven Kafka, database, cache, Socket.IO, and frontend path.

## Important Boundaries

- An unknown or inactive IMEI is sent to the dead-letter topic and is not shown in the UI.
- The tracking API, vehicle endpoints, and Socket.IO stream are publicly accessible without login. Add authentication and authorization before exposing this POC to untrusted users.
- Kafka, MongoDB, Redis, and Zookeeper are internal-only in Compose. Traccar management ports are exposed for local development and should be restricted in production.
- Native Traccar Kafka forwarding does not provide the same acknowledgement semantics as the Node.js canonical producer. Broker-outage reconciliation remains a release requirement.
