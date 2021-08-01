#!/bin/bash

pm2 stop nextjs
git pull
yarn install
yarn build
pm2 start nextjs
