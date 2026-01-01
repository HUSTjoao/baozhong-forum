import Link from 'next/link'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">页面未找到</h2>
        <p className="text-gray-500 mb-8">抱歉，您访问的页面不存在。</p>
        <Link
          href="/"
          className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          <Home className="w-5 h-5 mr-2" />
          返回首页
        </Link>
      </div>
    </div>
  )
}


















