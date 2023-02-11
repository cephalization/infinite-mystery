FROM node:18-slim AS builder
# Set working directory
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=web --docker

# Add lockfile and package.json's of isolated subworkspace
FROM node:18-slim AS installer
RUN apt-get update
RUN apt-get install -y openssl libssl-dev
WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
COPY --from=builder /app/.env .
RUN yarn install

# Build the project
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN yarn turbo run build --force --filter=web...

# TODO This does not work right now but is the ideal situation
#      The problem is that COPY is ignoring .prisma and database
#      from installer/node_modules without copying them by hand
#      I will not copy them by hand because this will not scale
# FROM node:18-slim AS runner
# RUN apt-get update
# RUN apt-get install -y openssl libssl-dev
# WORKDIR /app
# ENV NODE_ENV=production

# COPY --from=installer /app/node_modules /app/node_modules
# # COPY --from=installer /app/node_modules/.prisma /app/node_modules/.prisma
# # COPY --from=installer /app/node_modules/database /app/node_modules/database

# COPY --from=installer /app/apps/web/build /app/build
# COPY --from=installer /app/apps/web/public /app/public
# COPY --from=installer /app/apps/web/package.json /app/package.json

# Move build outputs into workdir so we can run 'yarn start'
RUN cp -r /app/apps/web/build /app/build
RUN cp -r /app/apps/web/public /app/public
RUN cp -r /app/apps/web/package.json /app/package.json

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 remix
USER remix

CMD yarn start