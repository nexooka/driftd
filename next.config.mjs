/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    '/api/generate-route': ['./data/**/*'],
  },
}

export default nextConfig
