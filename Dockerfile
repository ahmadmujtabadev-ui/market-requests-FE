FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy and install dependencies
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

# Copy source files
COPY . .

# Set environment variable for Next.js build
ENV NEXT_PUBLIC_STAGE=stag

# Build the app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
