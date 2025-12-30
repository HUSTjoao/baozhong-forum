# 用户登录功能设置指南

## 📋 已完成的功能

✅ 用户注册和登录系统
✅ 用户数据存储（使用 localStorage）
✅ 会话管理（NextAuth.js）
✅ 页面保护（添加大学、提问等功能需要登录）
✅ 导航栏显示用户信息

## 🚀 快速开始

### 1. 安装依赖

首先，你需要安装新增的依赖包：

```bash
npm install
```

这会安装以下新包：
- `next-auth` - 认证库
- `bcryptjs` - 密码加密（已添加但当前使用简化版本）

### 2. 配置环境变量

创建 `.env.local` 文件（在项目根目录）：

```bash
# NextAuth配置
# 在生产环境中，请使用强随机字符串
# 可以使用命令生成: openssl rand -base64 32
NEXTAUTH_SECRET=your-secret-key-change-in-production
NEXTAUTH_URL=http://localhost:3000
```

**重要提示**：
- `NEXTAUTH_SECRET` 在生产环境中必须使用强随机字符串
- 可以使用以下命令生成：`openssl rand -base64 32`
- 或者访问：https://generate-secret.vercel.app/32

### 3. 启动开发服务器

```bash
npm run dev
```

## 📁 新增的文件

### 认证相关
- `app/api/auth/[...nextauth]/route.ts` - NextAuth API 路由
- `app/api/auth/register/route.ts` - 用户注册 API
- `app/auth/login/page.tsx` - 登录/注册页面
- `types/next-auth.d.ts` - TypeScript 类型定义

### 组件
- `components/Providers.tsx` - SessionProvider 包装器
- `components/RequireAuth.tsx` - 页面保护组件

### 数据
- `data/users.ts` - 用户数据模型和存储

## 🎯 功能说明

### 用户注册
- 访问 `/auth/login` 页面
- 点击"还没有账户？点击注册"
- 填写信息：
  - 姓名（必填）
  - 邮箱（必填，用于登录）
  - 密码（必填，至少6位）
  - 确认密码（必填）
  - 身份（学生/学长学姐）

### 用户登录
- 访问 `/auth/login` 页面
- 输入邮箱和密码
- 点击"登录"

### 受保护的页面
以下页面需要登录后才能访问：
- `/universities/add` - 添加大学
- `/forum/ask` - 提问

未登录用户访问这些页面会自动跳转到登录页面。

### 用户信息显示
- 登录后，导航栏会显示用户名
- 如果是学长/学姐，会显示特殊标识
- 可以点击"登出"退出登录

## 🔒 安全说明

### 当前实现（开发环境）
- 密码以明文存储在 localStorage（仅用于开发）
- 用户数据存储在浏览器 localStorage

### 生产环境建议
1. **使用数据库**：
   - 推荐使用 PostgreSQL、MongoDB 或 MySQL
   - 使用 Prisma 或 TypeORM 作为 ORM

2. **密码加密**：
   - 使用 bcrypt 加密密码
   - 已安装 `bcryptjs`，可以在 `data/users.ts` 中使用

3. **环境变量**：
   - 确保 `.env.local` 不被提交到 Git
   - 在生产环境使用安全的密钥

4. **HTTPS**：
   - 生产环境必须使用 HTTPS
   - 更新 `NEXTAUTH_URL` 为生产域名

## 📝 代码示例

### 在组件中使用会话

```tsx
'use client'

import { useSession } from 'next-auth/react'

export default function MyComponent() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <div>加载中...</div>
  if (!session) return <div>请先登录</div>

  return <div>欢迎，{session.user.name}！</div>
}
```

### 保护页面

```tsx
import RequireAuth from '@/components/RequireAuth'

export default function ProtectedPage() {
  return (
    <RequireAuth>
      <div>这是受保护的页面</div>
    </RequireAuth>
  )
}
```

## 🐛 常见问题

### 1. 登录后页面不刷新
- 确保已安装所有依赖：`npm install`
- 检查 `.env.local` 文件是否存在且配置正确
- 清除浏览器缓存并重新加载

### 2. 注册失败
- 检查邮箱格式是否正确
- 确保密码长度至少6位
- 检查控制台是否有错误信息

### 3. 会话丢失
- 检查 `NEXTAUTH_SECRET` 是否配置
- 确保 `NEXTAUTH_URL` 与当前访问地址一致

## 🔄 下一步优化建议

1. **添加密码重置功能**
2. **添加邮箱验证**
3. **连接真实数据库**
4. **添加用户个人资料页面**
5. **添加忘记密码功能**
6. **添加社交登录（微信、QQ等）**

## 📚 相关文档

- [NextAuth.js 文档](https://next-auth.js.org/)
- [Next.js 文档](https://nextjs.org/docs)

















