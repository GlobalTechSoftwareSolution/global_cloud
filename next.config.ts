import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  rewrites: async () => [
    {
      source: '/api/contact',
      destination: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/accounts/contact/` : 'http://localhost:3000/api/accounts/contact/',
    },
  ],
};

export default nextConfig;
