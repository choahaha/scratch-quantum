FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite envs are baked at build time; Railway passes service variables
# as build args automatically when declared as ARG.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_SCRATCH_EMBED_URL
ARG VITE_GRADING_API_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    VITE_SCRATCH_EMBED_URL=$VITE_SCRATCH_EMBED_URL \
    VITE_GRADING_API_URL=$VITE_GRADING_API_URL

RUN npm run build

RUN npm install -g serve

EXPOSE 8080

CMD ["serve", "-s", "dist", "-l", "8080"]
