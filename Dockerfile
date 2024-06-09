# Use the official Node.js image as the base image
FROM node:18-alpine

# Install bash
RUN apk add --no-cache bash

# Set the working directory in the container
WORKDIR /

# Install wait-for-it script
ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application files to the container
COPY . .

# Set environment variables
ENV NODE_ENV=production

# Expose the port that your application will run on
EXPOSE 3000

# Define the command to run your application
CMD ["./wait-for-it.sh", "db:5432", "--", "npm", "start"]
