#! /bin/bash
BACKUP_FOLDER="/mnt/backup/omeka_files"
mkdir -p $BACKUP_FOLDER
echo "Syncing omeka_files to $BACKUP_FOLDER"

rsync -a /opt/data/omeka_files/ $BACKUP_FOLDER