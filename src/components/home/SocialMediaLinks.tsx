"use client"

import { Button } from "@/components/ui/button"
import { Youtube, Twitter, Twitch, Instagram, Facebook, Globe, Music, Linkedin, DollarSign } from "lucide-react"

interface SocialLink {
  name: string
  icon: React.ReactNode
  url: string
  color: string
}

const socialLinks: SocialLink[] = [
  {
    name: "YouTube",
    icon: <Youtube className="h-6 w-6" />,
    url: "https://www.youtube.com/@DefCatMTG",
    color: "#FF0000"
  },
  {
    name: "Patreon",
    icon: <DollarSign className="h-6 w-6" />,
    url: "https://patreon.com/DefCat",
    color: "#FF424D"
  },
  {
    name: "Twitch",
    icon: <Twitch className="h-6 w-6" />,
    url: "https://twitch.tv/defcat_hd",
    color: "#9146FF"
  },
  {
    name: "Twitter",
    icon: <Twitter className="h-6 w-6" />,
    url: "https://twitter.com/defcatofficial",
    color: "#1DA1F2"
  },
  {
    name: "Instagram",
    icon: <Instagram className="h-6 w-6" />,
    url: "https://instagram.com/defcatofficial",
    color: "#E4405F"
  },
  {
    name: "Facebook",
    icon: <Facebook className="h-6 w-6" />,
    url: "https://facebook.com/DefCatOfficial",
    color: "#1877F2"
  },
  {
    name: "Website",
    icon: <Globe className="h-6 w-6" />,
    url: "https://defcat.net",
    color: "#6366F1"
  },
  {
    name: "Spotify",
    icon: <Music className="h-6 w-6" />,
    url: "https://open.spotify.com/artist/2e9v2Z6vNDaf0HGf1MfTpH",
    color: "#1DB954"
  },
  {
    name: "LinkedIn",
    icon: <Linkedin className="h-6 w-6" />,
    url: "https://linkedin.com/in/jay-natale-2556b2120",
    color: "#0A66C2"
  }
]

export function SocialMediaLinks() {
  return (
    <section className="py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Connect With DefCat</h2>
          <p className="text-muted-foreground">
            Follow for Commander deck techs, gameplay videos, and MTG content
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {socialLinks.map((link) => (
            <Button
              key={link.name}
              variant="outline"
              size="lg"
              asChild
              className="hover-tinted glass border-white/10"
            >
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                {link.icon}
                <span>{link.name}</span>
              </a>
            </Button>
          ))}
        </div>
      </div>
    </section>
  )
}
