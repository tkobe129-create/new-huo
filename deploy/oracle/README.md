# Oracle Cloud Free Tier 上运行自建 Supabase

本项目不再绑定公共 Supabase。生产环境通过环境变量连接 Oracle 云主机上的 Supabase；应用自己的业务数据库仍通过 `DATABASE_URL` 连接同一套 Postgres。

## 1. 创建 Oracle 主机

创建 Ubuntu 22.04 ARM Ampere 实例（建议 4 OCPU / 24 GB，磁盘至少 100 GB；Free Tier 额度以 Oracle 控制台为准），分配公网 IPv4，并在 VCN 安全列表放行 TCP `22`、`80`、`443`。不要直接暴露 `5432`、`8000` 或 Supabase Studio 端口。

在实例上执行：

```bash
sudo apt update && sudo apt install -y git
sudo bash deploy/oracle/install-supabase.sh
```

脚本会安装 Docker、克隆 Supabase 官方 Docker 配置，并生成随机密钥。首次部署前编辑 `/opt/supabase/docker/.env`，至少确认 `SITE_URL`、`API_EXTERNAL_URL` 和 `DASHBOARD_PASSWORD`。

## 2. 启动 Supabase

```bash
cd /opt/supabase/docker
sudo docker compose pull
sudo docker compose up -d
sudo docker compose ps
```

生产环境务必用域名和 HTTPS：将 `API_EXTERNAL_URL=https://api.example.com`、`SITE_URL=https://app.example.com`，再用 Caddy/Nginx 将域名反代到 Kong 的 `8000` 端口。不要把 `.env` 提交到 Git。

从 Supabase Studio 的 API Settings 复制 `anon key`，并把下面变量配置到应用部署平台：

```dotenv
SUPABASE_URL=https://api.example.com
SUPABASE_ANON_KEY=你的_anon_key
DATABASE_URL=postgresql://postgres:你的数据库密码@主机内网地址:5432/postgres?sslmode=disable
VITE_AUTH_ENABLED=true
```

`SUPABASE_URL` 必须是浏览器/应用可访问的 API 地址，不是 `localhost`。如果应用和 Supabase 在同一台主机，也不要填 `127.0.0.1`，因为浏览器访问的是用户自己的电脑。

## 3. 数据库迁移

应用部署后执行：

```bash
npm ci
DATABASE_URL='postgresql://...' npm run db:migrate
```

迁移只会创建应用所需的表；Supabase 自带的 `auth`、`storage` 等 schema 由官方 compose 管理。

## 4. 备份与升级

至少每天备份 Postgres 卷或执行 `pg_dump`，并把备份同步到 Oracle Object Storage。升级前先备份，再在 `/opt/supabase/docker` 执行 `docker compose pull && docker compose up -d`。Oracle Free Tier 不是备份服务，实例被回收或误删后数据可能丢失。

官方配置来源：<https://github.com/supabase/supabase/tree/master/docker>
