/**
 * 数据迁移脚本：将 localStorage 数据迁移到 PostgreSQL 数据库
 * 
 * 使用方法：
 * 1. 在浏览器中打开论坛网站
 * 2. 打开浏览器开发者工具（F12）
 * 3. 切换到 Console 标签
 * 4. 将此脚本的内容复制粘贴到控制台并回车执行
 * 
 * 注意：此脚本需要在已登录的状态下运行，且需要管理员权限
 */

(async function migrateLocalStorageData() {
  console.log('===== 开始数据迁移 =====')
  console.log('提示：请确保您已登录且具有管理员权限')
  
  // 统计信息
  const stats = {
    questions: 0,
    replies: 0,
    reports: 0,
    alumniMessages: 0,
    errors: 0,
  }

  // 1. 迁移问题数据
  console.log('\n📝 开始迁移问题数据...')
  try {
    const questionsData = localStorage.getItem('forum_questions')
    if (questionsData) {
      const questions = JSON.parse(questionsData)
      console.log(`  找到 ${questions.length} 个问题`)

      for (const question of questions) {
        try {
          // 创建问题
          const response = await fetch('/api/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: question.title,
              content: question.content,
              isAnonymous: question.isAnonymous || false,
              universityId: question.universityId,
              majorId: question.majorId,
              category: question.category,
            }),
          })

          if (response.ok) {
            const data = await response.json()
            const newQuestionId = data.question.id
            stats.questions++
            console.log(`  ✓ 已迁移问题: ${question.title}`)

            // 迁移该问题的点赞
            if (question.likedBy && Array.isArray(question.likedBy)) {
              for (const userId of question.likedBy) {
                // 这里需要以对应用户的身份点赞，实际场景中可能需要特殊处理
                // 暂时跳过点赞迁移，因为需要用户 session
                console.log(`    - 点赞记录需要用户手动重新点赞`)
              }
            }

            // 迁移该问题的回复
            if (question.replyList && Array.isArray(question.replyList)) {
              for (const reply of question.replyList) {
                try {
                  await fetch(`/api/questions/${newQuestionId}/reply`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      content: reply.content,
                      isAnonymous: reply.isAnonymous || false,
                      parentReplyId: reply.parentReplyId,
                    }),
                  })
                  stats.replies++
                  console.log(`    ✓ 已迁移回复`)
                } catch (error) {
                  console.error(`    ✗ 回复迁移失败:`, error)
                  stats.errors++
                }
              }
            }
          } else {
            const error = await response.json()
            console.error(`  ✗ 问题迁移失败: ${error.error}`)
            stats.errors++
          }
        } catch (error) {
          console.error(`  ✗ 问题迁移失败:`, error)
          stats.errors++
        }
      }
    } else {
      console.log('  没有找到问题数据')
    }
  } catch (error) {
    console.error('读取问题数据失败:', error)
  }

  // 2. 迁移举报数据
  console.log('\n🚨 开始迁移举报数据...')
  try {
    const reportsData = localStorage.getItem('forum_reports')
    if (reportsData) {
      const reports = JSON.parse(reportsData)
      console.log(`  找到 ${reports.length} 条举报`)

      for (const report of reports) {
        try {
          const response = await fetch('/api/reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: report.type,
              targetId: report.targetId,
              targetTitle: report.targetTitle,
              targetContent: report.targetContent,
              reason: report.reason,
              questionId: report.questionId,
            }),
          })

          if (response.ok) {
            stats.reports++
            console.log(`  ✓ 已迁移举报`)
          } else {
            const error = await response.json()
            console.error(`  ✗ 举报迁移失败: ${error.error}`)
            stats.errors++
          }
        } catch (error) {
          console.error(`  ✗ 举报迁移失败:`, error)
          stats.errors++
        }
      }
    } else {
      console.log('  没有找到举报数据')
    }
  } catch (error) {
    console.error('读取举报数据失败:', error)
  }

  // 3. 迁移学长学姐寄语数据
  console.log('\n💌 开始迁移寄语数据...')
  try {
    const usersData = localStorage.getItem('forum_users')
    if (usersData) {
      const users = JSON.parse(usersData)
      console.log(`  找到 ${users.length} 个用户`)

      for (const user of users) {
        // 检查用户是否有寄语列表
        if (user.alumniMessages && Array.isArray(user.alumniMessages)) {
          for (const message of user.alumniMessages) {
            try {
              const response = await fetch('/api/alumni-messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  content: message.content,
                }),
              })

              if (response.ok) {
                stats.alumniMessages++
                console.log(`  ✓ 已迁移寄语`)
              } else {
                const error = await response.json()
                console.error(`  ✗ 寄语迁移失败: ${error.error}`)
                stats.errors++
              }
            } catch (error) {
              console.error(`  ✗ 寄语迁移失败:`, error)
              stats.errors++
            }
          }
        }
      }
    } else {
      console.log('  没有找到用户数据')
    }
  } catch (error) {
    console.error('读取用户数据失败:', error)
  }

  // 输出统计信息
  console.log('\n===== 数据迁移完成 =====')
  console.log('迁移统计:')
  console.log(`  问题: ${stats.questions}`)
  console.log(`  回复: ${stats.replies}`)
  console.log(`  举报: ${stats.reports}`)
  console.log(`  寄语: ${stats.alumniMessages}`)
  console.log(`  错误: ${stats.errors}`)
  console.log('\n⚠️ 注意: 点赞数据需要用户重新手动点赞')
  console.log('建议: 迁移完成后，请通知用户数据已迁移，点赞记录需要重新操作')
})()

