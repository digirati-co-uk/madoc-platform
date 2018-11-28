FROM fedora:28

MAINTAINER "Gary Tierney" <gary.tierney@digirati.com>

RUN dnf update -y && \
    dnf install -y \
        nodejs \
        php-common \
        php-cli \
        php-devel \
        php-fpm \
        php-mysqlnd \
        php-xml \
        php-gd \
        php-imap \
        php-intl \
        php-pcntl \
        php-zip \
        php-mbstring \
        php-pdo \
        php-soap \
        php-opcache \
        php-json \
        php-pear \
        ImageMagick \
        ImageMagick-devel \
        nginx \
        supervisor \
        make \
        binutils \
        wget \
        git \
        composer && \
    pecl install imagick && \
    dnf clean all && \
    rm -Rf /var/cache/dnf

ADD config/supervisord/*.ini /etc/supervisord.d/
ADD config/nginx.conf /etc/nginx/nginx.conf
ADD config/nginx/*.conf /etc/nginx/conf.d/
ADD config/php-fpm.conf /etc/php-fpm.conf
ADD config/php-fpm/*.conf /etc/php-fpm.d/
ADD config/php/*.ini /etc/php.d/

RUN groupadd www-data && useradd -r -g www-data www-data
RUN mkdir -p /srv/omeka /var/www/.npm && chown -R www-data:www-data /srv/omeka /var/www
ADD --chown=www-data:www-data bare/omeka-s/package.json \
    bare/omeka-s/composer.json \
    bare/omeka-s/composer.lock \
    bare/omeka-s/.htaccess.dist \
    bare/omeka-s/*.php \
    bare/omeka-s/gulpfile.js \
    /srv/omeka/

ADD --chown=www-data:www-data bare/omeka-s/application/ /srv/omeka/application/
ADD --chown=www-data:www-data bare/omeka-s/config/ /srv/omeka/config/
ADD --chown=www-data:www-data bare/omeka-s/modules/ /srv/omeka/modules/
ADD --chown=www-data:www-data bare/omeka-s/logs/ /srv/omeka/logs
ADD --chown=www-data:www-data bare/omeka-s/themes/ /srv/omeka/themes

ADD --chown=www-data:www-data repos/ /srv/omeka/repos/
ADD --chown=www-data:www-data config/patch-composer.php /srv/omeka/patch-composer.php
ADD --chown=www-data:www-data config/omeka-app/*.config.php  /srv/omeka/application/config/
ADD --chown=www-data:www-data config/omeka-app/*.config.php  /srv/omeka/application/config/
ADD --chown=www-data:www-data config/omeka/*  /srv/omeka/config/
ADD --chown=www-data:www-data config/error.phtml /srv/omeka/application/view/error/index.phtml

USER www-data
WORKDIR /srv/omeka
ENV XDG_DATA_HOME "/srv/omeka/.local"
ENV XDG_CONFIG_HOME "/srv/omeka/.config"
ENV npm_config_cache "/srv/omeka/.npm"
ENV COMPOSER_CACHE_DIR "/srv/omeka/.composer"

RUN npm install && ./node_modules/gulp/bin/gulp.js init && \
    php -f /srv/omeka/patch-composer.php && \
    composer update --lock --optimize-autoloader --no-dev --prefer-source --no-interaction && \
    rm -Rf ./node_modules/ /srv/omeka/.local /srv/omeka/.config /srv/omeka/.npm /srv/omeka/.composer && \
    mkdir -p /srv/omeka/files && \
    chmod 777 /srv/omeka/files

USER root
RUN mkdir -p /run/php-fpm && \
    mkdir -p /run/supervisor && \
    chown -R www-data:www-data /var/lib/nginx

CMD ["/bin/supervisord", "-c", "/etc/supervisord.conf"]
