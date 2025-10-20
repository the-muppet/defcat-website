/**
 * Footer Component
 * Site footer with links and info - updated with accessible tinted styling
 */

import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export function Footer() {
  return (
    <footer className="glass-tinted-subtle border-t border-tinted">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link 
                  href="/decks" 
                  className="hover:text-foreground hover:translate-x-0.5 transition-all inline-block"
                >
                  Browse Decks
                </Link>
              </li>
              <li>
                <Link 
                  href="/tiers" 
                  className="hover:text-foreground hover:translate-x-0.5 transition-all inline-block"
                >
                  Membership Tiers
                </Link>
              </li>
              <li>
                <Link 
                  href="/decks/submission" 
                  className="hover:text-foreground hover:translate-x-0.5 transition-all inline-block"
                >
                  Submit Deck
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/about"
                  className="hover:text-foreground hover:translate-x-0.5 transition-all inline-block"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Connect</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://patreon.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground hover:translate-x-0.5 transition-all inline-block"
                >
                  Patreon
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground hover:translate-x-0.5 transition-all inline-block"
                >
                  Discord
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <Separator className="my-6 bg-border-tinted" />
        
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} DefCat's DeckVault. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Powered by Moxfield • Built with Next.js
          </p>
        </div>
      </div>
    </footer>
  )
}