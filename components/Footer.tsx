'use client'

import { Mail, MessageCircle, ArrowRight, ArrowUp } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()

  // 如果是管理员相关页面，不显示通用页脚
  if (pathname?.startsWith('/admin')) {
    return null
  }
  return (
    <div className="bg-[#020617] relative overflow-hidden">
      {/* 背景柔光层 */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-32 w-72 h-72 rounded-full bg-primary-500/25 blur-3xl" />
        <div className="absolute -bottom-24 right-0 w-80 h-80 rounded-full bg-sky-500/20 blur-3xl" />
      </div>

      <footer className="text-white py-10 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-10">
            {/* 关于我们 */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">关于我们</h3>
              <div className="w-8 h-0.5 bg-primary-500 mb-4 rounded-full"></div>
              <p className="text-sm text-slate-400 leading-relaxed">
                每一个优秀的宝中人，都是一颗散落在世界各地的星火。
                在这里，我们汇聚成光。
              </p>
            </div>

            {/* 快速链接 */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">快速链接</h3>
              <div className="w-8 h-0.5 bg-primary-500 mb-4 rounded-full"></div>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a
                    href="/universities"
                    className="group flex items-center hover:text-white transition-colors"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 text-primary-300 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary-200" />
                    大学介绍
                  </a>
                </li>
                <li>
                  <a
                    href="/forum"
                    className="group flex items-center hover:text-white transition-colors"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 text-primary-300 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary-200" />
                    问答论坛
                  </a>
                </li>
                <li>
                  <a
                    href="/majors"
                    className="group flex items-center hover:text-white transition-colors"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 text-primary-300 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary-200" />
                    浏览专业
                  </a>
                </li>
              </ul>
            </div>

            {/* 联系我们 */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">联系我们</h3>
              <div className="w-8 h-0.5 bg-primary-500 mb-4 rounded-full"></div>
              <div className="space-y-3 text-sm text-slate-400">
                <div className="flex items-center">
                  <MessageCircle
                    className="w-4 h-4 mr-3 text-sky-300 flex-shrink-0"
                    strokeWidth={1.6}
                  />
                  <span>QQ：1750453328</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-3 text-sky-300 flex-shrink-0" strokeWidth={1.6} />
                  <a
                    href="mailto:erhao2007@gmail.com"
                    className="hover:text-white transition-colors"
                  >
                    erhao2007@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 底部版权 + 回到顶部 */}
          <div className="border-t border-white/10 mt-8 pt-6 flex flex-col items-center gap-4 text-xs md:text-sm text-slate-500 text-center">
            <div className="space-y-1">
              <p className="text-slate-400">
                &copy; 2007HUSTjoão. 保留所有权利
              </p>
              <p className="text-slate-500">
                网站制作于新旧岁序之交
              </p>
              <p className="text-slate-500">
                湖北·武汉 华中科技大学
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }
              }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-600/60 px-4 py-2 text-xs font-medium text-slate-200 hover:text-white hover:border-primary-400 hover:bg-primary-500/10 transition-all"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              回到顶部
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}


