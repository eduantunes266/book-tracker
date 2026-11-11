# Backend image: compiles the TypeScript and runs the API with Node
FROM node:24-alpine

WORKDIR /app

# Install dependencies first (this layer is cached while package*.json don't change)
COPY package*.json ./
RUN npm ci

# Copy the source, compile to dist/ and remove dev dependencies
COPY tsconfig.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

EXPOSE 5000
CMD ["node", "dist/index.js"]
