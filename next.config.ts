import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // SVG handling is now done via public directory and Next.js Image component
  // No webpack config needed with Turbopack
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'paerhoqoypdezkqhzimk.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  typescript: {
    // Disable type checking during build
    ignoreBuildErrors: true,
  },
  // Disable source maps in development to prevent Turbopack source map 404s
  productionBrowserSourceMaps: false,
}

export default nextConfig
