FROM node:20-alpine

WORKDIR /app

# Install system dependencies if required
RUN apk add --no-cache openssl libc6-compat

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy application source code
COPY src ./src/

# Expose backend port
EXPOSE 5000

# Default environment variables
ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "src/server.js"]
