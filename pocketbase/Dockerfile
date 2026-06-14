# PocketBase for Apres-Ski, with baked-in schema migrations.
# Build arg lets you bump the version without touching the rest.
ARG PB_VERSION=0.39.4

FROM alpine:3.20 AS build
ARG PB_VERSION
RUN apk add --no-cache ca-certificates unzip wget
WORKDIR /pb
RUN wget -q "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip" -O pb.zip \
    && unzip pb.zip \
    && rm pb.zip

FROM alpine:3.20
RUN apk add --no-cache ca-certificates
WORKDIR /pb
COPY --from=build /pb/pocketbase /pb/pocketbase
# Schema migrations run automatically on start. The JSVM (which executes the JS
# migrations) only initialises when a hooks dir is present, so we create one and
# point --hooksDir at it even though it is empty.
COPY pb_migrations /pb/pb_migrations
COPY pb_hooks /pb/pb_hooks

EXPOSE 8090
# /pb_data holds the SQLite db + uploads -> mount a persistent volume here.
VOLUME ["/pb_data"]
CMD ["/pb/pocketbase", "serve", \
     "--http=0.0.0.0:8090", \
     "--dir=/pb_data", \
     "--migrationsDir=/pb/pb_migrations", \
     "--hooksDir=/pb/pb_hooks"]
