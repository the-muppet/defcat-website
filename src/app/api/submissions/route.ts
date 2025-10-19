// app/api/submit-deck/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { DeckSubmissionEmail } from '@/emails;
import type { DeckSubmissionFormData, SubmissionResponse } from '@/types/form';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for server-side operations
);

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY!);

// Validation helper
function validateSubmission(data: any): data is DeckSubmissionFormData {
  const required = [
    'patreonUsername',
    'email',
    'discordUsername',
    'colorPreference',
    'bracket',
    'budget',
    'coffee'
  ];

  for (const field of required) {
    if (!data[field] || typeof data[field] !== 'string' || data[field].trim() === '') {
      return false;
    }
  }

  // Validate email format
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  if (!emailRegex.test(data.email)) {
    return false;
  }

  // Validate mysteryDeck is a string ('yes' or 'no')
  if (typeof data.mysteryDeck !== 'string' || !['yes', 'no'].includes(data.mysteryDeck)) {
    return false;
  }

  return true;
}

// Get color identity name for email
function getColorName(colorIdentity: string): string {
  const colorNames: Record<string, string> = {
    'W': 'Mono White',
    'U': 'Mono Blue',
    'B': 'Mono Black',
    'R': 'Mono Red',
    'G': 'Mono Green',
    'C': 'Colorless',
    'WU': 'Azorius',
    'UB': 'Dimir',
    'BR': 'Rakdos',
    'RG': 'Gruul',
    'GW': 'Selesnya',
    'WB': 'Orzhov',
    'UR': 'Izzet',
    'BG': 'Golgari',
    'RW': 'Boros',
    'GU': 'Simic',
    'GWU': 'Bant',
    'WUB': 'Esper',
    'UBR': 'Grixis',
    'BRG': 'Jund',
    'RGW': 'Naya',
    'WBG': 'Abzan',
    'URW': 'Jeskai',
    'BRW': 'Mardu',
    'GUB': 'Sultai',
    'RGU': 'Temur',
    'WUBR': 'No Green',
    'UBRG': 'No White',
    'BRGW': 'No Blue',
    'RGWU': 'No Black',
    'GWUB': 'No Red',
    'WUBRG': 'Five Color'
  };
  
  return colorNames[colorIdentity] || colorIdentity;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
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
      );
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

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
      );
    }

    // Get user's profile to check tier
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('patreon_tier, patreon_id')
      .eq('id', user.id)
      .single();

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
      );
    }

    // Check if user has Duke tier or above
    const eligibleTiers = ['Duke', 'Wizard', 'ArchMage'];
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
      );
    }

    // Check monthly submission limit
    const maxSubmissions = profile.patreon_tier === 'ArchMage' ? 2 : 1;
    
    const { count: submissionCount, error: countError } = await supabase
      .from('deck_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

    if (countError) {
      console.error('Error checking submission count:', countError);
    } else if (submissionCount !== null && submissionCount >= maxSubmissions) {
      return NextResponse.json<SubmissionResponse>(
        {
          success: false,
          error: {
            message: `You've reached your monthly limit of ${maxSubmissions} submission(s) for ${profile.patreon_tier} tier. Limit resets next month.`,
            code: 'MONTHLY_LIMIT_REACHED',
          },
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate data
    if (!validateSubmission(body)) {
      return NextResponse.json<SubmissionResponse>(
        {
          success: false,
          error: {
            message: 'Invalid submission data. Please check all required fields.',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 }
      );
    }

    // Convert mysteryDeck string to boolean
    const mysteryDeck = body.mysteryDeck === 'yes';

    // Prepare data for Supabase
    const submissionData = {
      user_id: user.id,
      patreon_id: profile.patreon_id,
      patreon_tier: profile.patreon_tier,
      patreon_username: body.patreonUsername.trim(),
      email: body.email.trim().toLowerCase(),
      discord_username: body.discordUsername.trim(),
      mystery_deck: mysteryDeck,
      commander: body.commander?.trim() || null,
      color_preference: body.colorPreference,
      theme: body.theme?.trim() || null,
      bracket: body.bracket,
      budget: body.budget.trim(),
      coffee_preference: body.coffee.trim(),
      ideal_date: body.idealDate?.trim() || null,
      status: 'pending' as const,
    };

    // Insert into Supabase
    const { data: submission, error: dbError } = await supabase
      .from('deck_submissions')
      .insert(submissionData)
      .select('id, created_at')
      .single();

    if (dbError) {
      console.error('Supabase error:', dbError);
      
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
        );
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
      );
    }

    // Get submission number (count of all submissions up to this one)
    const { count } = await supabase
      .from('deck_submissions')
      .select('*', { count: 'exact', head: true });

    const submissionNumber = count || 1;

    // Send confirmation email
    try {
      await resend.emails.send({
        from: 'DefCat Custom Decks <decks@defcat.com>', // Update with your domain
        to: body.email,
        subject: `Deck Submission Confirmed - #${submissionNumber}`,
        react: DeckSubmissionEmail({
          patreonUsername: body.patreonUsername,
          submissionNumber,
          colorPreference: getColorName(body.colorPreference),
          commander: body.commander || undefined,
          bracket: body.bracket,
          mysteryDeck,
        }),
      });
    } catch (emailError) {
      console.error('Email error:', emailError);
      // Don't fail the request if email fails
      // The submission is already saved
    }

    // Also notify admin (optional)
    try {
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
          <p><strong>Color Preference:</strong> ${getColorName(body.colorPreference)}</p>
          ${body.theme ? `<p><strong>Theme:</strong> ${body.theme}</p>` : ''}
          <p><strong>Bracket:</strong> ${body.bracket}</p>
          <p><strong>Budget:</strong> ${body.budget}</p>
          <p><strong>Coffee:</strong> ${body.coffee}</p>
          ${body.idealDate ? `<p><strong>Ideal Date:</strong> ${body.idealDate}</p>` : ''}
          <br>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/submissions/${submission.id}">View in Dashboard</a></p>
        `,
      });
    } catch (adminEmailError) {
      console.error('Admin notification error:', adminEmailError);
      // Don't fail the request
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
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json<SubmissionResponse>(
      {
        success: false,
        error: {
          message: 'An unexpected error occurred. Please try again.',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
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
  });
}
