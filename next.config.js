/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      'recharts',
    ],
  },
}

module.exports = nextConfig