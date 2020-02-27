#! /bin/bash
/usr/bin/mysqldump --single-transaction --skip-lock-table \ 
    -h localhost -P $MYSQL_PORT -u $MYSQL_USER $MYSQL_DATABASE --password=$MYSQL_PASSWORD \
    > $MYSQL_DATABASE.sql

/bin/chmod 644 $MYSQL_DATABASE.sql