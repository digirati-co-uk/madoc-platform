FROM mysql:5.7

COPY ./sql/* /docker-entrypoint-initdb.d/
COPY ./config/* /etc/mysql/conf.d/
