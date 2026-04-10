/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      '/api/generate-route': ['./data/**/*'],
    },
  },
}

export default nextConfig
