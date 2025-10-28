import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function requireDeveloper() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'developer') {
    redirect('/')
  }
}
