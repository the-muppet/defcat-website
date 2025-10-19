'use client'

import { createClient } from '@/lib/supabase/client';

const imgCache = new Map<string, string>()

export function getMedia(filename: string): string {
  if (imgCache.has(filename)) {
    return imgCache.get(filename)!
  }

  const supabase = createClient()
  const { data } = supabase.storage
    .from('media')
    .getPublicUrl(filename)

  imgCache.set(filename, data.publicUrl)
  return data.publicUrl
}