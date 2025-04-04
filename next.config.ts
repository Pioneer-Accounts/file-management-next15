import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Performance optimizations */
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false, // Only enable if needed
  },
  
  // Experimental features (use with caution)
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
    serverMinification: true,
  },
  
  // Server external packages (moved from experimental)
  serverExternalPackages: [],
  
  // Output as standalone for better deployment performance
  output: 'standalone',
  
  // Improve build performance by avoiding excessive type checking during build
  typescript: {
    ignoreBuildErrors: false, // Set to true only in production if you're confident in your types
  },
  
  // Cache headers for static assets
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=31536000',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
