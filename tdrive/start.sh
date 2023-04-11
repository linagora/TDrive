#!/bin/bash
set -e


# Setup
echo Start Setup
cp -n docker-compose.onpremise.yml docker-compose.yml
if [ ! -d ./configuration ]; then #create configuration folder
  cp -nR ./default-configuration ./configuration
else
  cp -nR ./default-configuration/* ./configuration
fi
data_folders=(\
	./docker-data \
	./docker-data/documents \
	./docker-data/drive \
	./docker-data/drive-preview \
	./docker-data/fpm \
	./docker-data/letsencrypt \
	./docker-data/logs \
	./docker-data/logs/nginx \
	./docker-data/scylladb \
	./docker-data/uploads \
	./docker-data/ssl \
	./connectors \
	)
for folder in "${data_folders[@]}"; do #create mounted folders
  if [ ! -d "$folder" ]; then
    mkdir "$folder"
  fi
done

# Run
docker-compose pull

docker-compose up -d scylladb rabbitmq
echo Wait for scylladb to startup
secs=$((5 * 60))
while [ $secs -gt 0 ]; do
   echo -ne "$secs\033[0K\r"
   sleep 1
   : $((secs--))
done

docker-compose up -d php
echo Wait for PHP to create tables in scylladb
secs=$((10 * 60))
while [ $secs -gt 0 ]; do
   echo -ne "$secs\033[0K\r"
   sleep 1
   : $((secs--))
done

docker-compose up -d
echo Finished

