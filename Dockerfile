FROM node:18-alpine

# Install Python and build dependencies
RUN apk add --no-cache python3 py3-pip make g++ && ln -sf python3 /usr/bin/python

WORKDIR /app

# Copy both scratch-blocks and scratch-gui
COPY scratch-blocks ./scratch-blocks
COPY scratch-gui ./scratch-gui

# Install scratch-blocks dependencies
WORKDIR /app/scratch-blocks
RUN npm install --legacy-peer-deps

# Install scratch-gui dependencies and build
WORKDIR /app/scratch-gui
RUN npm install --legacy-peer-deps
RUN npm run build

# Install serve to host static files
RUN npm install -g serve

EXPOSE 8080

CMD ["serve", "-s", "build", "-l", "8080"]
