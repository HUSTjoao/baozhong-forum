'use client'

import { useState, useEffect, useRef } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { LogIn, Lock, User, Eye, EyeOff, Shield } from 'lucide-react'
import { getUsers, saveUsers } from '@/data/users'
import { getAllUniversities, type University } from '@/data/universities'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const ADMIN_PASSWORD = 'qiaoerhaoniubi'

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [callbackUrl, setCallbackUrl] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'student' | 'alumni'>('student')
  const [graduationYear, setGraduationYear] = useState('')
  const [major, setMajor] = useState('')
  const [gender, setGender] = useState<'' | 'male' | 'female' | 'prefer-not-to-say'>('')
  const [nickname, setNickname] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [universities, setUniversities] = useState<University[]>([])
  const [schoolOption, setSchoolOption] = useState('')
  const [agreePromise, setAgreePromise] = useState(false)
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [showAdminEntry, setShowAdminEntry] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [adminError, setAdminError] = useState('')

  useEffect(() => {
    let callback: string | null = null
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      callback = params.get('callbackUrl')
    }
    if (!callback && searchParams) {
      callback = searchParams.get('callbackUrl')
    }
    if (callback) {
      try {
        setCallbackUrl(decodeURIComponent(callback))
      } catch {
        setCallbackUrl(callback)
      }
    }
  }, [searchParams])

  // 加载大学列表（供学校选择，选填）
  useEffect(() => {
    setUniversities(getAllUniversities())
  }, [])

  const handleAdminEnter = (e: React.FormEvent) => {
    e.preventDefault()
    setAdminError('')
    if (!adminPassword.trim()) {
      setAdminError('请输入管理员密码')
      return
    }
    if (adminPassword !== ADMIN_PASSWORD) {
      setAdminError('管理员密码不正确')
      return
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('bz_forum_admin', 'true')
    }
    router.push('/admin')
  }

  // 将头像图片压缩到 200KB 以内（优先缩放分辨率，其次降低 JPEG 质量）
  const compressImageToDataUrl = (file: File, maxBytes = 200 * 1024): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          // 多档尺寸，逐级尝试
          const maxSides = [512, 384, 256]
          const tryCompress = (index: number): string | null => {
            if (index >= maxSides.length) return null
            const maxSide = maxSides[index]

            let width = img.width
            let height = img.height
            if (width > height) {
              if (width > maxSide) {
                height = Math.round((height * maxSide) / width)
                width = maxSide
              }
            } else {
              if (height > maxSide) {
                width = Math.round((width * maxSide) / height)
                height = maxSide
              }
            }

            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            if (!ctx) return null

            ctx.clearRect(0, 0, width, height)
            ctx.drawImage(img, 0, 0, width, height)

            let quality = 0.9
            let bestDataUrl = canvas.toDataURL('image/jpeg', quality)

            // 逐步降低质量，直到小于目标大小或到达下限
            while (quality >= 0.4) {
              const approxBytes = Math.round(bestDataUrl.length * 0.75) // base64 长度估算
              if (approxBytes <= maxBytes) {
                return bestDataUrl
              }
              quality -= 0.1
              bestDataUrl = canvas.toDataURL('image/jpeg', quality)
            }

            // 本轮无法压到目标大小，尝试更小尺寸
            return tryCompress(index + 1)
          }

          const result = tryCompress(0)
          if (!result) {
            reject(new Error('图片过大，压缩失败'))
          } else {
            resolve(result)
          }
        }
        img.onerror = () => reject(new Error('图片加载失败'))
        img.src = event.target?.result as string
      }
      reader.onerror = () => reject(new Error('图片读取失败'))
      reader.readAsDataURL(file)
    })
  }

  const handleAvatarChange = async (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件')
      return
    }
    // 原始文件限制一个上限（例如 5MB），避免超大原图
    if (file.size > 5 * 1024 * 1024) {
      setError('图片大小不能超过 5MB')
      return
    }

    try {
      const dataUrl = await compressImageToDataUrl(file, 200 * 1024)
      setAvatarUrl(dataUrl)
    } catch (err) {
      console.error(err)
      setError('头像压缩失败，请尝试选择分辨率更小的图片')
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      })
      if (result?.error) {
        setError('账号或密码错误')
      } else {
        const redirectUrl = callbackUrl || '/'
        router.push(redirectUrl)
        router.refresh()
      }
    } catch {
      setError('登录失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!agreePromise) {
      setError('请先勾选承诺')
      return
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }
    if (password.length < 6) {
      setError('密码长度至少6位')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          name: nickname || username,
          role,
          universityId:
            schoolOption && schoolOption !== '__other' ? schoolOption : undefined,
          graduationYear: graduationYear
            ? (['gaoyi', 'gaoer', 'gaosan', 'non-baozhong'].includes(graduationYear)
                ? graduationYear
                : Number(graduationYear))
            : undefined,
          major: major || undefined,
          gender: gender || undefined,
          avatarUrl: avatarUrl || undefined,
          nickname: nickname || undefined,
          bio: bio || undefined,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || '注册失败')
        return
      }

      // 同步到本地 users，保持和原来逻辑一致
      try {
        const allUsers = getUsers()
        const newUser = {
          id: data.id,
          email: data.email,
          username: data.username,
          name: data.name,
          password,
          role: data.role,
          universityId: data.universityId,
          graduationYear: data.graduationYear,
          major: data.major,
          gender: data.gender,
          avatarUrl: data.avatarUrl,
          nickname: data.nickname,
          bio: data.bio,
          alumniMessage: data.alumniMessage,
          createdAt: new Date().toISOString(),
        }
        const existingIndex = allUsers.findIndex(
          (u: any) => u.id === newUser.id || u.username === newUser.username
        )
        if (existingIndex >= 0) {
          allUsers[existingIndex] = newUser
        } else {
          allUsers.push(newUser)
        }
        saveUsers(allUsers)
      } catch (err) {
        console.error('Error syncing user data to client:', err)
      }

      await new Promise<void>((resolve) => {
        setTimeout(resolve, 100)
      })

      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      })
      if (result?.error) {
        setError('注册成功，但自动登录失败，请手动登录')
      } else {
        const redirectUrl = callbackUrl || '/'
        router.push(redirectUrl)
        router.refresh()
      }
    } catch {
      setError('注册失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#f5f7fe] via-[#eef4ff] to-[#e6f7ff]">
      <div className="max-w-md w-full bg-white/95 rounded-2xl shadow-xl px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1 text-center">宝鸡中学高校论坛</h1>
        <p className="text-center text-slate-500 mb-6 text-sm">
          {mode === 'login' ? '登录进入校园论坛' : '注册账号，加入高校学长学姐社区'}
        </p>

        <div className="flex mb-6 rounded-full bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setError('')
            }}
            className={`flex-1 py-2 text-sm rounded-full ${
              mode === 'login' ? 'bg-white shadow text-primary-700 font-semibold' : 'text-slate-500'
            }`}
          >
            登录
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register')
              setError('')
            }}
            className={`flex-1 py-2 text-sm rounded-full ${
              mode === 'register'
                ? 'bg-white shadow text-primary-700 font-semibold'
                : 'text-slate-500'
            }`}
          >
            注册
          </button>
        </div>

        {/* 管理员入口开关 */}
        <div className="mb-4 flex items-center justify-end">
          <button
            type="button"
            onClick={() => {
              setShowAdminEntry((prev) => !prev)
              setAdminError('')
            }}
            className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-primary-600 transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>管理员入口</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* 管理员密码输入区域 */}
        {showAdminEntry && (
          <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-3 text-xs text-amber-800">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4" />
              <span className="font-semibold">管理员快速入口</span>
            </div>
            <p className="mb-2 text-[11px] text-amber-700">
              输入管理员专用密码后，可进入后台审核和管理内容。本入口仅对可信管理员开放。
            </p>
            <form onSubmit={handleAdminEnter} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Lock className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-amber-400" />
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full rounded-md border border-amber-200 bg-white px-6 py-1.5 text-xs outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200"
                  placeholder="输入管理员密码"
                />
              </div>
              <button
                type="submit"
                className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 transition-colors"
              >
                进入后台
              </button>
            </form>
            {adminError && (
              <p className="mt-1 text-[11px] text-red-600">
                {adminError}
              </p>
            )}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">账号</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  placeholder="请输入账号"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 pl-9 pr-9 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  placeholder="请输入密码"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-gradient-to-r from-[#005BAC] to-[#0066CC] py-2.5 text-sm font-semibold text-white shadow-md hover:from-[#004A8C] hover:to-[#0055AA] transition disabled:bg-slate-400"
            >
              {isLoading ? '登录中...' : '登 录'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            {/* 头像放在最上方：点击圆形直接上传 */}
            <div className="flex flex-col items-center gap-2 pb-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative h-20 w-20 rounded-full border-2 border-primary-100 bg-slate-100 overflow-hidden flex items-center justify-center shadow-sm cursor-pointer hover:border-primary-300 hover:shadow-md transition-all"
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="预览头像" className="h-full w-full object-cover" />
                ) : nickname ? (
                  <span className="text-2xl font-semibold text-primary-500">
                    {nickname.trim().charAt(0)}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">上传头像</span>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* 账号与密码 */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">账号</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    placeholder="用于登录的账号"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 pl-9 pr-9 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    placeholder="至少 6 位"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">确认密码</label>
                <div className="relative">
                  <input
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 pr-9 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    placeholder="再次输入密码"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showRegConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 学校（选填，包含其他，仅学长/学姐显示） */}
            {role === 'alumni' && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">学校（选填）</label>
                <select
                  value={schoolOption}
                  onChange={(e) => setSchoolOption(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                >
                  <option value="">不选择学校</option>
                  {universities.map((uni) => (
                    <option key={uni.id} value={uni.id}>
                      {uni.name}
                    </option>
                  ))}
                  <option value="__other">其他（不在列表）</option>
                </select>
              </div>
            )}

            {/* 基本信息 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">昵称</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  placeholder="在论坛中展示的名字，可留空使用账号"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">身份</label>
                <select
                  value={role}
                  onChange={(e) => {
                    const nextRole = e.target.value as 'student' | 'alumni'
                    setRole(nextRole)
                    setGraduationYear('')
                    if (nextRole === 'student') {
                      setSchoolOption('')
                      setMajor('')
                    }
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                >
                  <option value="student">学生</option>
                  <option value="alumni">
                    {gender === 'female' ? '学姐' : gender === 'male' ? '学长' : '学长/学姐'}
                  </option>
                </select>
              </div>
            </div>

            {/* 年级 / 毕业年份 + 专业 + 性别 */}
            {role === 'student' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">年级</label>
                  <select
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  >
                    <option value="">请选择</option>
                    <option value="gaoyi">高一</option>
                    <option value="gaoer">高二</option>
                    <option value="gaosan">高三</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">性别（选填）</label>
                  <select
                    value={gender}
                    onChange={(e) =>
                      setGender(e.target.value as '' | 'male' | 'female' | 'prefer-not-to-say')
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  >
                    <option value="">不选择</option>
                    <option value="male">男</option>
                    <option value="female">女</option>
                    <option value="prefer-not-to-say">不愿透露</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">毕业年份</label>
                  <select
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  >
                    <option value="">请选择</option>
                    <option value="non-baozhong">非宝中毕业生</option>
                    {Array.from(
                      { length: new Date().getFullYear() - 1994 },
                      (_, idx) => 1995 + idx
                    )
                      .reverse()
                      .map((year) => (
                        <option key={year} value={year}>
                          {year}届
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    专业<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    placeholder="例如：计算机科学与技术"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">性别（选填）</label>
                  <select
                    value={gender}
                    onChange={(e) =>
                      setGender(e.target.value as '' | 'male' | 'female' | 'prefer-not-to-say')
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  >
                    <option value="">不选择</option>
                    <option value="male">男</option>
                    <option value="female">女</option>
                    <option value="prefer-not-to-say">不愿透露</option>
                  </select>
                </div>
              </div>
            )}

            {/* 自我介绍 */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">自我介绍（选填）</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={200}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 resize-none"
                placeholder="可以写学科方向、兴趣爱好等，让同学更了解你"
              />
            </div>

            {/* 承诺勾选 */}
            <div className="flex items-start gap-2 rounded-md bg-slate-50 px-3 py-2 border border-slate-100">
              <input
                type="checkbox"
                checked={agreePromise}
                onChange={(e) => setAgreePromise(e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <p className="text-[11px] leading-relaxed text-slate-600">
                作为宝鸡中学学生，我承诺遵守法律法规，对自己在论坛上的一切言论负责。
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !agreePromise}
              className="w-full rounded-lg bg-gradient-to-r from-[#005BAC] to-[#0066CC] py-2.5 text-sm font-semibold text-white shadow-md hover:from-[#004A8C] hover:to-[#0055AA] transition disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {isLoading ? '注册中...' : '完成注册，进入论坛'}
            </button>
          </form>
        )}

        <div className="mt-4 text-center text-xs text-slate-400">
          <Link href="/" className="hover:text-primary-600">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}


