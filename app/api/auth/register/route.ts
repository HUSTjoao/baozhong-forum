import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserByEmail, getUserByUsername } from '@/data/users'

export async function POST(request: NextRequest) {
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
      alumniMessage,
    } = body

    // 验证输入（邮箱和姓名现在是可选的，但账号和密码是必填的）
    if (!password || !username) {
      return NextResponse.json(
        { error: '请填写所有必填项（账号、密码）' },
        { status: 400 }
      )
    }

    // 检查账号是否已存在
    if (getUserByUsername(username)) {
      return NextResponse.json(
        { error: '该账号已被注册' },
        { status: 400 }
      )
    }

    // 如果提供了邮箱，检查邮箱格式
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: '邮箱格式不正确' },
          { status: 400 }
        )
      }

      // 检查邮箱是否已存在
      if (getUserByEmail(email)) {
        return NextResponse.json(
          { error: '该邮箱已被注册' },
          { status: 400 }
        )
      }
    }

    // 检查密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少6位' },
        { status: 400 }
      )
    }

    // 创建用户（如果邮箱为空，使用临时邮箱；如果姓名为空，使用账号作为姓名）
    const userEmail = email && email.trim() ? email : `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@temp.local`
    const userName = name && name.trim() ? name : username.trim()
    
    // 在服务端创建用户
    const user = createUser({
      email: userEmail,
      username: username.trim(),
      password, // 实际应用中应该使用bcrypt加密
      name: userName,
      role: role || 'student',
      universityId,
      graduationYear,
      major,
      gender,
      avatarUrl,
      nickname,
      bio,
      alumniMessage,
    })

    // 返回用户信息（不包含密码）以及同步提示
    return NextResponse.json({
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
      universityId: user.universityId,
      graduationYear: user.graduationYear,
      major: user.major,
      gender: user.gender,
      avatarUrl: user.avatarUrl,
      nickname: user.nickname,
      bio: user.bio,
      alumniMessage: user.alumniMessage,
      syncMessage: '请在客户端同步数据',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '注册失败' },
      { status: 500 }
    )
  }
}


