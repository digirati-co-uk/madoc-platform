FROM fedora:28

MAINTAINER "Gary Tierney" <gary.tierney@digirati.com>
MAINTAINER "Stephen Fraser" <stephen.fraser@digirati.com>

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
        php-apcu \
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

ADD etc/supervisord/*.ini /etc/supervisord.d/
ADD etc/nginx/nginx.conf /etc/nginx/nginx.conf
ADD etc/nginx/conf.d/*.conf /etc/nginx/conf.d/
ADD etc/php-fpm.conf /etc/php-fpm.conf
ADD etc/php-fpm.d/*.conf /etc/php-fpm.d/
ADD etc/php.d/*.ini /etc/php.d/

RUN groupadd www-data && \
    useradd -r -g www-data www-data && \
    mkdir -p /srv/omeka /var/www/.npm && \
    chown -R www-data:www-data /srv/omeka /var/www

# Composer cache warming.
# Can't enable this until we remove the `repositories`
#RUN curl -o /srv/omeka/composer.json -sSL "https://raw.githubusercontent.com/digirati-co-uk/omeka-s/bugfix/7.2-rebase/composer.json" && \
#    curl -o /srv/omeka/composer.lock -sSL "https://raw.githubusercontent.com/digirati-co-uk/omeka-s/bugfix/7.2-rebase/composer.lock" && \
#    composer update --working-dir=/srv/omeka --lock --optimize-autoloader --no-dev --prefer-source --no-interaction

# Download our fork.
ADD --chown=www-data:www-data https://github.com/digirati-co-uk/omeka-s/archive/bugfix/7.2-rebase.tar.gz /srv/omeka/

RUN tar --strip-components=1 -zxf /srv/omeka/7.2-rebase.tar.gz -C /srv/omeka/ && \
    chown -R www-data:www-data /srv/omeka && \
    rm -Rf /src/omeka/7.2-rebase.tar.gz

# Custom overrides to Omeka core.
ADD --chown=www-data:www-data srv/omeka/application/view/error/index.phtml /srv/omeka/application/view/error/index.phtml

# Extended base configuration
ADD --chown=www-data:www-data srv/omeka/application/config/*.config.php /srv/omeka/application/config/
ADD --chown=www-data:www-data srv/omeka/config/*  /srv/omeka/config/

# Binaries
ADD --chown=www-data:www-data usr/local/bin/patch-composer /usr/local/bin/
ADD --chown=www-data:www-data usr/local/bin/madoc-installer /usr/local/bin/

USER www-data
WORKDIR /srv/omeka
ENV npm_config_cache "/srv/omeka/.npm"
ENV COMPOSER_CACHE_DIR "/srv/omeka/.composer-cache"
ENV COMPOSER_HOME "/srv/omeka/.composer"

RUN npm install && \
    ./node_modules/gulp/bin/gulp.js init && \
    npm cache clean -f && \
    rm -Rf ./node_modules/ /srv/omeka/.npm /srv/omeka/.composer-cache /srv/omeka/.composer /srv/omeka/build

USER root
RUN mkdir -p /run/php-fpm && \
    mkdir -p /run/supervisor && \
    chown -R www-data:www-data /var/lib/nginx

EXPOSE 80

CMD ["/bin/supervisord", "-c", "/etc/supervisord.conf"]
