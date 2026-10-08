import { redirect } from 'next/navigation'
export default function UniversityForumPage({ params }: { params: { id: string } }) {
  redirect('/universities/' + encodeURIComponent(params.id) + '#university-discussion')
}
