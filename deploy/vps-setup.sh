#!/usr/bin/env bash
#
# One-time VPS preparation for the Smart Move stack.
#
#   scp deploy/vps-setup.sh you@vps:/tmp/ && ssh you@vps 'sudo bash /tmp/vps-setup.sh'
#
# Assumes Ubuntu with nginx already installed and serving other sites, so it
# does not touch nginx's global configuration or the firewall's web ports.
# Idempotent: safe to re-run.

set -euo pipefail

DOMAIN="${DOMAIN:-smartmove4u.muradsprojects.co.uk}"
APP_DIR="${APP_DIR:-/opt/smartmove}"

log() { printf '\n\033[1;34m==>\033[0m %s\n' "$1"; }

if [[ $EUID -ne 0 ]]; then
  echo "Run with sudo." >&2
  exit 1
fi

log "Checking what already owns ports 80 and 443"
ss -tlnp '( sport = :80 or sport = :443 )' || true

log "Installing Docker if it is not already present"
if ! command -v docker >/dev/null 2>&1; then
  apt-get update -qq
  apt-get install -y -qq ca-certificates curl gnupg
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg |
    gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    >/etc/apt/sources.list.d/docker.list
  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io \
    docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
else
  echo "Docker $(docker --version) already installed"
fi

log "Installing certbot's nginx plugin and htpasswd"
apt-get install -y -qq certbot python3-certbot-nginx apache2-utils

log "Creating $APP_DIR"
mkdir -p "$APP_DIR"
chmod 750 "$APP_DIR"

log "Done"
cat <<NEXT

Next steps, from your machine:

  scp docker-compose.prod.yml you@vps:$APP_DIR/
  scp deploy/nginx/smartmove-zones.conf you@vps:/tmp/
  scp deploy/nginx/$DOMAIN.conf you@vps:/tmp/
  scp .env.production you@vps:$APP_DIR/          # after filling it in

Then on the VPS:

  sudo mv /tmp/smartmove-zones.conf /etc/nginx/conf.d/
  sudo mv /tmp/$DOMAIN.conf /etc/nginx/sites-available/
  sudo ln -sf /etc/nginx/sites-available/$DOMAIN.conf /etc/nginx/sites-enabled/
  sudo nginx -t && sudo systemctl reload nginx
  sudo certbot --nginx -d $DOMAIN

  cd $APP_DIR
  chmod 600 .env.production
  docker compose -f docker-compose.prod.yml --env-file .env.production up -d
  docker compose -f docker-compose.prod.yml --env-file .env.production \\
    run --rm app node dist/seed.mjs

NEXT
