# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory
WORKDIR /usr/src/myapp

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Copy built files from Jenkins (already built)
COPY dist ./dist

# Expose the port the app runs on
EXPOSE 3000

# Define entry point, environment variables are passed from Kubernetes
CMD ["node", "dist/src/main.js"]