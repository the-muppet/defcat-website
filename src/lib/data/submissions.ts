'use cache'

import { createClient } from '@/lib/supabase/server'

export async function getPendingSubmissionsCount() {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('deck_submissions')
    .select('*', { count: 'exact', head: true })
    .in('status', ['pending', 'queued'])

  if (error) {
    console.error('Failed to fetch pending submissions count:', error)
    return 0
  }

  return count || 0
}

export async function getPendingSubmissions() {
  const supabase = await createClient()

  const { data: submissions, error } = await supabase
    .from('deck_submissions')
    .select('*')
    .in('status', ['pending', 'queued'])
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch pending submissions:', error)
    return []
  }

  return submissions
}
