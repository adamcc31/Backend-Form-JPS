FROM node:24-bullseye-slim

# Install OpenSSL required by Prisma
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Copy dependency graphs
COPY package*.json ./

# Install dependencies strictly
RUN npm ci

# Copy full source
COPY . .

# Generate Prisma client and Build NestJS
RUN npx prisma generate
RUN npm run build

EXPOSE 4000

# Start Production Backend with Database Migrations First
CMD npx prisma db push --accept-data-loss && npx prisma db seed && node dist/src/main
