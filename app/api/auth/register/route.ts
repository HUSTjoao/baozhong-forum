import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// 确保这个路由是动态的，不在构建时执行
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  // 在构建时跳过执行
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ error: 'Service unavailable during build' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const {
      email,
      username,
      password,
      name,
      role,
      universityId,
      graduationYear,
      major,
      gender,
      avatarUrl,
      nickname,
      bio,
    } = body

    // 验证输入（邮箱和姓名现在是可选的，但账号和密码是必填的）
    if (!password || !username) {
      return NextResponse.json(
        { error: '请填写所有必填项（账号、密码）' },
        { status: 400 }
      )
    }

    // 检查账号是否已存在
    const existingByUsername = await prisma.user.findUnique({
      where: { username: username.trim() },
    })
    if (existingByUsername) {
      return NextResponse.json(
        { error: '该账号已被注册' },
        { status: 400 }
      )
    }

    // 如果提供了邮箱，检查邮箱格式和是否已存在
    let userEmail = email && email.trim() ? email : `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@temp.local`
    
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: '邮箱格式不正确' },
          { status: 400 }
        )
      }
      userEmail = email.trim()

      // 检查邮箱是否已存在
      const existingByEmail = await prisma.user.findUnique({
        where: { email: userEmail },
      })
      if (existingByEmail) {
        return NextResponse.json(
          { error: '该邮箱已被注册' },
          { status: 400 }
        )
      }
    } else {
      // 如果使用临时邮箱，需要检查是否已存在
      const existingByEmail = await prisma.user.findUnique({
        where: { email: userEmail },
      })
      if (existingByEmail) {
        // 如果临时邮箱已存在，生成新的
        userEmail = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@temp.local`
      }
    }

    // 检查密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少6位' },
        { status: 400 }
      )
    }

    // 创建用户（如果昵称为空，使用账号作为昵称）
    const userNickname = nickname && nickname.trim() ? nickname.trim() : (name && name.trim() ? name.trim() : username.trim())
    
    // 使用 bcrypt 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // 在数据库中创建用户
    const user = await prisma.user.create({
      data: {
        email: userEmail,
        username: username.trim(),
        password: hashedPassword,
        role: role || 'student',
        universityId: universityId || null,
        graduationYear: graduationYear ? String(graduationYear) : null,
        major: major || null,
        gender: gender || null,
        avatarUrl: avatarUrl || null,
        nickname: userNickname,
        bio: bio || null,
      },
    })

    // 返回用户信息（不包含密码）
    return NextResponse.json({
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.nickname || user.username || user.email, // 兼容旧代码，使用 nickname
      role: user.role,
      universityId: user.universityId,
      graduationYear: user.graduationYear,
      major: user.major,
      gender: user.gender,
      avatarUrl: user.avatarUrl,
      nickname: user.nickname,
      bio: user.bio,
    })
  } catch (error: any) {
    console.error('[register] error:', error)
    // 处理 Prisma 唯一约束错误
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: '该账号或邮箱已被注册' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error.message || '注册失败' },
      { status: 500 }
    )
  }
}


