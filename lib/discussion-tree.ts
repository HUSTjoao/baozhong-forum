import type { Reply } from './api-client'

/** Accept both flat database replies and previously nested API responses. */
export function discussionTree(replies: Reply[]): Reply[] {
  const nodes = new Map<string, Reply>()
  const collect = (items: Reply[], parent?: string) => {
    for (const reply of items) {
      if (nodes.has(reply.id)) continue
      nodes.set(reply.id, { ...reply, parentReplyId: reply.parentReplyId || parent, children: [] })
      collect(reply.children || [], reply.id)
    }
  }
  collect(replies)
  const roots: Reply[] = []
  for (const reply of nodes.values()) {
    const parent = reply.parentReplyId && nodes.get(reply.parentReplyId)
    const ancestors = new Set([reply.id])
    let cursor = parent
    let cycle = false
    while (cursor) {
      if (ancestors.has(cursor.id)) { cycle = true; break }
      ancestors.add(cursor.id)
      cursor = cursor.parentReplyId && nodes.get(cursor.parentReplyId)
    }
    if (parent && !cycle) parent.children!.push(reply)
    else roots.push(reply)
  }
  return roots
}
