'use client'

import { CheckCircle, ClipboardList, Loader2, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GlowingEffect } from '@/components/ui/glowEffect'
import { createClient } from '@/lib/supabase/client'
import { ColorIdentity } from '@/types/colors'

interface PendingSubmission {
  id: string
  created_at: string
  email: string
  moxfield_username: string | null
  discord_username: string | null
  patreon_tier: string
  commander: string | null
  color_preference: string | null
  theme: string | null
  bracket: string | null
  budget: string | null
  coffee_preference: string | null
  ideal_date: string | null
  mystery_deck: boolean
  status: string
}

export function PendingSubmissions() {
  const [submissions, setSubmissions] = useState<PendingSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    loadSubmissions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadSubmissions() {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('deck_submissions')
      .select('*')
      .in('status', ['pending', 'queued'])
      .order('created_at', { ascending: true })

    if (!error && data) {
      setSubmissions(data)
    }
    setLoading(false)
  }

  async function updateStatus(id: string, newStatus: string) {
    setUpdating(id)
    const supabase = createClient()

    // Get session token for API authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      console.error('No session found')
      setUpdating(null)
      return
    }

    // Use API route for admin operations
    const response = await fetch(`/api/admin/submissions/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    })

    if (response.ok) {
      await loadSubmissions()
    } else {
      const error = await response.json()
      console.error('Failed to update submission:', error)
    }

    setUpdating(null)
  }

  if (loading) {
    return (
      <div className="relative rounded-2xl border p-2 md:rounded-3xl md:p-3">
        <GlowingEffect
          blur={0}
          borderWidth={3}
          spread={80}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
        />
        <Card className="card-glass border-0 relative">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Pending Submissions
            </CardTitle>
            <CardDescription>Deck requests awaiting review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative rounded-2xl border p-2 md:rounded-3xl md:p-3">
      <GlowingEffect
        blur={0}
        borderWidth={3}
        spread={80}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
      />
      <Card className="card-tinted border-0 relative">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Pending Submissions
          </CardTitle>
          <CardDescription>
            {submissions.length} deck request{submissions.length !== 1 ? 's' : ''} awaiting review
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No pending submissions</p>
              <p className="text-sm mt-1">All caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="p-4 rounded-lg bg-accent-tinted border border-tinted hover:bg-accent-tinted/80 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-lg">{submission.email}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            submission.status === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {submission.status === 'pending' ? 'Pending' : 'Queued'}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                          {submission.patreon_tier}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        {submission.moxfield_username && (
                          <div className="text-muted-foreground">
                            <strong>Moxfield:</strong>{' '}
                            <a
                              href={`https://moxfield.com/users/${submission.moxfield_username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline"
                            >
                              {submission.moxfield_username}
                            </a>
                          </div>
                        )}
                        {submission.discord_username && (
                          <div className="text-muted-foreground">
                            <strong>Discord:</strong> {submission.discord_username}
                          </div>
                        )}
                        <div className="text-muted-foreground">
                          <strong>Type:</strong>{' '}
                          {submission.mystery_deck ? 'Mystery Deck' : 'Custom Build'}
                        </div>
                        {submission.commander && (
                          <div className="text-muted-foreground">
                            <strong>Commander:</strong> {submission.commander}
                          </div>
                        )}
                        {submission.color_preference && (
                          <div className="text-muted-foreground flex items-center gap-2">
                            <strong>Colors:</strong>
                            <div className="flex items-center gap-0.5">
                              {ColorIdentity.getIndividual(submission.color_preference).map(
                                (symbol, idx) => (
                                  <i key={idx} className={`ms ms-${symbol.toLowerCase()} ms-2x`} />
                                )
                              )}
                            </div>
                          </div>
                        )}
                        {submission.bracket && (
                          <div className="text-muted-foreground">
                            <strong>Bracket:</strong> {submission.bracket.replace('bracket', '')}
                          </div>
                        )}
                        {submission.budget && (
                          <div className="text-muted-foreground">
                            <strong>Budget:</strong> $
                            {Number(submission.budget).toLocaleString('en-US')}
                          </div>
                        )}
                        {submission.coffee_preference && (
                          <div className="text-muted-foreground">
                            <strong>Coffee:</strong> {submission.coffee_preference}
                          </div>
                        )}
                        {submission.theme && (
                          <div className="text-muted-foreground col-span-2">
                            <strong>Theme:</strong> {submission.theme}
                          </div>
                        )}
                        {submission.ideal_date && (
                          <div className="text-muted-foreground col-span-2">
                            <strong>Ideal Date:</strong> {submission.ideal_date}
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground pt-2 border-t border-tinted">
                        Submitted {new Date(submission.created_at).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-500/20 hover:bg-green-500/10 text-green-500"
                        onClick={() => updateStatus(submission.id, 'in_progress')}
                        disabled={updating === submission.id}
                      >
                        {updating === submission.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Start
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/20 hover:bg-red-500/10 text-red-500"
                        onClick={() => updateStatus(submission.id, 'rejected')}
                        disabled={updating === submission.id}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
