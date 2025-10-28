/**
 * Footer Component
 * Site footer with links and info - updated with accessible tinted styling
 */

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="glass-tinted-subtle border-t border-tinted">
      <div className="px-8 md:px-16 lg:px-24 py-8">
        <div className="flex flex-col items-center gap-6">
          <ul className="flex gap-8 text-sm text-muted-foreground">
            <li>
              <Link href="/about" className="hover:text-foreground transition-all">
                About
              </Link>
            </li>
            <li>
              <a
                href="https://patreon.com/defcat"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-all"
              >
                Patreon
              </a>
            </li>
            <li>
              <a
                href="https://patreon.com/defcat"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-all"
                title="Discord access is available to Patreon members. Click to join on Patreon!"
              >
                Discord
              </a>
            </li>
          </ul>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} DefCat's DeckVault. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
