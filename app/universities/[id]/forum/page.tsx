import { redirect } from 'next/navigation'
export default async function UniversityForumPage({ params: routeParams }: { params: Promise<{ id: string }> }) {
  const params = await routeParams
  redirect('/universities/' + encodeURIComponent(params.id) + '#university-discussion')
}
