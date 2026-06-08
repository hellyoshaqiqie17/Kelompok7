# Stage 1: Build C backend & Next.js frontend
FROM node:20-slim AS builder

# Install compiler dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libc6-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy and compile C backend for Linux
COPY backend-c ./backend-c
RUN gcc -O2 backend-c/kendaraan.c -o backend-c/kendaraan

# Copy frontend code
COPY frontend ./frontend
COPY package.json ./

# Install dependencies and build Next.js
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Stage 2: Production runtime image
FROM node:20-slim AS runner

# Install libc6-dev for execution environment compatibility
RUN apt-get update && apt-get install -y \
    libc6-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV BACKEND_CWD=/app/database

# Copy dist files from builder stage
COPY --from=builder /app/backend-c/kendaraan /app/backend-c-dist/kendaraan
COPY --from=builder /app/backend-c/data.json /app/backend-c-dist/data.json
COPY --from=builder /app/frontend /app/frontend
COPY --from=builder /app/package.json /app/package.json

# Copy and prepare persistent volume startup script
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

EXPOSE 3000

# Run entrypoint script
CMD ["/app/start.sh"]
