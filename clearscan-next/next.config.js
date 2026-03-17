/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/api/compare", destination: "http://localhost:8003/compare" },
    ];
  },
};

module.exports = nextConfig;
