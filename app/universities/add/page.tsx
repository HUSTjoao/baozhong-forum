'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Plus, X, Upload } from 'lucide-react'
import { addUserUniversity } from '@/data/universities'
import { getUserById } from '@/data/users'
import { ALL_PROVINCES_CITIES, getCitiesByProvince } from '@/data/provinces-cities'
import RequireAuth from '@/components/RequireAuth'
import { BackButton } from '@/components/BackButton'
import { AlertDialog } from '@/components/Dialog'

export default function AddUniversityPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [formData, setFormData] = useState({
    name: '',
    level: '',
    province: '',
    city: '',
    location: '',
    description: '',
    motto: '',
    logoUrl: '',
    students: 0,
    majors: [] as string[],
  })
  const [newMajor, setNewMajor] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [descriptionLength, setDescriptionLength] = useState(0)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [selectedProvince, setSelectedProvince] = useState('')
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [alertConfig, setAlertConfig] = useState<{ title: string; message?: string } | null>(
    null
  )
  const [redirectAfterAlert, setRedirectAfterAlert] = useState(false)

  // 当省份改变时，更新城市列表
  useEffect(() => {
    if (selectedProvince) {
      const cities = getCitiesByProvince(selectedProvince)
      setAvailableCities(cities)
      setFormData(prev => ({ ...prev, province: selectedProvince, city: '', location: '' }))
    } else {
      setAvailableCities([])
      setFormData(prev => ({ ...prev, province: '', city: '', location: '' }))
    }
  }, [selectedProvince])

  // 当城市改变时，更新location
  useEffect(() => {
    if (selectedProvince && formData.city) {
      const location = selectedProvince === formData.city 
        ? formData.city 
        : `${selectedProvince}${formData.city}`
      setFormData(prev => ({ ...prev, location }))
    }
  }, [formData.city, selectedProvince])

  // 监控简介长度
  useEffect(() => {
    setDescriptionLength(formData.description.length)
  }, [formData.description])

  const showAlert = (title: string, message?: string, options?: { redirect?: boolean }) => {
    setAlertConfig({ title, message })
    setRedirectAfterAlert(!!options?.redirect)
  }

  // 处理校徽URL输入
  const handleLogoUrlChange = (url: string) => {
    setFormData({ ...formData, logoUrl: url })
    setLogoPreview(url)
  }

  // 处理校徽文件上传（转为base64）
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        showAlert('提示', '请选择图片文件')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        showAlert('提示', '图片大小不能超过5MB')
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        setFormData({ ...formData, logoUrl: base64 })
        setLogoPreview(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session?.user?.id) {
      showAlert('需要登录', '请先登录后再添加大学。')
      return
    }
    
    // 禁言用户无法提交
    if (session.user.id) {
      const me = getUserById(session.user.id)
      if (me?.isMuted) {
        showAlert('需要权限', '你已被管理员禁言，暂时无法提交新的大学信息。')
        return
      }
    }

    if (!formData.name) {
      showAlert('提示', '请填写大学名称')
      return
    }

    if (!formData.level) {
      showAlert('提示', '请选择大学等级')
      return
    }

    if (!selectedProvince || !formData.city) {
      showAlert('提示', '请选择省份和城市')
      return
    }

    if (!formData.description || formData.description.length < 100) {
      showAlert('提示', '请填写不少于100字的学校简介')
      return
    }

    if (formData.majors.length === 0) {
      showAlert('提示', '请至少添加一个专业')
      return
    }

    setIsSubmitting(true)

    try {
      addUserUniversity({
        name: formData.name,
        level: formData.level,
        location: formData.location,
        province: selectedProvince,
        city: formData.city,
        description: formData.description,
        motto: formData.motto || undefined,
        logoUrl: formData.logoUrl || undefined,
        students: formData.students || 0,
        majors: formData.majors,
        creatorId: session.user.id,
      })

      // 触发自定义事件，通知其他页面刷新
      window.dispatchEvent(new Event('universitiesUpdated'))
      
      showAlert('大学信息已提交', '您的申请已成功提交，请耐心等待管理员审核。审核通过后将正式发布。', { redirect: true })
    } catch (error) {
      console.error('Error adding university:', error)
      showAlert('添加失败', '保存时出现问题，请稍后重试。')
    } finally {
      setIsSubmitting(false)
    }
  }

  const addMajor = () => {
    if (newMajor.trim() && !formData.majors.includes(newMajor.trim())) {
      setFormData({
        ...formData,
        majors: [...formData.majors, newMajor.trim()],
      })
      setNewMajor('')
    }
  }

  const removeMajor = (major: string) => {
    setFormData({
      ...formData,
      majors: formData.majors.filter((m) => m !== major),
    })
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-[#f5f7ff] via-[#eef4ff] to-[#e6f7ff] py-12 px-4 relative overflow-hidden">
        <AlertDialog
          open={!!alertConfig}
          title={alertConfig?.title || ''}
          message={alertConfig?.message}
          onClose={() => {
            setAlertConfig(null)
            if (redirectAfterAlert) {
              setRedirectAfterAlert(false)
              router.push('/universities')
            }
          }}
        />
        {/* 背景柔光色块 */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full opacity-40 blur-[90px]"
            style={{
              background:
                'radial-gradient(circle at 30% 30%, rgba(59,130,246,0.45), transparent 60%)',
            }}
          />
          <div
            className="absolute -bottom-40 -right-40 h-[460px] w-[460px] opacity-40 blur-[90px]"
            style={{
              background:
                'radial-gradient(circle at 70% 70%, rgba(236,72,153,0.4), transparent 60%)',
            }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <BackButton href="/universities" label="返回大学列表" />

          <div className="rounded-2xl border border-white/70 bg-white/90 shadow-[0_20px_45px_rgba(15,23,42,0.12)] backdrop-blur-xl px-6 py-7 md:px-8 md:py-8">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                  自定义学校资料
                </div>
                <h1 className="mt-3 text-2xl md:text-3xl font-semibold text-slate-900">
                  添加大学
                </h1>
                <p className="mt-2 text-xs md:text-sm text-slate-500">
                  补充你熟悉的大学信息，帮助更多学弟学妹了解真实的校园与专业。
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 基本信息区域 */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-5 md:px-5 md:py-6">
                <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-4">
                  基本信息
                </h2>
                
                {/* 大学名称 */}
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    大学名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例如：北京大学"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    required
                  />
                </div>

                {/* 大学等级 */}
                <div className="mb-4">
                  <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                    大学等级 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="level"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    required
                  >
                    <option value="">请选择</option>
                    <option value="985/211">985/211</option>
                    <option value="985">985</option>
                    <option value="211/双一流">211/双一流</option>
                    <option value="211">211</option>
                    <option value="双一流">双一流</option>
                    <option value="省重点">省重点</option>
                    <option value="一本">一本</option>
                    <option value="二本">二本</option>
                    <option value="中外合作">中外合作</option>
                    <option value="其他">其他</option>
                  </select>
                </div>

                {/* 省份和城市 */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-2">
                      省份 <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="province"
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      required
                    >
                      <option value="">请选择省份</option>
                      {ALL_PROVINCES_CITIES.map((province) => (
                        <option key={province.name} value={province.name}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      城市 <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      disabled={!selectedProvince}
                      required
                    >
                      <option value="">请选择城市</option>
                      {availableCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 校徽和校训区域 */}
              <div className="rounded-xl border border-slate-100 bg-white/80 px-4 py-5 md:px-5 md:py-6">
                <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-4">
                  校徽与校训
                </h2>
                
                {/* 校徽 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    校徽图片
                  </label>
                  <div className="space-y-4">
                    {/* 图片预览 */}
                    {logoPreview && (
                      <div className="w-32 h-32 rounded-xl border border-gray-200 bg-slate-50/80 overflow-hidden shadow-sm">
                        <img
                          src={logoPreview}
                          alt="校徽预览"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const img = e.currentTarget as HTMLImageElement
                            img.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                    
                    {/* 上传文件 */}
                    <div>
                      <label className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white cursor-pointer hover:bg-primary-700 transition-colors shadow-sm">
                        <Upload className="w-4 h-4 mr-2" />
                        上传图片
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoFileChange}
                          className="hidden"
                        />
                      </label>
                      <span className="ml-3 text-sm text-gray-500">或</span>
                    </div>
                    
                    {/* URL输入 */}
                    <div>
                      <input
                        type="url"
                        value={formData.logoUrl}
                        onChange={(e) => handleLogoUrlChange(e.target.value)}
                        placeholder="输入图片URL（例如：https://example.com/logo.png）"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      />
                      <p className="mt-1 text-xs text-gray-500">支持上传本地图片或输入图片URL，建议尺寸：200x200px</p>
                    </div>
                  </div>
                </div>

                {/* 校训 */}
                <div>
                  <label htmlFor="motto" className="block text-sm font-medium text-gray-700 mb-2">
                    校训
                  </label>
                  <input
                    type="text"
                    id="motto"
                    value={formData.motto}
                    onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                    placeholder="例如：自强不息，厚德载物"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
              </div>

              {/* 学校简介区域 */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-5 md:px-5 md:py-6">
                <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-4">
                  学校简介
                </h2>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    学校简介 <span className="text-red-500">*</span>
                    <span className={`ml-2 text-sm ${descriptionLength < 100 ? 'text-red-500' : 'text-gray-500'}`}>
                      ({descriptionLength}/100字，至少100字)
                    </span>
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="请详细介绍这所大学，包括历史背景、办学特色、优势学科、培养人才情况等，不少于100字..."
                    rows={8}
                    minLength={100}
                    className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 ${
                      descriptionLength > 0 && descriptionLength < 100 ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {descriptionLength > 0 && descriptionLength < 100 && (
                    <p className="mt-1 text-sm text-red-500">简介至少需要100字，当前{descriptionLength}字</p>
                  )}
                </div>
              </div>

              {/* 热门专业区域 */}
              <div className="rounded-xl border border-slate-100 bg-white/80 px-4 py-5 md:px-5 md:py-6">
                <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-4">
                  热门专业
                </h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    热门专业 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newMajor}
                      onChange={(e) => setNewMajor(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addMajor()
                        }
                      }}
                      placeholder="输入专业名称后按回车或点击添加"
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                    <button
                      type="button"
                      onClick={addMajor}
                      className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors shadow-sm"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* 已添加的专业列表 */}
                  {formData.majors.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.majors.map((major) => (
                        <span
                          key={major}
                          className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs md:text-sm font-medium text-primary-700"
                        >
                          {major}
                          <button
                            type="button"
                            onClick={() => removeMajor(major)}
                            className="ml-2 hover:text-primary-900"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {formData.majors.length === 0 && (
                    <p className="text-sm text-gray-500">请至少添加一个专业</p>
                  )}
                </div>
              </div>

              {/* 提交按钮 */}
              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || descriptionLength < 100}
                  className="flex-1 rounded-xl bg-primary-600 px-6 py-3 text-sm md:text-base font-semibold text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '提交中...' : '提交'}
                </button>
                <Link
                  href="/universities"
                  className="rounded-xl border border-gray-300 px-6 py-3 text-sm md:text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  取消
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </RequireAuth>
  )
}
