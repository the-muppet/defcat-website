/**
 * Admin Deck Management Page
 * Lists all decks with edit/delete capabilities
 */

import { requireAdmin } from '@/lib/auth-guards';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';

export default async function AdminDecksPage() {
  // Require admin role - will redirect if not admin
  await requireAdmin();

  const supabase = await createClient();

  // Fetch all decks with minimal data
  const { data: decks, error } = await supabase
    .from('decks')
    .select('id, moxfield_id, name, commanders, color_identity, created_at, view_count')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching decks:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8" data-page="admin-decks">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Deck Management</h1>
            <p className="text-muted-foreground mt-1">
              {decks?.length || 0} decks total
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/admin">
                Back to Dashboard
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/decks/import">
                <Plus className="h-4 w-4 mr-2" />
                Import Deck
              </Link>
            </Button>
          </div>
        </div>

        {/* Decks List */}
        <div className="space-y-4">
          {!decks || decks.length === 0 ? (
            <Card className="glass-panel p-8">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">No decks found</p>
                <Button asChild>
                  <Link href="/admin/decks/import">
                    <Plus className="h-4 w-4 mr-2" />
                    Import Your First Deck
                  </Link>
                </Button>
              </div>
            </Card>
          ) : (
            decks.map((deck) => (
              <Card key={deck.id} className="glass-card hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold truncate">
                          {deck.name}
                        </h3>
                      </div>

                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        {/* Commanders */}
                        {deck.commanders && deck.commanders.length > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Commanders:</span>
                            <span>{deck.commanders.join(', ')}</span>
                          </div>
                        )}

                        {/* Color Identity */}
                        {deck.color_identity && deck.color_identity.length > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Colors:</span>
                            <span>{deck.color_identity.join('')}</span>
                          </div>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Views:</span>
                          <span>{deck.view_count || 0}</span>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground mt-2">
                        Moxfield ID: {deck.moxfield_id}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/decks/${deck.id}`} target="_blank">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/decks/${deck.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
