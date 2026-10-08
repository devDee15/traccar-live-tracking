FROM node:20-alpine AS build
ARG VITE_GOOGLE_MAPS_API_KEY=""
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY
WORKDIR /app
COPY package.json package-lock.json ./
COPY api/package.json api/package.json
COPY web/package.json web/package.json
COPY packages/contracts/package.json packages/contracts/package.json
RUN npm ci --workspace @traccar-live-tracking/web
COPY web ./web
COPY packages/contracts ./packages/contracts
RUN npm run build --workspace @traccar-live-tracking/web

FROM nginx:1.27-alpine
COPY infrastructure/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/web/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=15s --timeout=5s --retries=5 CMD wget -qO- http://127.0.0.1/health || exit 1