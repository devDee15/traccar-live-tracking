# Traccar Live Tracking

JavaScript GPS fleet-tracking platform with Traccar, Kafka, MongoDB, Redis, Socket.IO, React, and Docker Compose.

## Structure

```text
traccar-live-tracking/
├── api/
│   └── src/
│       ├── common/          # Errors, logger, middleware, lifecycle, database
│       ├── config/          # Validated environment configuration
│       ├── controllers/     # HTTP request/response adapters
│       ├── events/          # Raw and canonical event contracts
│       ├── jobs/            # Bootstrap and scheduled jobs
│       ├── kafka/
│       │   ├── consumer/    # Normalizer, history, cache, realtime consumers
│       │   └── producer/    # Canonical and dead-letter publishing
│       ├── models/          # Mongoose models and indexes
│       ├── redis/           # Redis client and latest-location repository
│       ├── repositories/    # Persistence access
│       ├── routes/          # Express routes and validation
│       ├── services/        # Business logic
│       ├── sockets/         # Socket.IO namespace and authentication
│       └── utils/           # Generic helpers
├── infrastructure/
│   ├── nginx/
│   └── traccar/
├── packages/contracts/      # Shared JavaScript schemas
├── web/                     # React/Vite web container
└── docker-compose.yml
```

## Start

```bash
cp .env.example .env
docker compose up --build -d
docker compose ps
```

To render Google Maps, set `VITE_GOOGLE_MAPS_API_KEY` in `.env` and rebuild the web image:

```bash
docker compose up --build -d web
```

Local endpoints:

- Web: `http://localhost:4200`
- API: `http://localhost:3000/api`
- Traccar: `http://localhost:8082`
- Concox V5, if configured for GT06: `5023` TCP
- Wetrack AIS-140 using Traccar ITS protocol: `5179` TCP
- Teltonika tracker port: `5027` TCP/UDP

The POC dashboard and its API are open without login. Create an active vehicle with its tracker IMEI using `POST /api/vehicles`; incoming tracker positions are matched to that IMEI before they are saved and displayed. Confirm the Concox V5 firmware is set to a GT06-compatible protocol; model variants and firmware can differ.

## Useful Commands

```bash
npm run format
npm run check
docker compose logs -f api traccar kafka mongo redis zookeeper
docker compose down
```

The API writes structured JSON logs for each location as it is normalized, stored in MongoDB, cached in Redis, and broadcast to connected clients. Use `LOG_LEVEL=debug` in `.env` to include lower-level Kafka producer details. Service and event details are available through Docker Compose logs.

## Event Flow

```text
GPS device
  -> Traccar
  -> traccar-positions
  -> normalizer consumer
  -> gps-location-topic (IMEI key)
  -> history + latest-state + realtime consumers
```

The API uses Pino structured logs with request/correlation identifiers. Errors use a stable `{ error: { code, message, details, requestId } }` response shape. Unexpected failures are logged internally and returned without implementation details.

The live UI works without a Google Maps key by showing current coordinates, km/h speed, accumulated live route-point count, and recent events. With `VITE_GOOGLE_MAPS_API_KEY`, the same route points are rendered as a Google Maps polyline with a moving marker.

See [ARCHITECTURE_VALIDATION.md](ARCHITECTURE_VALIDATION.md) for proven flow segments and the remaining physical-device acceptance procedure.
