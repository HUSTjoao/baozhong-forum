'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LogIn, Lock, User, Eye, EyeOff } from 'lucide-react'
// 用户数据已迁移到数据库，不再需要 localStorage
import { getAllUniversities, type University } from '@/data/universities'
import AuthCompanions from '@/components/auth/AuthCompanions'
import './login.css'

function LoginPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [callbackUrl, setCallbackUrl] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [identity, setIdentity] = useState<'gaoyi' | 'gaoer' | 'gaosan' | 'alumni'>('gaoyi')
  const isAlumni = identity === 'alumni'
  const [graduationYear, setGraduationYear] = useState('')
  const [major, setMajor] = useState('')
  const [nickname, setNickname] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [universities, setUniversities] = useState<University[]>([])
  const [schoolName, setSchoolName] = useState('')
  const [agreePromise, setAgreePromise] = useState(false)
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [privateEntry,setPrivateEntry] = useState(false)
  const [reaction,setReaction] = useState(0)
  const complain=(message:string)=>{setError(message);setReaction(v=>v+1)}
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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
      complain('请选择图片文件')
      return
    }
    // 原始文件限制一个上限（例如 5MB），避免超大原图
    if (file.size > 5 * 1024 * 1024) {
      complain('图片大小不能超过 5MB')
      return
    }

    try {
      const dataUrl = await compressImageToDataUrl(file, 200 * 1024)
      setAvatarUrl(dataUrl)
    } catch (err) {
      console.error(err)
      complain('头像压缩失败，请尝试选择分辨率更小的图片')
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
        complain('账号或密码错误')
      } else {
        const loggedIn = await getSession()
        const redirectUrl = loggedIn?.user?.role === 'admin' ? '/admin' : callbackUrl || '/'
        router.push(redirectUrl)
        router.refresh()
      }
    } catch {
      complain('登录失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!agreePromise) {
      complain('请先勾选承诺')
      return
    }
    if (password !== confirmPassword) {
      complain('两次输入的密码不一致')
      return
    }
    if (password.length < 6) {
      complain('密码长度至少6位')
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
          name: nickname.trim() || username,
          role: isAlumni ? 'alumni' : 'student',
          universityId: isAlumni && schoolName.trim()
            ? universities.find(uni => uni.name === schoolName.trim())?.id || schoolName.trim()
            : undefined,
          graduationYear: isAlumni ? (graduationYear ? Number(graduationYear) : undefined) : identity,
          major: isAlumni ? major.trim() || undefined : undefined,
          avatarUrl: isAlumni ? avatarUrl || undefined : undefined,
          nickname: nickname.trim() || undefined,
          bio: isAlumni ? bio.trim() || undefined : undefined,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        complain(data.error || '注册失败')
        return
      }

      // 数据已存储在数据库中，不需要同步到 localStorage
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 100)
      })

      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      })
      if (result?.error) {
        complain('注册成功，但自动登录失败，请手动登录')
      } else {
        const redirectUrl = callbackUrl || '/'
        router.push(redirectUrl)
        router.refresh()
      }
    } catch {
      complain('注册失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page" data-mode={mode} data-identity={identity} onFocusCapture={event=>setPrivateEntry((event.target as HTMLElement).dataset.private==='true')} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node))setPrivateEntry(false)}}>
     <div className="auth-composition">
      <div className="auth-illustration-garden" aria-hidden="true">
        {['dancing', 'running', 'moshing', 'coffee', 'reading-side', 'plant', 'loving', 'roller-skating', 'clumsy', 'dog-jump', 'sitting', 'unboxing', 'meditating', 'reading', 'rolling', 'selfie', 'swinging'].map((name, index) => (
          <img key={name} className={`auth-surround-scene scene-${index}`} src={`/illustrations/login/${name}.svg`} alt="" />
        ))}
      </div>
      <section className="auth-form-panel">
       <AuthCompanions privateEntry={privateEntry||(mode==='login'?showLoginPassword:showRegPassword||showRegConfirmPassword)} failed={!!error} reaction={reaction}/>
       <div className="auth-form-introduction">
        <h1 className="auth-form-brand">宝鸡中学高校论坛</h1>
        <p className="auth-form-intro">{mode==='login'?'登录，继续那些还没聊完的话。':'留下你的名字，认识更多同行的人。'}</p>

        <div className="auth-mode-switch flex mb-6 rounded-full bg-slate-100 p-1">
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

       </div>
       <div className="auth-form-content">
        {error && (
          <div role="alert" className="auth-form-error mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="auth-username" className="block text-xs font-medium text-slate-600 mb-1">账号</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  autoComplete="username" id="auth-username" value={username}
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
                  data-private="true" autoComplete="current-password" type={showLoginPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 pl-9 pr-9 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  placeholder="请输入密码"
                  required
                />
                <button
                  type="button"
                  aria-label={showLoginPassword?'隐藏密码':'显示密码'} aria-pressed={showLoginPassword} onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
            <div className="auth-register-fields">
              <div className="auth-field-wide auth-register-account">
                <label htmlFor="register-username">账号</label>
                <input id="register-username" autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="用于登录的账号" required />
              </div>
              <div>
                <label htmlFor="register-password">密码</label>
                <div className="relative">
                  <input id="register-password" data-private="true" autoComplete="new-password" type={showRegPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="至少 6 位" minLength={6} required className="pr-10" />
                  <button type="button" aria-label={showRegPassword ? '隐藏密码' : '显示密码'} aria-pressed={showRegPassword} onClick={() => setShowRegPassword(!showRegPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="register-confirm">确认密码</label>
                <div className="relative">
                  <input id="register-confirm" data-private="true" autoComplete="new-password" type={showRegConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="再次输入密码" minLength={6} required className="pr-10" />
                  <button type="button" aria-label={showRegConfirmPassword ? '隐藏确认密码' : '显示确认密码'} aria-pressed={showRegConfirmPassword} onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showRegConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="auth-register-nickname">
                <label htmlFor="register-nickname">昵称（选填）</label>
                <input id="register-nickname" value={nickname} onChange={e => setNickname(e.target.value)} placeholder="留空使用账号" />
              </div>
              <div className="auth-register-identity">
                <label htmlFor="register-role">身份</label>
                <select id="register-role" value={identity} onChange={e => setIdentity(e.target.value as typeof identity)}>
                  <option value="gaoyi">高一</option>
                  <option value="gaoer">高二</option>
                  <option value="gaosan">高三</option>
                  <option value="alumni">毕业生</option>
                </select>
              </div>
            </div>
            {isAlumni && <details className="auth-optional-profile">
              <summary>补充个人资料 <span>全部选填</span></summary>
              <div className="auth-register-fields">
                <div>
                  <label htmlFor="register-year">毕业年份（选填）</label>
                  <select id="register-year" value={graduationYear} onChange={e => setGraduationYear(e.target.value)}>
                    <option value="">暂不填写</option>
                    {Array.from({ length: new Date().getFullYear() - 1994 }, (_, i) => new Date().getFullYear() - i).map(year => <option key={year} value={year}>{year} 年</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="register-school">学校（选填）</label>
                  <input id="register-school" autoComplete="organization" value={schoolName} onChange={e => setSchoolName(e.target.value)} maxLength={100} placeholder="输入你的学校名称" />
                </div>
                <div className="auth-field-wide">
                  <label htmlFor="register-major">专业（选填）</label>
                  <input id="register-major" value={major} onChange={e => setMajor(e.target.value)} placeholder="例如：计算机科学与技术" />
                </div>
                <div className="auth-field-wide auth-profile-avatar">
                  <button type="button" onClick={() => fileInputRef.current?.click()} aria-label="上传头像" className="auth-avatar-upload">
                    {avatarUrl ? <img src={avatarUrl} alt="预览头像" /> : <User size={24} />}
                  </button>
                  <div>头像（选填）<small>点击上传，也可以稍后再添加。</small></div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </div>
                <div className="auth-field-wide">
                  <label htmlFor="register-bio">自我介绍（选填）</label>
                  <textarea id="register-bio" value={bio} onChange={e => setBio(e.target.value)} rows={2} maxLength={200} placeholder="说说你的兴趣或学习方向" />
                </div>
              </div>
            </details>}
            <label className="auth-registration-promise">
              <input type="checkbox" checked={agreePromise} onChange={e => setAgreePromise(e.target.checked)} />
              <span>我承诺遵守法律法规，对自己在论坛上的言论负责。</span>
            </label>
            <button type="submit" disabled={isLoading || !agreePromise}>
              {isLoading ? '注册中...' : '完成注册，进入论坛'}
            </button>
          </form>
        )}

       </div>
      </section>
     </div>
    </div>
  )
}

// 包一层 Suspense，满足 Next.js 对 useSearchParams 的要求
export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  )
}


