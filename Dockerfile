# PrintQuote web image: the built React app served by nginx, which also
# forwards /api/* to the API container (so the browser sees one origin and no
# CORS setup is needed).
#   docker build -t printquote-web .
# Listens on port 8080 inside the container. API_UPSTREAM sets where /api goes
# (default http://api:8080, the API service name in deploy/docker-compose.yml).

# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# ---- runtime ----
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

# Files in /etc/nginx/templates are run through envsubst on start-up.
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

ENV API_UPSTREAM=http://api:8080 \
    NGINX_ENVSUBST_FILTER=^API_
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
