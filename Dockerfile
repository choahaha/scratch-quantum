FROM node:20-alpine

# Install Python and build dependencies
RUN apk add --no-cache python3 py3-pip make g++ && ln -sf python3 /usr/bin/python

WORKDIR /app

# Copy scratch-blocks, scratch-gui, and patches
COPY scratch-blocks ./scratch-blocks
COPY scratch-gui ./scratch-gui
COPY patches ./patches

# Install scratch-blocks dependencies (skip prepublish script that requires Java)
WORKDIR /app/scratch-blocks
RUN npm install --legacy-peer-deps --ignore-scripts

# Install scratch-gui dependencies (including peer deps)
WORKDIR /app/scratch-gui
RUN rm -f package-lock.json && yarn add react@16.14.0 react-dom@16.14.0 --ignore-engines

# Apply patches to scratch-vm
RUN cp /app/patches/scratch-vm/*.js node_modules/scratch-vm/src/blocks/

# Build after patches are applied
RUN yarn build

# Install serve to host static files
RUN npm install -g serve

EXPOSE 8080

CMD ["serve", "-s", "build", "-l", "8080"]
