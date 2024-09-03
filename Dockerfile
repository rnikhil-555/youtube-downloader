# Use a base image with Node.js and Python installed
FROM node:18

# Install Python
RUN apt-get update && apt-get install -y python3

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port that your app will run on
EXPOSE 3000

# Command to start the app
CMD ["npm", "run", "start"]
