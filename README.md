# 宝鸡中学高校论坛

面向宝鸡中学学生的大学信息平台，提供大学介绍和学长学姐答疑服务。

## 功能特性

- 🎓 **大学介绍** - 详细展示各大学信息，包括专业、校园环境等
- 💬 **问答论坛** - 学生可以向各大学的学长学姐提问
- 🔍 **搜索筛选** - 支持按大学筛选问题
- 📱 **响应式设计** - 适配各种设备

## 技术栈

- **Next.js 14** - React 框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **Lucide React** - 图标库

## 快速开始

### 本地开发环境（已恢复）

需要 Node.js 22。首次运行将 `.env.example` 复制为 `.env`，并为
`NEXTAUTH_SECRET` 填写随机密钥（可用 `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` 生成）。

```bash
npm ci
npm run db:setup
npm run dev -- --hostname 127.0.0.1
```

打开 http://localhost:3000 。本地使用 SQLite 数据库 `prisma/dev.db`，无需安装数据库服务。
`db:setup` 生成客户端、创建表并导入预置大学和专业；重复运行不会清空用户数据。
数据库和 `.env` 已加入 Git 忽略规则。SQLite 使用 `prisma/schema.local.prisma`，
原 PostgreSQL 模型保留在 `prisma/schema.prisma`。本地库不包含之前云端或浏览器里的用户内容。

验证命令：`npm run typecheck`、`npm run build`。

当前仅恢复启动基础，旧版发帖页、个人主页、专业讨论和管理后台仍有浏览器本地存储逻辑，
尚未完成数据库统一；不要将本地运行成功视为这些功能已修复。后续重构需要统一数据访问和权限校验。

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000)

### 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
├── app/                    # Next.js App Router 页面
│   ├── page.tsx           # 首页
│   ├── universities/      # 大学介绍页面
│   └── forum/             # 问答论坛页面
├── components/            # React 组件
│   ├── Navbar.tsx        # 导航栏
│   └── Footer.tsx        # 页脚
├── data/                  # 数据文件
│   ├── universities.ts   # 大学数据
│   └── questions.ts      # 问题数据
└── public/               # 静态资源
```

## 部署

### Vercel 部署（推荐）

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 自动部署完成

### 其他平台

项目可以部署到任何支持 Next.js 的平台，如：
- Netlify
- Railway
- 自己的服务器

## 后续开发建议

- [ ] 添加用户认证系统
- [ ] 连接数据库存储数据
- [ ] 添加实时通知功能
- [ ] 实现点赞、收藏等功能
- [ ] 添加管理员后台
- [ ] 优化 SEO

## 许可证

MIT
















