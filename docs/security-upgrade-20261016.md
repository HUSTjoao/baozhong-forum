# 公网上线前的依赖更新

2026-10-16：Next.js 固定为 15.5.28，NextAuth 固定为 4.24.15，Prisma CLI、客户端及 PostgreSQL / SQLite 适配器统一为 7.10.1。保留 React 18 和 Tailwind 3，避免无关的界面迁移。Next.js 内部 PostCSS 通过 override 使用同一大版本的 8.5.30。

动态 API 和服务端页面现在等待异步 params；客户端详情页使用 useParams。认证仍使用数据库账号密码，管理操作仍重新查询数据库角色。

安装后以官方 npm registry 执行 `npm audit --omit=dev`，当前结果为 0 项已知漏洞。完整安装仍有 Tailwind 3 构建依赖的 7 项告警（5 high、2 moderate），涉及 braces 和 postcss-selector-parser 及其上游链；它们用于编译仓库内的样式，不应接收用户提交的构建配置或样式文件。此结果不表示整个网站没有其他安全风险。不要运行 `npm audit fix --force`，它会引入 Tailwind 4 等破坏性变更。

服务器更新前备份 forum_db_v2 和 .env。拉取代码后停止测试进程、运行 npm ci 和单进程生产构建，构建成功后再启动进程。依赖更新不需要重新初始化数据库，也不需要重新导入目录。

公网切换还需要：Nginx 转发到 127.0.0.1:3001、配置域名 HTTPS 与续期、更新 NEXTAUTH_URL、验证公网登录和跨设备数据持久化。数据库端口应仅允许实际需要的访问来源。公安备案号待审核完成后再填写。

## 已签发证书后的服务器切换

`node scripts/enable-public-site.cjs` 只显示计划；在已核实的 `/root/baozhong-forum-test` 执行并添加 `--apply` 才会修改。脚本限 Linux root，检查两个域名的证书和私钥匹配、当前数据库及服务，拒绝账号与密码相同的管理员。先生成并检查数据库备份，再备份与更新环境配置、Nginx 和续期重载钩子。后续失败会恢复配置并尝试恢复服务；数据库本身不做迁移或重置。

切换后的 HTTPS 检查通过本机解析进行，不代表安全组 TCP 443 已开放或公网访问已验证。还需从外部网络检查登录、读写与持久化，验证 Certbot 续期及 PM2 开机启动。脚本已做本地语法和无修改模式检查，实际 Nginx 检查及切换验证在 ECS 执行时进行。

参考：
- https://github.com/advisories/GHSA-2xp9-vwfh-vxw4
- https://github.com/advisories/GHSA-7rqj-j65f-68wh
- https://nextjs.org/docs/app/guides/upgrading/version-15
