#! /bin/bash

# mount the EBS volumes and add to fstab so they mount at boot
# working-data dir
mkdir -p /opt/data

if ! blkid --probe --match-types ext4 /dev/xvdf ; then
    mkfs.ext4 /dev/xvdf
fi
mount /dev/xvdf /opt/data
echo /dev/xvdf /opt/data ext4 defaults,nofail 0 2 >> /etc/fstab

# backup
mkdir -p /mnt/backup
if ! blkid --probe --match-types ext4 /dev/xvdg ; then
    mkfs.ext4 /dev/xvdg
fi
mount /dev/xvdg /mnt/backup
echo /dev/xvdg /mnt/backup ext4 defaults,nofail 0 2 >> /etc/fstab