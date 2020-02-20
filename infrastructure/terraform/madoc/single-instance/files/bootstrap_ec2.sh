#! /bin/bash

sudo apt-get update
sudo apt-get remove docker docker-engine docker.io containerd runc
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

sudo mkdir -p /etc/docker/compose/madoc/
sudo mkdir -p /etc/systemd/system/