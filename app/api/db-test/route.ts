// 暂时移除实际数据库访问逻辑，避免影响现有站点运行。
// 这里只保留一个占位接口，后续真正上云时再改为使用 Prisma 访问云数据库。

export async function GET() {
  return new Response(
    JSON.stringify({
      ok: true,
      message: '数据库结构已同步到 Supabase，当前站点仍使用本地存储运行。',
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    }
  )
}

