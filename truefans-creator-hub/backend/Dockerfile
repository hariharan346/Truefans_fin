# Backend Dockerfile - Production
FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads && chmod 777 uploads

# Use a non-root user for security
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs && chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 5000

CMD ["node", "server.js"]

