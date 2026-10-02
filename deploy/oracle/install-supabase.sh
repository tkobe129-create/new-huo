#!/usr/bin/env bash
set -Eeuo pipefail

# Bootstrap the official Supabase self-hosted Docker distribution on Ubuntu.
# Run as root on the Oracle VM. This intentionally does not expose any ports.
if [[ $EUID -ne 0 ]]; then
  echo '请用 sudo 运行此脚本' >&2
  exit 1
fi

apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y ca-certificates curl git openssl
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
fi

install -d -m 0750 /opt/supabase
if [[ ! -d /opt/supabase/docker/.git ]]; then
  git clone --depth 1 https://github.com/supabase/supabase.git /tmp/supabase
  rm -rf /opt/supabase/docker
  cp -a /tmp/supabase/docker /opt/supabase/docker
  rm -rf /tmp/supabase
fi

cd /opt/supabase/docker
if [[ ! -f .env ]]; then
  cp .env.example .env
  # The official file contains placeholders; these random values are only a
  # starting point. Review and rotate them before making the API public.
  sed -i "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$(openssl rand -hex 24)/" .env
  sed -i "s/^JWT_SECRET=.*/JWT_SECRET=$(openssl rand -hex 32)/" .env
  sed -i "s/^DASHBOARD_PASSWORD=.*/DASHBOARD_PASSWORD=$(openssl rand -hex 16)/" .env
  chmod 600 .env
  echo '已生成 /opt/supabase/docker/.env，请先检查密钥和域名，再执行 docker compose up -d'
else
  echo '/opt/supabase/docker/.env 已存在，未覆盖。'
fi
