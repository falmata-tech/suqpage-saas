FROM node:24.18.1-alpine@sha256:f70403e87646dc51b45295f4b8b70cdad0b63d2297c4c9899119b03f7af7a6b3 AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund --fetch-retries=2 --fetch-timeout=60000

FROM node:24.18.1-alpine@sha256:f70403e87646dc51b45295f4b8b70cdad0b63d2297c4c9899119b03f7af7a6b3 AS builder
WORKDIR /app
ARG NEXT_PUBLIC_APP_URL
ARG MIRTPAGE_SERVER_ACTION_ORIGINS=""
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV MIRTPAGE_SERVER_ACTION_ORIGINS=${MIRTPAGE_SERVER_ACTION_ORIGINS}
RUN node -e "if (!/^https:\/\//i.test(process.env.NEXT_PUBLIC_APP_URL || '')) throw new Error('NEXT_PUBLIC_APP_URL build argument must be HTTPS')"
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24.18.1-alpine@sha256:f70403e87646dc51b45295f4b8b70cdad0b63d2297c4c9899119b03f7af7a6b3 AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S mirtpage && adduser -S mirtpage -G mirtpage
COPY --chown=mirtpage:mirtpage --from=deps /app/node_modules ./node_modules
COPY --chown=mirtpage:mirtpage --from=builder /app/.next ./.next
COPY --chown=mirtpage:mirtpage --from=builder /app/public ./public
COPY --chown=mirtpage:mirtpage --from=builder /app/scripts ./scripts
COPY --chown=mirtpage:mirtpage --from=builder /app/lib ./lib
COPY --chown=mirtpage:mirtpage --from=builder /app/package.json ./package.json
COPY --chown=mirtpage:mirtpage --from=builder /app/next.config.ts ./next.config.ts
RUN mkdir -p /data/media && chown -R mirtpage:mirtpage /data
USER mirtpage
EXPOSE 3000
CMD ["npm","start"]
