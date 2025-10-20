// app/about/page.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Target, Users, Trophy } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen p-8 relative">
      {/* Subtle tinted background */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-tinted via-transparent to-transparent opacity-30" />
      
      <div className="max-w-4xl mx-auto relative">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)] bg-clip-text text-transparent">
            About DefCat's DeckVault
          </h1>
          <p className="text-xl text-muted-foreground">
            Your premium cEDH decklist resource
          </p>
        </div>

        <div className="space-y-6">
          {/* What is DeckVault */}
          <Card className="glass-tinted border-tinted">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent-tinted border border-tinted">
                  <Sparkles className="h-5 w-5" style={{ color: 'var(--mana-color)' }} />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">What is DeckVault?</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">
                DeckVault is a curated collection of competitive EDH decklists, maintained by DefCat.
                Browse powerful strategies, discover new commanders, and level up your cEDH game.
                Our platform provides tier-based access to premium content, ensuring you get the most
                value from your support.
              </p>
            </CardContent>
          </Card>

          {/* Mission */}
          <Card className="glass-tinted border-tinted">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent-tinted border border-tinted">
                  <Target className="h-5 w-5" style={{ color: 'var(--mana-color)' }} />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">Our Mission</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed mb-4">
                We aim to provide the cEDH community with high-quality, tested decklists that push the 
                boundaries of competitive play. Every deck in our vault has been carefully crafted and 
                refined through extensive playtesting.
              </p>
              <ul className="space-y-2 text-foreground">
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full mt-2" style={{ backgroundColor: 'var(--mana-color)' }} />
                  <span>Promote competitive EDH gameplay and strategy</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full mt-2" style={{ backgroundColor: 'var(--mana-color)' }} />
                  <span>Support content creators in the Magic community</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full mt-2" style={{ backgroundColor: 'var(--mana-color)' }} />
                  <span>Foster innovation in deck building and gameplay</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Community */}
          <Card className="glass-tinted border-tinted">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent-tinted border border-tinted">
                  <Users className="h-5 w-5" style={{ color: 'var(--mana-color)' }} />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">Join Our Community</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed mb-4">
                Connect with fellow cEDH enthusiasts, share strategies, and stay updated on the latest 
                meta developments. Our community spans across multiple platforms.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <a
                  href="https://discord.gg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-lg bg-accent-tinted border border-tinted hover:bg-accent-tinted hover:shadow-tinted transition-all text-center"
                >
                  <strong className="text-foreground">Discord</strong>
                  <p className="text-sm text-muted-foreground mt-1">Chat and gameplay</p>
                </a>
                <a
                  href="https://patreon.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-lg bg-accent-tinted border border-tinted hover:bg-accent-tinted hover:shadow-tinted transition-all text-center"
                >
                  <strong className="text-foreground">Patreon</strong>
                  <p className="text-sm text-muted-foreground mt-1">Support & exclusive content</p>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="glass-tinted border-tinted">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent-tinted border border-tinted">
                  <Trophy className="h-5 w-5" style={{ color: 'var(--mana-color)' }} />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">Platform Features</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-accent-tinted border border-tinted">
                  <h3 className="font-semibold text-foreground mb-2">Tiered Access</h3>
                  <p className="text-sm text-muted-foreground">
                    Different membership levels unlock progressively more content
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-accent-tinted border border-tinted">
                  <h3 className="font-semibold text-foreground mb-2">Moxfield Integration</h3>
                  <p className="text-sm text-muted-foreground">
                    Direct links to fully detailed decklists with pricing
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-accent-tinted border border-tinted">
                  <h3 className="font-semibold text-foreground mb-2">Custom Submissions</h3>
                  <p className="text-sm text-muted-foreground">
                    Higher tiers can request custom deck builds
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-accent-tinted border border-tinted">
                  <h3 className="font-semibold text-foreground mb-2">Regular Updates</h3>
                  <p className="text-sm text-muted-foreground">
                    New decks added regularly as the meta evolves
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}