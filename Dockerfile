# Explicit runtime. Use this if Render's language auto-detection
# guesses wrong (e.g. tries to run pip install -r requirements.txt).
FROM node:20-alpine

WORKDIR /app

# Install dependencies first so Docker can cache this layer
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Then copy the site
COPY . .

ENV NODE_ENV=production
EXPOSE 10000

CMD ["node", "server.js"]
