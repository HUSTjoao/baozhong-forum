# 数据库迁移指南

从 localStorage 迁移到 PostgreSQL 数据库的完整指南。

## 📋 迁移概述

本次迁移将把所有论坛数据从浏览器的 localStorage 迁移到 PostgreSQL 数据库，实现：

- ✅ 跨设备数据同步
- ✅ 多用户数据一致性
- ✅ 集中化的管理员后台
- ✅ 数据持久化和备份

## 🔧 迁移步骤

### 第一步：更新数据库 Schema

1. **打开命令行工具**（在项目根目录下）

2. **运行 Prisma 迁移命令**：

```bash
npx prisma migrate dev --name add-alumni-message-likes
```

如果遇到中文路径编码问题，请尝试在英文路径下操作，或使用以下命令：

```bash
npx prisma generate
npx prisma db push
```

3. **验证数据库更新**：

```bash
npx prisma studio
```

打开 Prisma Studio 后，应该能看到新增的 `AlumniMessageLike` 表。

### 第二步：替换前端代码文件

**重要提示**：在替换文件前，建议先备份原文件！

1. **替换论坛详情页面**：

```bash
# 备份原文件
mv app/forum/[id]/page.tsx app/forum/[id]/page.tsx.backup

# 使用新文件
mv app/forum/[id]/page-new.tsx app/forum/[id]/page.tsx
```

或者在 Windows PowerShell 中：

```powershell
# 备份原文件
Move-Item -Path "app/forum/[id]/page.tsx" -Destination "app/forum/[id]/page.tsx.backup"

# 使用新文件
Move-Item -Path "app/forum/[id]/page-new.tsx" -Destination "app/forum/[id]/page.tsx"
```

2. **替换寄语页面**：

```bash
# 备份原文件
mv app/messages/page.tsx app/messages/page.tsx.backup

# 使用新文件
mv app/messages/page-new.tsx app/messages/page.tsx
```

或者在 Windows PowerShell 中：

```powershell
# 备份原文件
Move-Item -Path "app/messages/page.tsx" -Destination "app/messages/page.tsx.backup"

# 使用新文件
Move-Item -Path "app/messages/page-new.tsx" -Destination "app/messages/page.tsx"
```

### 第三步：重启开发服务器

```bash
# 停止当前运行的服务器（Ctrl+C）

# 重新启动
npm run dev
```

### 第四步：迁移现有的 localStorage 数据（可选）

如果您的浏览器中有重要的论坛数据，可以执行数据迁移：

1. **确保已登录论坛**（需要管理员账号）

2. **打开浏览器开发者工具**：
   - Chrome/Edge: 按 F12 或右键 → 检查
   - 切换到 "Console" 标签页

3. **运行迁移脚本**：
   - 打开文件 `scripts/migrate-from-localstorage.ts`
   - 复制全部内容
   - 粘贴到浏览器控制台
   - 按回车执行

4. **查看迁移结果**：
   - 控制台会显示迁移进度和统计信息
   - 检查是否有错误信息

**注意事项**：
- 点赞记录无法自动迁移（需要用户重新点赞）
- 确保以管理员身份登录
- 迁移过程中请勿关闭页面

### 第五步：清理 localStorage（可选）

数据迁移完成并确认无误后，可以清理浏览器的 localStorage：

1. 在浏览器开发者工具的 Console 中运行：

```javascript
// 清理论坛相关的 localStorage 数据
localStorage.removeItem('forum_questions')
localStorage.removeItem('forum_reports')
localStorage.removeItem('forum_users')
localStorage.removeItem('user_forum_universities')

console.log('localStorage 已清理')
```

## 📝 已完成的 API 端点

### 问题（Questions）

- `GET /api/questions/list` - 获取所有问题
- `GET /api/questions/[id]` - 获取单个问题详情
- `POST /api/questions` - 创建新问题
- `POST /api/questions/[id]/delete` - 删除问题
- `POST /api/questions/[id]/like` - 点赞/取消点赞问题

### 回复（Replies）

- `POST /api/questions/[id]/reply` - 创建回复
- `POST /api/questions/[id]/reply/[replyId]/delete` - 删除回复
- `POST /api/questions/[id]/reply/[replyId]/like` - 点赞/取消点赞回复

### 举报（Reports）

- `GET /api/reports` - 获取所有举报
- `POST /api/reports` - 提交举报
- `PATCH /api/reports/[id]` - 更新举报状态

### 学长学姐寄语（Alumni Messages）

- `GET /api/alumni-messages` - 获取所有寄语
- `POST /api/alumni-messages` - 创建新寄语
- `DELETE /api/alumni-messages/[id]` - 删除寄语
- `POST /api/alumni-messages/[id]/like` - 点赞/取消点赞寄语

## 🔍 验证迁移

迁移完成后，请执行以下验证：

1. **功能测试**：
   - ✅ 创建新问题
   - ✅ 发表回复
   - ✅ 点赞问题和回复
   - ✅ 删除自己的内容
   - ✅ 提交举报
   - ✅ 发布学长学姐寄语

2. **数据一致性测试**：
   - 在不同浏览器登录同一账号，检查数据是否一致
   - 清除浏览器缓存后重新登录，检查数据是否保留

3. **权限测试**：
   - 普通用户只能删除自己的内容
   - 管理员可以删除任何内容
   - 被禁言用户无法发表内容和点赞

## 🐛 故障排查

### 问题1：Prisma 迁移失败

**解决方案**：
```bash
# 重置数据库（警告：会清空所有数据）
npx prisma migrate reset

# 重新运行迁移
npx prisma migrate dev
```

### 问题2：页面报错 "Cannot find module"

**解决方案**：
```bash
# 重新安装依赖
npm install

# 重启开发服务器
npm run dev
```

### 问题3：API 返回 401 或 403 错误

**原因**：未登录或权限不足

**解决方案**：
1. 确保已登录
2. 检查用户角色和权限
3. 清除浏览器 Cookie 后重新登录

### 问题4：数据迁移脚本报错

**常见原因**：
1. 未登录或 session 过期
2. 不是管理员账号
3. localStorage 数据格式不正确

**解决方案**：
1. 重新登录
2. 使用管理员账号
3. 检查浏览器控制台的详细错误信息

## 📚 技术细节

### 数据库 Schema 变更

新增表：
- `AlumniMessageLike` - 学长学姐寄语点赞记录

更新的关系：
- `User` ↔ `AlumniMessageLike` - 一对多
- `AlumniMessage` ↔ `AlumniMessageLike` - 一对多

### API 客户端封装

所有 API 调用都封装在 `lib/api-client.ts` 中，提供：
- 统一的错误处理
- TypeScript 类型支持
- 简洁的调用接口

### 前端变更

主要更新：
1. 移除对 `@/data/questions.ts` 和 `@/data/users.ts` 的直接依赖
2. 使用 `@/lib/api-client.ts` 进行所有数据操作
3. 使用 React 状态管理替代 localStorage
4. 添加加载状态和错误处理

## 📞 需要帮助？

如果遇到任何问题，请检查：
1. 浏览器开发者工具的 Console 和 Network 标签
2. 服务器端的日志输出
3. Prisma Studio 中的数据库状态

## 🎉 迁移完成！

完成所有步骤后，您的论坛系统已经成功迁移到数据库存储！

**主要优势**：
- 🔄 数据在所有设备间自动同步
- 💾 数据持久化存储，不会因清除浏览器缓存而丢失
- 👥 支持多用户并发访问
- 🛡️ 更好的数据安全性和备份能力
- 📊 便于数据分析和管理

感谢您的耐心！如有任何问题，欢迎随时咨询。

