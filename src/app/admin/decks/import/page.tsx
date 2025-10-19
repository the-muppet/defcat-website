/**
 * Admin Deck Import Page
 * Import decks from Moxfield
 */

import Link from 'next/link';
import { requireAdmin } from '@/lib/auth-guards';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { DeckImportForm } from '@/components/admin/DeckImportForm';

export default async function AdminDeckImportPage() {
  await requireAdmin();

  return (
    <div className="container mx-auto px-4 py-8" data-page="admin-deck-import">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/decks">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Decks
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gradient">Import Deck from Moxfield</h1>
            <p className="text-muted-foreground mt-1">
              Enter a Moxfield deck URL or ID to import
            </p>
          </div>
        </div>

        {/* Scraper populated Bookmark dropdown list */}
       

        {/* Import Form */}
        <Card className="glass-panel p-6">
          <DeckImportForm />
        </Card>

        {/* Instructions */}
        <Card className="glass-subtle p-6">
          <h3 className="text-lg font-semibold mb-3">How to Import</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Go to Moxfield.com and find the deck you want to import</li>
            <li>Copy the deck URL (e.g., https://www.moxfield.com/decks/abc123xyz)</li>
            <li>Paste the URL or just the deck ID into the form above</li>
            <li>Select the required Patreon tier for access</li>
            <li>Click Import to fetch and store the deck</li>
          </ol>

          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm">
              <strong>Note:</strong> The deck data is cached in our database. To refresh a deck's data,
              you can re-import it with the same Moxfield ID.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
