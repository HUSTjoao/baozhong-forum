/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return ['/optimized-logos/:path*', '/optimized-campus/:path*'].map(source => ({ source, headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] }))
  },
  // 跳过 API 路由的构建时静态生成
  experimental: {
    ...(process.env.ECS_BUILD === '1' ? { cpus: 1 } : {}),
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

// Development and production builds must not overwrite each other's assets.
module.exports = (phase) => ({
  ...nextConfig,
  distDir: phase === require('next/constants').PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next',
})

















