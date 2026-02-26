/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/api/compare", destination: "http://localhost:8000/compare" },
    ];
  },
};

module.exports = nextConfig;
