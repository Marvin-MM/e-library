/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Strip all console.log/debug from production builds → faster JS execution
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },

  // Tree-shake lucide-react: only import icons actually used rather than the whole library
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'd89563aefaa5.ngrok-free.app',
      },
      {
        // DiceBear avatars used in sidebars
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
  },
};

module.exports = nextConfig;
