# 用户补充大学和专业

用户入口 `/universities/add`、`/majors/add`；管理员审核 `/admin/catalog`。资料进入真实 University/Major 表，默认 pending/isApproved=false，提交者由服务端登录态决定。大学同时创建 UniversityProfile，审核通过后可直接进入正式大学展开页；专业通过后加入 MajorLens 全专业搜索和详情页。未通过/待审核大学详情返回 404。个人主页既有申请列表从同一数据库读取。

名称以 NFKC、去空白、忽略大小写规范化检查；稳定名称哈希 ID 配合主键约束防止并发重复申请。介绍 30–6000 字，分类白名单；可选官网仅接受 HTTPS。不接收客户端审核状态、用户 ID 或权限。审核权限从数据库重新读取，禁止普通用户审核，已完成的申请不能重复审核。被禁言用户不能提交。当前未提供拒绝原因、修改后重新提交及编辑申请；名称相同的拒绝记录也阻止新申请，后续可增加管理员复审。

旧 localStorage 申请没有自动迁入；新版页面不再向浏览器本地存储写申请。旧后台其他管理功能尚未统一。

# 云数据库状态与上线验收

当前 `.env` 为 SQLite；尚未连通阿里云或其他云数据库。旧 `/api/db-test` 固定返回成功的占位代码已替换为真实 SELECT 1 和业务表计数。失败返回 503，不暴露凭据/表数据。

`npm run db:check:production` 要求 DATABASE_PROVIDER=postgresql 与 DATABASE_URL，再真实检查连接及业务表；本地 SQLite 明确检查失败。连接成功不等于写入、权限和部署后持久化已验证。

确认云平台/数据库引擎后，在部署环境配置 DATABASE_PROVIDER、DATABASE_URL、NEXTAUTH_URL、NEXTAUTH_SECRET。构建与运行使用同一种数据库 provider；生成 PostgreSQL Prisma 客户端，建立对应正式迁移并运行 Prisma 7 migrate deploy（已有库先核对结构并 baseline，不直接覆盖）。保留本地 SQLite 开发，不将本地 dev.db 当作云端数据库。云数据库网络白名单、私网/公网连接和 TLS 按实际平台设置。

最终从部署网址验证注册、发表、刷新、第二账号读取、管理员审核/删除及服务重启后的数据保留，才可以报告云端打通。生产数据库需独立备份与恢复验证。不要仅凭健康接口 200 或网页渲染成功报告完成。

已使用临时数据库账号验证：大学/专业提交、未登录拒绝、提交者 ID/审核状态不能伪造、待审核不公开、其他用户不能看申请、普通用户不能审核、规范化重复名称拒绝、管理员通过后公开目录和大学详情可访问、重复审核拒绝、数据库禁言实时检查和真实健康查询。临时数据在测试后清除。本轮未连接云数据库，未完成线上部署验收。

部署准备：用户选择新建干净的 PostgreSQL 数据库，旧 forum_db 和其备份保留。PostgreSQL 初始迁移位于 prisma/migrations-postgresql，与 SQLite 开发流程分开。`db:migrate:production` 应用于新的空 PostgreSQL 库，不能直接拿初始迁移套到已有旧库。`db:seed:production` 幂等导入 149 所核实大学和 192 个专业；`--check` 只核对资料，不写库。不创建测试账号、帖子或寄语。正式迁移与种子尚未在 ECS 上执行。

开发路线：本地完善功能与视觉，同时尽早建立云端测试环境，验证同一接口在 PostgreSQL 下的注册、发帖、审核及持久化。云端测试可用不等于正式对外发布；管理员用户管理、禁言与其他旧后台链路仍需完成。

ECS 准备脚本：`node scripts/prepare-ecs-test-database.cjs` 只显示计划；添加 `--apply` 才执行。在已备份旧库的前提下，新建 forum_db_v2（若非空则停止），只为该库和 forum_user 添加 127.0.0.1 密码认证，成功验证后备份并切换项目 .env。不修改旧库表和数据。`ecosystem.test.config.cjs` 使用独立 PM2 名称 baozhong-forum-test 和仅本机 3001 端口，不覆盖旧 3000 进程或 Nginx。测试服务器的 NEXTAUTH_URL 应与实际测试入口一致，在浏览器跨设备验收之前需配置入口及 HTTPS。
