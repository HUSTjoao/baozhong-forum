import type { ProfileData } from '@/lib/profile'

// Development-only design preview. These people and activities are fictional.
export const exampleProfile: ProfileData = {
  user: { id: 'preview', name: '林间', nickname: '林间', role: 'alumni', universityId: 'hust', graduationYear: '2023', major: '计算机科学与技术', avatarUrl: '/illustrations/login/selfie.svg', bio: '从宝鸡到武汉，正在学习把好奇心写成代码。\n喜欢骑车、旧书和傍晚的操场。关于大学生活，欢迎来问。', createdAt: '2026-09-01T08:00:00+08:00' },
  isOwner: true,
  stats: { questions: 2, replies: 2, letters: 1, likes: 26 },
  activities: [
    { id: 'preview-reply-1', kind: 'reply', title: '学计算机之前，一定要会编程吗？', content: '不用。很多同学也是入学之后才写下第一行代码。比起提前学完一门语言，我觉得愿意耐心拆解问题、在出错后继续试一次，更重要。你可以先做一个很小的作品，看看自己是不是喜欢这个过程。', date: '2026-10-12T09:20:00+08:00', likes: 8, replies: 0, href: '', label: '专业选择' },
    { id: 'preview-letter-1', kind: 'letter', title: '写给还在晚自习的你', content: '你不必在十八岁的时候，交出一份关于一生的标准答案。\n\n认真做好今天能做的事，保持好奇，慢慢试。等你走到更远的地方，也别忘了给家里打个电话。', date: '2026-10-11T20:10:00+08:00', likes: 9, replies: 0, href: '', label: '一封寄语' },
    { id: 'preview-question-1', kind: 'question', title: '如果重来一次，你还会选择现在的专业吗？', content: '入学前想象的专业，和真正读起来的感受会不会很不一样？想听听大家在哪个瞬间，觉得自己的选择是值得的。', date: '2026-10-10T16:40:00+08:00', likes: 4, replies: 3, href: '', label: '专业选择' },
    { id: 'preview-reply-2', kind: 'reply', title: '第一次离开宝鸡去上大学，需要准备些什么？', content: '带上日常必需品就好，很多东西到学校之后再买也来得及。比行李更值得准备的，是愿意主动和新同学说第一句话的勇气。', date: '2026-10-09T18:30:00+08:00', likes: 3, replies: 0, href: '', label: '大学生活' },
    { id: 'preview-question-2', kind: 'question', title: '在大学里，你最喜欢的一处地方是哪里？', content: '我的答案是图书馆一楼靠窗的位置。阳光好的时候，连不太会做的题也变得没那么让人着急。', date: '2026-10-08T10:00:00+08:00', likes: 2, replies: 2, href: '', label: '大学生活' },
  ],
  applications: [],
}
