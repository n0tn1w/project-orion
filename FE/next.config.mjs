/** @type {import('next').NextConfig} */
const backendOrigin = process.env.BACKEND_ORIGIN || "http://localhost:5000"; // override in prod

const nextConfig = {
  output: "standalone",

  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/:path*`,
      },
    ];
  },

  webpack(config, { dev }) {
    if (dev) {
      config.devtool = "source-map";
    }
    return config;
  },
};

export default nextConfig;
