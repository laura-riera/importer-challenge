# Dockerfile
FROM node:20

# Set working directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code (including prisma/migrations/)
COPY . .

# Build the project
RUN npm run build

# Run migrations and then start the app
CMD sh -c "npx prisma migrate deploy && node dist/main"
