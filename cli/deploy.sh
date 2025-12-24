#!/bin/bash
set -e

cd /srv/project

git fetch --all
git reset --hard origin/master

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

export VITE_LIFE_URL="https://life.tires/api/"

nvm use 22 || nvm install 22
pnpm install
pnpm run build

nvm use 18 || nvm install 18
pm2 reload ecosystem.config.cjs --env production || pm2 start ecosystem.config.cjs --env production
