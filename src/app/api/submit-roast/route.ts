// app/api/submit-roast/route.ts

import { createClient } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import type { SubmissionResponse } from '@/types/form'

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic'

// Helper to create Supabase client at runtime
function getSupabaseClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// Lazy-initialize Resend client
function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured')
  }
  return new Resend(process.env.RESEND_API_KEY)
}

// Validation helper
function validateRoastSubmission(data: any): boolean {
  const required = [
    'preferredName',
    'deckDescription',
    'moxfieldLink',
    'targetBracket',
    'artChoicesIntentional',
  ]

  for (const field of required) {
    if (!data[field] || typeof data[field] !== 'string' || data[field].trim() === '') {
      return false
    }
  }

  // Validate Moxfield URL
  if (!data.moxfieldLink.includes('moxfield.com')) {
    return false
  }

  return true
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()

    // Check authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json<SubmissionResponse>(
        {
          success: false,
          error: {
            message: 'Authentication required. Please sign in to submit a roast request.',
            code: 'UNAUTHORIZED',
          },
        },
        { status: 401 }
      )
    }

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))

    if (authError || !user) {
      return NextResponse.json<SubmissionResponse>(
        {
          success: false,
          error: {
            message: 'Invalid authentication. Please sign in again.',
            code: 'UNAUTHORIZED',
          },
        },
        { status: 401 }
      )
    }

    // Get user's profile to check tier and role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('patreon_tier, patreon_id, role, email')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json<SubmissionResponse>(
        {
          success: false,
          error: {
            message: 'Unable to verify Patreon tier. Please ensure your account is linked.',
            code: 'PROFILE_ERROR',
          },
        },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()

    // Validate submission data
    if (!validateRoastSubmission(body)) {
      return NextResponse.json<SubmissionResponse>(
        {
          success: false,
          error: {
            message: 'Invalid submission data. Please check all required fields.',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 }
      )
    }

    // Check if user is privileged (bypass tier and credit requirements)
    const isPrivileged = ['admin', 'moderator', 'developer'].includes(profile.role)

    // Check tier requirements (skip for privileged users)
    if (!isPrivileged) {
      const eligibleTiers = ['Emissary', 'Duke', 'Wizard', 'ArchMage']
      if (!eligibleTiers.includes(profile.patreon_tier)) {
        return NextResponse.json<SubmissionResponse>(
          {
            success: false,
            error: {
              message: `Roast submissions require Emissary tier ($30/month) or higher. Your current tier: ${profile.patreon_tier}`,
              code: 'INSUFFICIENT_TIER',
            },
          },
          { status: 403 }
        )
      }

      // Check roast credits for current month
      const currentMonth = new Date()
      currentMonth.setDate(1)
      currentMonth.setHours(0, 0, 0, 0)
      const monthString = currentMonth.toISOString().split('T')[0]

      const { data: credits, error: creditsError } = await supabase
        .from('user_credits')
        .select('roast_credits')
        .eq('user_id', user.id)
        .eq('credits_month', monthString)
        .single()

      if (creditsError && creditsError.code !== 'PGRST116') {
        console.error('Error checking credits:', creditsError)
        return NextResponse.json<SubmissionResponse>(
          {
            success: false,
            error: {
              message: 'Unable to check roast credits. Please try again.',
              code: 'CREDITS_ERROR',
            },
          },
          { status: 500 }
        )
      }

      const roastCredits = credits?.roast_credits ?? 0

      if (roastCredits <= 0) {
        return NextResponse.json<SubmissionResponse>(
          {
            success: false,
            error: {
              message: `You've used all your roast credits for this month. Credits refresh on the 1st of next month.`,
              code: 'NO_CREDITS',
            },
          },
          { status: 429 }
        )
      }

      // Deduct a roast credit
      const { error: deductError } = await supabase
        .from('user_credits')
        .update({
          roast_credits: roastCredits - 1,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('credits_month', monthString)

      if (deductError) {
        console.error('Error deducting credit:', deductError)
        return NextResponse.json<SubmissionResponse>(
          {
            success: false,
            error: {
              message: 'Failed to process credit. Please try again.',
              code: 'CREDIT_DEDUCTION_ERROR',
            },
          },
          { status: 500 }
        )
      }
    }

    // Prepare data for Supabase
    const submissionData = {
      user_id: user.id,
      patreon_id: profile.patreon_id,
      patreon_tier: profile.patreon_tier,
      patreon_username: body.preferredName?.trim() || null,
      email: profile.email || null,
      discord_username: null,
      submission_type: 'roast',
      mystery_deck: false,
      commander: null,
      color_preference: null,
      theme: body.deckDescription?.trim() || null,
      bracket: body.targetBracket || null,
      budget: null,
      coffee_preference: null,
      ideal_date: null,
      moxfield_link: body.moxfieldLink?.trim() || null,
      art_choices_intentional: body.artChoicesIntentional || null,
      status: 'pending' as const,
    }

    // Insert into Supabase
    const { data: submission, error: dbError } = await supabase
      .from('deck_submissions')
      .insert(submissionData)
      .select('id, created_at')
      .single()

    if (dbError) {
      console.error('Supabase error:', dbError)

      // If credit was deducted, try to refund it
      if (!isPrivileged) {
        const currentMonth = new Date()
        currentMonth.setDate(1)
        currentMonth.setHours(0, 0, 0, 0)
        const monthString = currentMonth.toISOString().split('T')[0]

        await supabase.rpc('refund_credit', {
          p_user_id: user.id,
          p_submission_type: 'roast',
          p_submission_month: monthString,
        })
      }

      return NextResponse.json<SubmissionResponse>(
        {
          success: false,
          error: {
            message: 'Failed to save submission. Please try again.',
            code: 'DATABASE_ERROR',
          },
        },
        { status: 500 }
      )
    }

    // Get submission number
    const { count } = await supabase
      .from('deck_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('submission_type', 'roast')

    const submissionNumber = count || 1

    // Send confirmation email
    try {
      const resend = getResendClient()
      await resend.emails.send({
        from: 'DefCat Deck Roasts <roasts@defcat.com>',
        to: profile.email,
        subject: `Roast Submission Confirmed - #${submissionNumber}`,
        html: `
          <h2>Your Deck Roast Request Has Been Received!</h2>
          <p>Hey ${body.preferredName},</p>
          <p>Your deck roast request has been confirmed! DefCat will roast your deck and you'll be notified when it's ready.</p>
          <hr>
          <p><strong>Submission #:</strong> ${submissionNumber}</p>
          <p><strong>Deck Link:</strong> <a href="${body.moxfieldLink}">${body.moxfieldLink}</a></p>
          <p><strong>Target Bracket:</strong> ${body.targetBracket}</p>
          <p><strong>Description:</strong> ${body.deckDescription}</p>
          <hr>
          <p>Thanks for supporting DefCat!</p>
          <br>
          <p style="font-size: 12px; color: #888;">Generated with Claude Code - https://claude.com/claude-code</p>
        `,
      })
    } catch (emailError) {
      console.error('Email error:', emailError)
      // Don't fail the request if email fails
    }

    // Notify admin
    try {
      const resend = getResendClient()
      await resend.emails.send({
        from: 'DefCat Submissions <notifications@defcat.com>',
        to: process.env.ADMIN_EMAIL || 'admin@defcat.com',
        subject: `New ${profile.patreon_tier} Roast Submission #${submissionNumber} from ${body.preferredName}`,
        html: `
          <h2>New Roast Submission Received</h2>
          <p><strong>Submission #:</strong> ${submissionNumber}</p>
          <p><strong>Patreon Tier:</strong> ${profile.patreon_tier}</p>
          <hr>
          <p><strong>Preferred Name:</strong> ${body.preferredName}</p>
          <p><strong>Email:</strong> ${profile.email}</p>
          <p><strong>Deck Link:</strong> <a href="${body.moxfieldLink}">${body.moxfieldLink}</a></p>
          <p><strong>Target Bracket:</strong> ${body.targetBracket}</p>
          <p><strong>Art Choices Intentional:</strong> ${body.artChoicesIntentional}</p>
          <p><strong>Description:</strong> ${body.deckDescription}</p>
          <br>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/submissions/${submission.id}">View in Dashboard</a></p>
        `,
      })
    } catch (adminEmailError) {
      console.error('Admin notification error:', adminEmailError)
    }

    // Return success response
    return NextResponse.json<SubmissionResponse>(
      {
        success: true,
        data: {
          id: submission.id,
          submissionNumber,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json<SubmissionResponse>(
      {
        success: false,
        error: {
          message: 'An unexpected error occurred. Please try again.',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
