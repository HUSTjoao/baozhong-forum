import { NextResponse } from 'next/server'
import { GET as getQuestions } from '../route'
export { POST } from '../route'
export const dynamic = 'force-dynamic'
export async function GET(req: Request) {
  const response = await getQuestions(req)
  const body = await response.json()
  return NextResponse.json(response.ok ? { questions: body } : body, { status: response.status })
}
