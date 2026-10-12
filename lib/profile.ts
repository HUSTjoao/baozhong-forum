export interface ProfileUser {
  id: string
  name: string
  nickname: string | null
  role: string | null
  universityId: string | null
  graduationYear: string | null
  major: string | null
  avatarUrl: string | null
  bio: string | null
  createdAt: string
}

export interface ProfileActivity {
  id: string
  kind: 'question' | 'reply' | 'letter'
  title: string
  content: string
  date: string
  likes: number
  replies: number
  href: string
  label: string
  anonymous?: boolean
  pending?: boolean
}

export interface ProfileData {
  user: ProfileUser
  isOwner: boolean
  stats: { questions: number; replies: number; letters: number; likes: number }
  activities: ProfileActivity[]
  applications: { id: string; name: string; kind: 'university' | 'major'; status: string }[]
}

export function profileIdentity(user: ProfileUser) {
  if (user.role === 'admin') return '管理员'
  if (user.role === 'alumni') return user.graduationYear ? `${user.graduationYear} 届毕业生` : '毕业生'
  const grades: Record<string, string> = { gaoyi: '高一', gaoer: '高二', gaosan: '高三' }
  return grades[user.graduationYear || ''] || '在校生'
}
