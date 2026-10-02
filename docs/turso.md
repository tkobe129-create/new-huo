# Turso Free 配置

生产环境使用 Turso 时设置 `TURSO_DATABASE_URL` 和 `TURSO_AUTH_TOKEN`。Turso 是 libSQL/SQLite，不是 PostgreSQL；当前应用的迁移 SQL 和身份认证仍需按 Turso 的 SQLite 语法部署前验证。不要把 token 放入 `VITE_` 变量或提交到 Git。

```bash
npm install
cp .env.example .env
# 填入 Turso 控制台创建的 database URL 和 token
npm run dev
```

Free 额度和限制以 Turso 控制台为准。生产上线前应配置备份、租户隔离、事务库存扣减和写入冲突重试。
