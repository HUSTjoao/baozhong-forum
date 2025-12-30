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
















