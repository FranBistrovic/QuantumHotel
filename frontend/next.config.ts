/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/uploads/**",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },

      {
        source: "/oauth2/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/oauth2/:path*`,
      },
      {
        source: "/login/oauth2/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/login/oauth2/:path*`,
      },

      {
        source: "/logout",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/logout`,
      },
    ];
  },
};

export default nextConfig;
