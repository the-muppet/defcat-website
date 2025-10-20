"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FeaturedVideo } from "@/components/home/FeaturedVideo"
import { SocialMediaLinks } from "@/components/home/SocialMediaLinks"
import { RotatingAds } from "@/components/home/RotatingAds"

export default function ExampleHomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [bracketLevel, setBracketLevel] = useState("")

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Background gradients */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(farthest-corner at 50% 0%, var(--bg-tinted) 0%, var(--background) 100%)'
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background pointer-events-none" />

      <div className="relative">
        {/* Hero Section */}
        <section className="pt-24 pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h1
                className="text-5xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r"
                style={{
                  backgroundImage: `linear-gradient(to right, var(--gradient-start), var(--gradient-end))`
                }}
              >
                Defcat's Commander Deck Vault
              </h1>
              <p className="text-xl text-muted-foreground">
                The Internet's #1 Commander Deck Collection
              </p>
            </div>

            {/* Search Section */}
            <div className="w-full max-w-3xl mx-auto mb-16">
              <div className="relative mb-6">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for commanders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 rounded-2xl glass border border-white/10 text-foreground text-lg placeholder-muted-foreground focus:outline-none focus:ring-2 transition-all"
                  style={{
                    '--tw-ring-color': 'var(--mana-color)',
                  } as React.CSSProperties}
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Bracket Level</label>
                  <select
                    value={bracketLevel}
                    onChange={(e) => setBracketLevel(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg glass border border-white/10 text-foreground focus:outline-none focus:ring-2"
                    style={{
                      '--tw-ring-color': 'var(--mana-color)',
                    } as React.CSSProperties}
                  >
                    <option value="">All Brackets</option>
                    <option value="1">Bracket 1</option>
                    <option value="2">Bracket 2</option>
                    <option value="3">Bracket 3</option>
                    <option value="4">Bracket 4</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Color Filter</label>
                  <select
                    className="w-full px-4 py-3 rounded-lg glass border border-white/10 text-foreground focus:outline-none focus:ring-2"
                    style={{
                      '--tw-ring-color': 'var(--mana-color)',
                    } as React.CSSProperties}
                  >
                    <option value="">All Colors</option>
                    <option value="W">White</option>
                    <option value="U">Blue</option>
                    <option value="B">Black</option>
                    <option value="R">Red</option>
                    <option value="G">Green</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Tags</label>
                  <select
                    className="w-full px-4 py-3 rounded-lg glass border border-white/10 text-foreground focus:outline-none focus:ring-2"
                    style={{
                      '--tw-ring-color': 'var(--mana-color)',
                    } as React.CSSProperties}
                  >
                    <option value="">All Tags</option>
                    <option value="combo">Combo</option>
                    <option value="aggro">Aggro</option>
                    <option value="control">Control</option>
                    <option value="tribal">Tribal</option>
                  </select>
                </div>
              </div>
            </div>

            {/* New User Graphic Placeholder */}
            {!searchQuery && (
              <Card className="glass border-white/10 bg-card-tinted mb-12">
                <CardContent className="p-12 text-center">
                  <h3 className="text-2xl font-bold mb-4">Welcome to DeckVault!</h3>
                  <p className="text-muted-foreground mb-6">
                    Browse thousands of curated Commander decks or search above to get started
                  </p>
                  <Button className="btn-tinted-primary shadow-tinted-glow">
                    Explore Decks
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Rotating Advertisements */}
        <RotatingAds />

        {/* Featured YouTube Video */}
        <FeaturedVideo
          title="Today's Featured Video"
          // videoId="YOUR_YOUTUBE_VIDEO_ID" // Uncomment and add your video ID
        />

        {/* Featured Deck Section would go here */}
        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Today's Featured Deck</h2>
            <Card className="glass border-white/10 bg-card-tinted">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  Featured deck component will be displayed here
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Premium Stats */}
        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Premium Member Benefits</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass border-white/10 bg-card-tinted">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold mb-2" style={{ color: 'var(--mana-color)' }}>
                    500+
                  </div>
                  <p className="text-muted-foreground">Exclusive Decks</p>
                </CardContent>
              </Card>
              <Card className="glass border-white/10 bg-card-tinted">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold mb-2" style={{ color: 'var(--mana-color)' }}>
                    100+
                  </div>
                  <p className="text-muted-foreground">Video Tutorials</p>
                </CardContent>
              </Card>
              <Card className="glass border-white/10 bg-card-tinted">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold mb-2" style={{ color: 'var(--mana-color)' }}>
                    24/7
                  </div>
                  <p className="text-muted-foreground">Discord Support</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Social Media Links */}
        <SocialMediaLinks />
      </div>
    </div>
  )
}
