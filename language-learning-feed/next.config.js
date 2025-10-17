/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations for feed scrolling
  reactStrictMode: true,
  
  // Image optimization for thumbnails
  images: {
    domains: [
      'i.ytimg.com', // YouTube thumbnails
      'i.scdn.co', // Spotify images
      'cloudflare.com', // CDN
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['framer-motion', 'axios'],
  },

  // Enable SWC minification
  swcMinify: true,

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Audio file support
    config.module.rules.push({
      test: /\.(mp3|wav|ogg)$/,
      type: 'asset/resource',
    });

    return config;
  },

  // Headers for caching
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;


