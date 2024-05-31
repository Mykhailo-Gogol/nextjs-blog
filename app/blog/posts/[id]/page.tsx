import { createClient } from '@/utils/supabase/client'
import { createClient as createServerClient } from '@/utils/supabase/server'
import Post from '../../post'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  const supabase = createClient()
  const { data } = await supabase.from('posts').select(`id`)

  return (
    data?.map((post) => ({
      post: post.id,
    })) || []
  )
}

export default async function PostById({ params }: { params: { id: number } }) {
  const supabase = createServerClient()

  const { data } = await supabase
    .from('posts')
    .select(
      `id, title, content, poster_url, author_id, author_avatar_url, author_full_name, created_at`
    )
    .eq('id', params.id)
    .single()

  return (
    <div>
      <Post post={data} page />
    </div>
  )
}
