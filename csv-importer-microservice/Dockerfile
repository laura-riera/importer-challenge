# Dockerfile
FROM node:20

# Set working directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy the source files
COPY . .

# Build the project
RUN npm run build

# Run the built app
CMD ["node", "dist/main"]
