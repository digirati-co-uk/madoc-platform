#! /bin/bash
BACKUP_FOLDER="/opt/backup/omeka_files"
mkdir -p $OUTPUT_FOLDER
echo "Syncing omeka_files to $BACKUP_FOLDER"

rsync -a /opt/data/omeka_files/ $BACKUP_FOLDER