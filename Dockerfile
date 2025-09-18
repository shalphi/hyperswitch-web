# Use Node 20 with Alpine
FROM node:20-alpine

# Install build essentials + git + bash
RUN apk add --no-cache make gcc g++ python3 git bash

WORKDIR /usr/src/app

COPY package*.json ./
COPY Hyperswitch-React-Demo-App/package*.json ./Hyperswitch-React-Demo-App/

RUN npm install --ignore-scripts

# Copy the app code (excluding .git)
COPY . .

# Clone submodules directly
RUN git clone --branch main https://github.com/juspay/hyperswitch-sdk-utils.git shared-code/sdk-utils

# Install demo app dependencies
RUN cd Hyperswitch-React-Demo-App && npm install --ignore-scripts

RUN npm run re:build && npm run build

EXPOSE 9050

ENV sdkEnv=local
ENV SENTRY_DSN=""
ENV NODE_ENV=development
ENV DISABLE_CSP=false
ENV HYPERSWITCH_PUBLISHABLE_KEY="pk_snd_test"
ENV HYPERSWITCH_SECRET_KEY="snd_test"
ENV HYPERSWITCH_SERVER_URL="https://sandbox.hyperswitch.io"
ENV HYPERSWITCH_CLIENT_URL="https://beta.hyperswitch.io"
ENV ENABLE_LOGGING=true
ENV SDK_ENV=local
ENV ENV_LOGGING_URL=http://localhost:3103
ENV ENV_BACKEND_URL=http://localhost:8080
CMD ["/bin/sh", "-c", "npx webpack serve --config webpack.dev.js"]
