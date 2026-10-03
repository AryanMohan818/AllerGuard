# Use official Node.js Alpine image for a super lightweight container
FROM node:20-alpine

WORKDIR /app

# Copy package files first to cache npm install
COPY package.json ./

# Install dependencies
RUN npm install

# Copy all frontend source files
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start the Vite development server with --host so it's accessible outside the container
CMD ["npm", "run", "dev"]