// app/api/submit-deck/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { DeckSubmissionEmail } from '@/emails'
import type { DeckSubmissionFormData, SubmissionResponse } from '@/types/form'
import { ColorIdentity } from '@/lib/utility/color-identity'

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic'

// Helper to create Supabase client at runtime
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for server-side operations
  )
}

// Lazy-initialize Resend client (only when needed, avoids build-time errors)
function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured')
  }
  return new Resend(process.env.RESEND_API_KEY)
}

// Validation helper
function validateSubmission(data: any): data is DeckSubmissionFormData {
  const required = [
    'patreonUsername',
    'email',
    'discordUsername',
    'colorPreference',
    'bracket',
    'budget',
    'coffee',
  ]

  for (const field of required) {
    if (!data[field] || typeof data[field] !== 'string' || data[field].trim() === '') {
      return false
    }
  }

  // Validate email format
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
  if (!emailRegex.test(data.email)) {
    return false
  }

  // Validate mysteryDeck is a string ('yes' or 'no')
  if (typeof data.mysteryDeck !== 'string' || !['yes', 'no'].includes(data.mysteryDeck)) {
    return false
  }

  return true
}

// Get color identity name for email

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
            message: 'Authentication required. Please sign in to submit a deck.',
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
      .select('patreon_tier, patreon_id, role')
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
    const isDraft = body.isDraft === true

    // Check if user is admin/moderator/developer (they bypass tier requirements)
    const isPrivileged = ['admin', 'moderator', 'developer'].includes(profile.role)

    // Check tier requirements (skip for drafts and privileged users)
    if (!isDraft && !isPrivileged) {
      const eligibleTiers = ['Duke', 'Wizard', 'ArchMage']
      if (!eligibleTiers.includes(profile.patreon_tier)) {
        return NextResponse.json<SubmissionResponse>(
          {
            success: false,
            error: {
              message: `Deck submissions require Duke tier ($50/month) or higher. Your current tier: ${profile.patreon_tier}`,
              code: 'INSUFFICIENT_TIER',
            },
          },
          { status: 403 }
        )
      }

      // Check deck credits for current month
      const currentMonth = new Date()
      currentMonth.setDate(1)
      currentMonth.setHours(0, 0, 0, 0)
      const monthString = currentMonth.toISOString().split('T')[0]

      const { data: credits, error: creditsError } = await supabase
        .from('user_credits')
        .select('deck_credits')
        .eq('user_id', user.id)
        .eq('credits_month', monthString)
        .single()

      if (creditsError && creditsError.code !== 'PGRST116') {
        console.error('Error checking credits:', creditsError)
        return NextResponse.json<SubmissionResponse>(
          {
            success: false,
            error: {
              message: 'Unable to check deck credits. Please try again.',
              code: 'CREDITS_ERROR',
            },
          },
          { status: 500 }
        )
      }

      const deckCredits = credits?.deck_credits ?? 0

      if (deckCredits <= 0) {
        return NextResponse.json<SubmissionResponse>(
          {
            success: false,
            error: {
              message: `You've used all your deck credits for this month. Credits refresh on the 1st of next month.`,
              code: 'NO_CREDITS',
            },
          },
          { status: 429 }
        )
      }

      // Deduct a deck credit
      const { error: deductError } = await supabase
        .from('user_credits')
        .update({
          deck_credits: deckCredits - 1,
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

    // Skip validation for drafts
    if (!isDraft && !validateSubmission(body)) {
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

    // Convert mysteryDeck string to boolean
    const mysteryDeck = body.mysteryDeck === true

    // Prepare data for Supabase
    const submissionData = {
      user_id: user.id,
      patreon_id: profile.patreon_id,
      patreon_tier: profile.patreon_tier,
      patreon_username: body.patreonUsername?.trim() || null,
      email: body.email?.trim()?.toLowerCase() || null,
      discord_username: body.discordUsername?.trim() || null,
      submission_type: 'deck' as const,
      mystery_deck: mysteryDeck,
      commander: body.commander?.trim() || null,
      color_preference: body.colorPreference || null,
      theme: body.theme?.trim() || null,
      bracket: body.bracket || null,
      budget: body.budget?.trim() || null,
      coffee_preference: body.coffee?.trim() || null,
      ideal_date: body.idealDate?.trim() || null,
      status: (isDraft ? 'draft' : 'pending') as 'draft' | 'pending',
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
      if (!isDraft && !isPrivileged) {
        const currentMonth = new Date()
        currentMonth.setDate(1)
        currentMonth.setHours(0, 0, 0, 0)
        const monthString = currentMonth.toISOString().split('T')[0]

        await supabase.rpc('refund_credit', {
          p_user_id: user.id,
          p_submission_type: 'deck',
          p_submission_month: monthString,
        })
      }

      // Check if it's a submission limit error from the trigger
      if (dbError.message?.includes('Monthly submission limit reached')) {
        return NextResponse.json<SubmissionResponse>(
          {
            success: false,
            error: {
              message: dbError.message,
              code: 'MONTHLY_LIMIT_REACHED',
            },
          },
          { status: 429 }
        )
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

    // Skip emails for drafts
    if (!isDraft) {
      // Get submission number (count of all submissions up to this one)
      const { count } = await supabase
        .from('deck_submissions')
        .select('*', { count: 'exact', head: true })

      const submissionNumber = count || 1

      // Send confirmation email
      try {
        const resend = getResendClient()
        await resend.emails.send({
          from: 'DefCat Custom Decks <decks@defcat.com>',
          to: body.email,
          subject: `Deck Submission Confirmed - #${submissionNumber}`,
          react: DeckSubmissionEmail({
            patreonUsername: body.patreonUsername,
            submissionNumber,
            colorPreference: ColorIdentity.getName(body.colorPreference),
            commander: body.commander || undefined,
            bracket: body.bracket,
            mysteryDeck,
          }),
        })
      } catch (emailError) {
        console.error('Email error:', emailError)
        // Don't fail the request if email fails
        // The submission is already saved
      }

      // Also notify admin (optional)
      try {
        const resend = getResendClient()
        const maxSubmissions = profile.patreon_tier === 'ArchMage' ? 2 : 1
        const { count: submissionCount } = await supabase
          .from('deck_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .neq('status', 'draft')
          .gte(
            'created_at',
            new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
          )

        await resend.emails.send({
          from: 'DefCat Submissions <notifications@defcat.com>', // Update with your domain
          to: process.env.ADMIN_EMAIL || 'admin@defcat.com', // Update with your admin email
          subject: `New ${profile.patreon_tier} Deck Submission #${submissionNumber} from ${body.patreonUsername}`,
          html: `
            <h2>New Deck Submission Received</h2>
            <p><strong>Submission #:</strong> ${submissionNumber}</p>
            <p><strong>Patreon Tier:</strong> ${profile.patreon_tier}</p>
            <p><strong>Remaining this month:</strong> ${maxSubmissions - (submissionCount || 0) - 1}</p>
            <hr>
            <p><strong>Patreon User:</strong> ${body.patreonUsername}</p>
            <p><strong>Discord:</strong> ${body.discordUsername}</p>
            <p><strong>Email:</strong> ${body.email}</p>
            <p><strong>Mystery Deck:</strong> ${mysteryDeck ? 'Yes' : 'No'}</p>
            ${body.commander ? `<p><strong>Commander:</strong> ${body.commander}</p>` : ''}
            <p><strong>Color Preference:</strong> ${ColorIdentity.getName(body.colorPreference)}</p>
            ${body.theme ? `<p><strong>Theme:</strong> ${body.theme}</p>` : ''}
            <p><strong>Bracket:</strong> ${body.bracket}</p>
            <p><strong>Budget:</strong> ${body.budget}</p>
            <p><strong>Coffee:</strong> ${body.coffee}</p>
            ${body.idealDate ? `<p><strong>Ideal Date:</strong> ${body.idealDate}</p>` : ''}
            <br>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/submissions/${submission.id}">View in Dashboard</a></p>
          `,
        })
      } catch (adminEmailError) {
        console.error('Admin notification error:', adminEmailError)
        // Don't fail the request
      }
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
