/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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

















