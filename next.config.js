/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 跳过 API 路由的构建时静态生成
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig

















