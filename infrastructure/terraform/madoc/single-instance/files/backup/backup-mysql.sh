#! /bin/bash
/usr/bin/mysqldump --single-transaction --skip-lock-tables -h 0.0.0.0 -P $MYSQL_PORT -u $MYSQL_USER $MYSQL_DATABASE --password=$MYSQL_PASSWORD > $MYSQL_DATABASE.sql

/bin/chmod 644 $MYSQL_DATABASE.sql