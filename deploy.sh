#!/bin/bash
docker container stop expendas
docker container rm expendas
git pull
docker build ./ -t expendas --memory=4g
docker run -d -p 127.0.0.1:3000:3000/tcp --name=expendas --restart=unless-stopped --add-host host.docker.internal:host-gateway expendas
