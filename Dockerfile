# This is a pre-release
# Optional: Basis-Image
FROM node:18-bullseye

ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NO_PROXY

ENV http_proxy=${HTTP_PROXY}
ENV https_proxy=${HTTPS_PROXY}
ENV no_proxy=${NO_PROXY}



# Dann folgt dein Build-Prozess
WORKDIR /home/node/app

# Beispiel:
COPY package.json yarn.lock ./
# Now yarn install will use those proxy settings
RUN yarn install

#FROM digirati/madoc-platform:v1.3.x-917e3d2

# Add our theme
#ADD --chown=www-data:www-data ./sbb-madoc-theme /srv/omeka/themes/sbb-madoc-theme
#ADD --chown=www-data:www-data ./crossasia-theme /srv/omeka/themes/crossasia-theme

# Add custom translations
#ADD --chown=www-data:www-data ./translations/s/ /srv/omeka/translations/s/

# Memory limit
#ADD --chown=www-data:www-data ./etc/php.ini /etc/php.d/custom.ini

# Add any other configuration needed.
