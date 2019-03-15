FROM digirati/madoc-omeka-s:latest

# Add new config files (enables twig.)
ADD --chown=www-data:www-data config/omeka-app/*.config.php /srv/omeka/application/config/

# Mount our modules
ADD --chown=www-data:www-data repos/ /srv/omeka/repos/

# Run madoc installer
RUN madoc-installer
