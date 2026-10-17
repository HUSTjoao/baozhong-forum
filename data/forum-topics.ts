// Legacy categories remain readable under the simplified public topics.
export const forumTopics = [
 { name: '全部', label: '全部讨论', categories: [] as string[] },
 { name: '升学与专业', label: '升学与专业', categories: ['升学择校', '志愿填报', '专业选择', '升学与专业'] },
 { name: '学习与备考', label: '学习与备考', categories: ['复习备考', '学习攻略', '学习与备考'] },
 { name: '校园生活', label: '校园生活', categories: ['校园琐事', '大学生活', '校园生活'] },
 { name: '心情与成长', label: '心情与成长', categories: ['心理压力', '心理成长', '心情与成长'] },
 { name: '其他话题', label: '其他话题', categories: ['其他', '其他话题'] }
]
export const forumTopicOf = (category?: string | null) => forumTopics.slice(1).find(topic => topic.categories.includes(category || ''))?.name || '其他话题'
