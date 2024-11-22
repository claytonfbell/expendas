#!/bin/bash
git pull
docker build ./ -t expendas
docker container stop expendas
docker container rm expendas
docker run -d -p 10.7.7.12:3000:3000/tcp --name=expendas --restart=unless-stopped --add-host host.docker.internal:host-gateway expendas
docker image prune -f