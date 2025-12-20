// next.config.mjs — ES module variant for Shopping Journey
export default {
  basePath: '/shopping-journey',
  assetPrefix: '/shopping-journey/',
  reactStrictMode: true,

  // Use default output (not standalone) for cPanel compatibility
  // output: 'standalone',

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    unoptimized: true,
  },

  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};
