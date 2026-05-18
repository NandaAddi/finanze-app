/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {},
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "bufferutil": false,
      "utf-8-validate": false,
    };
    return config;
  },
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/sign-in',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;