FROM alpine:latest

# Install OpenSSL
RUN apk update && \
  apk add --no-cache openssl && \
  rm -rf "/var/cache/apk/*"

# Create and set mount volume
WORKDIR /openssl-certs
VOLUME  /openssl-certs

COPY ./generate.sh /generate.sh

ENTRYPOINT ["/generate.sh"]
