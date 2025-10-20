/**
 * Admin Deck Management API
 * PATCH - Update deck metadata
 * DELETE - Remove deck and associated data
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth-guards';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * PATCH /api/admin/decks/[id]
 * Update deck metadata
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    // Verify admin access
    await requireAdmin();

    const body = await request.json();
    const { name, description, commanders } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Deck name is required' },
        { status: 400 }
      );
    }

    // Validate commanders array
    if (!commanders || !Array.isArray(commanders) || commanders.length === 0) {
      return NextResponse.json(
        { error: 'At least one commander is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Update deck (color_identity is derived, not editable)
    const { data, error } = await supabase
      .from('decks')
      .update({
        name,
        description,
        commanders,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating deck:', error);
      return NextResponse.json(
        { error: 'Failed to update deck' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in PATCH /api/admin/decks/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/decks/[id]
 * Delete deck and all associated data
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    // Verify admin access
    await requireAdmin();

    const supabase = await createClient();

    // Delete deck_cards first (foreign key constraint)
    const { error: cardsError } = await supabase
      .from('deck_cards')
      .delete()
      .eq('deck_id', params.id);

    if (cardsError) {
      console.error('Error deleting deck cards:', cardsError);
      return NextResponse.json(
        { error: 'Failed to delete deck cards' },
        { status: 500 }
      );
    }

    // Delete deck
    const { error: deckError } = await supabase
      .from('decks')
      .delete()
      .eq('id', params.id);

    if (deckError) {
      console.error('Error deleting deck:', deckError);
      return NextResponse.json(
        { error: 'Failed to delete deck' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/decks/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
