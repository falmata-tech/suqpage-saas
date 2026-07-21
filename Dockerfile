FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
ARG NEXT_PUBLIC_APP_URL
ARG SUQPAGE_SERVER_ACTION_ORIGINS=""
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV SUQPAGE_SERVER_ACTION_ORIGINS=${SUQPAGE_SERVER_ACTION_ORIGINS}
RUN node -e "if (!/^https:\/\//i.test(process.env.NEXT_PUBLIC_APP_URL || '')) throw new Error('NEXT_PUBLIC_APP_URL build argument must be HTTPS')"
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S suqpage && adduser -S suqpage -G suqpage
COPY --chown=suqpage:suqpage --from=deps /app/node_modules ./node_modules
COPY --chown=suqpage:suqpage --from=builder /app/.next ./.next
COPY --chown=suqpage:suqpage --from=builder /app/public ./public
COPY --chown=suqpage:suqpage --from=builder /app/scripts ./scripts
COPY --chown=suqpage:suqpage --from=builder /app/lib ./lib
COPY --chown=suqpage:suqpage --from=builder /app/package.json ./package.json
COPY --chown=suqpage:suqpage --from=builder /app/next.config.ts ./next.config.ts
RUN mkdir -p /data/media && chown -R suqpage:suqpage /data
USER suqpage
EXPOSE 3000
CMD ["npm","start"]
