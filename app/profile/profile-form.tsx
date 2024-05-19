'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { type User } from '@supabase/supabase-js'
import Avatar from './avatar'

export default function ProfileForm({ user }: { user: User | null }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [fullname, setFullname] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [avatar_url, setAvatarUrl] = useState<string | null>(null)

  const getProfile = useCallback(async () => {
    try {
      setLoading(true)

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`full_name, username, avatar_url`)
        .eq('id', user?.id)
        .maybeSingle()

      if (error && status !== 406) {
        console.log(error)
        throw error
      }

      if (data) {
        setFullname(data.full_name)
        setUsername(data.username)
        setAvatarUrl(data.avatar_url)
      }
    } catch (error) {
      alert('Error loading user data!')
      console.log(error)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    getProfile()
  }, [user, getProfile])

  async function updateProfile({
    fullname,
    username,
    avatar_url,
  }: {
    username: string | null
    fullname: string | null
    avatar_url: string | null
  }) {
    try {
      setLoading(true)

      const { error } = await supabase.from('profiles').upsert({
        id: user?.id as string,
        full_name: fullname,
        username,

        avatar_url,
        updated_at: new Date().toISOString(),
      })

      const { error: user_data_error } = await supabase
        .from('user_data')
        .upsert({
          id: user?.id as string,

          updated_at: new Date().toISOString(),
        })
      if (error) throw error
      if (user_data_error) throw user_data_error

      alert('Profile updated!')
    } catch (error) {
      alert('Error updating the data!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="flex justify-center items-center p-5 min-h-screen flex-col">
      <div className="md:w-1/3 mx-auto">
        <Avatar
          uid={user?.id ?? null}
          url={avatar_url}
          size={150}
          onUpload={(url) => {
            setAvatarUrl(url)
            updateProfile({
              fullname,
              username,
              avatar_url: url,
            })
          }}
        />
        <input
          className="input input-bordered w-full mb-5"
          id="email"
          type="text"
          value={user?.email}
          disabled
        />

        <input
          className="input input-bordered w-full mb-5"
          id="fullName"
          placeholder="full name"
          type="text"
          value={fullname || ''}
          onChange={(e) => setFullname(e.target.value)}
        />

        <input
          className="input input-bordered w-full mb-5"
          id="username"
          placeholder="username"
          type="text"
          value={username || '@'}
          onChange={(e) => setUsername(e.target.value)}
        />

        <button
          className="btn mb-5 w-full"
          onClick={() =>
            updateProfile({
              fullname,
              username,
              avatar_url,
            })
          }
          disabled={loading}
        >
          {loading ? 'Loading ...' : 'Update'}
        </button>

        <form action="/auth/signout" method="post">
          <button className="btn btn-error w-full" type="submit">
            Sign out
          </button>
        </form>
      </div>
    </section>
  )
}
