FROM mysql:5.7

COPY ./sql/* /docker-entrypoint-initdb.d/

COPY ./sql/01-create-database.sql /docker-entrypoint-initdb.d/01-create-database.sql
COPY ./sql/02-migration.sql /docker-entrypoint-initdb.d/02-migration.sql
COPY ./sql/03-property.sql /docker-entrypoint-initdb.d/03-property.sql
COPY ./sql/04-resource-class.sql /docker-entrypoint-initdb.d/04-resource-class.sql
COPY ./sql/05-resource-template.sql /docker-entrypoint-initdb.d/05-resource-template.sql
COPY ./sql/06-resource-template-property.sql /docker-entrypoint-initdb.d/06-resource-template-property.sql
COPY ./sql/07-settings.sql /docker-entrypoint-initdb.d/07-settings.sql
COPY ./sql/08-vocab.sql /docker-entrypoint-initdb.d/08-vocab.sql
COPY ./sql/09-user.sql /docker-entrypoint-initdb.d/09-user.sql
COPY ./sql/12-site.sql /docker-entrypoint-initdb.d/12-site.sql
COPY ./sql/14-public-user.sql /docker-entrypoint-initdb.d/14-public-user.sql
COPY ./sql/15-site-pages.sql /docker-entrypoint-initdb.d/15-site-pages.sql
COPY ./sql/16-site-settings.sql /docker-entrypoint-initdb.d/16-site-settings.sql

# Override
COPY ./madoc-sql/10-enable-modules.sql /docker-entrypoint-initdb.d/10-enable-modules.sql
# 11-configure-modules remove.

COPY ./config/* /etc/mysql/conf.d/
