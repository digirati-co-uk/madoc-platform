#!/bin/sh

if [ -f "madoc.key" ]; then
  echo "Private key already exists, skipping..."
else
  openssl genrsa -out madoc.key 2048
  rm ./madoc.pub
fi;

if [ -f "madoc.pub" ]; then
  echo "Public key already exists, skipping..."
else
  openssl rsa -pubout -in madoc.key -out madoc.pub
fi;
