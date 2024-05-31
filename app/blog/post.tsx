'use client'

import Loading from '@/components/Loading'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Post({
  post,
  page,
}: {
  post: {
    id: number
    title: string
    content: string
    poster_url: string | null
    author_id: string | null
    author_avatar_url: string | null
    author_full_name: string | null
    created_at: Date
  } | null
  page?: boolean
}) {
  const supabase = createClient()

  const [posterUrl, setPosterUrl] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  async function downloadImage(path: string, source: 'avatars' | 'posters') {
    try {
      const { data, error } = await supabase.storage.from(source).download(path)
      if (error) {
        throw error
      }

      const url = URL.createObjectURL(data)

      switch (source) {
        case 'avatars':
          setAvatarUrl(url)
          break
        case 'posters':
          setPosterUrl(url)
          break
      }
    } catch (error) {
      console.log('Error downloading image: ', error)
    }
  }

  useEffect(() => {
    if (post?.poster_url) {
      downloadImage(post.poster_url, 'posters')
    }

    if (post?.author_avatar_url) {
      downloadImage(post.author_avatar_url, 'avatars')
    }
  }, [post?.id, supabase])

  return (
    <Link
      href={'/blog/posts/' + post?.id}
      className="hover:scale-110 transition-all"
    >
      <div className="card">
        <figure className="px-5 pt-5">
          {posterUrl ? (
            <Image
              src={posterUrl || '/post_default.png'}
              alt={post?.title || 'poster'}
              width={300}
              height={300}
              className="rounded-xl h-60 object-cover"
              loading="lazy"
            />
          ) : (
            <Loading size={240} />
          )}
        </figure>
        <div className="card-body items-center text-center">
          <div className="flex items-center mb-5">
            {posterUrl ? (
              <Image
                src={avatarUrl || '/user_default.png'}
                alt={post?.author_avatar_url || ''}
                width={40}
                height={40}
                className="rounded-full overflow-hidden w-10 h-10 object-center object-cover"
              />
            ) : (
              <Loading size={40} />
            )}
            <span className="px-5">{post?.author_full_name}</span>
          </div>
          <h2 className="card-title">{post?.title}</h2>
          {post?.created_at && page && (
            <span className="text-xs">
              {String(new Date(post?.created_at).toDateString())}
            </span>
          )}
          <p
            className={`w-full py-5 ${page ? 'md:w-2/3 text-left' : 'truncate'}`}
          >
            {post?.content}
          </p>
        </div>
      </div>
    </Link>
  )
}
