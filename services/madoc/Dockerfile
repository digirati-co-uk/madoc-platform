FROM digirati/madoc-omeka-s:latest

MAINTAINER "Gary Tierney" <gary.tierney@digirati.com>
MAINTAINER "Stephen Fraser" <stephen.fraser@digirati.com>

# Override NGINX config (temporary)
COPY ./config/nginx.conf /etc/nginx/conf.d/omeka.conf

# Add new config files (enables twig.)
ADD --chown=www-data:www-data config/omeka-app/*.config.php /srv/omeka/application/config/

# Mount our modules
ADD --chown=www-data:www-data packages/auto-complete /srv/omeka/repos/auto-complete
ADD --chown=www-data:www-data packages/default-theme /srv/omeka/repos/default-theme
ADD --chown=www-data:www-data packages/extract-tagged-strings /srv/omeka/repos/extract-tagged-strings
ADD --chown=www-data:www-data packages/google-analytics /srv/omeka/repos/google-analytics
ADD --chown=www-data:www-data packages/madoc-bridge /srv/omeka/repos/madoc-bridge
ADD --chown=www-data:www-data packages/madoc-crowd-sourcing-theme /srv/omeka/repos/madoc-crowd-sourcing-theme
ADD --chown=www-data:www-data packages/omeka-i18n-module /srv/omeka/repos/omeka-i18n-module
ADD --chown=www-data:www-data packages/public-user /srv/omeka/repos/public-user
ADD --chown=www-data:www-data packages/shared-library /srv/omeka/repos/shared-library

# Add our translations
ADD --chown=www-data:www-data translations/ /srv/omeka/translations/

# Run madoc installer
RUN madoc-installer
