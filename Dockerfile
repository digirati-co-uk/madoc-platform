FROM digirati/madoc-omeka-s:latest

MAINTAINER "Gary Tierney" <gary.tierney@digirati.com>
MAINTAINER "Stephen Fraser" <stephen.fraser@digirati.com>

# Override NGINX config (temporary)
COPY ./config/nginx.conf /etc/nginx/conf.d/omeka.conf

# Add new config files (enables twig.)
ADD --chown=www-data:www-data config/omeka-app/*.config.php /srv/omeka/application/config/

# Mount our modules
ADD --chown=www-data:www-data repos/ /srv/omeka/repos/

# Add our translations
ADD --chown=www-data:www-data translations/ /srv/omeka/translations/

# Add sorting room
ADD --chown=www-data:www-data sorting-room/ /srv/omeka/sorting-room/

# Run madoc installer
RUN madoc-installer
